# Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd JEEMockTestApp
npm install
```

## Step 2: Start Development (No configuration needed!)

```bash
npm start
```

Then press `a` to run on Android device/emulator, or scan QR code with Expo Go app.

## Step 3: Test the App

### Default Login Credentials:

**Admin Account:**
- Email: `admin@jee.com`
- Password: `admin123`

**Student Account:**
- Email: `test@gmail.com`
- Password: `test123`

## Step 4: Build APK for Production

### Option A: Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build --platform android --profile preview
```

### Option B: Local Build

```bash
# Install Expo CLI
npm install -g expo-cli

# Build APK
expo build:android
```

## Optional: Enable Supabase Database

1. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Add Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Run migrations in Supabase SQL editor (from `../MockPortalApp/supabase/migrations/`)

## Testing Screenshot Blocking

**IMPORTANT**: Screenshot blocking only works on physical Android devices, NOT on emulators!

1. Install app on physical Android device
2. Login and start a test
3. Try to take a screenshot (Power + Volume Down)
4. Screenshot will be blocked and violation will be logged

## Troubleshooting

### App crashes on start
```bash
# Clear cache
expo start -c

# Reinstall dependencies
rm -rf node_modules && npm install
```

### Screenshot blocking not working
- Must test on physical Android device (doesn't work on emulator)
- Check app permissions in Android settings

### Build errors
- Ensure Node.js version is 18 or higher
- Update Android SDK tools
- Check Java version (Java 11 recommended)

## Next Steps

1. Customize test questions in `src/context/TestContext.tsx`
2. Update app branding in `app.json`
3. Add your own icon and splash screen in `assets/` folder
4. Configure Supabase for production database
5. Build and test on physical device

## Support

See README.md for detailed documentation.

---

**Your Android app is ready to use!**
