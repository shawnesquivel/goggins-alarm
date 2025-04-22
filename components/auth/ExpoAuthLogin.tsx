import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { supabase } from "@/lib/supabase";

export default function () {
  /**
   *
   * Note: this doesn't work yet. see GitHub Issue:
   *
   */
  console.log("[ExpoAuthLogin] Initializing Google Sign In component");

  GoogleSignin.configure({
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    webClientId:
      "294468100097-e5e9pup377orojsl4ta6orga3n7nkdoq.apps.googleusercontent.com",
    // reversed
    iosClientId:
      // "294468100097-plq9insq4njpo3q285lnpqujf7gjf9gl.apps.googleusercontent.com", //non-reversed -> gives `Your app is missing support for the following URL schemes:   com.googleusercontent.apps.294468100097-plq9insq4njpo3q285lnpqujf7gjf9gl]`
      "com.googleusercontent.apps.294468100097-plq9insq4njpo3q285lnpqujf7gjf9gl", // okay so the above appears to not be a format it likes.. I'll reversed it back to the requested format from the error message. `com.googleusercontent.apps` ->  restart deve server -> now the error is: `Your app is missing support for the following URL schemes: 294468100097-plq9insq4njpo3q285lnpqujf7gjf9gl.apps.googleusercontent.com]`
  });

  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={async () => {
        try {
          console.log("[ExpoAuthLogin] Checking Play Services availability");
          await GoogleSignin.hasPlayServices();

          console.log("[ExpoAuthLogin] Starting Google Sign In flow");
          const userInfo = await GoogleSignin.signIn();
          console.log("[ExpoAuthLogin] Received user info:", userInfo);

          if (userInfo?.data?.idToken) {
            console.log(
              "[ExpoAuthLogin] Got ID token, signing in with Supabase"
            );
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: userInfo.data.idToken,
            });

            if (error) {
              console.error("[ExpoAuthLogin] Supabase sign in error:", error);
            } else {
              console.log(
                "[ExpoAuthLogin] Successfully signed in with Supabase:",
                data
              );
            }
          } else {
            console.error("[ExpoAuthLogin] No ID token present in user info");
            throw new Error("no ID token present!");
          }
        } catch (error: any) {
          console.error("[ExpoAuthLogin] Error during sign in:", error);

          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            console.log("[ExpoAuthLogin] User cancelled the login flow");
          } else if (error.code === statusCodes.IN_PROGRESS) {
            console.log(
              "[ExpoAuthLogin] Sign in operation already in progress"
            );
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            console.log(
              "[ExpoAuthLogin] Play services not available or outdated"
            );
          } else {
            console.error("[ExpoAuthLogin] Unexpected error:", error);
          }
        }
      }}
    />
  );
}
