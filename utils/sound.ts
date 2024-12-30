import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class AlarmSound {
  private mainSound?: Audio.Sound;
  private snoozeSound?: Audio.Sound;

  async loadSound() {
    try {
      const { sound: main } = await Audio.Sound.createAsync(
        require("@/assets/sounds/iphone-alarm.mp3")
      );
      const { sound: snooze } = await Audio.Sound.createAsync(
        require("@/assets/sounds/goggins-evil-laugh.mp3")
      );

      this.mainSound = main;
      this.snoozeSound = snooze;

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error("Error loading sound", error);
    }
  }

  async playMainSound() {
    try {
      if (!this.mainSound) {
        await this.loadSound();
      }
      await this.mainSound?.playAsync();
    } catch (error) {
      console.error("Error playing main sound", error);
    }
  }

  async playSnoozeSound() {
    try {
      if (!this.snoozeSound) {
        await this.loadSound();
      }
      await this.snoozeSound?.playAsync();
    } catch (error) {
      console.error("Error playing snooze sound", error);
    }
  }

  async stopSound() {
    try {
      await this.mainSound?.stopAsync();
      await this.snoozeSound?.stopAsync();
    } catch (error) {
      console.error("Error stopping sound", error);
    }
  }
}
