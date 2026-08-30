"""
Unified Gait Analysis Pipeline

Orchestrates all analysis modules and consolidates results into:
1. Structured return values from all modules
2. Centralized print output (no scattered prints)
3. PNG plots saved instead of displayed
4. JSON output file with all results
"""

import json
import sys
import os
from typing import Optional
import argparse

# Add current directory to path for imports
_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

# Import all analysis modules
from contact_and_overstride import run_gait_pipeline
from new_strike_analysis import analyze_strike_type
from pelvis_analysis import cadence_and_step_vertical_comparison
from swing_stance_analysis import plot_ankle_x as analyze_swing_stance
from trunk_lean_analysis import analyze_forward_trunk_lean
from knee_flexion import plot_ankle_x as analyze_knee_flexion
from overstride_at_contact import calculate_overstride_at_contact


def run_full_pipeline(
    path: str,
    label: str = "Runner",
    fps: float = 60.0,
    output_dir: str = "pipeline_output",
    verbose: bool = True,
    save_plots: bool = True,
) -> dict:
    """
    Run all gait analysis modules and consolidate results.
    """
    os.makedirs(output_dir, exist_ok=True)

    results = {
        "metadata": {
            "input_file": path,
            "label": label,
            "fps": fps,
            "output_directory": output_dir,
        },
        "modules": {}
    }

    print("\n" + "=" * 90)
    print("  UNIFIED GAIT ANALYSIS PIPELINE")
    print("=" * 90)
    print(f"\n  Input file: {path}")
    print(f"  Label:      {label}")
    print(f"  FPS:        {fps}")
    print(f"  Output dir: {output_dir}\n")

    # ── MODULE 1: Contact and Overstride (integrated step finding + strike + IC) ───────
    desc_contact = "Contains frame indices for foot ground contacts and basic initial overstride metrics. In overstride reult the 4-tuple values are mean_abs(average absolute overstride offset across analyzed steps verdict), result, n_over(how many steps were flagged as overstride) and n_tot(total number of steps analyze)."
    if verbose:
        print("  [1/8] Running overstride_metric_1 (step finding + strike + IC)...")
    try:
        gait_result = run_gait_pipeline(
            path=path,
            label=label,
            fps=fps,
            verbose=False,
        )
        results["modules"]["overstride_metric_1"] = {
            "description": desc_contact,
            #"status": "success",
            #"contacts": gait_result.get("contacts", []),
            "overstride": gait_result.get("overstride", {}),
        }
        if verbose:
            print("    ✓ Contact and Overstride complete")
    except Exception as e:
        results["modules"]["overstride_metric_1"] = {"description": desc_contact, "status": "error", "error": str(e)}
        if verbose:
            print(f"    ✗ Contact and Overstride error: {e}")

    # ── MODULE 2: New Strike Analysis (detailed metrics) ─────────────────────
    desc_strike = "Provides overall classification of the foot strike pattern (e.g., mid, foot and heel strikes) and prediction confidence."
    if verbose:
        print("  [2/7] Running new_strike_analysis...")
    try:
        strike_new_result = analyze_strike_type(
            path=path,
            label=label,
            fps=fps,
            plot=False,
        )
        results["modules"]["strike_analysis_new"] = {
            "description": desc_strike,
            "overall": strike_new_result.get("overall", ""),
            "confidence": strike_new_result.get("confidence", "")
        }
        if verbose:
            print("    ✓ New strike analysis complete")
    except Exception as e:
        results["modules"]["strike_analysis_new"] = {"description": desc_strike, "status": "error", "error": str(e)}
        if verbose:
            print(f"    ✗ New strike analysis error: {e}")

    # ── MODULE 3: Pelvis Analysis (cadence & excursion) ──────────────────────
    desc_pelvis = "step_durations_s gives the time in seconds between consecutive detected steps, while mean_stride_L and mean_stride_R give the average distance from one left or right foot contact to the next same-side contact. In the summary, avg_excursion_L and avg_excursion_R mean the average vertical pelvis movement from a peak to the following trough for left and right steps, and avg_half_cycle_L_s and avg_half_cycle_R_s mean the average time between peaks for left and right steps."
    if verbose:
        print("  [3/7] Running pelvis_analysis (cadence & excursion)...")
    try:
        pelvis_plot_path = os.path.join(output_dir, f"{label}_pelvis_analysis.png") if save_plots else None
        pelvis_result = cadence_and_step_vertical_comparison(
            path=path,
            label=label,
            smooth_window=11,
            prominence=15.0,
            min_distance=10,
            fps=fps,
            save_path=pelvis_plot_path,
        )
        results["modules"]["pelvis_analysis"] = {
            "description": desc_pelvis,
            "cadence_steps_per_min": pelvis_result.get("cadence_steps_per_min", ""),
            "step_durations_s": pelvis_result.get("step_durations_s", ""),
            "mean_stride_L": pelvis_result.get("mean_stride_L", ""),
            "mean_stride_R": pelvis_result.get("mean_stride_R", ""),
            "summary": pelvis_result.get("summary", [])
        }
        if verbose:
            print("    ✓ Pelvis analysis complete")
    except Exception as e:
        results["modules"]["pelvis_analysis"] = {"description": desc_pelvis, "status": "error", "error": str(e)}
        if verbose:
            print(f"    ✗ Pelvis analysis error: {e}")

    # ── MODULE 4: Swing/Stance Analysis (flight phase metrics) ───────────────
    desc_swing = "Details flight and stance phase metrics, indicating the percentage of the gait cycle spent in the air (left flight, right flight, double flight)."
    if verbose:
        print("  [4/7] Running swing_stance_analysis (flight metrics)...")
    try:
        swing_plot_path = os.path.join(output_dir, f"{label}_swing_stance.png") if save_plots else None
        swing_result = analyze_swing_stance(path, save_path=swing_plot_path)
        
        if "flight_metrics" in swing_result:
            swing_summary = {
                "description": desc_swing,
                "overall_averages": swing_result.get("flight_metrics", {}).get("overall_averages", {}),
                #"left_foot_cycles": swing_result.get("left_foot_cycles", []) if hasattr(swing_result, "left_foot_cycles") else None,
                #"right_foot_cycles": swing_result.get("right_foot_cycles", []) if hasattr(swing_result, "right_foot_cycles") else None,
                #"plot_path": swing_plot_path,
            }
            results["modules"]["swing_stance_analysis"] = swing_summary
        else:
            swing_result["description"] = desc_swing
            results["modules"]["swing_stance_analysis"] = swing_result
            
        if verbose:
            print("    ✓ Swing/stance analysis complete")
    except Exception as e:
        results["modules"]["swing_stance_analysis"] = {"description": desc_swing, "status": "error", "error": str(e)}
        if verbose:
            print(f"    ✗ Swing/stance analysis error: {e}")

    # ── MODULE 5: Trunk Lean Analysis ──────────────────────────────────────────
    desc_trunk = "Summarizes forward trunk lean angles (mean, standard deviation, min, max) in degrees for global, lower (pelvis), and upper (thoracic) regions."
    if verbose:
        print("  [5/7] Running trunk_lean_analysis...")
    try:
        trunk_result = analyze_forward_trunk_lean(
            path=path,
            label=label,
            fps=fps,
            plot=False,
        )
        trunk_summary = {
            "description": desc_trunk,
            "mean_global": float(trunk_result.get("mean_global", 0)),
            "std_global": float(trunk_result.get("std_global", 0)),
            "min_global": float(trunk_result.get("min_global", 0)),
            "max_global": float(trunk_result.get("max_global", 0)),
            "mean_lower": float(trunk_result.get("mean_lower", 0)),
            "std_lower": float(trunk_result.get("std_lower", 0)),
            "min_lower": float(trunk_result.get("min_lower", 0)),
            "max_lower": float(trunk_result.get("max_lower", 0)),
            "mean_upper": float(trunk_result.get("mean_upper", 0)),
            "std_upper": float(trunk_result.get("std_upper", 0)),
            "min_upper": float(trunk_result.get("min_upper", 0)),
            "max_upper": float(trunk_result.get("max_upper", 0)),
        }
        results["modules"]["trunk_lean_analysis"] = trunk_summary
        if verbose:
            print("    ✓ Trunk lean analysis complete")
    except Exception as e:
        results["modules"]["trunk_lean_analysis"] = {"description": desc_trunk, "status": "error", "error": str(e)}
        if verbose:
            print(f"    ✗ Trunk lean analysis error: {e}")

    # ── MODULE 6: Knee Flexion Analysis ────────────────────────────────────────
    desc_knee = "Tracks knee flexion cycles and distinct frame events (such as foot strikes) for both the left and right legs. foot_strike=first frame of the contact. mid_stance=medium frame of the contact of that foot, att the middle of foot_strike and toe_of. toe_off: frame of the foot release. mid_swing: mid frame of the air time of that leg. the degrees are the knee degrees of these spesific times."
    if verbose:
        print("  [6/7] Running knee_flexion_analysis...")
    try:
        knee_plot_path = os.path.join(output_dir, f"{label}_knee_flexion.png") if save_plots else None
        knee_result = analyze_knee_flexion(path, save_path=knee_plot_path)
        knee_summary = {
            "description": desc_knee,
            "left_events": knee_result.get("left_events", {}),
            "right_events": knee_result.get("right_events", {}),
        }
        results["modules"]["knee_flexion_analysis"] = knee_summary
        if verbose:
            print("    ✓ Knee flexion analysis complete")
    except Exception as e:
        results["modules"]["knee_flexion_analysis"] = {"description": desc_knee, "status": "error", "error": str(e)}
        if verbose:
            print(f"    ✗ Knee flexion analysis error: {e}")

    # ── MODULE 7: Alpers Overstride Analysis ────────────────────────────────────
    desc_alpers = "Calculates the precise overstride index in degrees, integrating the alpha angle(angle between ground normal and leg, leg is pelvis to foot line) and forward lean to assess if the foot lands too far ahead of the center of mass. index>10 meand overstride , >5 is mild overstride, and less than 5 is acceptable."
    if verbose:
        print("  [7/7] Running overstride_metric_2_analysis...")
    try:
        frames = gait_result.get("frames", [])
        contacts = gait_result.get("contacts", [])
        if frames and contacts:
            alpers_result = calculate_overstride_at_contact(frames, contacts, k=0.7)
            alpers_result["description"] = desc_alpers
            results["modules"]["overstride_metric_2"] = alpers_result
            if verbose:
                print("    ✓ Alpers overstride analysis complete")
        else:
            results["modules"]["overstride_metric_2"] = {
                "description": desc_alpers, 
                "status": "error", 
                "error": "No frames or contacts from overstride_metric_1"
            }
            if verbose:
                print("    ✗ Alpers overstride analysis error: No frames or contacts from overstride_metric_1")
    
    except Exception as e:
        results["modules"]["overstride_metric_2"] = {"description": desc_alpers, "status": "error", "error": str(e)}
        if verbose:
            print(f"    ✗ Alpers overstride analysis error: {e}")

    # ── Print consolidated summary ─────────────────────────────────────────────
    if verbose:
        print("\n" + "─" * 90)
        print("  PIPELINE SUMMARY")
        print("─" * 90)

        # Contact and Overstride Summary
        gp = results["modules"].get("overstride_metric_1", {})
        if gp.get("status") == "success":
            print(f"\n  ▸ CONTACT AND OVERSTRIDE")
            contacts = gp.get('contacts', [])
            contact_frames = [int(c.get('frame')) for c in contacts if isinstance(c, dict) and 'frame' in c]
            print(f"    Contacts detected: {len(contact_frames)} frames")
            print(f"    Contact frames:    {contact_frames}")
            ov = gp.get('overstride', {})
            if isinstance(ov, tuple) and len(ov) >= 4:
                print(f"    Overstride:        {ov[2]} / {ov[3]} steps (mean: {ov[0]:+.1f})")

        # Strike Analysis Summary
        san = results["modules"].get("strike_analysis_new", {})
        if san.get("status") != "error":
            print(f"\n  ▸ STRIKE ANALYSIS")
            print(f"    Primary:           {san.get('overall', '?')}")
            print(f"    Confidence:        {san.get('confidence', '?')}")

        # Pelvis Summary
        pa = results["modules"].get("pelvis_analysis", {})
        if pa.get("status") != "error":
            print(f"\n  ▸ PELVIS ANALYSIS")
            print(f"    Cadence:           {pa.get('cadence_steps_per_min', 0):.1f} steps/min")

        # Trunk Lean Summary
        ta = results["modules"].get("trunk_lean_analysis", {})
        if ta.get("status") != "error":
            print(f"\n  ▸ TRUNK LEAN ANALYSIS")
            print(f"    Global angle:      {ta.get('mean_global', 0):+.2f}°")

        # Swing/Stance Summary
        ssa = results["modules"].get("swing_stance_analysis", {})
        if ssa.get("status") != "error":
            print(f"\n  ▸ SWING/STANCE ANALYSIS")
            flight = ssa.get('flight_metrics', {})
            if flight and 'overall_averages' in flight:
                ov_avg = flight['overall_averages']
                print(f"    Left flight:       {ov_avg.get('avg_left_flight', 0):.1f}%")

        # Knee Flexion Summary
        ka = results["modules"].get("knee_flexion_analysis", {})
        if ka.get("status") != "error":
            print(f"\n  ▸ KNEE FLEXION ANALYSIS")
            l_events = ka.get('left_events', {})
            r_events = ka.get('right_events', {})
            print(f"    Left foot cycles:  {len(l_events.get('foot_strike', []))} detected")

        # Alpers Overstride Summary
        ao = results["modules"].get("overstride_metric_2", {})
        if ao.get("status") != "error":
            print(f"\n  ▸ ALPERS OVERSTRIDE")
            mean_osi = ao.get('mean_overstride_index_deg')
            if mean_osi is not None:
                print(f"    Mean overstride index: {mean_osi:.2f}°")
            else:
                print(f"    No overstride data available")

        print("\n" + "=" * 90 + "\n")

    # ── Save JSON output ───────────────────────────────────────────────────────
    json_output_path = os.path.join(output_dir, f"{label}_results.json")
    with open(json_output_path, "w") as f:
        # Make results JSON serializable
        json_results = {
            "metadata": results["metadata"],
            "modules": {}
        }
        for module_name, module_data in results["modules"].items():
            json_results["modules"][module_name] = _make_serializable(module_data)

        json.dump(json_results, f, indent=2, default=str)

    if verbose:
        print(f"  Results saved to: {json_output_path}\n")

    return json_results


def _make_serializable(obj):
    """Convert numpy arrays and other non-serializable types to JSON-compatible formats."""
    if isinstance(obj, dict):
        return {k: _make_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [_make_serializable(item) for item in obj]
    elif hasattr(obj, 'tolist'):  # numpy arrays
        return obj.tolist()
    elif isinstance(obj, (int, float, str, bool, type(None))):
        return obj
    else:
        return str(obj)


def main():
    parser = argparse.ArgumentParser(
        description="Unified Gait Analysis Pipeline"
    )
    parser.add_argument("jsonl_file", help="Path to JSONL file with gait data")
    parser.add_argument("--label", default="Runner", help="Subject label (default: Runner)")
    parser.add_argument("--fps", type=float, default=60.0, help="Frames per second (default: 60)")
    parser.add_argument("--output-dir", default="pipeline_output", help="Output directory")
    parser.add_argument("--quiet", action="store_true", help="Suppress verbose output")
    parser.add_argument("--no-plots", action="store_true", help="Do not save PNG plots")

    args = parser.parse_args()

    results = run_full_pipeline(
        path=args.jsonl_file,
        label=args.label,
        fps=args.fps,
        output_dir=args.output_dir,
        verbose=not args.quiet,
        save_plots=not args.no_plots,
    )

    return results


if __name__ == "__main__":
    main()