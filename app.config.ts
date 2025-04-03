export default {
  expo: {
    name: "mentality-alarm",
    slug: "mentality-alarm",
    userInterfaceStyle: "automatic",
    extra: {
      openaiApiKey: process.env.OPENAI_API_KEY,
    },
    plugins: [
      "expo-font",
      "expo-router"
    ]
  },
};
