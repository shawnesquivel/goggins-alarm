import React, { useEffect, useRef } from "react";
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
  Animated,
} from "react-native";
import { OnboardingScreen as OnboardingScreenType } from "@/contexts/OnboardingContext";
import StyledText from "./StyledText";
import {
  useFonts,
  LibreBaskerville_400Regular,
  LibreBaskerville_700Bold,
  LibreBaskerville_400Regular_Italic,
} from "@expo-google-fonts/libre-baskerville";
import {
  useFonts as useFigtreeFonts,
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from "@expo-google-fonts/figtree";

// Create animated components once outside of the render functions
const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedStyledText = Animated.createAnimatedComponent(StyledText);

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
const renderFormattedTitle = (
  screen: OnboardingScreenType,
  fadeAnim: Animated.Value
) => {
  const [fontsLoaded] = useFonts({
    LibreBaskerville_400Regular,
    LibreBaskerville_700Bold,
    LibreBaskerville_400Regular_Italic,
  });

  if (!fontsLoaded) {
    return null;
  }

  const titleStyle = {
    fontFamily: "LibreBaskerville_400Regular",
    lineHeight: 46,
    opacity: 0,
  };

  const renderAnimatedText = (content: React.ReactNode) => (
    <AnimatedText
      style={[
        titleStyle,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
      className="text-4xl text-center"
    >
      {content}
    </AnimatedText>
  );

  switch (screen.id) {
    case "welcome1":
      return renderAnimatedText(
        <>
          "What do you{" "}
          <AnimatedStyledText
            italic
            style={{ fontFamily: "LibreBaskerville_400Regular_Italic" }}
          >
            really
          </AnimatedStyledText>{" "}
          want?"
        </>
      );
    case "welcome2":
      return renderAnimatedText(
        <>
          Imagine your{" "}
          <AnimatedStyledText
            italic
            style={{ fontFamily: "LibreBaskerville_400Regular_Italic" }}
          >
            dream
          </AnimatedStyledText>{" "}
          life
        </>
      );
    case "welcome3":
      return renderAnimatedText(
        <>
          <AnimatedStyledText
            strikethrough
            style={{ fontFamily: "LibreBaskerville_400Regular" }}
          >
            "I don't have enough{" "}
            <AnimatedStyledText
              italic
              style={{ fontFamily: "LibreBaskerville_400Regular_Italic" }}
            >
              time.
            </AnimatedStyledText>
            {""}"
          </AnimatedStyledText>
        </>
      );
    case "concept1":
      return renderAnimatedText(
        <>
          Deep Work: Your{" "}
          <AnimatedStyledText
            italic
            style={{ fontFamily: "LibreBaskerville_400Regular_Italic" }}
          >
            Unfair
          </AnimatedStyledText>{" "}
          Advantage
        </>
      );
    case "start":
      return renderAnimatedText(
        <>
          Begin with{" "}
          <AnimatedStyledText
            italic
            style={{ fontFamily: "LibreBaskerville_400Regular_Italic" }}
          >
            intention
          </AnimatedStyledText>
          .
        </>
      );
    default:
      return renderAnimatedText(screen.title);
  }
};

// Function to render formatted description
const renderFormattedDescription = (
  screen: OnboardingScreenType,
  fadeAnims: Animated.Value[]
) => {
  const [figtreeLoaded] = useFigtreeFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  if (!figtreeLoaded) {
    return null;
  }

  const textStyle = {
    fontFamily: "Figtree_400Regular",
    opacity: 0,
  };
  const italicStyle = {
    fontFamily: "Figtree_400Regular",
    opacity: 0,
  };

  const renderAnimatedText = (content: React.ReactNode, index: number) => (
    <AnimatedText
      style={[
        textStyle,
        {
          opacity: fadeAnims[index],
          transform: [
            {
              translateY: fadeAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
      className="text-lg text-center text-[#555] leading-7 mb-5"
    >
      {content}
    </AnimatedText>
  );

  // Screen-specific description rendering
  if (screen.id === "welcome2") {
    return (
      <View className="mt-8">
        {renderAnimatedText(
          <>
            Imagine you had{" "}
            <AnimatedStyledText italic style={italicStyle}>
              all those things
            </AnimatedStyledText>{" "}
            you're dreaming of.
          </>,
          0
        )}
        {renderAnimatedText(
          "Imagine how you'd feel if you focused for the next 6 months.",
          1
        )}
        {renderAnimatedText(
          <>
            Close your eyes for 30 seconds and{" "}
            <AnimatedStyledText italic style={italicStyle}>
              really feel it
            </AnimatedStyledText>
            .
          </>,
          2
        )}
        {renderAnimatedText(
          "P.S. This is important. Do it for your future self.",
          3
        )}
      </View>
    );
  }

  if (screen.id === "concept1") {
    return (
      <View className="mt-8">
        {renderAnimatedText(
          <>
            Deep work means to concentrate for 30-90min with{" "}
            <AnimatedStyledText italic style={italicStyle}>
              zero
            </AnimatedStyledText>{" "}
            distractions.
          </>,
          0
        )}
        {renderAnimatedText("Deep Work = Hours × Quality of Work", 1)}
        {renderAnimatedText(
          "What others accomplish in 10 distracted hours, you'll finish in just 3.",
          2
        )}
        {renderAnimatedText(
          "This system took us from being in careers we hated, to working in our dream jobs remotely around the world.",
          3
        )}
        {renderAnimatedText("Here's how...", 4)}
      </View>
    );
  }

  if (screen.id === "concept4") {
    return (
      <View className="mt-8">
        {renderAnimatedText(
          "Every day, you'll aim to hit your goal (1-3hrs) and build a streak.",
          0
        )}
        {renderAnimatedText(
          <>
            Our AI will track your stats over time, and help unlock your{" "}
            <AnimatedStyledText italic style={italicStyle}>
              10X
            </AnimatedStyledText>{" "}
            productivity.
          </>,
          1
        )}
      </View>
    );
  }

  if (screen.id === "setup3") {
    return (
      <View className="mt-8">
        {renderAnimatedText(
          <>
            Most people fail because they push{" "}
            <AnimatedStyledText italic style={italicStyle}>
              too hard, too fast
            </AnimatedStyledText>
            .
          </>,
          0
        )}
        {renderAnimatedText(
          <>
            <AnimatedStyledText strikethrough style={textStyle}>
              Don't
            </AnimatedStyledText>{" "}
            be that person!
          </>,
          1
        )}
        {renderAnimatedText(
          "Set a daily focus goal that you can commit to for the next 7 days, no matter what.",
          2
        )}
        {renderAnimatedText(
          "We highly recommend starting at 30-60min per day.",
          3
        )}
        {renderAnimatedText("You can change this goal any time.", 4)}
      </View>
    );
  }

  // Default case - render the description as animated text
  return screen.description ? (
    <View className="mt-8">{renderAnimatedText(screen.description, 0)}</View>
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
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const descriptionFadeAnims = useRef(
    Array(10)
      .fill(0)
      .map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Reset animations when screen changes
    titleFadeAnim.setValue(0);
    descriptionFadeAnims.forEach((anim) => anim.setValue(0));

    // Animate title first
    Animated.timing(titleFadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      // After title animation, animate description lines with delay
      const animations = descriptionFadeAnims.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          delay: index * 200, // 200ms delay between each line
          useNativeDriver: true,
        })
      );
      Animated.stagger(200, animations).start();
    });
  }, [screen.id]); // Re-run animation when screen changes

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView className="flex-1 bg-[#F3F1EC]">
        <StatusBar barStyle="dark-content" />

        {/* Header - version info */}
        <View className="px-4 pt-2">
          <Text className="text-xs text-[#999]">
            Sign Up Version {currentStep + 11}
          </Text>
        </View>

        {/* Progress bar */}
        <View className="h-0.5 bg-[#E4E2DD] mb-4">
          <View
            className="h-0.5 bg-[#A4A095]"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </View>

        {/* Main content */}
        <View className="flex-1 px-6">
          {/* Title section - positioned at 30% from top */}
          <View className="mt-[25%]">
            {renderFormattedTitle(screen, titleFadeAnim)}
            {screen.subtitle && (
              <Text className="text-lg text-center text-[#333] mt-4">
                {screen.subtitle}
              </Text>
            )}
          </View>

          {/* Description section */}
          {renderFormattedDescription(screen, descriptionFadeAnims)}

          {/* Children components */}
          <View className="mt-8 flex-1">{children}</View>
        </View>

        {/* Bottom navigation - always at the bottom */}
        <View className="w-full mb-6">
          {/* Navigation buttons */}
          <View className="flex-row justify-between px-5">
            {showBackButton ? (
              <TouchableOpacity className="flex-1 py-4 px-6" onPress={onBack}>
                <Text className="text-base font-medium text-[#333] text-center">
                  BACK
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-1" />
            )}

            <TouchableOpacity
              className={`flex-1 py-4 px-8 rounded-xs ${
                disableNext ? "bg-[#999]" : "bg-black"
              }`}
              onPress={onNext}
              disabled={disableNext}
            >
              <Text
                className={`text-center text-base font-medium ${
                  disableNext ? "text-[#ddd]" : "text-white"
                }`}
              >
                {screen.action || "NEXT"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
