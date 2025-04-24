export default {
  expo: {
    name: "Deep Work Timer",
    owner: "shawnesquivel",
    slug: "deep-work-timer",
    userInterfaceStyle: "automatic",
    scheme: "app.deeptimer.focus",
    extra: {
      openaiApiKey: process.env.OPENAI_API_KEY,
      supabaseUrl: "https://jsgqekncltjwfjggntvx.supabase.co",
      supabaseAnonKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzZ3Fla25jbHRqd2ZqZ2dudHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NzQ0NTYsImV4cCI6MjA1OTI1MDQ1Nn0.xlf0cZzkJwzRpWFvTGbK55EiiJKEWuztlec7Y2_Xwkw",
      eas: {
        projectId: "12494e3e-61d2-4a19-8dc6-614b139b45fa",
      },
    },
    plugins: ["expo-font", "expo-router"],
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
    android: {
      package: "app.deeptimer.focus",
    },
  },
};
