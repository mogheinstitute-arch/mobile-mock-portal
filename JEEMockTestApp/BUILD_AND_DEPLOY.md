# Build and Deploy Guide

This guide explains how to build and deploy your JEE Mock Test Android app.

## Quick Start

```bash
cd JEEMockTestApp
npm install
npm start
```

Press `a` for Android or scan QR code with Expo Go app.

---

## Development Workflow

### 1. Local Development with Expo Go

**Easiest way to test on your device:**

```bash
npm start
```

- Install "Expo Go" app from Google Play Store
- Scan QR code from terminal
- App will load instantly on your device
- Changes auto-reload (hot reload enabled)

**Pros:**
- No build required
- Instant updates
- Easy testing

**Cons:**
- Screenshot blocking doesn't work in Expo Go
- Some native features limited

### 2. Development Build

**For testing native features (screenshot blocking):**

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Create development build
eas build --profile development --platform android
```

This creates a development APK with full native features.

---

## Production Builds

### Option 1: EAS Build (Recommended)

**Most reliable and recommended by Expo:**

#### A. Build APK (for direct installation)

```bash
eas build --platform android --profile preview
```

- Creates an APK file
- Can be directly installed on any Android device
- No Google Play Store needed
- Good for testing and internal distribution

#### B. Build AAB (for Google Play Store)

```bash
eas build --platform android --profile production
```

- Creates an Android App Bundle (AAB)
- Required for Google Play Store
- Smaller download size
- Optimized for different devices

**Steps:**
1. Run build command
2. Wait for build to complete (10-20 minutes)
3. Download APK/AAB from EAS dashboard
4. Install APK on device or upload AAB to Play Store

### Option 2: Local Build with Expo CLI

**Alternative if you prefer local builds:**

```bash
# Install Expo CLI
npm install -g expo-cli

# Build APK
expo build:android -t apk

# Build AAB
expo build:android -t app-bundle
```

**Note**: This method is being deprecated by Expo in favor of EAS Build.

---

## Distribution Methods

### 1. Direct APK Installation

**Best for: Internal testing, beta users**

1. Build APK using EAS Build
2. Download APK file
3. Send to users via email/cloud storage
4. Users enable "Install from Unknown Sources"
5. Install APK on Android device

### 2. Google Play Store

**Best for: Public release**

#### Requirements:
- Google Play Developer account ($25 one-time fee)
- App signing key
- Privacy policy
- Content rating

#### Steps:

1. **Create Google Play Developer Account**
   - Go to https://play.google.com/console
   - Pay $25 registration fee
   - Complete account setup

2. **Prepare App for Release**
   ```bash
   # Update app.json with production settings
   # Increment version number
   # Build production AAB
   eas build --platform android --profile production
   ```

3. **Create App Listing**
   - App name, description, screenshots
   - Privacy policy URL
   - Content rating questionnaire
   - Store listing graphics

4. **Upload AAB**
   - Go to Play Console
   - Create new release
   - Upload AAB file
   - Submit for review

5. **Review Process**
   - Google reviews app (1-7 days)
   - App goes live after approval

### 3. Firebase App Distribution

**Best for: Beta testing with multiple testers**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Upload APK to Firebase
firebase appdistribution:distribute app-release.apk \
  --app YOUR_APP_ID \
  --groups testers
```

---

## Environment Configuration

### Development
```
EXPO_PUBLIC_SUPABASE_URL=dev-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=dev-key
```

### Production
```
EXPO_PUBLIC_SUPABASE_URL=prod-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=prod-key
```

---

## Build Configurations

### eas.json Profiles:

#### `development`
- Development build with debugging
- For testing native features

#### `preview`
- APK build for testing
- Production-like environment
- Can be installed directly

#### `production`
- AAB for Play Store
- Fully optimized
- Signed for release

---

## Signing and Security

### App Signing

EAS Build automatically handles signing:
- Generates keystore
- Signs APK/AAB
- Stores credentials securely

For manual signing, see: https://docs.expo.dev/app-signing/app-credentials/

### Security Checklist

- [ ] Remove debug logs
- [ ] Enable ProGuard/R8
- [ ] Use production Supabase credentials
- [ ] Test screenshot blocking on device
- [ ] Verify violation logging works
- [ ] Test all security features

---

## Testing Before Release

### Pre-Release Checklist

1. **Functional Testing**
   - [ ] Login/signup works
   - [ ] Admin panel accessible
   - [ ] Tests load and display correctly
   - [ ] Timer counts down properly
   - [ ] Questions can be answered
   - [ ] Navigation works
   - [ ] Submit test works
   - [ ] Results display correctly

2. **Security Testing**
   - [ ] Screenshot blocking works (physical device!)
   - [ ] App switch detection logs violations
   - [ ] Background mode triggers violations
   - [ ] Test state persists on app close
   - [ ] Resume test works correctly

3. **Performance Testing**
   - [ ] App loads quickly
   - [ ] Images load properly
   - [ ] No crashes or freezes
   - [ ] Smooth scrolling
   - [ ] Memory usage acceptable

4. **Device Testing**
   - [ ] Test on multiple Android versions
   - [ ] Test on different screen sizes
   - [ ] Test on low-end devices
   - [ ] Test with slow network

---

## Troubleshooting Builds

### Build Fails

```bash
# Clear Expo cache
expo start -c

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try build again
eas build --platform android --profile preview
```

### Native Module Errors

Check `package.json` dependencies are compatible:
```bash
npx expo install --check
```

### Gradle Errors

Update Gradle in `android/gradle.properties` (if using bare workflow).

For managed workflow (current setup), EAS handles this automatically.

---

## Continuous Deployment

### Automated Builds with GitHub Actions

Create `.github/workflows/build.yml`:

```yaml
name: EAS Build
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx eas-cli build --platform android --profile preview --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

---

## Post-Release

### Over-The-Air (OTA) Updates

Update app without rebuilding:

```bash
# Publish update
eas update --branch production --message "Bug fixes"
```

Users get updates automatically on next app launch!

**Note**: Only works for JavaScript/React code, not native code.

### Monitoring

- Use EAS Insights for crash reports
- Monitor Google Play Console for reviews
- Track downloads and user engagement

---

## Cost Breakdown

### Free Tier (Expo)
- Unlimited development
- 1-2 builds per month

### Paid Plans
- **EAS Starter**: $29/month - More builds
- **EAS Production**: $99/month - Priority builds, more seats

### Google Play
- $25 one-time developer fee

---

## Getting Help

- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- Community: https://forums.expo.dev

---

**You're ready to build and deploy your Android app!**
