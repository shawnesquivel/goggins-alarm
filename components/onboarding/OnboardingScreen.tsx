import React, { useEffect, useState } from "react";
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
import Reanimated, {
  FadeInUp,
  FadeOut,
  SlideInUp,
  runOnJS,
  withDelay,
  withSequence,
  withTiming,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { checkConnection } from "@/lib/supabase";

// Create animated components once outside of the render functions
const AnimatedText = Reanimated.createAnimatedComponent(Text);
const AnimatedStyledText = Reanimated.createAnimatedComponent(StyledText);
const AnimatedView = Reanimated.createAnimatedComponent(View);

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
  fadeAnim: number
) => {
  const [fontsLoaded] = useFonts({
    LibreBaskerville_400Regular,
    LibreBaskerville_700Bold,
    LibreBaskerville_400Regular_Italic,
  });

  if (!fontsLoaded) {
    return null;
  }

  const baseStyle = {
    fontFamily: "LibreBaskerville_400Regular",
    lineHeight: 46,
  };

  const renderAnimatedText = (content: string) => {
    // Split the content by formatting markers
    const parts = content.split(/(\*[^*]+\*|~[^~]+~)/);

    return (
      <AnimatedText
        style={[
          baseStyle,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim * 20,
              },
            ],
          },
        ]}
        className="text-4xl text-center"
      >
        {parts.map((part, index) => {
          if (part.startsWith("*") && part.endsWith("*")) {
            return (
              <Text
                key={index}
                style={{
                  fontFamily: "LibreBaskerville_400Regular_Italic",
                }}
              >
                {part.slice(1, -1)}
              </Text>
            );
          } else if (part.startsWith("~") && part.endsWith("~")) {
            return (
              <Text
                key={index}
                style={{
                  fontFamily: "LibreBaskerville_400Regular",
                  textDecorationLine: "line-through",
                }}
              >
                {part.slice(1, -1)}
              </Text>
            );
          }
          return part;
        })}
      </AnimatedText>
    );
  };

  return renderAnimatedText(screen.title);
};

// Function to render formatted description
const renderFormattedDescription = (
  screen: OnboardingScreenType,
  fadeAnims: number[]
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
  };

  const renderLine = (content: string, index: number) => {
    const parts = content.split(/(\*[^*]+\*|~[^~]+~)/);
    return (
      <AnimatedText
        key={index}
        style={[
          textStyle,
          {
            opacity: fadeAnims[index],
            transform: [
              {
                translateY: fadeAnims[index] * 20,
              },
            ],
          },
        ]}
        className="text-lg text-center text-[#555] leading-7 mb-5"
      >
        {parts.map((part, partIndex) => {
          if (part.startsWith("*") && part.endsWith("*")) {
            return (
              <Text
                key={partIndex}
                style={{
                  fontFamily: "Figtree_500Medium",
                  fontStyle: "italic",
                }}
              >
                {part.slice(1, -1)}
              </Text>
            );
          } else if (part.startsWith("~") && part.endsWith("~")) {
            return (
              <Text
                key={partIndex}
                style={{
                  fontFamily: "Figtree_400Regular",
                  textDecorationLine: "line-through",
                }}
              >
                {part.slice(1, -1)}
              </Text>
            );
          }
          return part;
        })}
      </AnimatedText>
    );
  };

  // Default case - always split by newlines and render line by line
  const lines = screen.description?.split("\n\n") || [];
  return (
    <View className="mt-8">
      {lines.map((line, index) => renderLine(line, index))}
    </View>
  );
};

// Animated text line component
const AnimatedLine = React.memo(
  ({
    content,
    index,
    style,
    textStyle,
    isTitle = false,
  }: {
    content: string;
    index: number;
    style?: any;
    textStyle?: any;
    isTitle?: boolean;
  }) => {
    // Parse content for italic and strikethrough
    const parts = content.split(/(\*[^*]+\*|~[^~]+~)/);

    // Title animation: quick and immediate
    // Body text: starts after 600ms, then 150ms between lines
    const delay = isTitle ? 300 : 1000 + index * 800;

    return (
      <AnimatedView
        style={[style]}
        entering={FadeInUp.delay(delay)
          .springify()
          .mass(0.3) // Lighter animation
          .damping(15)} // More rigid
        exiting={FadeOut}
        layout={Layout.springify()}
      >
        <Text style={textStyle}>
          {parts.map((part: string, partIndex: number) => {
            if (part.startsWith("*") && part.endsWith("*")) {
              return (
                <Text
                  key={partIndex}
                  style={{
                    fontFamily: isTitle
                      ? "LibreBaskerville_400Regular_Italic"
                      : "Figtree_500Medium",
                    fontStyle: "italic",
                  }}
                >
                  {part.slice(1, -1)}
                </Text>
              );
            } else if (part.startsWith("~") && part.endsWith("~")) {
              return (
                <Text
                  key={partIndex}
                  style={{
                    fontFamily: isTitle
                      ? "LibreBaskerville_400Regular"
                      : "Figtree_400Regular",
                    textDecorationLine: "line-through",
                  }}
                >
                  {part.slice(1, -1)}
                </Text>
              );
            }
            return part;
          })}
        </Text>
      </AnimatedView>
    );
  }
);

// Animated description component
const AnimatedDescription = React.memo(
  ({ screen }: { screen: OnboardingScreenType }) => {
    const [figtreeLoaded] = useFigtreeFonts({
      Figtree_400Regular,
      Figtree_500Medium,
      Figtree_600SemiBold,
      Figtree_700Bold,
    });

    if (!figtreeLoaded) return null;

    const textStyle = {
      fontFamily: "Figtree_400Regular",
      fontSize: 18,
      textAlign: "center" as const,
      color: "#555",
      lineHeight: 28,
    };

    const lines = screen.description?.split("\n\n") || [];

    return (
      <View className="mt-8">
        {lines.map((line: string, index: number) => (
          <AnimatedLine
            key={`${screen.id}-${index}`}
            content={line}
            index={index}
            style={{ marginBottom: 20 }}
            textStyle={textStyle}
          />
        ))}
      </View>
    );
  }
);

// Animated title component
const AnimatedTitle = React.memo(
  ({ screen }: { screen: OnboardingScreenType }) => {
    const [fontsLoaded] = useFonts({
      LibreBaskerville_400Regular,
      LibreBaskerville_700Bold,
      LibreBaskerville_400Regular_Italic,
    });

    if (!fontsLoaded) return null;

    const titleStyle = {
      fontFamily: "LibreBaskerville_400Regular",
      fontSize: 36,
      textAlign: "center" as const,
      lineHeight: 46,
    };

    return (
      <AnimatedView
        style={{ width: "100%" }}
        entering={FadeInUp.springify().mass(0.3).damping(15)}
        exiting={FadeOut}
        layout={Layout.springify()}
      >
        <AnimatedLine
          content={screen.title}
          index={0}
          textStyle={titleStyle}
          isTitle={true}
        />
      </AnimatedView>
    );
  }
);

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
  const [isConnected, setIsConnected] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const showBackButton = currentStep > 0 && onBack;
  const { progress, previousProgress, updateProgress, completeOnboarding } =
    useOnboarding();

  const progressValue = useSharedValue(progress);
  const previousProgressValue = useSharedValue(previousProgress);

  useEffect(() => {
    // Calculate the new progress
    const newProgress = ((currentStep + 1) / totalSteps) * 100;

    // Update the progress with a spring animation
    progressValue.value = withSpring(newProgress, {
      damping: 20,
      stiffness: 90,
    });

    // Update the context values
    updateProgress(newProgress);
  }, [currentStep, totalSteps]);

  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        const connected = await checkConnection();
        setIsConnected(connected);
        if (!connected) {
          setRetryMessage(
            "Unable to connect to the server. Please check your internet connection."
          );
        }
      } catch (error) {
        console.log("Connection check failed:", error);
        setIsConnected(false);
        setRetryMessage("Connection check failed. Please try again.");
      }
    };

    checkConnectionStatus();
  }, []);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }));

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryMessage("Attempting to connect...");

    try {
      const connected = await checkConnection();
      setIsConnected(connected);
      if (!connected) {
        setRetryMessage(
          "Still unable to connect. Please check your internet connection."
        );
      }
    } catch (error: any) {
      console.log("Retry failed:", error);
      const errorMessage = error?.message || "Unknown error occurred";
      setRetryMessage(
        __DEV__
          ? `Connection Error: ${errorMessage}\nMake sure Supabase is running locally with 'npx supabase start'`
          : "Connection attempt failed. Please try again."
      );
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isConnected) {
    return (
      <SafeAreaView className="flex-1 bg-[#F3F1EC] justify-center items-center px-6">
        <View className="items-center">
          <Text className="text-2xl font-medium text-center mb-4">
            Connection Required
          </Text>
          <Text className="text-base text-center text-[#555] mb-8">
            {retryMessage ||
              "Please check your internet connection to continue setting up your account."}
          </Text>
          {__DEV__ && retryMessage && (
            <View className="bg-red-50 p-4 rounded-md mb-4 w-full">
              <Text className="text-xs text-red-500 font-mono">
                Development Mode: {retryMessage}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={handleRetry}
            disabled={isRetrying}
            className={`bg-black py-4 px-8 rounded-md ${
              isRetrying ? "opacity-50" : ""
            }`}
          >
            <Text className="text-white text-base font-medium">
              {isRetrying ? "Connecting..." : "Retry Connection"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView className="flex-1 bg-[#F3F1EC]">
        <StatusBar barStyle="dark-content" />

        {/* Offline Indicator */}
        {!isConnected && (
          <View className="bg-[#FFE4E1] py-2 px-4">
            <Text className="text-[#DC143C] text-sm text-center font-medium">
              Offline Mode - Some features may be limited
            </Text>
          </View>
        )}

        {/* Header - version info and skip button */}
        <View className="px-4 pt-2 flex-row justify-between items-center">
          <Text className="text-xs text-[#999]">
            Sign Up Version {currentStep + 11}
          </Text>

          {/* Skip to Home button - only shown on first screen */}
          {currentStep === 0 && (
            <TouchableOpacity
              onPress={completeOnboarding}
              className="py-1 px-3 bg-blue-500 rounded-full"
            >
              <Text className="text-xs text-white font-medium">
                Skip to Home (Testing)
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress bar */}
        <View className="h-0.5 bg-[#E4E2DD] mb-4">
          <Reanimated.View
            className="h-0.5 bg-[#A4A095]"
            style={progressBarStyle}
          />
        </View>

        {/* Main content */}
        <View className="flex-1 px-6">
          {/* Title section - positioned at 30% from top */}
          <View className="mt-[25%]">
            <AnimatedTitle screen={screen} />
            {screen.subtitle && (
              <Text className="text-lg text-center text-[#333] mt-4">
                {screen.subtitle}
              </Text>
            )}
          </View>

          {/* Description section */}
          <AnimatedDescription screen={screen} />

          {/* Children components */}
          <View className="mt-8 flex-1">{children}</View>
        </View>

        {/* Bottom navigation */}
        <View className="w-full mb-6">
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
