import React from "react";
import { View, Text, StyleSheet } from "react-native";
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

export default function FontTest() {
  const [libreBaskervilleLoaded] = useFonts({
    LibreBaskerville_400Regular,
    LibreBaskerville_700Bold,
    LibreBaskerville_400Regular_Italic,
  });

  const [figtreeLoaded] = useFigtreeFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  if (!libreBaskervilleLoaded || !figtreeLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Font Test</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Libre Baskerville</Text>
        <Text
          style={[styles.text, { fontFamily: "LibreBaskerville_400Regular" }]}
        >
          Regular: The quick brown fox jumps over the lazy dog
        </Text>
        <Text style={[styles.text, { fontFamily: "LibreBaskerville_700Bold" }]}>
          Bold: The quick brown fox jumps over the lazy dog
        </Text>
        <Text
          style={[
            styles.text,
            { fontFamily: "LibreBaskerville_400Regular_Italic" },
          ]}
        >
          Italic: The quick brown fox jumps over the lazy dog
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Figtree</Text>
        <Text style={[styles.text, { fontFamily: "Figtree_400Regular" }]}>
          Regular: The quick brown fox jumps over the lazy dog
        </Text>
        <Text style={[styles.text, { fontFamily: "Figtree_500Medium" }]}>
          Medium: The quick brown fox jumps over the lazy dog
        </Text>
        <Text style={[styles.text, { fontFamily: "Figtree_600SemiBold" }]}>
          SemiBold: The quick brown fox jumps over the lazy dog
        </Text>
        <Text style={[styles.text, { fontFamily: "Figtree_700Bold" }]}>
          Bold: The quick brown fox jumps over the lazy dog
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
});
