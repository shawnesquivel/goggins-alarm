import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { OnboardingScreen as OnboardingScreenType } from "@/contexts/OnboardingContext";

interface OnboardingScreenProps {
  screen: OnboardingScreenType;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  children?: React.ReactNode;
}

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen({
  screen,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  children,
}: OnboardingScreenProps) {
  const showBackButton = currentStep > 0 && onBack;

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Header - version info */}
        <View style={styles.header}>
          <Text style={styles.versionText}>
            Sign Up Version {currentStep + 11}
          </Text>
        </View>

        {/* Main content */}
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{screen.title}</Text>
            {screen.subtitle && (
              <Text style={styles.subtitle}>{screen.subtitle}</Text>
            )}
          </View>

          {screen.description && (
            <Text style={styles.description}>{screen.description}</Text>
          )}

          <View style={styles.childrenContainer}>{children}</View>
        </View>

        {/* Bottom navigation - always at the bottom */}
        <View style={styles.bottomContainer}>
          {/* Navigation buttons */}
          <View style={styles.navigationContainer}>
            {showBackButton ? (
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Text style={styles.backButtonText}>BACK</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptySpace} />
            )}

            <TouchableOpacity style={styles.nextButton} onPress={onNext}>
              <Text style={styles.nextButtonText}>
                {screen.action || "NEXT"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${((currentStep + 1) / totalSteps) * 100}%` },
              ]}
            />
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  versionText: {
    color: "#999",
    fontSize: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#333",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    lineHeight: 24,
    marginBottom: 20,
  },
  childrenContainer: {
    flex: 1,
  },
  bottomContainer: {
    width: "100%",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  nextButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  emptySpace: {
    width: 80,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#e0e0e0",
    marginBottom: Platform.OS === "ios" ? 24 : 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#000",
  },
});
