# Goggins Alarm

A motivational alarm clock app inspired by David Goggins that won't let you snooze - you need to take a photo of your running shoes to turn it off!

## Features

- 🏃‍♂️ **No Excuses Alarm**: The alarm won't stop until you take a photo of your running shoes
- 🔊 **Motivational Sounds**: Features David Goggins' voice to get you motivated
- 📅 **Recurring Alarms**: Set alarms for specific days of the week
- 📱 **Modern UI**: Built with React Native and styled with NativeWind (Tailwind CSS for React Native)
- 📷 **Camera Integration**: Uses Expo Camera with AI verification of running shoes

## Tech Stack

- React Native / Expo
- TypeScript
- NativeWind (Tailwind CSS)
- Expo Router
- OpenAI API for image verification
- Expo AV for sound playback
- Expo Notifications

## Prerequisites

- Node.js (v14.0 or later)
- npm or yarn
- Expo CLI
- OpenAI API key for image verification

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/goggins-alarm.git
cd goggins-alarm
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:

```bash
npm start
# or
yarn start
```

5. Use Expo Go app on your device or an emulator to run the application

## Development

### Setting Up Development Environment

1. **Install Expo Go**:

   - Download Expo Go from the App Store (iOS) or Play Store (Android)
   - Create an Expo account in the Expo Go app

2. **Sign In to Expo**:

   ```bash
   npx expo login
   ```

   - Use the same account credentials on both your development machine and mobile device

3. **Start Development Server**:

   ```bash
   npx expo start --tunnel
   ```

   - The `--tunnel` option is recommended for better connectivity
   - You'll see a QR code in your terminal

4. **Connect Your Device**:
   - **iOS**: Use your iPhone's Camera app to scan the QR code
   - **Android**: Use the Expo Go app to scan the QR code
   - Make sure your device and computer are on the same WiFi network

### Troubleshooting

If you encounter connection issues:

1. **Package Version Mismatches**:

   ```bash
   npx expo install
   ```

   This will update all packages to their correct versions

2. **Clear Cache and Reinstall**:

   ```bash
   rm -rf node_modules
   npm install
   npx expo start --clear
   ```

3. **Network Issues**:

   - Try turning off mobile data on your device
   - Ensure both devices are on the same WiFi network
   - Use the tunnel option if LAN connection fails

4. **Expo Go Issues**:
   - Close and reopen Expo Go
   - Make sure you're signed into the same Expo account on both devices
   - Try manually entering the URL shown in the terminal

### Development Tips

- Use `npx expo start --tunnel` for more reliable connections
- Keep Expo Go updated to the latest version
- The development server automatically reloads when you make changes to the code
- Use the developer menu (shake device or press Cmd+D/Ctrl+D) to access debugging tools

## Usage

1. Set your alarm time and days for it to repeat
2. When the alarm goes off, you'll be prompted to take a photo of your running shoes
3. The app uses AI to verify that the photo contains running shoes
4. Once verified, the alarm turns off and you're ready to start your workout!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- David Goggins for the motivation
- Expo team for the amazing tools
- OpenAI for the image recognition capabilities
