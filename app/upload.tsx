import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AnalysisLayout } from '@/components/layouts';
import { CustomButton, ProgressBar, StatCard, MetricDisplay } from '@/components';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

/**
 * Upload & Analysis Screen - For uploading videos and viewing results
 * 
 * This demonstrates the AnalysisLayout component with:
 * - Back button navigation
 * - Video upload interface
 * - Progress tracking
 * - Analysis results display
 */
export default function UploadScreen() {
  const router = useRouter();
  const iconColor = useThemeColor({}, 'icon');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.1;
      setUploadProgress(progress);
      if (progress >= 1) {
        clearInterval(interval);
        setIsUploading(false);
        setShowResults(true);
      }
    }, 200);
  };

  return (
    <AnalysisLayout
      title="Video Analysis"
      onBackPress={() => router.back()}>
      {!showResults ? (
        <View style={styles.uploadContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Upload Running Video
          </ThemedText>
          <ThemedText type="default" style={styles.description}>
            Record or upload a video of your running form for analysis
          </ThemedText>

          <TouchableOpacity style={styles.uploadArea} activeOpacity={0.7}>
            <Ionicons name="videocam-outline" size={64} color={iconColor} />
            <ThemedText type="defaultSemiBold" style={styles.uploadText}>
              Tap to Record or Select Video
            </ThemedText>
            <ThemedText type="default" style={styles.uploadHint}>
              Recommended: 10-30 seconds side view
            </ThemedText>
          </TouchableOpacity>

          {isUploading && (
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={uploadProgress}
                showLabel={true}
                label="Uploading..."
                color="#0a7ea4"
              />
            </View>
          )}

          {!isUploading && (
            <CustomButton
              text="Start Analysis"
              onPress={handleUpload}
              style={styles.analyzeButton}
            />
          )}
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Analysis Results
          </ThemedText>

          <View style={styles.statsGrid}>
            <StatCard label="Cadence" value="180" unit="spm" />
            <StatCard label="Stride Length" value="1.2" unit="m" />
            <StatCard label="Ground Contact" value="240" unit="ms" />
            <StatCard label="Vertical Oscillation" value="8.5" unit="cm" />
          </View>

          <MetricDisplay
            primaryValue="85%"
            primaryLabel="Overall Form Score"
            secondaryValue="Good"
            secondaryLabel="Form Rating"
          />

          <View style={styles.recommendations}>
            <ThemedText type="subtitle" style={styles.recommendationsTitle}>
              Recommendations
            </ThemedText>
            <ThemedView style={styles.recommendationItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <ThemedText type="default" style={styles.recommendationText}>
                Maintain your current cadence - it's optimal
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.recommendationItem}>
              <Ionicons name="information-circle" size={20} color="#FF9800" />
              <ThemedText type="default" style={styles.recommendationText}>
                Consider reducing ground contact time for better efficiency
              </ThemedText>
            </ThemedView>
          </View>

          <CustomButton
            text="Analyze Another Video"
            onPress={() => {
              setShowResults(false);
              setUploadProgress(0);
            }}
            variant="outline"
            style={styles.anotherButton}
          />
        </View>
      )}
    </AnalysisLayout>
  );
}

const styles = StyleSheet.create({
  uploadContainer: {
    gap: 24,
  },
  resultsContainer: {
    gap: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  description: {
    opacity: 0.7,
    marginBottom: 8,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#0a7ea4',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 126, 164, 0.05)',
    minHeight: 200,
  },
  uploadText: {
    marginTop: 16,
    marginBottom: 8,
  },
  uploadHint: {
    fontSize: 12,
    opacity: 0.6,
  },
  progressContainer: {
    marginTop: 16,
  },
  analyzeButton: {
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  recommendations: {
    gap: 12,
  },
  recommendationsTitle: {
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(10, 126, 164, 0.05)',
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
  },
  anotherButton: {
    marginTop: 8,
  },
});

