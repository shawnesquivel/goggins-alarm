import React, { useEffect, useState } from "react";
import { Modal, View, Pressable } from "react-native";
import { Text } from "./Themed";
import { useRouter } from "expo-router";
import { useAlarms } from "@/contexts/AlarmContext";

interface AlarmTriggerModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const snoozeQuotes = [
  {
    text: "I realized one demotivated day is part of the progress. It's better than telling yourself you're not enough.",
    author: "David Goggins",
  },
  {
    text: "If something haunts me and bothers me, I do it.",
    author: "David Goggins",
  },
  {
    text: "I know what's on the back end of quitting. It's a lifetime of regret and asking why you quit.",
    author: "David Goggins",
  },
];

export default function AlarmTriggerModal({
  visible,
  onDismiss,
}: AlarmTriggerModalProps) {
  const router = useRouter();
  const { hasShoePhotoToday, alarmSound } = useAlarms();
  const [showSnoozeMessage, setShowSnoozeMessage] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    if (visible && hasShoePhotoToday()) {
      onDismiss();
    }
  }, [visible]);

  const handleImUp = () => {
    setShowSnoozeMessage(false);
    setCurrentQuoteIndex(0);
    onDismiss();
    router.push("/camera");
  };

  const handleSnoozeAttempt = async () => {
    await alarmSound.stopSound();
    await alarmSound.playSnoozeSound();
    setShowSnoozeMessage(true);
    setCurrentQuoteIndex((prev) => (prev + 1) % snoozeQuotes.length);
  };

  const currentQuote = snoozeQuotes[currentQuoteIndex];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleSnoozeAttempt}
    >
      <View className="flex-1 justify-center items-center bg-[#000000]">
        {showSnoozeMessage ? (
          <>
            <Text className="text-xl mb-8">
              Life doesn't have a snooze button.
            </Text>
            <Text className="text-[#ff4444] text-md mb-8 italic">
              "{currentQuote.text}"
            </Text>
            {/* <Text className="text-sm mb-8 italic">- {currentQuote.author}</Text> */}
          </>
        ) : (
          <>
            <Text className="text-6xl font-bold mb-8">WAKE UP!</Text>
            <Text className="text-2xl mb-4">Time to get after it!</Text>
            {/* Instructions */}
            <Text className="text-lg mb-12 text-center px-4">
              Take a photo of your running shoes to turn off the alarm
            </Text>
          </>
        )}
        <Pressable
          onPress={handleImUp}
          className="bg-gray-800 px-8 py-4 rounded-xl"
        >
          {showSnoozeMessage ? (
            <Text className="text-xl">Take a photo.</Text>
          ) : (
            <Text className="text-xl">I'm up.</Text>
          )}
        </Pressable>
        <Pressable onPress={handleSnoozeAttempt} className="mt-4 px-8 py-4">
          <Text className="text-gray-400">Snooze</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
