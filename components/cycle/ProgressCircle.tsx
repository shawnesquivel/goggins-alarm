import { Animated, Easing, Text, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import Svg, { Circle } from "react-native-svg";

// Create animated circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Default daily goal in minutes (from AnalyticsService)
const DEFAULT_GOAL_MINUTES = 60;

// Progress Circle Component
const ProgressCircle = ({
  percentage,
  deepWorkMinutes,
  isLoading,
}: {
  percentage: number;
  deepWorkMinutes: number;
  isLoading: boolean;
}) => {
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const [hasTriggeredCelebration, setHasTriggeredCelebration] = useState(false);

  // Ensure percentage is a valid number, but preserve 0 as 0%
  const safePercentage = isNaN(percentage) ? 0 : percentage;
  const safeDeepWorkMinutes = isNaN(deepWorkMinutes) ? 0 : deepWorkMinutes;

  // Calculate the total goal minutes based on current progress
  const calculateGoalMinutes = () => {
    // If no progress or invalid percentage, use the default goal
    if (safePercentage <= 0 || safeDeepWorkMinutes <= 0) {
      return DEFAULT_GOAL_MINUTES;
    }

    // Calculate goal: if X minutes is Y%, what is 100?
    return Math.round(safeDeepWorkMinutes / (safePercentage / 100));
  };

  // Calculate goal for display
  const goalMinutes = calculateGoalMinutes();
  const goalHours = (goalMinutes / 60).toFixed(1);
  const minutesToGo = Math.max(0, goalMinutes - safeDeepWorkMinutes);
  const minutesToGoText =
    minutesToGo >= 60
      ? `${(minutesToGo / 60).toFixed(1)}h to daily goal`
      : `${Math.ceil(minutesToGo)} min to daily goal`;

  // For animation purposes, use a small non-zero value when percentage is 0
  const animationPercentage = safePercentage === 0 ? 0.001 : safePercentage;

  // Celebration pulse animation
  const startCelebrationAnimation = () => {
    // Only trigger celebration once per session
    if (hasTriggeredCelebration) return;

    setHasTriggeredCelebration(true);

    // Create pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0.95,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { iterations: 3 }
    ).start();
  };

  // Animate progress on load or when percentage changes
  useEffect(() => {
    if (!isLoading) {
      // Reset animation value to 0 first to ensure animation runs
      progressAnimation.setValue(0);

      // If already at 100%+, animate quickly to full
      if (safePercentage >= 100) {
        Animated.timing(progressAnimation, {
          toValue: 1,
          duration: 800, // Faster for 100%+
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          startCelebrationAnimation();
        });
      } else {
        // Otherwise animate from 0 to target percentage
        Animated.timing(progressAnimation, {
          toValue: Math.min(animationPercentage / 100, 1),
          duration: 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
    }
  }, [safePercentage, isLoading]);

  const size = 160; // Increased circle size from 128 to 160
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <Animated.View
      className="w-40 h-40 relative items-center justify-center m-8" // Increased from w-32 h-32 to w-40 h-40 and mb-2 to mb-4
      style={{
        transform: [{ scale: pulseAnimation }],
      }}
    >
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={safePercentage >= 100 ? "#10b981" : "#6b7280"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={Animated.multiply(
            progressAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [circumference, 0],
            }),
            -1
          )}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Percentage text overlay */}
      <View className="absolute items-center justify-center w-full h-full">
        <Text
          className={`text-3xl font-bold text-center mb-1 ${
            safePercentage >= 100 ? "text-green-600" : ""
          }`}
        >
          {isLoading ? "..." : `${Math.floor(safePercentage)}%`}
        </Text>
        {!isLoading && safePercentage > 100 && (
          <Text className="text-sm text-green-600 text-center">
            Crushed it!
          </Text>
        )}
        {!isLoading && safePercentage < 100 && (
          <View className="items-center">
            <Text className="text-xs text-gray-600 text-center">
              {minutesToGoText}
            </Text>
            <Text className="text-xs text-gray-600 text-center">
              ({goalHours}h)
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export default ProgressCircle;
