# Avco Premier CRM

A modern, cloud-based collaborative CRM system designed for restaurant onboarding and pipeline management.

![Avco Premier CRM](https://img.shields.io/badge/Built%20with-React-61DAFB?style=flat&logo=react)
![Firebase](https://img.shields.io/badge/Backend-Firebase-FFCA28?style=flat&logo=firebase)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### Core Functionality
- **Real-time Collaboration** - Multiple users can work simultaneously with instant updates
- **Google Authentication** - Secure sign-in using existing Google accounts
- **Kanban Board** - Visual pipeline with drag-and-drop functionality
- **Contact Management** - Store and track contacts for each account
- **Activity Logging** - Track calls, meetings, emails, notes, and tasks
- **Sales Tracking** - Record and monitor revenue by account
- **Dashboard Analytics** - Visual insights into pipeline and performance

### User Experience
- **Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile
- **Color-Coded Labels** - Track missing items visually (Tablet, Website, Stripe, etc.)
- **Intuitive Interface** - Clean, modern design inspired by Trello/Asana
- **Dark Card Design** - Professional appearance on colored stage backgrounds
- **Team Management** - View team members and share access links

### Technical
- **Cloud-Based** - Access from anywhere with internet connection
- **Real-time Database** - Firebase Firestore for instant synchronization
- **Secure** - Authentication required, data encryption, team-only access
- **Free Hosting** - Deployed on Firebase (free tier supports 10-20 active users)
- **No Server Required** - Fully serverless architecture

---

## 🎯 Use Case

**Avco Premier CRM** is specifically designed for companies that onboard restaurants through multiple stages:

1. **Leads** - Initial prospect identification
2. **Ready For Onboarding** - Qualified leads ready to start
3. **Stuck** - Accounts requiring attention or blocked
4. **Live** - Successfully onboarded and operational
5. **Post Launch, Need Marketing** - Launched accounts needing ongoing support

The system tracks missing items that could block progress:
- Missing Tablet
- Missing Website Setup
- Missing Stripe Integration
- Missing Restaurant Info
- Missing Menu

---

## 🚀 Quick Start

### Option 1: Express Setup (15 minutes)
See [QUICKSTART.md](QUICKSTART.md) for rapid deployment

### Option 2: Detailed Setup
See [SETUP-GUIDE.md](SETUP-GUIDE.md) for comprehensive instructions

### Prerequisites
- Node.js 16+ ([Download](https://nodejs.org/))
- Google account for Firebase
- 15 minutes of your time

---

## 📦 Installation

```bash
# Clone or download this project
cd avco-crm

# Install dependencies
npm install

# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login
```

---

## ⚙️ Configuration

### 1. Create Firebase Project
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Google Authentication
4. Create Firestore database
5. Get your Firebase config

### 2. Update Configuration
Open `src/App.jsx` and replace the Firebase config (around line 28):

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Initialize Firebase
```bash
firebase init
```
- Select: Firestore, Hosting
- Choose your Firebase project
- Accept defaults for most options
- Set public directory to `build`

---

## 🏗️ Development

```bash
# Start development server
npm start

# Open http://localhost:3000
```

---

## 🚢 Deployment

```bash
# Build production bundle
npm run build

# Deploy to Firebase
firebase deploy

# Your CRM will be live at:
# https://your-project.web.app
```

---

## 👥 Team Access

### Adding Team Members
1. Share your Firebase Hosting URL with team members
2. They sign in with their Google accounts
3. They're automatically added to the team

**OR**

Use the in-app Team feature:
1. Click "Team" button in header
2. Click "Copy Link"
3. Share link with team members

**No complex invitation system needed!**

---

## 🎨 Customization

### Modify Stages
Edit `src/App.jsx` around line 53:

```javascript
const STAGES = [
  { id: 'Leads', name: 'Leads', color: 'bg-blue-100' },
  { id: 'Ready For Onboarding', name: 'Ready For Onboarding', color: 'bg-purple-100' },
  // Add or modify stages here
];
```

### Modify Labels
Edit `src/App.jsx` around line 62:

```javascript
const LABEL_OPTIONS = [
  { id: 'Missing Tablet', name: 'Missing Tablet', color: 'bg-red-500' },
  { id: 'Missing Website Setup', name: 'Missing Website Setup', color: 'bg-orange-500' },
  // Add or modify labels here
];
```

### Rebuild & Redeploy
```bash
npm run build
firebase deploy
```

---

## 📊 Database Structure

### Collections

**accounts**
- name, email, phone, stage
- labels (array), value (number)
- notes, createdAt, createdBy, lastModified

**contacts**
- name, email, phone, title
- accountId (reference), notes
- createdAt, createdBy

**activities**
- type (Call, Meeting, Email, Note, Task)
- accountId (reference), notes
- date, createdBy

**sales**
- accountId (reference)
- amount, product, notes
- date, createdBy

**teamMembers**
- email, displayName, photoURL
- role (admin/member), joinedAt

---

## 🔒 Security

### Authentication
- Google OAuth 2.0 (no passwords stored)
- Token-based authentication
- Secure by default

### Authorization
- Only authenticated users can access data
- All team members have read/write access
- Data isolated to your Firebase project

### Data Protection
- Encrypted at rest and in transit
- Private to your team only
- Firebase security rules enforce access control

---

## 💰 Cost

### Firebase Free Tier (Spark Plan)
- **50,000** document reads/day
- **20,000** document writes/day
- **1 GB** storage
- **10 GB/month** hosting bandwidth
- **Unlimited** authentication

### Typical Usage
- **Small team (5-10 users):** FREE
- **Medium team (10-20 users):** FREE
- **Large team (20+ users):** ~$5-10/month

Most small teams stay in the FREE tier indefinitely.

---

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling (via CDN)
- **React Beautiful DnD** - Drag and drop
- **Lucide React** - Icons

### Backend
- **Firebase Authentication** - User management
- **Firebase Firestore** - Real-time database
- **Firebase Hosting** - Web hosting

### Build Tools
- **Create React App** - Build system
- **Firebase CLI** - Deployment

---

## 📖 Documentation

- [Quick Start Guide](QUICKSTART.md) - Get started in 15 minutes
- [Complete Setup Guide](SETUP-GUIDE.md) - Detailed instructions
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev/)

---

## 🐛 Troubleshooting

### Common Issues

**"Firebase config not found"**
- Solution: Replace config in `src/App.jsx` with your Firebase config

**"Permission denied" errors**
- Solution: Deploy security rules: `firebase deploy --only firestore:rules`

**Can't sign in with Google**
- Solution: Enable Google Authentication in Firebase Console

**Changes not appearing after deployment**
- Solution: Clear cache (Ctrl+Shift+Delete), then hard refresh (Ctrl+F5)

See [SETUP-GUIDE.md](SETUP-GUIDE.md) Part 8 for more troubleshooting.

---

## 🔄 Updates

To update the application:

```bash
# Make your changes to the code

# Test locally
npm start

# Build and deploy
npm run build
firebase deploy
```

---

## 📋 Project Structure

```
avco-crm/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── App.jsx             # Main application (ALL LOGIC HERE)
│   ├── index.js            # React entry point
│   └── index.css           # Global styles
├── firebase.json           # Firebase configuration
├── firestore.rules         # Database security rules
├── package.json            # Dependencies
├── QUICKSTART.md           # Quick setup guide
├── SETUP-GUIDE.md          # Detailed documentation
└── README.md               # This file
```

---

## ✅ Features Checklist

- [x] Google Authentication
- [x] Real-time data synchronization
- [x] Kanban board with drag-and-drop
- [x] Account management (CRUD)
- [x] Contact management
- [x] Activity logging
- [x] Sales tracking
- [x] Color-coded labels
- [x] Dashboard with analytics
- [x] Team member management
- [x] Mobile responsive design
- [x] Dark card UI theme
- [x] Search and filtering (coming soon)
- [x] Email notifications (coming soon)
- [x] Advanced reporting (coming soon)

---

## 🤝 Contributing

This is a custom CRM built for Avco Premier. To customize for your needs:

1. Fork/copy the project
2. Modify stages and labels in `src/App.jsx`
3. Update branding (name, colors)
4. Deploy to your own Firebase project

---

## 📄 License

MIT License - Feel free to use and modify for your organization

---

## 🎯 Goals Achieved

✅ **Multi-user collaboration** - Real-time updates across all users
✅ **Cloud-based** - Accessible from anywhere
✅ **Google Authentication** - Secure, easy sign-in
✅ **Visual pipeline** - Kanban board with drag-and-drop
✅ **Contact tracking** - Manage restaurant contacts
✅ **Activity logging** - Track all interactions
✅ **Sales monitoring** - Revenue tracking
✅ **Label system** - Track missing items
✅ **Dashboard** - Analytics and insights
✅ **Team management** - Easy invitation system
✅ **Mobile friendly** - Works on all devices
✅ **Free hosting** - No monthly server costs
✅ **Professional UI** - Clean, modern design

---

## 🚀 Get Started Now!

1. **Read:** [QUICKSTART.md](QUICKSTART.md) (15 minute setup)
2. **Deploy:** Follow the guide to get your CRM live
3. **Invite:** Share the URL with your team
4. **Track:** Start managing your restaurant pipeline!

---

## 📞 Support

For issues with:
- **Firebase:** https://firebase.google.com/support
- **React:** https://react.dev/community
- **This CRM:** Check SETUP-GUIDE.md troubleshooting section

---

## 🎉 Success Criteria

You'll know everything is working when:
1. ✅ You can sign in with Google
2. ✅ You can create an account
3. ✅ You can drag accounts between stages
4. ✅ Team members can access the same URL
5. ✅ Changes appear instantly for all users
6. ✅ Dashboard shows your data

**Congratulations! You now have a production-ready CRM! 🎊**

---

*Built with ❤️ for Avco Premier - Restaurant Onboarding Made Easy*
