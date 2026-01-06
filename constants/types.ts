export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER",
    PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY",
}

export enum ExperienceLevel {
    BEGINNER = "BEGINNER",
    INTERMEDIATE = "INTERMEDIATE",
    ADVANCED = "ADVANCED",
    ELITE = "ELITE",
}

export enum RunningGoal {
    IMPROVE_FORM = "IMPROVE_FORM",
    RUN_FASTER = "RUN_FASTER",
    RUN_LONGER = "RUN_LONGER",
    PREVENT_INJURY = "PREVENT_INJURY",
    PREPARE_FOR_RACE = "PREPARE_FOR_RACE",
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
