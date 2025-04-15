import React, { useState, useRef } from "react";
import { Modal, View, Text, TouchableOpacity, Alert } from "react-native";
import { ShareTemplate } from "./ShareTemplate";
import { SharePreview } from "./SharePreview";
import * as MediaLibrary from "expo-media-library";
import ViewShot, { captureRef } from "react-native-view-shot";
import { formatDurationForExport } from "@/lib/time";
import { format } from "date-fns";

interface ExportModalProps {
  onClose: () => void;
  userName: string;
  durationInMinutes: number;
}

/**
 * ExportModal - Modal for sharing deep work sessions
 *
 * Usage:
 * ```tsx
 * {showExportModal && (
 *   <ExportModal
 *     onClose={() => setShowExportModal(false)}
 *     userName={session?.user?.email?.split("@")[0] || "User"}
 *     durationInMinutes={currentSession?.duration || 0}
 *   />
 * )}
 * ```
 */
export const ExportModal: React.FC<ExportModalProps> = ({
  onClose,
  userName,
  durationInMinutes,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const templateRef = useRef<ViewShot>(null);

  // Format time and date internally
  const formattedTime = formatDurationForExport(
    Math.floor(durationInMinutes * 60)
  );
  const formattedDate = format(new Date(), "EEE, MMM d");

  const handleExport = async () => {
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to save photos"
        );
        return;
      }

      if (!templateRef.current) return;

      // Capture the template as an image
      const uri = await captureRef(templateRef, {
        format: "png",
        quality: 1,
        width: 600,
        height: 400,
      });

      // Save to photo library
      await MediaLibrary.saveToLibraryAsync(uri);

      Alert.alert("Success", "Deep work session saved to your photos!");
      onClose();
    } catch (error) {
      console.error("Error exporting image:", error);
      Alert.alert("Error", "Failed to save image");
    }
  };

  return (
    <Modal transparent animationType="fade" visible={true}>
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View className="bg-white rounded-2xl p-6 w-[90%] max-w-xl">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-semibold">
              Share Deep Work Session
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-11 h-11 items-center justify-center"
            >
              <Text className="text-2xl font-semibold leading-none">×</Text>
            </TouchableOpacity>
          </View>

          {/* Visible preview */}
          <View className="w-full mb-6">
            <SharePreview
              userName={userName}
              deepWorkTime={formattedTime}
              date={formattedDate}
              isDarkMode={isDarkMode}
            />
          </View>

          {/* Template for export */}
          <View className="absolute -top-[9999px] left-0 w-[600px] h-[400px]">
            <ViewShot
              ref={templateRef}
              options={{ format: "png", quality: 1.0 }}
            >
              <ShareTemplate
                userName={userName}
                deepWorkTime={formattedTime}
                date={formattedDate}
                isDarkMode={isDarkMode}
              />
            </ViewShot>
          </View>

          <View className="w-full mt-6">
            {/* Color options */}
            <View className="flex-row justify-center gap-2 mb-6">
              <TouchableOpacity
                onPress={() => setIsDarkMode(false)}
                className="w-11 h-11 items-center justify-center"
              >
                <View
                  className={`w-8 h-8 rounded-full border-2 bg-[#F3F1EC]  ${
                    !isDarkMode
                      ? "border-2 border-[#FAE395]"
                      : "border-1 border-[#A4A095]"
                  }`}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsDarkMode(true)}
                className="w-11 h-11 items-center justify-center"
              >
                <View
                  className={`w-8 h-8 rounded-full border-2 bg-[#1B1B1B] ${
                    isDarkMode
                      ? "border-[#FAE395] border-2"
                      : "border-1 border-[#A4A095] "
                  }`}
                />
              </TouchableOpacity>
            </View>

            {/* Save button */}
            <TouchableOpacity
              className="bg-black py-3 px-6 rounded-sm items-center"
              onPress={handleExport}
            >
              <Text className="text-white text-base font-semibold uppercase">
                Save to Photos
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
