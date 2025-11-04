# Deployment Checklist for Avco Premier CRM

Use this checklist to ensure proper deployment. Check off each item as you complete it.

---

## Pre-Deployment Checklist

### Firebase Setup
- [ ] Created Firebase project at https://console.firebase.google.com/
- [ ] Project name: ________________________
- [ ] Enabled Google Authentication (Authentication → Sign-in method → Google)
- [ ] Created Firestore Database (Firestore Database → Create database)
- [ ] Selected database location: ________________________
- [ ] Added Web app to project (Project Settings → Your apps → Web)
- [ ] Copied Firebase configuration

### Configuration
- [ ] Opened `src/App.jsx`
- [ ] Replaced Firebase config (around line 28) with actual values
- [ ] Saved file
- [ ] Verified no "YOUR_API_KEY" placeholders remain

### Local Setup
- [ ] Installed Node.js (version: _______)
- [ ] Ran `npm install` successfully
- [ ] Installed Firebase CLI: `npm install -g firebase-tools`
- [ ] Logged in to Firebase: `firebase login`
- [ ] Initialized Firebase: `firebase init`
  - [ ] Selected Firestore
  - [ ] Selected Hosting
  - [ ] Chose correct project
  - [ ] Set public directory to `build`
  - [ ] Configured as single-page app

### Security
- [ ] Deployed Firestore security rules: `firebase deploy --only firestore:rules`
- [ ] Verified rules deployed successfully (check Firebase Console)

---

## Deployment Checklist

### Build & Test
- [ ] Tested locally: `npm start`
- [ ] Application opens at http://localhost:3000
- [ ] Can sign in with Google
- [ ] Can create test account
- [ ] Can drag account between stages
- [ ] Verified real-time updates work
- [ ] Built production version: `npm run build`
- [ ] Build completed without errors

### Deploy to Production
- [ ] Ran: `firebase deploy`
- [ ] Deployment completed successfully
- [ ] Received Hosting URL: ________________________
- [ ] Visited production URL
- [ ] Production site loads correctly
- [ ] Can sign in on production site
- [ ] Created first real account
- [ ] Verified all features work in production

---

## Post-Deployment Checklist

### Testing
- [ ] Tested on desktop browser (Chrome/Firefox/Safari/Edge)
- [ ] Tested on mobile device
- [ ] Tested Google sign-in
- [ ] Created test account
- [ ] Moved account between stages (drag-and-drop)
- [ ] Added contact to account
- [ ] Logged activity
- [ ] Recorded sale
- [ ] Viewed dashboard
- [ ] All features working correctly

### Team Access
- [ ] Copied production URL
- [ ] Shared URL with team members
- [ ] Confirmed team members can sign in
- [ ] Verified team members see real-time updates
- [ ] Checked Team modal shows all members

### Documentation
- [ ] Bookmarked production URL
- [ ] Saved Firebase project name
- [ ] Documented any customizations made
- [ ] Created backup of Firebase config
- [ ] Shared QUICKSTART.md with team

---

## Verification Checklist

### Security Verification
- [ ] Only authenticated users can access CRM
- [ ] Unauthenticated visitors see login screen
- [ ] Firebase security rules are active
- [ ] Google OAuth is working correctly

### Performance Verification
- [ ] Page loads in < 3 seconds
- [ ] Real-time updates appear instantly
- [ ] Drag-and-drop is smooth
- [ ] No console errors (check browser DevTools - F12)
- [ ] Mobile responsive (test on phone)

### Data Verification
- [ ] Accounts save correctly
- [ ] Contacts linked to accounts
- [ ] Activities logged with timestamps
- [ ] Sales recorded accurately
- [ ] Dashboard shows correct statistics

---

## Production Information

**Record this information for future reference:**

Firebase Project ID: ________________________

Production URL: ________________________

Firebase Console: https://console.firebase.google.com/project/YOUR_PROJECT/overview

First Admin User: ________________________

Deployment Date: ________________________

Team Members:
1. ________________________
2. ________________________
3. ________________________
4. ________________________
5. ________________________

---

## Troubleshooting Reference

If issues occur, check:

1. **Can't sign in**
   - Firebase Console → Authentication → Sign-in method → Google is enabled
   - Browser allows popups from your domain

2. **Permission errors**
   - Run: `firebase deploy --only firestore:rules`
   - Check Firebase Console → Firestore → Rules

3. **Changes not showing**
   - Clear browser cache (Ctrl+Shift+Delete)
   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)

4. **Deployment failed**
   - Check Firebase CLI is logged in: `firebase login:list`
   - Verify project selected: `firebase use --project YOUR_PROJECT_ID`
   - Rebuild: `npm run build`

---

## Maintenance Schedule

### Weekly
- [ ] Check Firebase Console → Usage and billing
- [ ] Review team member list
- [ ] Backup important data (Firebase Console → Firestore → Import/Export)

### Monthly
- [ ] Review security rules (if customized)
- [ ] Check for Firebase SDK updates
- [ ] Monitor application performance

### As Needed
- [ ] Update team access
- [ ] Customize stages/labels
- [ ] Deploy updates

---

## Quick Commands Reference

```bash
# Test locally
npm start

# Build for production
npm run build

# Deploy everything
firebase deploy

# Deploy only website
firebase deploy --only hosting

# Deploy only security rules
firebase deploy --only firestore:rules

# Check login status
firebase login:list

# View projects
firebase projects:list

# Switch project
firebase use YOUR_PROJECT_ID
```

---

## Success Criteria

You can check off deployment as successful when:

- [x] ✅ Application is live at production URL
- [x] ✅ Google sign-in works
- [x] ✅ Can create accounts
- [x] ✅ Drag-and-drop functions
- [x] ✅ Real-time sync works
- [x] ✅ Team members can access
- [x] ✅ Dashboard displays data
- [x] ✅ Mobile responsive works
- [x] ✅ No console errors
- [x] ✅ Security rules active

---

## Next Steps After Deployment

1. **Train your team**
   - Share QUICKSTART.md guide
   - Walk through main features
   - Demonstrate real-time collaboration

2. **Customize for your workflow**
   - Adjust stages if needed
   - Modify labels to match your process
   - Update activity types

3. **Monitor usage**
   - Check Firebase Console daily for first week
   - Gather team feedback
   - Make adjustments as needed

4. **Set up backups**
   - Schedule regular exports from Firestore
   - Document your customizations
   - Keep Firebase config secure

---

## Emergency Contacts

Firebase Support: https://firebase.google.com/support
Firebase Status: https://status.firebase.google.com/
React Support: https://react.dev/community

---

## Deployment Complete! 🎉

Congratulations! Your Avco Premier CRM is now live and ready for your team to use.

**Your CRM URL:** ________________________

Share this URL with your team and start tracking your restaurant onboarding pipeline!

---

**Date Completed:** ________________________

**Deployed By:** ________________________

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________
