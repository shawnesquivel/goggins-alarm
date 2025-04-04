export default {
  expo: {
    name: "Deep Work Timer",
    slug: "deep-work-timer",
    userInterfaceStyle: "automatic",
    scheme: "com.deepwork",
    extra: {
      openaiApiKey: process.env.OPENAI_API_KEY,
      supabaseUrl: process.env.REACT_NATIVE_SUPABASE_URL,
      supabaseAnonKey: process.env.REACT_NATIVE_SUPABASE_ANON_KEY,
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
