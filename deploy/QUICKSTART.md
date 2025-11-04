# Avco Premier CRM - Quick Start (15 Minutes)

This is a condensed guide to get your CRM running FAST. For detailed information, see SETUP-GUIDE.md.

## Prerequisites
- Google account
- Node.js installed ([Download](https://nodejs.org/))

---

## Step 1: Firebase Setup (5 minutes)

### 1.1 Create Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "avco-premier-crm"
4. Disable Google Analytics
5. Click "Create project"

### 1.2 Enable Google Auth
1. Click "Authentication" → "Get started"
2. Click "Google" → Enable → Save

### 1.3 Create Database
1. Click "Firestore Database" → "Create database"
2. Choose "Production mode" → Next
3. Select your location → Enable

### 1.4 Get Config
1. Click ⚙️ (Settings) → "Project settings"
2. Scroll to "Your apps" → Click "</>" (Web)
3. Register app: "Avco Premier CRM"
4. Check "Also set up Firebase Hosting"
5. **Copy the firebaseConfig object**

---

## Step 2: Configure Application (2 minutes)

1. Open `src/App.jsx`
2. Find line ~28 (the firebaseConfig section)
3. Replace with your config from Step 1.4
4. Save file

---

## Step 3: Install & Deploy (8 minutes)

### 3.1 Install Dependencies
```bash
npm install
npm install -g firebase-tools
```

### 3.2 Login to Firebase
```bash
firebase login
```

### 3.3 Initialize Firebase
```bash
firebase init
```
- Select: Firestore, Hosting (use SPACE to select)
- Use existing project: Choose your project
- Firestore rules: Press ENTER (default)
- Firestore indexes: Press ENTER (default)
- Public directory: Type `build` and press ENTER
- Single-page app: Type `y` and press ENTER
- GitHub setup: Type `n` and press ENTER
- Overwrite index.html: Type `n` and press ENTER

### 3.4 Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### 3.5 Build & Deploy
```bash
npm run build
firebase deploy
```

**DONE!** 🎉

Your URL will be shown: `https://your-project.web.app`

---

## Step 4: Share with Team

Copy your Firebase URL and share it with team members:
- They visit the URL
- Click "Sign in with Google"
- They're in!

---

## Quick Test

1. Visit your Firebase URL
2. Sign in with Google
3. Click "New Account"
4. Create a test restaurant
5. Drag it between stages
6. It works!

---

## Troubleshooting

**"Firebase config not found"**
→ Did you replace the config in src/App.jsx?

**"Permission denied"**
→ Run: `firebase deploy --only firestore:rules`

**Can't sign in**
→ Check Firebase Console → Authentication → Google is enabled

**Changes not showing**
→ Run: `npm run build && firebase deploy`

---

## Next Steps

- Read SETUP-GUIDE.md for detailed features
- Customize stages/labels in src/App.jsx
- Add your team members
- Start tracking your restaurant pipeline!

---

## Common Commands

```bash
npm start                          # Test locally
npm run build                      # Build for production
firebase deploy                    # Deploy everything
firebase deploy --only hosting     # Deploy only website
```

---

## Your CRM Features

✅ Real-time collaboration
✅ Google Authentication
✅ Kanban board with drag & drop
✅ Contact management
✅ Activity logging
✅ Sales tracking
✅ Dashboard analytics
✅ Mobile responsive
✅ FREE hosting (Firebase free tier)

---

**Need help?** Check SETUP-GUIDE.md for comprehensive documentation.

**Costs:** FREE for small teams (10-20 users). Firebase free tier is very generous.

**Security:** Only authenticated users can access. Your data is private to your team.
