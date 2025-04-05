import React from "react";
import { View, StyleSheet } from "react-native";
import DatabaseTester from "@/components/DatabaseTester";

export default function DatabaseTestScreen() {
  return (
    <View style={styles.container}>
      <DatabaseTester />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
