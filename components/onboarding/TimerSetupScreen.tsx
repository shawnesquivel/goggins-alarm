import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { usePomodoro } from "@/contexts/AlarmContext";
import OnboardingScreen from "./OnboardingScreen";
import { OnboardingScreen as OnboardingScreenType } from "@/contexts/OnboardingContext";

interface TimerSetupScreenProps {
  screen: OnboardingScreenType;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
}

export default function TimerSetupScreen({
  screen,
  currentStep,
  totalSteps,
  onNext,
  onBack,
}: TimerSetupScreenProps) {
  const { settings, updateSettings } = usePomodoro();
  const [focusDuration, setFocusDuration] = useState(settings.focusDuration);
  const [breakDuration, setBreakDuration] = useState(settings.breakDuration);

  const handleUpdateSettings = () => {
    updateSettings({
      ...settings,
      focusDuration,
      breakDuration,
    });
    onNext();
  };

  // Predefined timer durations
  const focusOptions = [15, 25, 30, 45, 60];
  const breakOptions = [5, 10, 15, 20, 30];

  return (
    <OnboardingScreen
      screen={screen}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={handleUpdateSettings}
      onBack={onBack}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timerContainer}>
          <View style={styles.timerSection}>
            <Text style={styles.timerTitle}>Deep Work</Text>
            <View style={styles.timerOptions}>
              {focusOptions.map((duration) => (
                <TouchableOpacity
                  key={`focus-${duration}`}
                  style={[
                    styles.timerOption,
                    focusDuration === duration && styles.selectedTimerOption,
                  ]}
                  onPress={() => setFocusDuration(duration)}
                >
                  <Text
                    style={[
                      styles.timerOptionText,
                      focusDuration === duration &&
                        styles.selectedTimerOptionText,
                    ]}
                  >
                    {duration}
                  </Text>
                  <Text
                    style={[
                      styles.timerUnitText,
                      focusDuration === duration &&
                        styles.selectedTimerOptionText,
                    ]}
                  >
                    MINUTES
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.timerSection}>
            <Text style={styles.timerTitle}>Deep Rest</Text>
            <View style={styles.timerOptions}>
              {breakOptions.map((duration) => (
                <TouchableOpacity
                  key={`break-${duration}`}
                  style={[
                    styles.timerOption,
                    breakDuration === duration && styles.selectedTimerOption,
                  ]}
                  onPress={() => setBreakDuration(duration)}
                >
                  <Text
                    style={[
                      styles.timerOptionText,
                      breakDuration === duration &&
                        styles.selectedTimerOptionText,
                    ]}
                  >
                    {duration}
                  </Text>
                  <Text
                    style={[
                      styles.timerUnitText,
                      breakDuration === duration &&
                        styles.selectedTimerOptionText,
                    ]}
                  >
                    MINUTES
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  timerContainer: {
    marginVertical: 10,
  },
  timerSection: {
    marginBottom: 20,
  },
  timerTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 12,
    textAlign: "center",
  },
  timerOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  timerOption: {
    width: 90,
    height: 90,
    margin: 6,
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedTimerOption: {
    backgroundColor: "#000",
  },
  timerOptionText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#333",
  },
  selectedTimerOptionText: {
    color: "#fff",
  },
  timerUnitText: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
});
