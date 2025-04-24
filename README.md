# Supabase

## Reset local
npx supabase db reset
npx supabas functions list


## Sync TypeScript to Database Schema
npx supabase gen types --lang=typescript --local > types/database.types.ts


### EAS development build instructions 
Check seutp
```
npx eas whoami
npx eas --version
```

Check dependencies
```
npx expo install --check
```

Fix `app.json`
```
{
  "expo": 
    "ios": {
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": [
                // Get this from Google oAuth 2.0 -> Create iOS client:
              "com.googleusercontent.apps.294468100097-plq9insq4njpo3q285inqpjf7gif9gl"
              // Register the app's URL scheme to handle the Oauth callback
              "app.deeptimer.focus"
            ]
          }
        ]
      }
    },
  }
}
```


Build for EAS on physical device
```
eas build --platform ios --profile development
```


Logs:
Project Credentials Configuration

Project                   @shawnesquivel/deep-work-timer
Bundle Identifier         app.deeptimer.focus
                          
Ad Hoc Configuration      
                          
Distribution Certificate  
Serial Number             4A0145F3DBEEF9935A3539A93E0AA9F6
Expiration Date           Wed, 15 Apr 2026 15:32:10 GMT+0700
Apple Team                4K9KCC9VC9 (Shiho Hayashi (Individual))
Updated                   4 days ago
                          
Provisioning Profile      
Developer Portal ID       9JCDXB437B
Status                    active
Expiration                Wed, 15 Apr 2026 15:32:10 GMT+0700
Apple Team                4K9KCC9VC9 (Shiho Hayashi (Individual))
Provisioned devices       - iPhone (UDID: 00008101-000C31DE0AF1003A)
Updated                   3 days ago
                          
All credentials are ready to build @shawnesquivel/deep-work-timer (app.deeptimer.focus)


In app.json, add the C

## Pre-requisites
- Register the schema in Supabase Dashboard  > Auth > Url Configuration

https://supabase.com/dashboard/project/jsgqekncltjwfjggntvx/auth/url-configuration

ENTER: app.deeptimer.focus://auth/callback

- Ensure that app.json has the correct schema


## Can't find the server on the installed device on apple?
- Run npx eas build --platform ios --profile development
- Delete app (avoid cache issues with schema)
- Reinstlal via QR code
- Ensure you're logged in with your EAS profile
- Run  npx expo prebuild --clean && nprx expo start
- Click the app

## Fix Bug:
https://github.com/software-mansion/react-native-gesture-handler/issues/2749#issuecomment-1935955867

 ERROR  Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'RNGoogleSignin' could not be found. Verify that a module by this name is registered in the native binary., js engine: hermes

 Solution: 
 ```
 cd ios
 pod install
 cd ..
 ```



## Bug: Your app is missing support for the folloiwng URL schemes....
 ERROR  Google sign in error: [Error: Encountered an error when signing in (see more below). If the error is 'Your app is missing support for the following URL schemes...', follow the troubleshooting guide at https://react-native-google-signin.github.io/docs/troubleshooting#ios

Your app is missing support for the following URL schemes: com.googleusercontent.apps.294468100097-plq9insq4njpo3q285lnpqujf7gjf9gl]

Solution: 
Update your app.json to use the iOS client ID's URL scheme. The above was a Web Client ID. Then rebuild:
Ensure the Client ID is configured here:
https://supabase.com/dashboard/project/jsgqekncltjwfjggntvx/auth/providers?provider=Google

```
npx expo prebuild --clean
npx eas build --platform ios --profile development
# delete app on iphone 
# re-install app from QR code.
# sign into Expo on native app
# npx expo start
```




# Four Key Rules for Expo App Development Updates

## 1. JavaScript Changes Only
**Rule**: For changes that only affect JavaScript code (no native dependencies):
- Make your code changes
- No rebuild required
- Changes appear automatically with hot reload
- Example: UI updates, business logic, state management

## 2. Configuration Updates
**Rule**: For app.json or plugin configuration changes:
- Update app.json or config plugin parameters
- Run `npx expo prebuild --clean` to regenerate native code
- Rebuild with `npx expo run:ios` or use EAS Build
- Example: Adding URL schemes, changing app permissions

## 3. Native Code Changes
**Rule**: For native code modifications:
- Edit native code files or add native modules
- Always run `npx expo prebuild --clean`
- Rebuild the app completely
- Example: Adding custom native modules, modifying Swift/Java files

## 4. Adding Libraries with Native Dependencies
**Rule**: When installing new libraries with native code:
- Install the package with npm/yarn
- If using Expo Dev Client: run `npx expo prebuild --clean`
- If using EAS: run `eas build --profile development --platform ios`
- Test thoroughly on actual devices, not just simulators
- Example: OAuth libraries, camera modules, Bluetooth integrations

Each rule follows a specific path through the diagram based on the type of change you're making to your Expo project.


## OAUTH Setup

### Supabase
Client IDs ()
294468100097-plq9insq4njpo3q285lnpqujf7gjf9gl.apps.googleusercontent.com,294468100097-e5e9pup377orojsl4ta6orga3n7nkdoq.apps.googleusercontent.com

Client Secret (From Google Web Client)
GOCSPX-***

Callback URL (for OAuth). Added this to Web Client Redirect URIs.
https://jsgqekncltjwfjggntvx.supabase.co/auth/v1/callback


### Google Web Auth
Using web based auth.


Client ID
294468100097-e5e9pup377orojsl4ta6orga3n7nkdoq.apps.googleusercontent.com

Client Secret
GOCSPX-******

Authorized Redirect URis
https://jsgqekncltjwfjggntvx.supabase.co/auth/v1/callback, http://127.0.0.1:54321/auth/v1/callback, http://localhost:54321/auth/v1/callback, http://localhost:8081/login-callback, http://localhost:8081, https://auth.expo.io/@shawnesquivel/deep-work-timer/login-callback


Note: 
app.deeptimer.focus:// ... Results in "Error - Invalid Redirect: must use either http or https as the scheme."

### Build Details (Takes about 4.5min)
https://docs.expo.dev/tutorial/eas/ios-development-build-for-devices/


Build and download this
```
npx expo prebuild --clean
npx eas build --platform ios --profile development --non-interactive
```
Note: `--non-interactive` to accept defaults.

Then run 
```
npx expo start --tunnel
```


