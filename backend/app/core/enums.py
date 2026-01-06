from enum import Enum

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class ExperienceLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    ELITE = "elite"

class RunningGoal(str, Enum):
    WEIGHT_LOSS = "weight_loss"
    IMPROVE_FITNESS = "improve_fitness"
    MARATHON_TRAINING = "marathon_training"
    SPEED_IMPROVEMENT = "speed_improvement"
    STRESS_RELIEF = "stress_relief"
    SOCIAL_RUNNING = "social_running"
