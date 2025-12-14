import PrimaryButton from "@/components/atomic/Button/PrimaryButton";
import SecondaryButton from "@/components/atomic/Button/SecondaryButton";
import LoadingSpinner from "@/components/atomic/Feedback/LoadingSpinner";
import { generateUploadUrl, login, register } from "@/utils/devAuth";
import { runPreflightCheck } from "@/utils/preflightCheck";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import { VideoView, useVideoPlayer } from "expo-video";
import { startTransition, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

// TODO: Replace with your actual email and password
const DEV_EMAIL = 'your-email@example.com';
const DEV_PASSWORD = 'your-password-here';

// TODO: Replace with your actual backend API base URL
const API_BASE_URL = 'https://your-backend-api.com';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const recordingPromiseRef = useRef<Promise<{ uri: string } | undefined> | null>(null);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [recording, setRecording] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [status, setStatus] = useState<"loading" | "checking" | "ready" | "fail">("loading");
  const [metrics, setMetrics] = useState<{ avgBrightness?: number; avgSharpness?: number } | null>(null);
  const [mode, setMode] = useState<"day" | "night">("day");
  const [isUploading, setIsUploading] = useState(false);
  
  // Create video player for expo-video (hook must be at top level)
  const player = useVideoPlayer(uri || '', (player) => {
    player.loop = true;
  });
  
  // Update player source when URI changes
  useEffect(() => {
    if (uri) {
      // Use replaceAsync to avoid UI freezes on iOS
      player.replaceAsync(uri).then(() => {
        player.loop = true;
        player.play();
      }).catch((error) => {
        console.error("Error replacing video source:", error);
      });
    }
  }, [uri, player]);

  // Start preflight checks when camera is ready
  // Must be called before any conditional returns (Rules of Hooks)
  useEffect(() => {
    // Only run if permission is granted
    if (!permission?.granted || !ref.current || recording) return;

    const startQualityChecks = () => {
      const runCheck = async () => {
        // Don't check if camera is not available or recording
        if (!ref.current || recording) return;
        
        // Store ref in a local variable to ensure it doesn't change during async operation
        const cameraRef = ref.current;
        if (!cameraRef) return;

        try {
          // Use startTransition to mark status update as non-urgent
          // This prevents blocking the photo capture process
          startTransition(() => {
            setStatus((currentStatus) => {
              return currentStatus === "loading" ? "checking" : currentStatus;
            });
          });

          const thresholds =
            mode === "day"
              ? { minBrightness: 60, maxBrightness: 220, minSharpness: 0.035 }
              : { minBrightness: 25, maxBrightness: 200, minSharpness: 0.02 };

          // Run preflight check - state updates are deferred via startTransition
          const result = await runPreflightCheck(cameraRef, thresholds);
          console.log("Preflight results:", result);
          
          // Check if camera is still mounted before updating state (prevents updates if unmounted)
          if (!ref.current) {
            console.warn("Camera unmounted after preflight check, skipping state update");
            return;
          }
          
          // Use startTransition for all state updates to prevent blocking/unmounting
          startTransition(() => {
            setMetrics(result.metrics);
            
            if (result.pass) {
              setStatus((currentStatus) => {
                return currentStatus === "ready" ? currentStatus : "ready";
              });
            } else {
              setStatus("fail");
            }
          });
        } catch (err: any) {
          // If camera unmounted, don't treat it as a failure - just stop checking
          if (err?.message?.includes("unmounted") || err?.message?.includes("Camera unmounted")) {
            console.warn("Camera unmounted during preflight, will retry on next check");
            return; // Don't set status to fail, just return
          }
          console.error("Error during preflight:", err);
          
          // Only update state if camera is still mounted, and use startTransition
          if (ref.current) {
            startTransition(() => {
              setStatus("fail");
            });
          }
        }
      };

      // Initial check after delay
      setTimeout(runCheck, 1000);

      // Poll every 2s continuously (even after ready)
      if (!checkIntervalRef.current) {
        checkIntervalRef.current = setInterval(() => {
          // Continue checking as long as not recording and camera is available
          if (!recording && ref.current) {
            runCheck();
          }
        }, 2000);
      }
    };

    // Start checks after a delay to ensure camera is ready
    const timeoutId = setTimeout(startQualityChecks, 1500);

    return () => {
      clearTimeout(timeoutId);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [mode, recording, permission?.granted]);

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
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
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
    
    // Stop quality checks while recording
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    
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
    setStatus("loading");
    setMetrics(null);
  };

  const toggleMode = () => {
    if (recording) return;
    setMode((prev) => (prev === "day" ? "night" : "day"));
    setStatus("loading");
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
    
    setIsUploading(true);
    
    try {
      console.log('Starting upload process...');
      
      // Step 1: Register user (if not already registered, this will fail but that's ok)
      try {
        console.log('Attempting to register user...');
        await register(DEV_EMAIL, DEV_PASSWORD);
        console.log('User registered successfully');
      } catch (registerError: any) {
        // User might already exist, that's fine - we'll try to login
        console.log('Registration failed (user may already exist):', registerError.message);
      }
      
      // Step 2: Login to get token
      console.log('Logging in...');
      const loginResult = await login(DEV_EMAIL, DEV_PASSWORD);
      console.log('Login successful, token stored');
      
      // Step 3: Get upload URL
      console.log('Getting upload URL...');
      const { upload_url, path } = await generateUploadUrl();
      console.log('Upload URL received:', { path });
      
      // Step 4: Upload video file to signed URL
      console.log('Reading video file...');
      // Read file as base64 using expo-file-system legacy API (React Native compatible)
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64' as any,
      });
      
      // Convert base64 to Uint8Array for upload
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      console.log('Uploading video to signed URL...');
      // Upload to Supabase signed URL using PUT method
      const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        body: byteArray,
        headers: {
          'Content-Type': 'video/mp4',
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Video upload failed: ${uploadResponse.statusText}`);
      }
      
      console.log('Video uploaded successfully to:', path);
      
      /*
      // Step 5: Create run record
      console.log('Creating run record...');
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const runResponse = await fetch(`${API_BASE_URL}/runs/`, {
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
      alert('Video uploaded successfully!');
      
    } catch (error: any) {
      console.error('Error in upload process:', error);
      alert(`Failed to upload video: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    setUri(null);
    setIsVideo(false);
    setStatus("loading");
  };

  const renderVideo = (uri: string) => {
    if (isUploading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Uploading video...</Text>
          <Text style={styles.loadingSubtext}>Please wait while we process your video</Text>
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
        
        {/* Mode selector */}
        {!recording && (
          <View style={styles.modeContainer}>
            <Pressable
              onPress={() => toggleMode()}
              style={[
                styles.modeButton,
                { backgroundColor: mode === "day" ? "#3B82F6" : "#E5E7EB" }
              ]}
            >
              <Text style={[styles.modeButtonText, { color: mode === "day" ? "#FFFFFF" : "#64748B" }]}>
                Day
              </Text>
            </Pressable>
            <Pressable
              onPress={() => toggleMode()}
              style={[
                styles.modeButton,
                { backgroundColor: mode === "night" ? "#6366F1" : "#E5E7EB" }
              ]}
            >
              <Text style={[styles.modeButtonText, { color: mode === "night" ? "#FFFFFF" : "#64748B" }]}>
                Night
              </Text>
            </Pressable>
          </View>
        )}

        {/* Status indicator */}
        {!recording && (
          <View style={styles.statusContainer}>
            {status === "loading" && (
              <Text style={styles.statusText}>Loading camera...</Text>
            )}
            {status === "checking" && (
              <Text style={styles.statusText}>Analyzing quality...</Text>
            )}
            {status === "ready" && (
              <Text style={[styles.statusText, styles.readyText]}>✅ Ready to record</Text>
            )}
            {status === "fail" && (
              <Text style={[styles.statusText, styles.failText]}>❌ Quality too low</Text>
            )}
            {metrics && (
              <Text style={styles.adviceText}>{getAdvice()}</Text>
            )}
          </View>
        )}

        <View style={styles.shutterContainer}>
          <Pressable onPress={toggleFacing} disabled={recording}>
            <FontAwesome6 name="rotate-left" size={32} color={recording ? "#666" : "white"} />
          </Pressable>
          <Pressable onPress={recordVideo} disabled={status !== "ready" && !recording}>
            {({ pressed }) => (
              <View
                style={[
                  styles.shutterBtn,
                  {
                    opacity: pressed ? 0.5 : (status === "ready" || recording) ? 1 : 0.5,
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
    padding: 12,
    borderRadius: 12,
    maxWidth: "80%",
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
});
