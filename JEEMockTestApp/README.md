# JEE Mock Test Android App (Expo)

A comprehensive Android mobile application for JEE B.Arch exam preparation with advanced security features including screenshot blocking, violation tracking, and anti-cheating measures.

## Features

- **Authentication System**
  - Student and admin login/signup
  - Admin approval workflow for new students
  - Role-based access control

- **Test Management**
  - Multiple test categories (White, Blue, Grey, PYQ, Latest Pattern)
  - Dynamic question shuffling
  - Timer-based test duration
  - Question navigation and review marking
  - Test state persistence (auto-save every 5 seconds)

- **Security Features**
  - **Android Screenshot Blocking** using expo-screen-capture
  - App switch detection and violation logging
  - Background/foreground monitoring
  - Keep screen awake during tests
  - Violation tracking and reporting

- **Admin Panel**
  - Student account management
  - Pending student approval/rejection
  - Test creation and management
  - View all student test results

- **Student Features**
  - Test history with detailed analytics
  - Performance tracking
  - Score calculation (+4 correct, -1 incorrect)
  - Resume interrupted tests

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Android Studio (for Android development)
- Expo CLI
- Android device or emulator

## Installation

### 1. Install Dependencies

```bash
cd JEEMockTestApp
npm install
```

### 2. Configure Environment Variables (Optional)

For full database features, create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Note**: The app works without Supabase configuration using local authentication and storage.

### 3. Set Up Supabase Database (Optional)

If using Supabase:

1. Create a Supabase project at https://supabase.com
2. Run the migration files from `../MockPortalApp/supabase/migrations/` in your Supabase SQL editor:
   - `20251128142138_001_create_initial_schema.sql`
   - `20251207_002_create_student_history.sql`

## Development

### Start Development Server

```bash
npm start
```

This will start the Expo development server.

### Run on Android

```bash
npm run android
```

Or scan the QR code from Expo Go app on your Android device.

## Building for Production

### Using EAS Build (Recommended)

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS Build**:
   ```bash
   eas build:configure
   ```

4. **Build APK for Android**:
   ```bash
   eas build --platform android --profile preview
   ```

5. **Build AAB for Google Play Store**:
   ```bash
   eas build --platform android --profile production
   ```

### Local Build (Alternative)

1. **Install Expo CLI**:
   ```bash
   npm install -g expo-cli
   ```

2. **Build APK**:
   ```bash
   expo build:android
   ```

## Default Test Accounts

### Admin Account
- Email: `admin@jee.com`
- Password: `admin123`

### Student Account (Pre-approved)
- Email: `test@gmail.com`
- Password: `test123`

**Note**: These are local accounts for testing. In production with Supabase, you should use real authentication.

## Project Structure

```
JEEMockTestApp/
├── App.tsx                 # Main app entry point with navigation
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── src/
│   ├── context/
│   │   ├── AuthContext.tsx    # Authentication state management
│   │   └── TestContext.tsx    # Test state management
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client configuration
│   │   └── types.ts           # TypeScript type definitions
│   └── screens/
│       ├── LoginScreen.tsx           # Login page
│       ├── SignupScreen.tsx          # Signup page
│       ├── TestListScreen.tsx        # Test selection
│       ├── TestInstructionsScreen.tsx # Test instructions
│       ├── TestTakingScreen.tsx      # Test taking with security
│       ├── AdminScreen.tsx           # Admin panel
│       ├── AnalyticsScreen.tsx       # Student analytics
│       └── LeaderboardScreen.tsx     # Leaderboard
```

## Security Features

### Screenshot Blocking
- Uses `expo-screen-capture` to prevent screenshots on Android
- Automatically enabled when test starts
- Violations are logged and tracked

### Violation Detection
- App switching (background/inactive state)
- Screen focus loss
- All violations are timestamped and recorded

### Test Integrity
- Keep screen awake during tests
- Auto-submit on timer expiration
- Test state persistence (resume capability)

## Permissions

The app requires the following Android permissions:
- `android.permission.PREVENT_SCREEN_CAPTURE` - For screenshot blocking

These are automatically configured in `app.json`.

## Troubleshooting

### Screenshot blocking not working
- Ensure you're testing on a physical Android device
- Screenshot blocking doesn't work on emulators
- Check that permissions are granted in app settings

### Supabase connection issues
- Verify environment variables are correctly set
- Check Supabase URL and anon key
- Ensure RLS policies are configured correctly

### Build failures
- Clear cache: `expo start -c`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Android SDK and tools are updated

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | No |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | No |

## Testing

### Manual Testing Checklist

- [ ] Login with student account
- [ ] Login with admin account
- [ ] Signup new student
- [ ] Admin approve/reject students
- [ ] Start a test
- [ ] Screenshot blocking works
- [ ] App switch detection works
- [ ] Answer questions and navigate
- [ ] Submit test and view results
- [ ] View analytics
- [ ] View leaderboard
- [ ] Test state persistence (close and reopen app during test)

## Contributing

This is a complete, production-ready app. For modifications:
1. Follow the existing code structure
2. Maintain TypeScript types
3. Test on physical Android devices for security features

## License

Proprietary - JEE Mock Test Portal

## Support

For issues or questions, contact the development team.

---

**Built with Expo, React Native, and Supabase**
