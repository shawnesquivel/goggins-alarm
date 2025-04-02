import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { OnboardingScreen as OnboardingScreenType } from "@/contexts/OnboardingContext";
import StyledText from "./StyledText";

interface OnboardingScreenProps {
  screen: OnboardingScreenType;

  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  children?: React.ReactNode;
  disableNext?: boolean;
}

const { width, height } = Dimensions.get("window");

// Function to render formatted text based on screen ID and content
const renderFormattedTitle = (screen: OnboardingScreenType) => {
  switch (screen.id) {
    case "welcome1":
      return (
        <Text className="text-4xl font-bold text-center">
          "What do you <StyledText italic>really</StyledText> want?"
        </Text>
      );
    case "welcome3":
      return (
        <Text className="text-4xl font-bold text-center">
          <StyledText strikethrough>"I don't have enough time."</StyledText>
        </Text>
      );
    case "concept1":
      return (
        <Text className="text-4xl font-bold text-center">
          Deep Work: Your <StyledText italic>Unfair</StyledText> Advantage
        </Text>
      );
    case "start":
      return (
        <Text className="text-4xl font-bold text-center">
          Begin with <StyledText italic>intention</StyledText>.
        </Text>
      );
    default:
      return (
        <Text className="text-4xl font-bold text-center">{screen.title}</Text>
      );
  }
};

// Function to render formatted description
const renderFormattedDescription = (screen: OnboardingScreenType) => {
  // Screen-specific description rendering
  if (screen.id === "welcome2") {
    return (
      <View className="mt-8">
        <Text className="text-lg text-center text-[#555] leading-7 mb-5">
          Imagine you had <StyledText italic>all those things</StyledText>{" "}
          you're dreaming of.
        </Text>
        <Text className="text-lg text-center text-[#555] leading-7 mb-5">
          Imagine how you'd feel if you focused for the next 6 months.
        </Text>
        <Text className="text-lg text-center text-[#555] leading-7 mb-5">
          Close your eyes for 30 seconds and{" "}
          <StyledText italic>really feel it</StyledText>.
        </Text>
        <Text className="text-lg text-center text-[#555] leading-7">
          P.S. This is important. Do it for your future self.
        </Text>
      </View>
    );
  }

  if (screen.id === "concept1") {
    return (
      <View className="mt-8">
        <Text className="text-lg text-center text-[#555] leading-7 mb-5">
          Deep work means to concentrate for 30-90min with{" "}
          <StyledText italic>zero</StyledText> distractions.
        </Text>
        <Text className="text-lg text-center text-[#555] leading-7 mb-5">
          Deep Work = Quantity of Work × Quality of Work
        </Text>
        <Text className="text-lg text-center text-[#555] leading-7 mb-5">
          What others accomplish in 10 distracted hours, you'll finish in just
          3.
        </Text>
        <Text className="text-lg text-center text-[#555] leading-7">
          This system took us from being in careers we hated, to working in our
          dream jobs remotely around the world.
        </Text>
        <Text className="text-lg text-center text-[#555] leading-7 mt-5">
          Here's how...
        </Text>
      </View>
    );
  }

  if (screen.id === "concept4") {
    return (
      <View className="mt-8">
        <Text className="text-lg text-center text-[#555] leading-7 mb-5">
          Every day, you'll aim to hit your goal (1-3hrs) and build a streak.
        </Text>
        <Text className="text-lg text-center text-[#555] leading-7">
          Our AI will track your stats over time, and help unlock your{" "}
          <StyledText italic>10X</StyledText> productivity.
        </Text>
      </View>
    );
  }

  if (screen.id === "setup3") {
    return (
      <View className="mt-8">
        <Text className="text-lg text-center text-[#555] leading-7 mb-5">
          Most people fail because they push{" "}
          <StyledText italic>too hard, too fast</StyledText>.
        </Text>
        <Text className="text-lg text-center text-[#555] leading-7 mb-5">
          <StyledText strikethrough>Don't</StyledText> be that person!
        </Text>
        <Text className="text-lg text-center text-[#555] leading-7 mb-5">
          Set a daily focus goal that you can commit to for the next 7 days, no
          matter what.
        </Text>
        <Text className="text-lg text-center text-[#555] leading-7 mb-5">
          We highly recommend starting at 30-60min per day.
        </Text>
        <Text className="text-lg text-center text-[#555] leading-7">
          You can change this goal any time.
        </Text>
      </View>
    );
  }

  // Default case - just render the description as regular text
  return screen.description ? (
    <Text className="text-lg text-center text-[#555] leading-7 mt-8">
      {screen.description}
    </Text>
  ) : null;
};

export default function OnboardingScreen({
  screen,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  children,
  disableNext,
}: OnboardingScreenProps) {
  const showBackButton = currentStep > 0 && onBack;

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView className="flex-1 bg-[#f8f8f8]">
        <StatusBar barStyle="dark-content" />

        {/* Header - version info */}
        <View className="px-4 pt-2">
          <Text className="text-xs text-[#999]">
            Sign Up Version {currentStep + 11}
          </Text>
        </View>

        {/* Main content */}
        <View className="flex-1 px-6">
          {/* Title section - positioned at 30% from top */}
          <View className="mt-[25%]">
            {renderFormattedTitle(screen)}
            {screen.subtitle && (
              <Text className="text-lg text-center text-[#333] mt-4">
                {screen.subtitle}
              </Text>
            )}
          </View>

          {/* Description section */}
          {renderFormattedDescription(screen)}

          {/* Children components */}
          <View className="mt-8 flex-1">{children}</View>
        </View>

        {/* Bottom navigation - always at the bottom */}
        <View className="w-full mb-6">
          {/* Navigation buttons */}
          <View className="flex-row justify-between px-5 pb-5">
            {showBackButton ? (
              <TouchableOpacity className="py-3 px-6" onPress={onBack}>
                <Text className="text-base font-medium text-[#333]">BACK</Text>
              </TouchableOpacity>
            ) : (
              <View className="w-20" />
            )}

            <TouchableOpacity
              className={`py-3 px-8 rounded ${
                disableNext ? "bg-[#999]" : "bg-black"
              }`}
              onPress={onNext}
              disabled={disableNext}
            >
              <Text
                className={`text-base font-medium ${
                  disableNext ? "text-[#ddd]" : "text-white"
                }`}
              >
                {screen.action || "NEXT"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View className="h-1 bg-[#e0e0e0]">
            <View
              className="h-1 bg-black"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
