import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, ScrollView } from "react-native";
import { Text, View } from "@/components/Themed";

export default function ModalScreen() {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>mentality alarm.</Text>
        <View
          style={styles.separator}
          lightColor="#eee"
          darkColor="rgba(255,255,255,0.1)"
        />

        <View style={styles.quote}>
          <Text style={styles.quoteText}>
            "The only way to get better is to get after it every single day." -
            David Goggins
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 The Mission</Text>
          <Text style={styles.description}>
            Build mental toughness through discipline. No excuses. No cookie
            cutter shit. No easy way out.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Features</Text>
          <Text style={styles.feature}>
            • Build discipline through consistency.
          </Text>
          <Text style={styles.feature}>
            • Stay accountable with photo verification.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ FAQ</Text>

          <Text style={styles.question}>How does the alarm work?</Text>
          <Text style={styles.answer}>
            Set your wake-up time. When the alarm goes off, you must take a
            photo of your running shoes to turn it off. No shortcuts.
          </Text>

          <Text style={styles.question}>What happens if I try to snooze?</Text>
          <Text style={styles.answer}>
            David Goggins will laugh at you, share some motivation, and the
            alarm will repeat every minute until you get up and take the photo.
          </Text>

          <Text style={styles.question}>Why running shoes?</Text>
          <Text style={styles.answer}>
            The app uses AI to verify you're showing running shoes. This creates
            a mental connection between waking up and working out.
          </Text>

          <Text style={styles.question}>
            Can I disable the alarm another way?
          </Text>
          <Text style={styles.answer}>
            No. The only way to disable the alarm is to take a photo of your
            running shoes. This builds mental toughness and prevents excuses.
          </Text>
        </View>

        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 20,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: "80%",
  },
  section: {
    width: "100%",
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#007AFF",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "left",
    marginBottom: 16,
  },
  feature: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  quote: {
    backgroundColor: "#1c1c1e",
    padding: 24,
    borderRadius: 12,
    width: "100%",
    marginTop: 24,
    marginBottom: 24,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    color: "#ffffff",
  },
  question: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  answer: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    color: "#8E8E93",
  },
});
