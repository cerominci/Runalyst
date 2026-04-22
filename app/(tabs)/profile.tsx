import Column from "@/components/atomic/Layout/Column";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import Subtitle from "@/components/atomic/Typography/Subtitle";
import Title from "@/components/atomic/Typography/Title";
import VideoListGrid from "@/components/composite/Analysis/VideoListGrid";
import { getAllRuns } from "@/utils/devAuth";
import { useIsFocused } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

export default function ProfileScreen() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFocused = useIsFocused();

  const fetchRuns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const runs = await getAllRuns();

      // Transform runs data to match VideoListGrid format
      const transformedVideos = runs.map((run) => ({
        id: run.id.toString(),
        thumbnailUri:
          "https://via.placeholder.com/150x100/cccccc/000000?text=No+Thumbnail",
        date: new Date(run.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        score: undefined, // No score data from API yet
      }));

      setVideos(transformedVideos);
    } catch (err: any) {
      console.error("Error fetching runs:", err);
      setError(err.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchRuns();
    }
  }, [isFocused, fetchRuns]);

  const handleVideoSelect = (id: string) => {
    // Handle video selection - for now, just log
    console.log("Selected video:", id);
  };

  return (
    <ScreenContainer>
      <Column style={styles.content}>
        <View style={styles.headerSection}>
          <Title style={styles.title}>Your Videos</Title>
          <Subtitle style={styles.subtitle}>
            View your uploaded videos and analysis history.
          </Subtitle>
        </View>

        {/* Videos List */}
        <View style={styles.videosSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Subtitle style={styles.loadingText}>
                Loading your videos...
              </Subtitle>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Subtitle style={styles.errorText}>{error}</Subtitle>
            </View>
          ) : videos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Subtitle style={styles.emptyText}>
                No videos uploaded yet.
              </Subtitle>
            </View>
          ) : (
            <VideoListGrid videos={videos} onSelect={handleVideoSelect} />
          )}
        </View>
      </Column>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 24,
  },
  headerSection: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },
  videosSection: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#64748B",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 16,
  },
});
