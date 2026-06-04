import React from "react";
import { FlatList, StyleSheet } from "react-native";
import VideoListItem from "./VideoListItem";

interface VideoItem {
  id: string;
  title?: string | null;
  thumbnailUri?: string;
  date: string;
  score?: number;
}

interface VideoListGridProps {
  videos: VideoItem[];
  onSelect: (id: string) => void;
}

const VideoListGrid: React.FC<VideoListGridProps> = ({ videos, onSelect }) => {
  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <VideoListItem
          runId={item.id}
          title={item.title}
          thumbnailUri={item.thumbnailUri}
          date={item.date}
          score={item.score}
          onPress={() => onSelect(item.id)}
        />
      )}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 4,
  },
});

export default VideoListGrid;
