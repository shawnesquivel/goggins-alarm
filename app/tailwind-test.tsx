import React from "react";
import { SafeAreaView, StatusBar } from "react-native";
import TestTailwind from "@/components/TestTailwind";

export default function TailwindTestScreen() {
  return (
    <SafeAreaView className="flex-1">
      <StatusBar />
      <TestTailwind />
    </SafeAreaView>
  );
}
