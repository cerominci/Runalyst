import { AnalysisModulesPayload } from "@/utils/endpoints";

export const MOCK_ANALYSIS_MODULES: AnalysisModulesPayload = {
  pelvis_analysis: {
    summary: {
      avg_excursion_L: 10.961428833007812,
      avg_excursion_R: 9.837745361328125,
      avg_excursion_all: 10.450663618607955,
      avg_half_cycle_L_s: 0.45527083333333335,
      avg_half_cycle_R_s: 0.4692791666666666,
    },
    description:
      "step_durations_s gives the time in seconds between consecutive detected steps. avg_excursion_* and avg_half_cycle_* summarize pelvis movement and timing.",
    mean_stride_L: 177.42896149736632,
    mean_stride_R: 177.67368794674536,
    step_durations_s: [
      0.47278125,
      0.4902916666666667,
      0.43776041666666665,
      0.43776041666666665,
      0.4377604166666669,
      0.4727812499999997,
      0.4377604166666669,
      0.47278125000000015,
      0.45527083333333307,
      0.4727812499999997,
      0.4902916666666668,
    ],
    cadence_steps_per_min: 129.97189685942274,
  },
  overstride_metric_1: {
    overstride: [269.2, "yes", 12, 12],
    description:
      "Contains frame indices for foot ground contacts and basic initial overstride metrics.",
  },
  overstride_metric_2: {
    comment: "Belirgin overstride egilimi.",
    description:
      "Calculates the precise overstride index in degrees, integrating alpha angle and forward lean.",
    per_contact: [
      { side: "L", frame: 0, alpha_deg: 16.2984, lean_forward_deg: 17.3835, overstride_index_deg: 4.1299 },
      { side: "R", frame: 27, alpha_deg: 15.504, lean_forward_deg: 11.5625, overstride_index_deg: 7.4103 },
      { side: "L", frame: 55, alpha_deg: 16.0904, lean_forward_deg: 10.693, overstride_index_deg: 8.6053 },
      { side: "R", frame: 80, alpha_deg: 16.4789, lean_forward_deg: 8.6417, overstride_index_deg: 10.4297 },
      { side: "L", frame: 105, alpha_deg: 18.0689, lean_forward_deg: 8.6648, overstride_index_deg: 12.0035 },
      { side: "R", frame: 130, alpha_deg: 19.2174, lean_forward_deg: 9.4297, overstride_index_deg: 12.6167 },
      { side: "L", frame: 157, alpha_deg: 17.3163, lean_forward_deg: 6.9586, overstride_index_deg: 12.4453 },
      { side: "R", frame: 182, alpha_deg: 20.5866, lean_forward_deg: 8.5433, overstride_index_deg: 14.6063 },
      { side: "L", frame: 209, alpha_deg: 18.3802, lean_forward_deg: 10.8585, overstride_index_deg: 10.7792 },
      { side: "R", frame: 235, alpha_deg: 21.6482, lean_forward_deg: 5.8488, overstride_index_deg: 17.5541 },
      { side: "L", frame: 262, alpha_deg: 19.0264, lean_forward_deg: 6.2966, overstride_index_deg: 14.6188 },
      { side: "R", frame: 291, alpha_deg: 22.0525, lean_forward_deg: 5.0772, overstride_index_deg: 18.4984 },
    ],
    mean_alpha_deg: 18.389023299663062,
    mean_lean_forward_deg: 9.163197425199034,
    mean_overstride_index_deg: 11.974785102023736,
  },
  strike_analysis_new: {
    overall: "HEEL",
    confidence: "medium",
    description:
      "Provides overall classification of the foot strike pattern and prediction confidence.",
  },
  trunk_lean_analysis: {
    max_lower: 13.179062275522128,
    max_upper: 16.520681954251128,
    min_lower: -3.401057952813469,
    min_upper: -1.259053833891156,
    std_lower: 3.2974695497233655,
    std_upper: 3.3392292682762315,
    max_global: 14.727998334092373,
    mean_lower: 5.251913879312267,
    mean_upper: 5.485982291425563,
    min_global: -1.6156313041308656,
    std_global: 3.216880211539108,
    description:
      "Summarizes forward trunk lean angles (mean, std, min, max) for global, lower, and upper regions.",
    mean_global: 5.376459227619988,
  },
  knee_flexion_analysis: {
    description:
      "Tracks knee flexion cycles and frame events (foot_strike, mid_stance, toe_off, mid_swing).",
    left_events: {
      toe_off: [[27, 145.2982], [77, 154.9319], [127, 160.5623], [177, 154.3364], [237, 110.5305]],
      mid_swing: [[38, 96.2085], [90, 83.0416], [141, 88.7747], [192, 65.4057], [244, 70.542]],
      mid_stance: [[9, 131.7882], [63, 131.5403], [114, 121.1805], [166, 126.6674], [237, 110.5305]],
      foot_strike: [[0, 159.4249], [51, 162.3189], [105, 162.2403], [156, 164.853], [209, 160.7992]],
    },
    right_events: {
      toe_off: [[52, 143.2479], [107, 115.6974], [153, 151.1334], [207, 142.5853], [257, 154.1763]],
      mid_swing: [[10, 92.4264], [64, 86.0648], [116, 72.44], [166, 73.8869], [218, 67.7749]],
      mid_stance: [[35, 123.8113], [107, 115.6974], [140, 129.4636], [192, 126.4779], [245, 129.3671]],
      foot_strike: [[29, 145.2753], [81, 147.6479], [131, 156.1498], [181, 155.9672], [231, 155.568]],
    },
  },
  swing_stance_analysis: {
    description:
      "Details flight and stance phase metrics, indicating percentage of gait cycle in the air.",
    overall_averages: {
      avg_left_flight: 53.93721600880314,
      avg_right_flight: 48.69218911560754,
      avg_double_flight: 6.853387024863163,
    },
  },
};
