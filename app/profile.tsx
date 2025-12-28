import PrimaryButton from "@/components/atomic/Button/PrimaryButton";
import LoadingSpinner from "@/components/atomic/Feedback/LoadingSpinner";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import ScrollScreen from "@/components/atomic/Layout/ScrollScreen";
import Subtitle from "@/components/atomic/Typography/Subtitle";
import AgeInput from "@/components/composite/Profile/AgeInput";
import ExperienceLevelSelector from "@/components/composite/Profile/ExperienceLevelSelector";
import GenderSelector from "@/components/composite/Profile/GenderSelector";
import HeightInput from "@/components/composite/Profile/HeightInput";
import InjurySelector from "@/components/composite/Profile/InjurySelector";
import RunningGoalSelector from "@/components/composite/Profile/RunningGoalSelector";
import WeightInput from "@/components/composite/Profile/WeightInput";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [runningGoal, setRunningGoal] = useState<string | null>(null);
  const [hasInjuries, setHasInjuries] = useState<boolean | null>(null);

  const validateForm = (): boolean => {
    if (!age.trim() || parseInt(age) < 1 || parseInt(age) > 120) {
      setError("Please enter a valid age (1-120)");
      return false;
    }
    if (!weight.trim() || parseFloat(weight) < 20 || parseFloat(weight) > 300) {
      setError("Please enter a valid weight (20-300 kg)");
      return false;
    }
    if (!height.trim() || parseInt(height) < 100 || parseInt(height) > 250) {
      setError("Please enter a valid height (100-250 cm)");
      return false;
    }
    if (!gender) {
      setError("Please select your gender");
      return false;
    }
    if (!experienceLevel) {
      setError("Please select your running experience level");
      return false;
    }
    if (!runningGoal) {
      setError("Please select your primary running goal");
      return false;
    }
    if (hasInjuries === null) {
      setError("Please indicate if you have any current injuries");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Save profile data to backend
      const profileData = {
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseInt(height),
        gender,
        experienceLevel,
        runningGoal,
        hasInjuries,
      };

      console.log("Profile data:", profileData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Profile submission error:", err);
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollScreen>
        <View style={styles.container}>
          <View style={styles.header}>
            <Subtitle style={styles.title}>Complete Your Profile</Subtitle>
            <Text style={styles.subtitle}>
              Help us personalize your running analysis experience
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <AgeInput value={age} onChangeText={setAge} />
            <WeightInput value={weight} onChangeText={setWeight} />
            <HeightInput value={height} onChangeText={setHeight} />
            <GenderSelector
              selectedValue={gender}
              onSelect={setGender}
            />
            <ExperienceLevelSelector
              selectedValue={experienceLevel}
              onSelect={setExperienceLevel}
            />
            <RunningGoalSelector
              selectedValue={runningGoal}
              onSelect={setRunningGoal}
            />
            <InjurySelector
              hasInjuries={hasInjuries}
              onSelect={setHasInjuries}
            />

            <PrimaryButton
              title={isLoading ? "Saving..." : "Complete Profile"}
              onPress={handleSubmit}
              disabled={isLoading}
              style={styles.submitButton}
            />

            {isLoading && (
              <View style={styles.loadingContainer}>
                <LoadingSpinner size="small" />
              </View>
            )}
          </View>
        </View>
      </ScrollScreen>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  submitButton: {
    marginTop: 8,
    paddingVertical: 16,
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 16,
  },
});

