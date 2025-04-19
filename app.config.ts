export default {
  expo: {
    name: "Deep Work Timer",
    owner: "shawnesquivel",
    slug: "deep-work-timer",
    userInterfaceStyle: "automatic",
    scheme: "app.deeptimer.focus",
    extra: {
      openaiApiKey: process.env.OPENAI_API_KEY,
      supabaseUrl:
        process.env.SUPABASE_URL_PROD || "App.config.ts couldn't find dev key",
      supabaseAnonKey:
        process.env.SUPABASE_ANON_KEY_PROD ||
        "App.config.ts couldn't find anon key",
      eas: {
        projectId: "12494e3e-61d2-4a19-8dc6-614b139b45fa",
      },
    },
    plugins: ["expo-font", "expo-router"],
    android: {
      package: "com.shawnesquivel.deepworktimer",
    },
    ios: {
      bundleIdentifier: "app.deeptimer.focus",
      infoPlist: {
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: ["app.deeptimer.focus"],
          },
        ],
        ITSAppUsesNonExemptEncryption: false,
      },
    },
  },
};
