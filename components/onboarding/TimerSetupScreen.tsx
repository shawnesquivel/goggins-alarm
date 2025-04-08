import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { usePomodoro } from "@/contexts/AlarmContext";
import OnboardingScreen from "./OnboardingScreen";
import { OnboardingScreen as OnboardingScreenType } from "@/contexts/OnboardingContext";
import {
  useFonts,
  LibreCaslonText_400Regular,
} from "@expo-google-fonts/libre-caslon-text";

interface TimerSetupScreenProps {
  screen: OnboardingScreenType;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
}

const { width } = Dimensions.get("window");

export default function TimerSetupScreen({
  screen,
  currentStep,
  totalSteps,
  onNext,
  onBack,
}: TimerSetupScreenProps) {
  const { settings, updateSettings } = usePomodoro();
  const [focusDuration, setFocusDuration] = useState(30);
  const [breakDuration, setBreakDuration] = useState(0.0833);
  const [fontsLoaded] = useFonts({
    LibreCaslonText_400Regular,
  });

  const handleUpdateSettings = () => {
    updateSettings({
      ...settings,
      focusDuration,
      breakDuration,
    });
    onNext();
  };

  const incrementFocus = () => {
    setFocusDuration((prev) => Math.min(prev + 5, 180));
  };

  const decrementFocus = () => {
    setFocusDuration((prev) => Math.max(prev - 5, 5));
  };

  const incrementBreak = () => {
    setBreakDuration((prev) => Math.min(prev + 5, 30));
  };

  const decrementBreak = () => {
    setBreakDuration((prev) => Math.max(prev - 5, 5));
  };

  const handleFocusDurationChange = (text: string) => {
    // Allow empty input
    if (text === "") {
      setFocusDuration(0);
      return;
    }

    const value = parseInt(text);
    if (!isNaN(value)) {
      // Only apply min/max when the input is complete (reached max length)
      if (text.length === 3) {
        setFocusDuration(Math.min(Math.max(value, 5), 180));
      } else {
        // Allow any number while typing
        setFocusDuration(value);
      }
    }
  };

  const handleBreakDurationChange = (text: string) => {
    // Allow empty input
    if (text === "") {
      setBreakDuration(0);
      return;
    }

    const value = parseInt(text);
    if (!isNaN(value)) {
      // Only apply min/max when the input is complete (reached max length)
      if (text.length === 2) {
        setBreakDuration(Math.min(Math.max(value, 5), 30));
      } else {
        // Allow any number while typing
        setBreakDuration(value);
      }
    }
  };

  if (!fontsLoaded) return null;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <OnboardingScreen
        screen={screen}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={handleUpdateSettings}
        onBack={onBack}
      >
        <View style={styles.container}>
          <View style={styles.timersContainer}>
            {/* Deep Work section */}
            <View style={styles.timerSection}>
              <Text style={styles.sectionTitle}>Deep Work</Text>
              <View style={styles.timerContent}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={incrementFocus}
                  activeOpacity={0.7}
                >
                  <Text style={styles.controlButtonText}>+</Text>
                </TouchableOpacity>

                <View style={styles.timerBox}>
                  <TextInput
                    style={[
                      styles.timeValue,
                      { fontFamily: "LibreCaslonText_400Regular" },
                    ]}
                    value={focusDuration === 0 ? "" : focusDuration.toString()}
                    onChangeText={handleFocusDurationChange}
                    keyboardType="number-pad"
                    maxLength={3}
                    textAlign="center"
                    selectTextOnFocus
                  />
                  <Text style={styles.timeUnit}>MINUTES</Text>
                </View>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={decrementFocus}
                  activeOpacity={0.7}
                >
                  <Text style={styles.controlButtonText}>−</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Deep Rest section */}
            <View style={styles.timerSection}>
              <Text style={styles.sectionTitle}>Deep Rest</Text>
              <View style={styles.timerContent}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={incrementBreak}
                  activeOpacity={0.7}
                >
                  <Text style={styles.controlButtonText}>+</Text>
                </TouchableOpacity>

                <View style={[styles.timerBox, styles.restBox]}>
                  <TextInput
                    style={[
                      styles.timeValue,
                      { fontFamily: "LibreCaslonText_400Regular" },
                    ]}
                    value={breakDuration === 0 ? "" : breakDuration.toString()}
                    onChangeText={handleBreakDurationChange}
                    keyboardType="number-pad"
                    maxLength={2}
                    textAlign="center"
                    selectTextOnFocus
                  />
                  <Text style={styles.timeUnit}>MINUTES</Text>
                </View>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={decrementBreak}
                  activeOpacity={0.7}
                >
                  <Text style={styles.controlButtonText}>−</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </OnboardingScreen>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  timersContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 60,
  },
  timerSection: {
    alignItems: "center",
    width: width * 0.42,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    fontFamily: "LibreBaskerville_400Regular",
  },
  timerContent: {
    flexDirection: "column",
    alignItems: "center",
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  controlButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  timerBox: {
    width: 150,
    height: 150,
    backgroundColor: "white",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  restBox: {
    backgroundColor: "#DDDAD0",
  },
  timeValue: {
    fontSize: 64,
    fontWeight: "bold",
    width: "100%",
    textAlign: "center",
    padding: 0,
  },
  timeUnit: {
    fontSize: 14,
    color: "#505050",
    marginTop: 4,
  },
});
