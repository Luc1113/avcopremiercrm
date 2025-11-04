# Avco Premier CRM - Complete Setup Guide

## Overview
Avco Premier CRM is a cloud-based collaborative CRM system designed for restaurant onboarding. It features real-time synchronization, Google Authentication, and a Kanban-style board interface.

---

## Part 1: Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: **avco-premier-crm** (or your preferred name)
4. Click "Continue"
5. Disable Google Analytics (optional, not needed for this project)
6. Click "Create project"
7. Wait for project creation, then click "Continue"

### Step 2: Enable Google Authentication

1. In Firebase Console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Click on "Google" under "Sign-in providers"
4. Toggle "Enable" to ON
5. Enter a project support email (your email)
6. Click "Save"

### Step 3: Create Firestore Database

1. In Firebase Console, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in production mode"
4. Click "Next"
5. Choose a Cloud Firestore location (choose closest to your location):
   - `us-central` for United States
   - `europe-west` for Europe
   - `asia-southeast` for Asia
6. Click "Enable"
7. Wait for database creation

### Step 4: Get Firebase Configuration

1. In Firebase Console, click the gear icon (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps" section
4. Click the "</>" icon (Web app)
5. Register app name: **Avco Premier CRM**
6. Check "Also set up Firebase Hosting"
7. Click "Register app"
8. Copy the `firebaseConfig` object - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...your-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

**IMPORTANT:** Save this configuration - you'll need it in Step 5!

9. Click "Continue to console"

### Step 5: Update Application Configuration

1. Open the file `src/App.jsx`
2. Find this section at the top (around line 28):

```javascript
// Firebase configuration - YOU NEED TO REPLACE THIS
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. Replace with your actual Firebase configuration from Step 4
4. Save the file

---

## Part 2: Local Development Setup

### Prerequisites
- Node.js 16 or higher ([Download here](https://nodejs.org/))
- npm (comes with Node.js)

### Step 1: Install Dependencies

Open terminal/command prompt in the project folder and run:

```bash
npm install
```

This installs all required packages:
- React
- Firebase SDK
- React Beautiful DnD (drag-and-drop)
- Lucide React (icons)
- Tailwind CSS

### Step 2: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 3: Login to Firebase

```bash
firebase login
```

This opens a browser window - sign in with your Google account.

### Step 4: Initialize Firebase in Project

```bash
firebase init
```

When prompted:
1. **Which Firebase features?** 
   - Press SPACE to select: ✓ Firestore, ✓ Hosting
   - Press ENTER

2. **Use existing project or create new?** 
   - Select "Use an existing project"
   - Choose your project from the list

3. **Firestore Rules file?** 
   - Press ENTER (use default: firestore.rules)

4. **Firestore indexes file?** 
   - Press ENTER (use default: firestore.indexes.json)

5. **Public directory?** 
   - Type: `build`
   - Press ENTER

6. **Configure as single-page app?** 
   - Type: `y`
   - Press ENTER

7. **Set up automatic builds with GitHub?** 
   - Type: `n`
   - Press ENTER

8. **Overwrite build/index.html?** 
   - Type: `n`
   - Press ENTER

### Step 5: Deploy Security Rules

Deploy the security rules to protect your data:

```bash
firebase deploy --only firestore:rules
```

You should see: ✓ firestore: deployed database rules successfully

### Step 6: Start Development Server

```bash
npm start
```

The application will open in your browser at `http://localhost:3000`

You should see the login screen. Click "Sign in with Google" to test authentication.

---

## Part 3: Production Deployment

### Step 1: Build the Application

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Step 2: Deploy to Firebase Hosting

```bash
firebase deploy
```

Wait for deployment to complete. You'll see output like:

```
✓ Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project/overview
Hosting URL: https://your-project.web.app
```

### Step 3: Access Your CRM

Your CRM is now live! The URL will be:
- **Primary URL:** `https://your-project.web.app`
- **Alternative URL:** `https://your-project.firebaseapp.com`

Both URLs work identically.

---

## Part 4: Team Member Access

### Method 1: Share Direct URL (Recommended)

1. Copy your Firebase Hosting URL (e.g., `https://avco-premier-crm.web.app`)
2. Share this URL with team members via email, Slack, etc.
3. Team members can bookmark it
4. When they visit the URL, they'll see the login screen
5. They sign in with their Google account
6. They're automatically added as team members

**That's it!** No invitation system needed - anyone with the URL can sign in.

### Method 2: Using the In-App Team Feature

1. Sign in to the CRM
2. Click the "Team" button in the header
3. Click "Copy Link" button
4. Share the copied link with team members
5. They can sign in with Google

### Managing Team Members

- View all team members: Click "Team" button in header
- All authenticated users have full read/write access
- First user is automatically added
- Subsequent users are added when they sign in

---

## Part 5: Using the CRM

### Main Features

#### 1. Kanban Board (Default View)
- **5 Stages:** Leads → Ready For Onboarding → Stuck → Live → Post Launch
- **Drag & Drop:** Move accounts between stages
- **Color-Coded Labels:** Track missing items (Tablet, Website, Stripe, etc.)
- **Quick Actions:** Edit, Log Activity buttons on each card

#### 2. Adding Accounts
1. Click "New Account" button (top right)
2. Fill in details:
   - Restaurant/Company Name (required)
   - Email
   - Phone
   - Stage
   - Labels (click to toggle)
   - Potential Deal Value
   - Notes
3. Click "Create Account"

#### 3. Managing Accounts
- **Click any card** to open detailed view
- **Edit:** Click edit icon or "Edit" button
- **Delete:** Click trash icon (requires confirmation)
- **Drag between stages** to update progress

#### 4. Tracking Details

**Contacts:**
- Click account card → "Add Contact" button
- Store contact name, email, phone, title, notes
- View all contacts for an account

**Activities:**
- Click "Log Activity" button on any account card
- Types: Call, Meeting, Email, Note, Task
- Automatically timestamped
- Shows who logged the activity

**Sales:**
- Click account → "Record Sale" button
- Track amount, product/service, notes
- View total sales per account
- Dashboard shows total revenue

#### 5. Dashboard View
- Click "Dashboard" button in header
- View statistics:
  - Total accounts
  - Pipeline value
  - Total revenue
  - Activity count
- Pipeline breakdown by stage
- Missing items requiring attention
- Recent activity feed

#### 6. Real-Time Collaboration
- All changes sync instantly across all users
- Multiple team members can work simultaneously
- See updates from other users in real-time
- No need to refresh

---

## Part 6: Data Security & Privacy

### Security Rules

The application has these security measures:

1. **Authentication Required:** Only signed-in users can access data
2. **Team-Only Access:** Only authenticated team members see CRM data
3. **Secure by Default:** All data is private to your team
4. **No Public Access:** External users cannot see or access your data

### What's Protected

- All accounts, contacts, activities, and sales are private
- Only users who sign in with Google can access
- Data is stored in your Firebase project (not shared)
- Each Firebase project is isolated

### Google Authentication

- Uses official Google OAuth 2.0
- No passwords stored in the application
- Secure token-based authentication
- Users sign in with existing Google accounts

---

## Part 7: Customization Options

### Changing Stages

Edit `src/App.jsx`, find the `STAGES` array (around line 53):

```javascript
const STAGES = [
  { id: 'Leads', name: 'Leads', color: 'bg-blue-100' },
  // Add, remove, or modify stages here
];
```

### Changing Labels

Edit `src/App.jsx`, find the `LABEL_OPTIONS` array (around line 62):

```javascript
const LABEL_OPTIONS = [
  { id: 'Missing Tablet', name: 'Missing Tablet', color: 'bg-red-500' },
  // Add, remove, or modify labels here
];
```

### Changing Activity Types

Edit `src/App.jsx`, find the `ACTIVITY_TYPES` array (around line 71):

```javascript
const ACTIVITY_TYPES = ['Call', 'Meeting', 'Email', 'Note', 'Task'];
```

After making changes, rebuild and redeploy:

```bash
npm run build
firebase deploy
```

---

## Part 8: Troubleshooting

### Issue: "Firebase config not found" error

**Solution:** Make sure you replaced the Firebase configuration in `src/App.jsx` with your actual config from Firebase Console.

### Issue: "Permission denied" errors

**Solution:** Deploy security rules:
```bash
firebase deploy --only firestore:rules
```

### Issue: Can't sign in with Google

**Solution:** 
1. Check that Google auth is enabled in Firebase Console → Authentication
2. Make sure you added your domain to authorized domains
3. Clear browser cache and try again

### Issue: Changes not appearing after deployment

**Solution:** 
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. Try incognito/private browsing mode

### Issue: "npm: command not found"

**Solution:** Install Node.js from https://nodejs.org/ (includes npm)

### Issue: Drag and drop not working

**Solution:** Make sure you're clicking and holding on the card body (not buttons)

---

## Part 9: Cost & Limits

### Firebase Free Tier (Spark Plan)

**Included Free:**
- 50,000 document reads/day
- 20,000 document writes/day
- 20,000 document deletes/day
- 1 GB storage
- 10 GB/month hosting transfer
- Google Authentication (unlimited)

**Typical Usage Estimate:**
- Small team (5-10 users): Well within free tier
- ~100-500 operations per user per day
- Should handle 10-20 active users easily

**If You Exceed Free Tier:**
- Firebase automatically upgrades to pay-as-you-go (Blaze plan)
- Prices are very reasonable:
  - $0.06 per 100,000 document reads
  - $0.18 per 100,000 document writes
  - $0.02 per 100,000 document deletes

**Cost Monitoring:**
- View usage in Firebase Console → Usage and billing
- Set up budget alerts
- For small teams, costs typically stay at $0/month

---

## Part 10: Maintenance & Updates

### Updating the Application

1. Make changes to code
2. Test locally: `npm start`
3. Build: `npm run build`
4. Deploy: `firebase deploy`

### Backup Data

To export your data:

1. Go to Firebase Console
2. Click "Firestore Database"
3. Click "Import/Export" tab
4. Click "Export"
5. Choose Cloud Storage bucket
6. Click "Export"

### Monitoring

Firebase Console provides:
- Real-time database activity
- Authentication logs
- Hosting analytics
- Performance monitoring
- Error tracking

---

## Part 11: Getting Help

### Resources

- **Firebase Documentation:** https://firebase.google.com/docs
- **React Documentation:** https://react.dev/
- **Firebase Support:** https://firebase.google.com/support

### Common Questions

**Q: Can I use my own domain?**
A: Yes! In Firebase Console → Hosting → Add custom domain

**Q: Can I export my data?**
A: Yes, use Firebase Console → Firestore → Import/Export

**Q: How many users can use this?**
A: Unlimited users can authenticate. Free tier supports ~10-20 active users comfortably.

**Q: Is my data secure?**
A: Yes, data is encrypted at rest and in transit. Only authenticated users can access.

**Q: Can I add my company logo?**
A: Yes, edit `src/App.jsx` and add an image in the header section.

---

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Deploy to Firebase
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only security rules
firebase deploy --only firestore:rules

# View Firebase projects
firebase projects:list

# Check Firebase login status
firebase login:list
```

---

## Success Checklist

✅ Firebase project created
✅ Google Authentication enabled
✅ Firestore database created
✅ Firebase configuration added to App.jsx
✅ Dependencies installed (`npm install`)
✅ Firebase CLI installed
✅ Firebase initialized in project
✅ Security rules deployed
✅ Application builds successfully (`npm run build`)
✅ Application deployed to Firebase Hosting
✅ Can sign in with Google account
✅ Team members can access via URL
✅ Data syncs in real-time

---

## Conclusion

You now have a fully functional, cloud-based collaborative CRM! Your team can:

- ✅ Access from anywhere with internet
- ✅ Sign in securely with Google
- ✅ Collaborate in real-time
- ✅ Track restaurant onboarding pipeline
- ✅ Manage contacts, activities, and sales
- ✅ View dashboard analytics

**Your CRM URL:** `https://your-project.web.app`

Share this URL with your team and start managing your restaurant onboarding pipeline!

---

## Support

If you encounter any issues not covered in this guide:

1. Check the Troubleshooting section (Part 8)
2. Review Firebase Console for error messages
3. Check browser console (F12) for JavaScript errors
4. Verify Firebase configuration is correct
5. Ensure security rules are deployed

For Firebase-specific issues, visit: https://firebase.google.com/support
