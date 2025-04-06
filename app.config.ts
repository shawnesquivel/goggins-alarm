export default {
  expo: {
    name: "Deep Work Timer",
    slug: "deep-work-timer",
    userInterfaceStyle: "automatic",
    scheme: "com.deepwork",
    extra: {
      openaiApiKey: process.env.OPENAI_API_KEY,
      supabaseUrl:
        process.env.SUPABASE_URL_DEV || "App.config.ts couldn't find dev key",
      supabaseAnonKey:
        process.env.SUPABASE_ANON_KEY_DEV ||
        "App.config.ts couldn't find anon key",
    },
    plugins: ["expo-font", "expo-router"],
    android: {
      package: "com.shawnesquivel.deepworktimer",
    },
    ios: {
      bundleIdentifier: "com.deepwork",
      infoPlist: {
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: ["com.deepwork"],
          },
        ],
      },
    },
  },
};
