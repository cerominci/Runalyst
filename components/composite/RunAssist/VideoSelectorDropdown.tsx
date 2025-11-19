// components/composite/RunAssist/VideoSelectorDropdown.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import Dropdown from "../../atomic/Inputs/Dropdown";
import Subtitle from "../../atomic/Typography/Subtitle";

interface VideoSelectorDropdownProps {
  selectedVideo: string | null;
  onSelect: (id: string) => void;
  videoOptions: { id: string; label: string }[];
}

const VideoSelectorDropdown: React.FC<VideoSelectorDropdownProps> = ({
  selectedVideo,
  onSelect,
  videoOptions,
}) => {
  return (
    <View style={styles.container}>
      <Subtitle>Select a video</Subtitle>

      <Dropdown
        selectedValue={selectedVideo}
        onSelect={(value) => onSelect(value)}
        options={videoOptions.map((v) => v.id)}
        placeholder="Choose a video"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
});

export default VideoSelectorDropdown;
