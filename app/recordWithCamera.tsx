import PrimaryButton from "@/components/atomic/Button/PrimaryButton";
import SecondaryButton from "@/components/atomic/Button/SecondaryButton";
import LoadingSpinner from "@/components/atomic/Feedback/LoadingSpinner";
import { binaryUpload, createRunRecord, generateUploadUrl } from "@/utils/endpoints";
import { runPreflightCheck } from "@/utils/preflightCheck";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// TODO: Replace with your actual email and password
const DEV_EMAIL = "your-email@example.com";
const DEV_PASSWORD = "your-password-here";

// TODO: Replace with your actual backend API base URL
const API_BASE_URL = "https://your-backend-api.com";

export default function App() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const recordingPromiseRef = useRef<Promise<{ uri: string } | undefined> | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [recording, setRecording] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [status, setStatus] = useState<"idle" | "checking" | "ready" | "fail">("idle");
  const [metrics, setMetrics] = useState<{ avgBrightness?: number; avgSharpness?: number } | null>(null);
  const [mode, setMode] = useState<"day" | "night">("day");
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  
  // Create video player for expo-video (hook must be at top level)
  const player = useVideoPlayer(uri || "", (player) => {
    player.loop = true;
  });

  // Update player source when URI changes
  useEffect(() => {
    if (uri) {
      // Use replaceAsync to avoid UI freezes on iOS
      player
        .replaceAsync(uri)
        .then(() => {
          player.loop = true;
          player.play();
        })
        .catch((error) => {
          console.error("Error replacing video source:", error);
        });
    }
  }, [uri, player]);

  // Manual quality check function
  const checkQuality = async () => {
    if (!ref.current || recording || isCheckingQuality) return;

    setIsCheckingQuality(true);
    setStatus("checking");
    setMetrics(null);

    try {
      const cameraRef = ref.current;
      if (!cameraRef) {
        setStatus("idle");
        setIsCheckingQuality(false);
        return;
      }

      const thresholds =
        mode === "day"
          ? { minBrightness: 60, maxBrightness: 220, minSharpness: 0.035 }
          : { minBrightness: 25, maxBrightness: 200, minSharpness: 0.02 };

      // Run preflight check - only take one screenshot
      const result = await runPreflightCheck(cameraRef, {
        ...thresholds,
        framesToSample: 1, // Only take one screenshot instead of multiple
        sampleIntervalMs: 0, // No delay needed for single frame
      });
      console.log("Preflight results:", result);

      // Check if camera is still mounted before updating state
      if (!ref.current) {
        console.warn("Camera unmounted after preflight check, skipping state update");
        setIsCheckingQuality(false);
        return;
      }

      setMetrics(result.metrics);

      if (result.pass) {
        setStatus("ready");
      } else {
        setStatus("fail");
      }
    } catch (err: any) {
      console.error("Error during preflight:", err);
      if (ref.current) {
        setStatus("fail");
      }
    } finally {
      setIsCheckingQuality(false);
    }
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", color: "white", marginBottom: 20 }}>
          We need your permission to use the camera
        </Text>
        <PrimaryButton onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const recordVideo = async () => {
    if (recording) {
      // Stop recording
      setRecording(false);
      ref.current?.stopRecording();
      // Wait for the promise to resolve
      if (recordingPromiseRef.current) {
        try {
          const video = await recordingPromiseRef.current;
          console.log({ video });
          if (video?.uri) {
            setUri(video.uri);
            setIsVideo(true);
          }
          recordingPromiseRef.current = null;
        } catch (error) {
          console.error("Error getting video:", error);
          recordingPromiseRef.current = null;
        }
      }
      return;
    }

    // Start recording
    if (!ref.current) return;
    
    setRecording(true);
    const promise = ref.current.recordAsync();
    recordingPromiseRef.current = promise;

    promise.catch((error) => {
      console.error("Recording error:", error);
      setRecording(false);
      recordingPromiseRef.current = null;
    });
  };

  const toggleFacing = () => {
    if (recording) return;
    setFacing((prev) => (prev === "back" ? "front" : "back"));
    setStatus("idle");
    setMetrics(null);
  };

  const toggleMode = () => {
    if (recording) return;
    setMode((prev) => (prev === "day" ? "night" : "day"));
    setStatus("idle");
    setMetrics(null);
  };

  const getAdvice = () => {
    if (!metrics) return "Analyzing camera quality...";
    const { avgBrightness, avgSharpness } = metrics;
    const advices: string[] = [];

    if (typeof avgBrightness === "number") {
      if (avgBrightness < 50) {
        advices.push("Scene is dark — move to a brighter area or add light.");
      } else if (avgBrightness < 90) {
        advices.push("A little dim — try adding more light.");
      } else if (avgBrightness > 220) {
        advices.push("Very bright — avoid strong backlight.");
      }
    }

    if (typeof avgSharpness === "number") {
      if (avgSharpness < 0.02) {
        advices.push("Image looks blurry — keep camera steady, clean lens.");
      } else if (avgSharpness < 0.04) {
        advices.push("Slight blur — try steadying your device.");
      }
    }

    if (advices.length === 0) return "✅ Ready to record";
    return advices.join(" ");
  };

  const handleContinue = async () => {
    if (!uri) return;

    // Ensure preview audio is muted during upload.
    (player as any).pause?.();
    (player as any).muted = true;
    setIsUploading(true);

    try {
      console.log("Starting upload process...");

      // Step 3: Get upload URL
      console.log("Getting upload URL...");
      const { upload_url, path } = await generateUploadUrl();
      console.log('Upload URL received:', { path });
      console.log('Upload URL:', upload_url);
      
      // Step 4: Upload video file to signed URL using centralized binary upload function
      console.log('Uploading video to signed URL...');
      await binaryUpload(uri, upload_url, 'video/mp4');
      
      console.log('Video uploaded successfully to:', path);
      
      // Step 5: Create run record (required for analysis to appear in app)
      const response = await createRunRecord(path, "run");
      if (response == null) {
        throw new Error("Create run response is null");
      }
      console.log("Run record created:", response);
      
      /*
      // Step 5: Create run record
      console.log('Creating run record...');
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const runResponse = await fetch(`${API_BASE_URL}/runs/create-record`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_path: path,
          title: `Run ${new Date().toISOString()}`,
        }),
      });
      
      if (!runResponse.ok) {
        const error = await runResponse.json().catch(() => ({ message: 'Failed to create run record' }));
        throw new Error(error.message || `Failed to create run record: ${runResponse.statusText}`);
      }
      
      const runResult = await runResponse.json();
      console.log('Run record created:', runResult);
      
      // TODO: Navigate to analysis page or handle success
      // router.push('/analysis' as any);
      */
      alert("Video uploaded and analysis queued successfully!");
    } catch (error: any) {
      console.error("Error in upload process:", error);
      alert(`Failed to upload video: ${error.message || "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    setUri(null);
    setIsVideo(false);
    setStatus("idle");
    setMetrics(null);
  };

  const renderVideo = (uri: string) => {
    if (isUploading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Uploading video...</Text>
          <Text style={styles.loadingSubtext}>
            Please wait while we process your video
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.previewContainer}>
        <VideoView
          player={player}
          style={styles.previewVideo}
          nativeControls
          contentFit="contain"
        />
        <View style={styles.buttonRow}>
          <SecondaryButton
            title="Record another"
            onPress={handleRetake}
            style={styles.actionButton}
          />
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            style={styles.actionButton}
          />
        </View>
      </View>
    );
  };

  const renderCamera = () => {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          ref={ref}
          mode="video"
          facing={facing}
          mute={false}
          responsiveOrientationWhenOrientationLocked
        />

        {/* Back button */}
        {!recording && (
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={18} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Mode selector */}
        {!recording && (
          <View style={styles.modeContainer}>
            <Pressable
              onPress={() => toggleMode()}
              style={[
                styles.modeButton,
                { backgroundColor: mode === "day" ? "#3B82F6" : "#E5E7EB" },
              ]}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  { color: mode === "day" ? "#FFFFFF" : "#64748B" },
                ]}
              >
                Day
              </Text>
            </Pressable>
            <Pressable
              onPress={() => toggleMode()}
              style={[
                styles.modeButton,
                { backgroundColor: mode === "night" ? "#6366F1" : "#E5E7EB" },
              ]}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  { color: mode === "night" ? "#FFFFFF" : "#64748B" },
                ]}
              >
                Night
              </Text>
            </Pressable>
          </View>
        )}

        {/* Status indicator and Check Quality button */}
        {!recording && (
          <View style={styles.statusContainer}>
            {status === "idle" && (
              <>
                <Text style={styles.statusText}>Press "Check Quality" to analyze</Text>
                <PrimaryButton
                  title="Check Quality"
                  onPress={checkQuality}
                  disabled={isCheckingQuality}
                  style={styles.checkQualityButton}
                />
              </>
            )}
            {status === "checking" && (
              <>
                <LoadingSpinner size="small" />
                <Text style={styles.statusText}>Analyzing quality...</Text>
              </>
            )}
            {status === "ready" && (
              <>
                <Text style={[styles.statusText, styles.readyText]}>✅ Ready to record</Text>
                {metrics && (
                  <Text style={styles.adviceText}>{getAdvice()}</Text>
                )}
                <PrimaryButton
                  title="Check Quality Again"
                  onPress={checkQuality}
                  disabled={isCheckingQuality}
                  style={styles.checkQualityButton}
                />
              </>
            )}
            {status === "fail" && (
              <>
                <Text style={[styles.statusText, styles.failText]}>❌ Quality too low</Text>
                {metrics && (
                  <Text style={styles.adviceText}>{getAdvice()}</Text>
                )}
                <PrimaryButton
                  title="Check Quality Again"
                  onPress={checkQuality}
                  disabled={isCheckingQuality}
                  style={styles.checkQualityButton}
                />
              </>
            )}
            {metrics && <Text style={styles.adviceText}>{getAdvice()}</Text>}
          </View>
        )}

        <View style={styles.shutterContainer}>
          <Pressable onPress={toggleFacing} disabled={recording}>
            <FontAwesome6
              name="rotate-left"
              size={32}
              color={recording ? "#666" : "white"}
            />
          </Pressable>
          <Pressable onPress={recordVideo} disabled={(status !== "ready" && !recording) || isCheckingQuality}>
            {({ pressed }) => (
              <View
                style={[
                  styles.shutterBtn,
                  {
                    opacity: pressed ? 0.5 : (status === "ready" || recording) ? 1 : 0.3,
                  },
                ]}
              >
                <View
                  style={[
                    styles.shutterBtnInner,
                    {
                      backgroundColor: recording ? "red" : "white",
                    },
                  ]}
                />
              </View>
            )}
          </Pressable>
          <View style={{ width: 32 }} />
        </View>
        {recording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording...</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {uri ? renderVideo(uri) : renderCamera()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraContainer: StyleSheet.absoluteFillObject,
  camera: StyleSheet.absoluteFillObject,
  backBtn: {
    position: "absolute",
    top: 56,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  modeContainer: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusContainer: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 16,
    borderRadius: 12,
    maxWidth: "80%",
    minWidth: 200,
  },
  statusText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  readyText: {
    color: "#4ade80",
  },
  failText: {
    color: "#f87171",
  },
  adviceText: {
    color: "#e5e7eb",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  previewContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000",
  },
  previewVideo: {
    width: "100%",
    height: 400,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    textAlign: "center",
  },
  loadingSubtext: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
  },
  recordingIndicator: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(220, 38, 38, 0.8)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "white",
    marginRight: 8,
  },
  recordingText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  checkQualityButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 150,
  },
});
