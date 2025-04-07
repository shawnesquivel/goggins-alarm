import { StatusBar } from "expo-status-bar";
import { Platform, ScrollView } from "react-native";
import { Text, View } from "@/components/Themed";

export default function ModalScreen() {
  return (
    <View className="flex-1">
      <ScrollView className="flex-1 p-5">
        <Text className="text-2xl font-bold mb-5">Pomodoro Timer</Text>

        <View className="mb-6">
          <Text className="text-lg font-bold mb-2.5">
            What is the Pomodoro technique?
          </Text>
          <Text className="text-base leading-6 mb-3">
            The Pomodoro Technique is a time management method developed by
            Francesco Cirillo in the late 1980s. It uses a timer to break work
            into intervals, traditionally 25 minutes in length, separated by
            short breaks.
          </Text>
          <Text className="text-base leading-6 mb-3">
            Each interval is known as a pomodoro, from the Italian word for
            tomato, after the tomato-shaped kitchen timer Cirillo used as a
            university student.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold mb-2.5">How to use this app</Text>
          <Text className="text-base leading-6 mb-3">
            <Text className="font-bold">1. Create Projects:</Text> Start by
            creating projects in the Projects tab. These represent the different
            areas of your work or side projects.
          </Text>
          <Text className="text-base leading-6 mb-3">
            <Text className="font-bold">2. Start a Focus Session:</Text> On the
            Timer tab, enter what you're working on, select the relevant project
            and tags, and start a focus session.
          </Text>
          <Text className="text-base leading-6 mb-3">
            <Text className="font-bold">3. Stay Focused:</Text> Work without
            distractions until the timer completes. You can use full-screen mode
            for fewer distractions.
          </Text>
          <Text className="text-base leading-6 mb-3">
            <Text className="font-bold">4. Take Breaks:</Text> When a focus
            session ends, take a short break. The app can automatically start a
            break timer.
          </Text>
          <Text className="text-base leading-6 mb-3">
            <Text className="font-bold">5. Rate Your Sessions:</Text> After each
            session, rate how productive it was and optionally add notes.
          </Text>
          <Text className="text-base leading-6 mb-3">
            <Text className="font-bold">6. Track Progress:</Text> Use the
            Reports tab to see your focus time statistics and track progress
            over time.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold mb-2.5">
            Benefits of the Pomodoro Technique
          </Text>
          <Text className="text-base leading-6 mb-3">
            • Reduces distractions and mental fatigue
          </Text>
          <Text className="text-base leading-6 mb-3">
            • Increases accountability and motivation
          </Text>
          <Text className="text-base leading-6 mb-3">
            • Improves planning and estimation skills
          </Text>
          <Text className="text-base leading-6 mb-3">
            • Creates a better work/break balance
          </Text>
          <Text className="text-base leading-6 mb-3">
            • Helps maintain consistent focus quality
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold mb-2.5">Tips for Success</Text>
          <Text className="text-base leading-6 mb-3">
            <Text className="font-bold">Start Small:</Text> If 25 minutes seems
            too long, begin with shorter sessions and work your way up.
          </Text>
          <Text className="text-base leading-6 mb-3">
            <Text className="font-bold">Respect Breaks:</Text> Breaks are an
            essential part of the technique. Don't skip them!
          </Text>
          <Text className="text-base leading-6 mb-3">
            <Text className="font-bold">Batch Small Tasks:</Text> Use a single
            pomodoro for multiple small tasks to maintain efficiency.
          </Text>
          <Text className="text-base leading-6 mb-3">
            <Text className="font-bold">Track Progress:</Text> Regularly review
            your reports to see patterns in your productivity.
          </Text>
          <Text className="text-base leading-6 mb-3">
            <Text className="font-bold">Adjust as Needed:</Text> Customize
            session durations based on your personal work style.
          </Text>
        </View>
      </ScrollView>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}
