import json
import os
import argparse
import numpy as np
import matplotlib.pyplot as plt
from scipy.ndimage import uniform_filter1d
from scipy.signal import medfilt

L_ANKLE = 7
R_ANKLE = 8

def load_nlf(filepath):
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Dosya bulunamadı: {filepath}")
    with open(filepath) as f:
        return [json.loads(line) for line in f]

def plateau_smooth(signal, window=10, std_threshold=80):
    """Stance fazında (ayak yerdeyken) sinyali düzleştirir."""
    result = signal.copy()
    for i in range(0, len(signal), window):
        end = min(i + window, len(signal))
        segment = signal[i:end]
        if len(segment) >= 3 and np.std(segment) < std_threshold:
            result[i:end] = np.mean(segment)
    return result

def remove_spikes(signal):
    """Anlık gürültü sıçramalarını temizler."""
    result = signal.copy()
    is_active = np.abs(signal) > 0
    i = 0
    while i < len(signal):
        if is_active[i]:
            start = i
            while i < len(signal) and is_active[i]: i += 1
            if (i - start) <= 3: result[start:i] = 0
        else: i += 1
    return result

def get_cycles(vx_signal, timestamps):
    """
    Hız verisinden Initial Contact (IC) ve Toe-Off (TO) anlarını bulur.
    Cycle = IC(n) -> IC(n+1)
    """
    is_stance = vx_signal == 0
    strikes = []  # Initial Contact (Yere basma)
    toe_offs = [] # Toe-Off (Yerden kesilme)

    for i in range(1, len(is_stance)):
        if not is_stance[i-1] and is_stance[i]: # Swing -> Stance
            strikes.append(i)
        elif is_stance[i-1] and not is_stance[i]: # Stance -> Swing
            toe_offs.append(i)

    cycles = []
    for j in range(len(strikes) - 1):
        start = strikes[j]
        end = strikes[j+1]
        # Bu döngü içindeki yerden kesilme anını bul
        to = [t for t in toe_offs if start < t < end]
        if to:
            cycles.append({
                'ic': start,
                'to': to[0],
                'next_ic': end,
                'gct_ms': (timestamps[to[0]] - timestamps[start]) * 1000,
                'total_ms': (timestamps[end] - timestamps[start]) * 1000
            })
    return cycles

def analyze_gait(filepath, vel_threshold=1500):
    frames = load_nlf(filepath)
    ts = np.array([f['timestamp_sec'] for f in frames])
    
    # 1. Veri Çıkarımı ve Smoothing
    l_raw = np.array([f['joints_3d'][0][0][L_ANKLE][0] for f in frames])
    r_raw = np.array([f['joints_3d'][0][0][R_ANKLE][0] for f in frames])
    
    l_sm = plateau_smooth(uniform_filter1d(l_raw, size=7))
    r_sm = plateau_smooth(uniform_filter1d(r_raw, size=7))
    
    # 2. Hız (Vx) ve Gürültü Temizleme (Median Filter)
    dt = np.diff(ts, prepend=ts[0]-0.016)
    l_vx = medfilt(np.diff(l_sm, prepend=l_sm[0]) / dt, kernel_size=5)
    r_vx = medfilt(np.diff(r_sm, prepend=r_sm[0]) / dt, kernel_size=5)
    
    # 3. Thresholding
    l_vx_c = remove_spikes(np.where(l_vx < vel_threshold, 0, l_vx))
    r_vx_c = remove_spikes(np.where(r_vx < vel_threshold, 0, r_vx))

    # 4. Cycle Segmentasyonu
    l_cycles = get_cycles(l_vx_c, ts)
    r_cycles = get_cycles(r_vx_c, ts)

    # --- GÖRSELLEŞTİRME ---
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), sharex=True)
    fig.patch.set_facecolor('#0f172a')
    
    for ax in [ax1, ax2]:
        ax.set_facecolor('#1e293b')
        ax.grid(True, color='#334155', alpha=0.3)
        ax.tick_params(colors='#94a3b8')

    # Üst: Hız ve GCT Blokları
    ax1.plot(ts, l_vx_c, color='#4ade80', alpha=0.3, label='Sol Hız')
    ax1.plot(ts, r_vx_c, color='#f472b6', alpha=0.3, label='Sağ Hız')
    
    for c in l_cycles:
        ax1.axvspan(ts[c['ic']], ts[c['to']], color='#4ade80', alpha=0.3)
    for c in r_cycles:
        ax1.axvspan(ts[c['ic']], ts[c['to']], color='#f472b6', alpha=0.3)
    
    ax1.set_title(f"Gait Cycle Segmentasyonu: {os.path.basename(filepath)}", color='white')
    ax1.legend()

    # Alt: Faz Analizi (Normalized 0-100%)
    ax2.set_ylabel("Adım No", color='#94a3b8')
    for i, c in enumerate(l_cycles):
        stance_pct = ((c['to'] - c['ic']) / (c['next_ic'] - c['ic'])) * 100
        ax2.barh(f"L-{i+1}", stance_pct, color='#4ade80', edgecolor='white')
        ax2.barh(f"L-{i+1}", 100-stance_pct, left=stance_pct, color='#0ea5e9', edgecolor='white')

    ax2.set_xlabel("Döngü Yüzdesi (%) - [Yeşil: Stance, Mavi: Swing]", color='#94a3b8')
    
    # --- İSTATİSTİK RAPORU ---
    avg_l_gct = np.mean([c['gct_ms'] for c in l_cycles])
    avg_r_gct = np.mean([c['gct_ms'] for c in r_cycles])
    
    # Symmetry Index Formula:
    # $$SI = \frac{|GCT_L - GCT_R|}{0.5 \times (GCT_L + GCT_R)} \times 100$$
    si = (abs(avg_l_gct - avg_r_gct) / (0.5 * (avg_l_gct + avg_r_gct))) * 100

    print(f"\n{'='*50}\nDETAYLI GAIT RAPORU\n{'='*50}")
    print(f"Tespit Edilen Döngü (Sol):  {len(l_cycles)}")
    print(f"Tespit Edilen Döngü (Sağ):  {len(r_cycles)}")
    print(f"Ortalama Sol GCT:         {avg_l_gct:.1f} ms")
    print(f"Ortalama Sağ GCT:        {avg_r_gct:.1f} ms")
    print(f"Symmetry Index (SI):     %{si:.1f}")
    print(f"{'DENGELİ' if si < 5 else 'ASİMETRİK'}")
    print("="*50)

    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("file")
    parser.add_argument("--threshold", type=float, default=1500)
    args = parser.parse_args()
    analyze_gait(args.file, args.threshold)