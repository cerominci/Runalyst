/** Must match backend / Pydantic profile enums (JSON uses these exact strings). */
export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
  PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

export enum ExperienceLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  ELITE = "elite",
}

export enum RunningGoal {
  WEIGHT_LOSS = "weight_loss",
  IMPROVE_FITNESS = "improve_fitness",
  MARATHON_TRAINING = "marathon_training",
  SPEED_IMPROVEMENT = "speed_improvement",
  STRESS_RELIEF = "stress_relief",
  SOCIAL_RUNNING = "social_running",
}

export interface Profile {
  user_id: number;
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  bio?: string | null;
  gender?: Gender | null;
  experience_level?: ExperienceLevel | null;
  running_goal?: RunningGoal | null;
  has_injuries?: boolean | null;
}

export interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
  profile?: Profile | null;
}

export interface ProfileUpdateIn {
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  bio?: string | null;
  gender?: Gender | null;
  experience_level?: ExperienceLevel | null;
  running_goal?: RunningGoal | null;
  has_injuries?: boolean | null;
}
