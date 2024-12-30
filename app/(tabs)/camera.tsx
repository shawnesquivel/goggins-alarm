import { useState, useRef, useEffect } from "react";
import { Pressable, StyleSheet, Image, Alert } from "react-native";
import { Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useAlarms } from "@/contexts/AlarmContext";
import AlarmTriggerModal from "@/components/AlarmTriggerModal";
import Constants from "expo-constants";

const OPENAI_API_KEY = Constants.expoConfig?.extra?.openaiApiKey;

export default function CameraScreen() {
  const router = useRouter();
  const {
    hasShoePhotoToday,
    setLastShoePhotoDate,
    alarmSound,
    isAlarmTriggered,
    setIsAlarmTriggered,
  } = useAlarms();
  const [permission, requestPermission] = useCameraPermissions();
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [openAIResponse, setOpenAIResponse] = useState<string>("");
  const cameraRef = useRef(null);

  const analyzeImage = async (base64Image: string) => {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Are these running shoes? Answer only 'true' or 'false'.",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 1,
          }),
        }
      );

      const data = await response.json();
      setOpenAIResponse(JSON.stringify(data, null, 2));
      return data.choices[0].message.content.toLowerCase() === "true";
    } catch (error) {
      console.error("Error analyzing image:", error);
      setOpenAIResponse(`Error: ${error}`);
      return false;
    }
  };

  const handlePhotoValidation = async (isRunningShoes: boolean) => {
    if (isRunningShoes) {
      setLastShoePhotoDate(new Date());
      alarmSound.stopSound();
      Alert.alert("Success!", "Running shoes verified! Alarm disabled.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      Alert.alert("Try Again", "Those don't look like running shoes!");
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsAnalyzing(true);
      const photo = await cameraRef.current.takePictureAsync({ base64: true });

      if (!photo || !photo.base64) {
        Alert.alert("Error", "Failed to capture photo");
        return;
      }

      setLastPhoto(photo.uri);

      const isRunningShoes = await analyzeImage(photo.base64);
      if (!isRunningShoes) {
        setLastPhoto(null);
      }
      await handlePhotoValidation(isRunningShoes);
    } catch (error) {
      console.error("Error taking/analyzing picture:", error);
      Alert.alert("Error", "Failed to analyze image");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          We need your permission to show the camera
        </Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  if (hasShoePhotoToday()) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>All set. Go crush your workout.</Text>
        <Pressable
          style={styles.button}
          onPress={() => {
            alarmSound.stopSound();
            router.back();
          }}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {lastPhoto ? (
        <View style={styles.camera}>
          <Image source={{ uri: lastPhoto }} style={styles.camera} />
          <View style={styles.analyzingOverlay}>
            <Text style={styles.analyzingText}>Analyzing image...</Text>
          </View>
        </View>
      ) : (
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          <View style={styles.camera}>
            <View style={styles.controls}>
              <View style={styles.placeholder} />
              <Pressable
                style={[
                  styles.captureButton,
                  isAnalyzing && styles.captureButtonDisabled,
                ]}
                onPress={takePicture}
                disabled={isAnalyzing}
              >
                <View style={styles.captureInner} />
              </Pressable>
              <View style={styles.placeholder} />
            </View>
          </View>
        </CameraView>
      )}

      {/* show the analyzing overlay */}
      {isAnalyzing && (
        <View style={styles.analyzingOverlay}>
          <Text style={styles.analyzingText}>Analyzing image...</Text>
        </View>
      )}
      {/* show the last photo in the bottom right */}

      {lastPhoto && (
        <View style={styles.preview}>
          <Image source={{ uri: lastPhoto }} style={styles.previewImage} />
        </View>
      )}

      {/* show the openAI response in the top (debugging)*/}
      {openAIResponse && (
        <View style={styles.responseOverlay}>
          <Text style={styles.responseText}>{openAIResponse}</Text>
        </View>
      )}

      <AlarmTriggerModal
        visible={isAlarmTriggered}
        onDismiss={() => {
          setIsAlarmTriggered(false);
          alarmSound.stopSound();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  text: {
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
    color: "white",
  },
  button: {
    backgroundColor: "grey",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 40,
    width: "100%",
  },
  flipButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: "#007AFF",
  },
  placeholder: {
    width: 64,
    height: 64,
  },
  preview: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "white",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  analyzingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  analyzingText: {
    color: "white",
    fontSize: 18,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  responseOverlay: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 10,
    borderRadius: 8,
    maxHeight: "30%",
  },
  responseText: {
    color: "white",
    fontSize: 12,
  },
});
