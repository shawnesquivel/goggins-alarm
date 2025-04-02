import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, ScrollView } from "react-native";
import { Text, View } from "@/components/Themed";

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Pomodoro Timer</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            What is the Pomodoro technique?
          </Text>
          <Text style={styles.paragraph}>
            The Pomodoro Technique is a time management method developed by
            Francesco Cirillo in the late 1980s. It uses a timer to break work
            into intervals, traditionally 25 minutes in length, separated by
            short breaks.
          </Text>
          <Text style={styles.paragraph}>
            Each interval is known as a pomodoro, from the Italian word for
            tomato, after the tomato-shaped kitchen timer Cirillo used as a
            university student.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to use this app</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>1. Create Projects:</Text> Start by
            creating projects in the Projects tab. These represent the different
            areas of your work or side projects.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>2. Start a Focus Session:</Text> On the
            Timer tab, enter what you're working on, select the relevant project
            and tags, and start a focus session.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>3. Stay Focused:</Text> Work without
            distractions until the timer completes. You can use full-screen mode
            for fewer distractions.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>4. Take Breaks:</Text> When a focus
            session ends, take a short break. The app can automatically start a
            break timer.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>5. Rate Your Sessions:</Text> After each
            session, rate how productive it was and optionally add notes.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>6. Track Progress:</Text> Use the Reports
            tab to see your focus time statistics and track progress over time.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Benefits of the Pomodoro Technique
          </Text>
          <Text style={styles.paragraph}>
            • Reduces distractions and mental fatigue
          </Text>
          <Text style={styles.paragraph}>
            • Increases accountability and motivation
          </Text>
          <Text style={styles.paragraph}>
            • Improves planning and estimation skills
          </Text>
          <Text style={styles.paragraph}>
            • Creates a better work/break balance
          </Text>
          <Text style={styles.paragraph}>
            • Helps maintain consistent focus quality
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips for Success</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Start Small:</Text> If 25 minutes seems
            too long, begin with shorter sessions and work your way up.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Respect Breaks:</Text> Breaks are an
            essential part of the technique. Don't skip them!
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Batch Small Tasks:</Text> Use a single
            pomodoro for multiple small tasks to maintain efficiency.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Track Progress:</Text> Regularly review
            your reports to see patterns in your productivity.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Adjust as Needed:</Text> Customize session
            durations based on your personal work style.
          </Text>
        </View>
      </ScrollView>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  bold: {
    fontWeight: "bold",
  },
});
