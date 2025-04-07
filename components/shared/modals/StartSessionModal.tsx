import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Text as RNText,
} from "react-native";
import { Text } from "@/components/Themed";
import { usePomodoro } from "@/contexts/AlarmContext";
import { useProjects } from "@/contexts/ProjectContext";

interface StartSessionModalProps {
  visible: boolean;
  onClose: () => void;
  onSessionStart?: () => void;
}

export default function StartSessionModal({
  visible,
  onClose,
  onSessionStart,
}: StartSessionModalProps) {
  const { startFocusSession } = usePomodoro();
  const { projects, loading } = useProjects();

  const [taskDescription, setTaskDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [sessionDuration, setSessionDuration] = useState(25);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  const handleStartSession = () => {
    if (!taskDescription || !selectedProjectId) return;
    startFocusSession(taskDescription, selectedProjectId, []);
    if (onSessionStart) onSessionStart();
    onClose();
  };

  const isStartDisabled =
    !taskDescription.trim() ||
    !selectedProjectId ||
    loading ||
    projects.length === 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center px-4 bg-black/80">
        <View className="w-full max-w-xs bg-white rounded-lg">
          <RNText className="text-lg font-medium text-center py-4 text-black">
            Start Focus Session
          </RNText>

          <View className="px-4 py-3">
            <RNText className="text-sm mb-2 text-black">Task</RNText>
            <TextInput
              className="w-full mb-4 px-3 py-2 border border-gray-200 rounded text-black"
              placeholder="What are you working on?"
              value={taskDescription}
              onChangeText={setTaskDescription}
              placeholderTextColor="#666"
            />

            <RNText className="text-sm mb-2 text-black">Project</RNText>
            {loading ? (
              <RNText className="text-sm text-gray-500 mb-4">Loading...</RNText>
            ) : projects.length === 0 ? (
              <RNText className="text-sm text-gray-500 mb-4">
                No projects
              </RNText>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                {projects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    onPress={() => setSelectedProjectId(project.id)}
                    className={`mr-2 px-4 py-2 rounded ${
                      selectedProjectId === project.id
                        ? "bg-black"
                        : "border border-gray-200"
                    }`}
                  >
                    <RNText
                      className={
                        selectedProjectId === project.id
                          ? "text-white"
                          : "text-black"
                      }
                    >
                      {project.name}
                    </RNText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <RNText className="text-sm mb-2 text-black">Duration</RNText>
            <View className="flex-row space-x-2 mb-4">
              {[15, 25, 45].map((duration) => (
                <TouchableOpacity
                  key={duration}
                  onPress={() => setSessionDuration(duration)}
                  className={`flex-1 py-2 rounded ${
                    sessionDuration === duration
                      ? "bg-black"
                      : "border border-gray-200"
                  }`}
                >
                  <RNText
                    className={`text-center ${
                      sessionDuration === duration ? "text-white" : "text-black"
                    }`}
                  >
                    {duration}
                  </RNText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="flex-row border-t border-gray-100">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3 border-r border-gray-100"
            >
              <RNText className="text-center text-black">Cancel</RNText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleStartSession}
              disabled={isStartDisabled}
              className={`flex-1 py-3 ${
                isStartDisabled ? "bg-gray-100" : "bg-black"
              }`}
            >
              <RNText
                className={`text-center ${
                  isStartDisabled ? "text-gray-400" : "text-white"
                }`}
              >
                Start
              </RNText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
