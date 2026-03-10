import json
import os
import argparse
import numpy as np
import matplotlib.pyplot as plt
from scipy.ndimage import uniform_filter1d

# --- İndeksler (Sabit) ---
L_ANKLE = 7
R_ANKLE = 8
PELVIS = 0

def load_nlf(filepath):
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Dosya bulunamadı: {filepath}")
    with open(filepath) as f:
        return [json.loads(line) for line in f]

def plateau_smooth(signal, window=10, std_threshold=80):
    """Stance fazında (ayak sabitken) gürültüyü temizler."""
    result = signal.copy()
    n = len(signal)
    for i in range(0, n, window):
        end = min(i + window, n)
        segment = signal[i:end]
        if len(segment) >= 3 and np.std(segment) < std_threshold:
            result[i:end] = np.mean(segment)
    return result

def remove_spikes(signal):
    """Anlık sıçramaları (spike) temizler."""
    result = signal.copy()
    n = len(signal)
    is_active = np.abs(signal) > 0
    i = 0
    while i < n:
        if is_active[i]:
            start = i
            while i < n and is_active[i]: i += 1
            if (i - start) <= 3:
                result[start:i] = 0
        else: i += 1
    return result

def get_gct_segments(vx_signal, timestamps):
    """Hızın sıfır olduğu (yerle temas) bölgeleri yakalar."""
    segments = []
    is_stance = vx_signal == 0
    n = len(vx_signal)
    i = 0
    while i < n:
        if is_stance[i]:
            start = i
            while i < n and is_stance[i]: i += 1
            if start > 0 and i < n:
                segments.append((start, i))
        else: i += 1
    return segments

def analyze_file(filepath, vel_threshold=1500):
    frames = load_nlf(filepath)
    fn = os.path.basename(filepath)
    
    # Zaman ve Pozisyon Verileri
    ts = np.array([f['timestamp_sec'] for f in frames])
    left_x = np.array([f['joints_3d'][0][0][L_ANKLE][0] for f in frames])
    right_x = np.array([f['joints_3d'][0][0][R_ANKLE][0] for f in frames])
    
    # 1. Yumuşatma (Smoothing)
    l_smooth = plateau_smooth(uniform_filter1d(left_x, size=7))
    r_smooth = plateau_smooth(uniform_filter1d(right_x, size=7))
    
    # 2. Hız Hesaplama (Velocity)
    # dt = 1/FPS varsayımı yerine gerçek timestamp farkı
    dt = np.diff(ts, prepend=ts[0] - (ts[1]-ts[0]))
    dt[dt <= 0] = 1e-6
    l_vx = np.diff(l_smooth, prepend=l_smooth[0]) / dt
    r_vx = np.diff(r_smooth, prepend=r_smooth[0]) / dt
    
    # 3. Temizleme (Hız eşiği altı sıfır kabul edilir)
    l_vx_c = remove_spikes(np.where(l_vx < vel_threshold, 0, l_vx))
    r_vx_c = remove_spikes(np.where(r_vx < vel_threshold, 0, r_vx))
    
    # 4. GCT Segmentasyonu
    l_gct_segs = get_gct_segments(l_vx_c, ts)
    r_gct_segs = get_gct_segments(r_vx_c, ts)
    
    # --- GÖRSELLEŞTİRME ---
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 9), sharex=True)
    fig.patch.set_facecolor('#0f172a')
    
    for ax in [ax1, ax2]:
        ax.set_facecolor('#1e293b')
        ax.grid(True, color='#334155', alpha=0.3)
        ax.tick_params(colors='#94a3b8')

    # Üst: X Pozisyonu
    ax1.plot(ts, l_smooth, color='#4ade80', lw=2, label='Sol Ayak X')
    ax1.plot(ts, r_smooth, color='#f472b6', lw=2, label='Sağ Ayak X')
    ax1.set_title(f"Gait Analizi (X-Velocity tabanlı): {fn}", color='white', size=14)
    ax1.legend(facecolor='#0f172a', labelcolor='white')

    # Alt: Hız ve GCT (Temas) Bölgeleri
    ax2.plot(ts, l_vx_c, color='#4ade80', alpha=0.2)
    ax2.plot(ts, r_vx_c, color='#f472b6', alpha=0.2)
    
    # Temas bölgelerini (GCT) boya
    for i, (s, e) in enumerate(l_gct_segs):
        ax2.axvspan(ts[s], ts[e], color='#4ade80', alpha=0.4, label='Sol GCT' if i==0 else "")
    for i, (s, e) in enumerate(r_gct_segs):
        ax2.axvspan(ts[s], ts[e], color='#f472b6', alpha=0.4, label='Sağ GCT' if i==0 else "")

    ax2.set_xlabel("Zaman (s)", color='#94a3b8')
    ax2.set_ylabel("Hız (Vx)", color='#94a3b8')
    ax2.legend(facecolor='#0f172a', labelcolor='white')

    # İstatistik Raporu
    l_ms = [(ts[e]-ts[s])*1000 for s, e in l_gct_segs]
    r_ms = [(ts[e]-ts[s])*1000 for s, e in r_gct_segs]
    
    print("\n" + "="*50)
    print(f" DOSYA: {fn}")
    print("-" * 50)
    if l_ms and r_ms:
        print(f" Sol GCT (Ort):  {np.mean(l_ms):.1f} ms")
        print(f" Sağ GCT (Ort): {np.mean(r_ms):.1f} ms")
        print(f" Asimetri:      {abs(np.mean(l_ms)-np.mean(r_ms)):.1f} ms")
    else:
        print(" Uyarı: Yeterli adım tespit edilemedi. Eşik değerini kontrol edin.")
    print("="*50 + "\n")

    plt.tight_layout()
    plt.show()

def main():
    parser = argparse.ArgumentParser(description="Ankle X-Velocity tabanlı GCT Analizi")
    parser.add_argument("file", help="Analiz edilecek .jsonl dosyasının yolu")
    parser.add_argument("--threshold", type=float, default=1500, help="Hız eşiği (Stance algılama için)")
    
    args = parser.parse_args()
    
    try:
        analyze_file(args.file, vel_threshold=args.threshold)
    except Exception as e:
        print(f"Hata oluştu: {e}")

if __name__ == "__main__":
    main()