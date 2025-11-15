import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  onSnapshot,
  serverTimestamp,
  orderBy,
  where
} from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Plus, 
  LogOut, 
  Users, 
  TrendingUp, 
  Phone, 
  Mail, 
  DollarSign,
  Calendar,
  X,
  Edit2,
  Trash2,
  FileText,
  BarChart3,
  Sparkles,
  Moon,
  Sun,
  CheckCircle2,
  AlertCircle,
  Zap,
  Settings,
  Shield,
  UserCheck
} from 'lucide-react';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbhAsz3vIbac1nfkFTJAQ2R6_5hU30DJs",
  authDomain: "avcopremiercrm.firebaseapp.com",
  projectId: "avcopremiercrm",
  storageBucket: "avcopremiercrm.firebasestorage.app",
  messagingSenderId: "661834692749",
  appId: "1:661834692749:web:f94e1ef9c7bfd7c2d68ac4",
  measurementId: "G-PFTZFTNT1G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Updated Stage configuration based on workflow
const STAGES = [
  { 
    id: 'Sales', 
    name: 'Sales (Gil)', 
    color: 'from-red-400 to-red-600', 
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    icon: Phone,
    description: 'Menu, Intake forms'
  },
  { 
    id: 'Yonatan', 
    name: 'Yonatan', 
    color: 'from-cyan-400 to-cyan-600', 
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    icon: FileText,
    description: 'Digital menu, Stripe link generation'
  },
  { 
    id: 'Luca', 
    name: 'Luca', 
    color: 'from-purple-400 to-purple-600', 
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    icon: Zap,
    description: 'Bugs + New Features, Web changes'
  },
  { 
    id: 'Live', 
    name: 'Live!', 
    color: 'from-emerald-400 to-emerald-600', 
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: CheckCircle2,
    description: 'Site is live'
  },
  { 
    id: 'Elizabeth', 
    name: 'Elizabeth', 
    color: 'from-blue-400 to-blue-600', 
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    icon: TrendingUp,
    description: 'Post setup support, Google ads'
  },
  { 
    id: 'Customer', 
    name: 'Customer', 
    color: 'from-pink-400 to-pink-600', 
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    icon: Users,
    description: 'Visitor first steps, dropoff tracking'
  }
];

// Label configuration for tracking issues
const LABEL_OPTIONS = [
  { id: 'Missing Menu', name: 'Missing Menu', color: 'bg-gradient-to-r from-red-500 to-red-600' },
  { id: 'Missing Intake Forms', name: 'Missing Intake Forms', color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
  { id: 'Missing Digital Menu', name: 'Missing Digital Menu', color: 'bg-gradient-to-r from-yellow-500 to-yellow-600' },
  { id: 'Missing Stripe Link', name: 'Missing Stripe Link', color: 'bg-gradient-to-r from-cyan-500 to-cyan-600' },
  { id: 'Bugs/Features Needed', name: 'Bugs/Features Needed', color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
  { id: 'Web Changes Needed', name: 'Web Changes Needed', color: 'bg-gradient-to-r from-indigo-500 to-indigo-600' },
  { id: 'Setup Support Needed', name: 'Setup Support Needed', color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
  { id: 'Google Ads Needed', name: 'Google Ads Needed', color: 'bg-gradient-to-r from-green-500 to-green-600' },
  { id: 'Dropoff Tracking', name: 'Dropoff Tracking', color: 'bg-gradient-to-r from-pink-500 to-pink-600' },
  { id: 'Test Order Needed', name: 'Test Order Needed', color: 'bg-gradient-to-r from-rose-500 to-rose-600' }
];

const ACTIVITY_TYPES = ['Call', 'Meeting', 'Email', 'Note', 'Task', 'Setup Complete', 'Issue Reported', 'Follow-up'];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const [selectedAccountForDetail, setSelectedAccountForDetail] = useState(null);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Dark mode effect
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
  // Check if current user is admin
  const isAdmin = user?.email === 'lucad070103@gmail.com';

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const teamRef = collection(db, 'teamMembers');
        const q = query(teamRef, where('email', '==', currentUser.email));
        onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            addDoc(collection(db, 'teamMembers'), {
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: currentUser.email === 'lucad070103@gmail.com' ? 'admin' : 'team',
              joinedAt: serverTimestamp()
            });
          }
        });
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);
    });
    return unsubscribe;
  }, []);

  // Real-time listeners for data
  useEffect(() => {
    if (!user) return;

    const accountsQuery = query(collection(db, 'accounts'), orderBy('createdAt', 'desc'));
    const unsubAccounts = onSnapshot(accountsQuery, (snapshot) => {
      const accountsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAccounts(accountsData);
    });

    const contactsQuery = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
    const unsubContacts = onSnapshot(contactsQuery, (snapshot) => {
      const contactsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContacts(contactsData);
    });

    const activitiesQuery = query(collection(db, 'activities'), orderBy('date', 'desc'));
    const unsubActivities = onSnapshot(activitiesQuery, (snapshot) => {
      const activitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(activitiesData);
    });

    const salesQuery = query(collection(db, 'sales'), orderBy('date', 'desc'));
    const unsubSales = onSnapshot(salesQuery, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSales(salesData);
    });

    const teamQuery = query(collection(db, 'teamMembers'), orderBy('joinedAt', 'asc'));
    const unsubTeam = onSnapshot(teamQuery, (snapshot) => {
      const teamData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeamMembers(teamData);
    });

    return () => {
      unsubAccounts();
      unsubContacts();
      unsubActivities();
      unsubSales();
      unsubTeam();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      const provider = new OAuthProvider('microsoft.com');
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Microsoft login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddAccount = async (accountData) => {
    try {
      await addDoc(collection(db, 'accounts'), {
        ...accountData,
        stage: 'Sales',
        createdAt: serverTimestamp(),
        createdBy: user.email,
        labels: []
      });
      setShowAccountModal(false);
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const handleUpdateAccount = async (accountId, updates) => {
    try {
      const accountRef = doc(db, 'accounts', accountId);
      await updateDoc(accountRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: user.email
      });
      setEditingAccount(null);
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await deleteDoc(doc(db, 'accounts', accountId));
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    try {
      const accountRef = doc(db, 'accounts', draggableId);
      await updateDoc(accountRef, {
        stage: destination.droppableId,
        updatedAt: serverTimestamp(),
        updatedBy: user.email
      });

      // Log stage change as activity
      await addDoc(collection(db, 'activities'), {
        accountId: draggableId,
        type: 'Stage Change',
        notes: `Moved from ${source.droppableId} to ${destination.droppableId}`,
        date: serverTimestamp(),
        createdBy: user.displayName || user.email
      });
    } catch (error) {
      console.error('Error moving account:', error);
    }
  };

  const handleAddContact = async (contactData) => {
    try {
      await addDoc(collection(db, 'contacts'), {
        ...contactData,
        createdAt: serverTimestamp(),
        createdBy: user.email
      });
      setShowContactModal(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleAddActivity = async (activityData) => {
    try {
      await addDoc(collection(db, 'activities'), {
        ...activityData,
        date: serverTimestamp(),
        createdBy: user.displayName || user.email
      });
      setShowActivityModal(false);
  const handleAddSale = async (saleData) => {
    try {
      await addDoc(collection(db, 'sales'), {
        ...saleData,
        date: serverTimestamp(),
        createdBy: user.displayName || user.email
      });
      setShowSaleModal(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error adding sale:', error);
    }
  };

  const handleUpdateTeamMember = async (memberId, updates) => {
    if (!isAdmin) return;
    try {
      const memberRef = doc(db, 'teamMembers', memberId);
      await updateDoc(memberRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: user.email
      });
      setEditingTeamMember(null);
    } catch (error) {
      console.error('Error updating team member:', error);
    }
  };

  const handleDeleteTeamMember = async (memberId) => {
    if (!isAdmin) return;
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    try {
      await deleteDoc(doc(db, 'teamMembers', memberId));
    } catch (error) {
      console.error('Error deleting team member:', error);
    }
  };
      setShowSaleModal(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error adding sale:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-semibold">Loading AVCO Premier CRM...</p>
        </div>
      </div>
    );
  }

if (!user) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-12 h-12 text-purple-600 animate-pulse" />
            <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AVCO Premier CRM
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
            Restaurant Onboarding Workflow System
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Google Login */}
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          {/* Microsoft Login */}
          <button
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowDashboard(!showDashboard)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${
                    showDashboard 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:shadow-xl'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  {showDashboard ? 'Pipeline View' : 'Dashboard'}
                </button>

                <button
                  onClick={() => setShowTeamModal(true)}
                  className="px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:shadow-xl"
                >
                  <Users className="w-5 h-5" />
                  Team
                </button>
}

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b-2 border-purple-200 dark:border-gray-700 sticky top-0 z-50 shadow-xl">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-pulse" />
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    AVCO Premier CRM
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Restaurant Onboarding Workflow</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowDashboard(!showDashboard)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${
                    showDashboard 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:shadow-xl'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  {showDashboard ? 'Pipeline View' : 'Dashboard'}
                </button>

                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-3 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all shadow-lg"
                >
                  {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
                </button>

                <div className="flex items-center gap-3 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                  <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full border-2 border-purple-600 shadow-lg" />
                  <div className="text-left">
                    <div className="font-bold text-gray-800 dark:text-gray-200">{user.displayName}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{user.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-all shadow-lg"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {showDashboard ? (
            <DashboardView accounts={accounts} sales={sales} activities={activities} />
          ) : (
            <>
              {/* Action Buttons */}
              <div className="mb-8 flex flex-wrap gap-4">
                <button
                  onClick={() => setShowAccountModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  New Restaurant
                </button>
              </div>

              {/* Pipeline View */}
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-6 overflow-x-auto pb-6">
                  {STAGES.map((stage) => {
                    const stageAccounts = accounts.filter(acc => acc.stage === stage.id);
                    const StageIcon = stage.icon;
                    
                    return (
                      <Droppable key={stage.id} droppableId={stage.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-shrink-0 w-80 rounded-2xl shadow-2xl border-2 transition-all ${
                              snapshot.isDraggingOver 
                                ? 'border-purple-400 dark:border-purple-600 scale-105' 
                                : 'border-gray-200 dark:border-gray-700'
                            } ${stage.bgColor}`}
                          >
                            {/* Stage Header */}
                            <div className={`bg-gradient-to-r ${stage.color} p-6 rounded-t-2xl`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <StageIcon className="w-6 h-6 text-white" />
                                  <h2 className="text-xl font-black text-white">{stage.name}</h2>
                                </div>
                                <span className="bg-white/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
                                  {stageAccounts.length}
                                </span>
                              </div>
                              <p className="text-white/90 text-sm font-medium">{stage.description}</p>
                            </div>

                            {/* Accounts */}
                            <div className="p-4 space-y-3 min-h-[200px] max-h-[calc(100vh-400px)] overflow-y-auto">
                              {stageAccounts.map((account, index) => (
                                <Draggable key={account.id} draggableId={account.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => setSelectedAccountForDetail(account)}
                                      className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
                                        snapshot.isDragging ? 'rotate-3 scale-110 shadow-2xl' : ''
                                      }`}
                                    >
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{account.name}</h3>
                                          {account.email && (
                                            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                                              <Mail className="w-3 h-3" />
                                              {account.email}
                                            </p>
                                          )}
                                        </div>
                                        <div className="flex gap-1">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingAccount(account);
                                            }}
                                            className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-all"
                                          >
                                            <Edit2 className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteAccount(account.id);
                                            }}
                                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-all"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>

                                      {account.phone && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-2">
                                          <Phone className="w-3 h-3" />
                                          {account.phone}
                                        </p>
                                      )}

                                      {account.value && (
                                        <p className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-1 mb-2">
                                          <DollarSign className="w-4 h-4" />
                                          ${account.value.toLocaleString()}
                                        </p>
                                      )}

                                      {/* Labels */}
                                      {account.labels && account.labels.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                          {account.labels.map((labelId) => {
                                            const label = LABEL_OPTIONS.find(l => l.id === labelId);
                                            return label ? (
                                              <span key={labelId} className={`${label.color} text-white text-xs px-2 py-1 rounded-full font-semibold shadow-md`}>
                                                {label.name}
                                              </span>
                                            ) : null;
                                          })}
                                        </div>
                                      )}

                                      {account.notes && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                                          {account.notes}
                                        </p>
                                      )}

                                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        Added {account.createdAt?.toDate?.()?.toLocaleDateString() || 'recently'}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}

                              {stageAccounts.length === 0 && (
                                <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                  <p className="font-semibold">No restaurants in this stage</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Droppable>
                    );
                  })}
                </div>
              </DragDropContext>
            </>
          )}
        </main>

        {/* Modals */}
        {showAccountModal && (
          <AccountModal
            onClose={() => setShowAccountModal(false)}
            onSubmit={handleAddAccount}
          />
        )}

        {editingAccount && (
          <AccountModal
            account={editingAccount}
            onClose={() => setEditingAccount(null)}
            onSubmit={(data) => handleUpdateAccount(editingAccount.id, data)}
          />
        )}

        {selectedAccountForDetail && (
          <AccountDetailModal
            account={selectedAccountForDetail}
            contacts={contacts.filter(c => c.accountId === selectedAccountForDetail.id)}
            activities={activities.filter(a => a.accountId === selectedAccountForDetail.id)}
        {showSaleModal && (
          <SaleModal
            accountId={selectedAccount?.id}
            onClose={() => {
              setShowSaleModal(false);
              setSelectedAccount(null);
            }}
            onSubmit={handleAddSale}
          />
        )}

        {showTeamModal && (
          <TeamModal
            teamMembers={teamMembers}
            isAdmin={isAdmin}
            onClose={() => setShowTeamModal(false)}
            onEdit={setEditingTeamMember}
            onDelete={handleDeleteTeamMember}
          />
        )}

        {editingTeamMember && (
          <EditTeamMemberModal
            member={editingTeamMember}
            isAdmin={isAdmin}
            onClose={() => setEditingTeamMember(null)}
            onSubmit={(data) => handleUpdateTeamMember(editingTeamMember.id, data)}
          />
        )}
      </div>
    </div>
  );
}
          />
        )}

        {showContactModal && (
          <ContactModal
            accountId={selectedAccount?.id}
            onClose={() => {
              setShowContactModal(false);
              setSelectedAccount(null);
            }}
            onSubmit={handleAddContact}
          />
        )}

        {showActivityModal && (
          <ActivityModal
            accountId={selectedAccount?.id}
            onClose={() => {
              setShowActivityModal(false);
              setSelectedAccount(null);
            }}
            onSubmit={handleAddActivity}
          />
        )}

        {showSaleModal && (
          <SaleModal
            accountId={selectedAccount?.id}
            onClose={() => {
              setShowSaleModal(false);
              setSelectedAccount(null);
            }}
            onSubmit={handleAddSale}
          />
        )}
      </div>
    </div>
  );
}

// Account Modal Component
function AccountModal({ account, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: account?.name || '',
    email: account?.email || '',
    phone: account?.phone || '',
    website: account?.website || '',
    address: account?.address || '',
    value: account?.value || '',
    notes: account?.notes || '',
    labels: account?.labels || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      value: parseFloat(formData.value) || 0
    });
  };

  const toggleLabel = (labelId) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.includes(labelId)
        ? prev.labels.filter(id => id !== labelId)
        : [...prev.labels, labelId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-3xl flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">
            {account ? 'Edit Restaurant' : 'New Restaurant'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Restaurant Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-all font-semibold"
              placeholder="Mario's Pizza"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-all"
                placeholder="contact@mariospizza.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-all"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-all"
              placeholder="https://mariospizza.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-all"
              placeholder="123 Main St, Brooklyn, NY"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Deal Value ($)</label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({...formData, value: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-all font-bold"
              placeholder="5000"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Status Labels</label>
            <div className="flex flex-wrap gap-2">
              {LABEL_OPTIONS.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                    formData.labels.includes(label.id)
                      ? `${label.color} text-white shadow-lg scale-105`
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-all"
              rows="4"
              placeholder="Additional notes about the restaurant..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all"
            >
              {account ? 'Update' : 'Create'} Restaurant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Contact Modal Component
function ContactModal({ accountId, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    accountId,
    name: '',
    email: '',
    phone: '',
    role: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full border-2 border-purple-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-3xl flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">New Contact</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-all"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-all"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-all"
              placeholder="Owner"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Add Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Activity Modal Component
function ActivityModal({ accountId, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    accountId,
    type: 'Note',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full border-2 border-purple-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-3xl flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">Log Activity</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Activity Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-all font-semibold"
            >
              {ACTIVITY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Notes *</label>
            <textarea
              required
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-all"
              rows="4"
              placeholder="Describe the activity..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Log Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sale Modal Component
function SaleModal({ accountId, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    accountId,
    product: '',
    amount: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount) || 0
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full border-2 border-purple-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-3xl flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">Record Sale</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Product/Service *</label>
            <input
              type="text"
              required
              value={formData.product}
              onChange={(e) => setFormData({...formData, product: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-green-500 dark:focus:border-green-400 focus:outline-none transition-all"
              placeholder="Website Setup + Online Ordering"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Amount ($) *</label>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-green-500 dark:focus:border-green-400 focus:outline-none transition-all font-bold"
              placeholder="5000"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-green-500 dark:focus:border-green-400 focus:outline-none transition-all"
              rows="3"
              placeholder="Additional sale details..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Record Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Account Detail Modal Component
function AccountDetailModal({ account, contacts, activities, sales, onClose, onAddContact, onAddActivity, onAddSale }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-3xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-white mb-1">{account.name}</h2>
              <div className="flex items-center gap-3 text-white/90 text-sm">
                {account.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {account.email}
                  </span>
                )}
                {account.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {account.phone}
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
              <X className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Account Info */}
          <div className="grid grid-cols-2 gap-4">
            {account.website && (
              <div>
                <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Website</label>
                <a href={account.website} target="_blank" rel="noopener noreferrer" className="block text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                  {account.website}
                </a>
              </div>
            )}
            {account.address && (
              <div>
                <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Address</label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">{account.address}</p>
              </div>
            )}
            {account.value && (
              <div>
                <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Deal Value</label>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">${account.value.toLocaleString()}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Stage</label>
              <p className="text-gray-800 dark:text-gray-200 font-bold">{account.stage}</p>
            </div>
          </div>

          {/* Labels */}
          {account.labels && account.labels.length > 0 && (
            <div>
              <label className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 block">Status Labels</label>
              <div className="flex flex-wrap gap-2">
                {account.labels.map((labelId) => {
                  const label = LABEL_OPTIONS.find(l => l.id === labelId);
                  return label ? (
                    <span key={labelId} className={`${label.color} text-white px-4 py-2 rounded-full font-semibold shadow-md text-sm`}>
                      {label.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          {account.notes && (
            <div>
              <label className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 block">Notes</label>
              <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">{account.notes}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-3">
            <button
              onClick={onAddContact}
              className="flex-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-xl font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Contact
            </button>
            <button
              onClick={onAddActivity}
              className="flex-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-4 py-3 rounded-xl font-bold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Log Activity
            </button>
            <button
              onClick={onAddSale}
              className="flex-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl font-bold hover:bg-green-200 dark:hover:bg-green-900/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Record Sale
            </button>
          </div>

          {/* Contacts */}
          {contacts.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 text-lg">Contacts ({contacts.length})</h3>
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border-2 border-blue-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
// Team Modal Component
function TeamModal({ teamMembers, isAdmin, onClose, onEdit, onDelete }) {
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'sales': return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'team': return 'bg-gradient-to-r from-gray-500 to-gray-600';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return Shield;
      case 'sales': return TrendingUp;
      case 'team': return UserCheck;
      default: return Users;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-white" />
            <h2 className="text-3xl font-black text-white">Team Management</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
            <X className="w-8 h-8 text-white" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Team Members ({teamMembers.length})
            </h3>
          </div>

          <div className="grid gap-4">
            {teamMembers.map((member) => {
              const RoleIcon = getRoleIcon(member.role);
              return (
                <div key={member.id} className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img 
                        src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.displayName || member.email)}&background=random`} 
                        alt={member.displayName} 
                        className="w-12 h-12 rounded-full border-2 border-purple-600 shadow-lg" 
                      />
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                          {member.displayName || 'No Name'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Joined: {member.joinedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <RoleIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className={`${getRoleColor(member.role)} text-white px-4 py-2 rounded-full font-semibold text-sm shadow-md capitalize`}>
                          {member.role}
                        </span>
                      </div>

                      {isAdmin && member.email !== 'lucad070103@gmail.com' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEdit(member)}
                            className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(member.id)}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {member.email === 'lucad070103@gmail.com' && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg">
                          <Shield className="w-4 h-4" />
                          Super Admin
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {teamMembers.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-600">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-semibold text-lg">No team members found</p>
              <p className="text-sm mt-2">Team members will appear here when they sign in</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isAdmin ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                    <Shield className="w-4 h-4" />
                    You have admin privileges
                  </div>
                ) : (
                  <p>Contact the admin to change your role or permissions</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Team Member Modal Component
function EditTeamMemberModal({ member, isAdmin, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    role: member?.role || 'team',
    displayName: member?.displayName || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full border-2 border-purple-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-3xl flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">Edit Team Member</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center mb-6">
            <img 
              src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.displayName || member.email)}&background=random`} 
              alt={member.displayName} 
              className="w-16 h-16 rounded-full border-2 border-purple-600 shadow-lg mx-auto mb-3" 
            />
            <h3 className="font-bold text-gray-800 dark:text-gray-200">{member.displayName || 'No Name'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Display Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-all"
              placeholder="Enter display name"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-all font-semibold"
              disabled={member.email === 'lucad070103@gmail.com'}
            >
              <option value="admin">Admin - Full access</option>
              <option value="sales">Sales - Can manage accounts and sales</option>
              <option value="team">Team - Can view and add activities</option>
            </select>
            {member.email === 'lucad070103@gmail.com' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Super admin role cannot be changed
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Update Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Dashboard View Component
function DashboardView({ accounts, sales, activities }) {
                    </div>
                    {contact.email && <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{contact.email}</p>}
                    {contact.phone && <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{contact.phone}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {activities.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 text-lg">Activity History ({activities.length})</h3>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border-2 border-purple-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-800 dark:text-gray-200">{activity.type}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {activity.date?.toDate?.()?.toLocaleDateString() || 'Just now'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.notes}</p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">By: {activity.createdBy}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales */}
          {sales.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 text-lg">Sales History ({sales.length})</h3>
              <div className="space-y-3">
                {sales.map((sale) => (
                  <div key={sale.id} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border-2 border-green-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-800 dark:text-gray-200">{sale.product}</span>
                      <span className="font-bold text-green-600 dark:text-green-400 text-lg">${sale.amount.toLocaleString()}</span>
                    </div>
                    {sale.notes && <p className="text-sm text-gray-600 dark:text-gray-400">{sale.notes}</p>}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {sale.date?.toDate?.()?.toLocaleDateString() || 'Just now'} • By: {sale.createdBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Dashboard View Component
function DashboardView({ accounts, sales, activities }) {
  const totalPipelineValue = accounts.reduce((sum, acc) => sum + (acc.value || 0), 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);

  const stageStats = STAGES.map(stage => {
    const stageAccounts = accounts.filter(acc => acc.stage === stage.id);
    return {
      name: stage.name,
      count: stageAccounts.length,
      value: stageAccounts.reduce((sum, acc) => sum + (acc.value || 0), 0),
      gradient: stage.color,
      icon: stage.icon
    };
  });

  const labelStats = LABEL_OPTIONS.map(label => ({
    name: label.name,
    count: accounts.filter(acc => acc.labels?.includes(label.id)).length,
    color: label.color
  })).filter(stat => stat.count > 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border-2 border-blue-100 dark:border-gray-600 transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-200">Total Restaurants</h3>
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {accounts.length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border-2 border-purple-100 dark:border-gray-600 transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-200">Pipeline Value</h3>
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ${totalPipelineValue.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border-2 border-green-100 dark:border-gray-600 transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-200">Total Revenue</h3>
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            ${totalRevenue.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border-2 border-orange-100 dark:border-gray-600 transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-200">Activities</h3>
            <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            {activities.length}
          </div>
        </div>
      </div>

      {/* Workflow by Stage */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-gray-100 dark:border-gray-600">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Workflow by Stage</h3>
        <div className="space-y-4">
          {stageStats.map((stat) => {
            const StageIcon = stat.icon;
            return (
              <div key={stat.name} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{stat.name}</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                    {stat.count} restaurants • ${stat.value.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${stat.gradient} h-3 rounded-full transition-all duration-500 group-hover:scale-105`}
                    style={{ width: `${totalPipelineValue > 0 ? (stat.value / totalPipelineValue) * 100 : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items Requiring Attention */}
      {labelStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-gray-100 dark:border-gray-600">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Items Requiring Attention</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {labelStats.map((stat) => (
              <div key={stat.name} className="text-center transform hover:scale-110 transition-all">
                <div className={`${stat.color} text-white rounded-2xl p-6 mb-3 shadow-lg`}>
                  <div className="text-3xl font-bold">{stat.count}</div>
                </div>
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-200">{stat.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-gray-100 dark:border-gray-600">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {activities.slice(0, 10).map((activity) => {
            const account = accounts.find(acc => acc.id === activity.accountId);
            return (
              <div key={activity.id} className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{activity.type}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{account?.name || 'Unknown Restaurant'}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.notes}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{activity.createdBy}</span>
                    <span>•</span>
                    <span>{activity.date?.toDate?.()?.toLocaleDateString() || 'Just now'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;