// components/composite/Analysis/VideoListGrid.tsx
import React from "react";
import { FlatList, StyleSheet } from "react-native";
import VideoListItem from "./VideoListItem";

interface VideoItem {
  id: string;
  thumbnailUri: string;
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
          thumbnailUri={item.thumbnailUri}
          date={item.date}
          score={item.score}
          onPress={() => onSelect(item.id)}
        />
      )}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    paddingTop: 8,
  },
});

export default VideoListGrid;
