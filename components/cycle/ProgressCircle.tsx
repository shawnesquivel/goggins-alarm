import { Animated, Easing, Text, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import Svg, { Circle } from "react-native-svg";

// Create animated circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
      if (percentage >= 100) {
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
          toValue: Math.min(percentage / 100, 1),
          duration: 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
    }
  }, [percentage, isLoading]);

  const size = 128; // Size of circle in pixels
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <Animated.View
      className="w-32 h-32 relative items-center justify-center mb-2"
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
          stroke={percentage >= 100 ? "#10b981" : "#6b7280"}
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
          className={`text-2xl font-bold text-center ${
            percentage >= 100 ? "text-green-600" : ""
          }`}
        >
          {isLoading ? "..." : `${percentage}%`}
        </Text>
        {!isLoading && percentage > 100 && (
          <Text className="text-sm text-green-600 text-center mt-0.5">
            Crushed it!
          </Text>
        )}
        {!isLoading && percentage < 100 && (
          <Text className="text-sm text-gray-600 text-center mt-0.5">
            {`${Math.ceil(
              deepWorkMinutes / (percentage / 100) - deepWorkMinutes
            )} min to goal`}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

export default ProgressCircle;
