import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
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
  Sun
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

// Stage configuration with modern colors
const STAGES = [
  { id: 'Leads', name: 'Leads', color: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'Ready For Onboarding', name: 'Ready For Onboarding', color: 'from-purple-400 to-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
  { id: 'Stuck', name: 'Stuck', color: 'from-amber-400 to-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
  { id: 'Live', name: 'Live', color: 'from-emerald-400 to-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'Post Launch, need of marketing', name: 'Post Launch', color: 'from-pink-400 to-pink-600', bgColor: 'bg-pink-50 dark:bg-pink-900/20' }
];

// Label configuration with modern colors
const LABEL_OPTIONS = [
  { id: 'Missing Tablet', name: 'Missing Tablet', color: 'bg-gradient-to-r from-red-500 to-red-600' },
  { id: 'Missing Website Setup', name: 'Missing Website Setup', color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
  { id: 'Missing Stripe', name: 'Missing Stripe', color: 'bg-gradient-to-r from-yellow-500 to-yellow-600' },
  { id: 'Missing Restaurant Info', name: 'Missing Restaurant Info', color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
  { id: 'Missing Menu', name: 'Missing Menu', color: 'bg-gradient-to-r from-purple-500 to-purple-600' }
];

const ACTIVITY_TYPES = ['Call', 'Meeting', 'Email', 'Note', 'Task'];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [sales, setSales] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
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
    }
  }, [isDarkMode]);

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
              role: 'member',
              joinedAt: serverTimestamp()
            });
          }
        });
      }
      setLoading(false);
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

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveAccount = async (accountData) => {
    try {
      if (editingAccount) {
        const accountRef = doc(db, 'accounts', editingAccount.id);
        await updateDoc(accountRef, {
          ...accountData,
          lastModified: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'accounts'), {
          ...accountData,
          createdAt: serverTimestamp(),
          createdBy: user.email,
          lastModified: serverTimestamp()
        });
      }
      setShowAccountModal(false);
      setEditingAccount(null);
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Failed to save account. Please try again.');
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'accounts', accountId));
      setSelectedAccountForDetail(null);
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account.');
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
      alert('Failed to add contact.');
    }
  };

  const handleAddActivity = async (activityData) => {
    try {
      await addDoc(collection(db, 'activities'), {
        ...activityData,
        date: serverTimestamp(),
        createdBy: user.email
      });
      setShowActivityModal(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('Failed to add activity.');
    }
  };

  const handleAddSale = async (saleData) => {
    try {
      await addDoc(collection(db, 'sales'), {
        ...saleData,
        date: serverTimestamp(),
        createdBy: user.email
      });
      setShowSaleModal(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error adding sale:', error);
      alert('Failed to add sale.');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStage = destination.droppableId;

    try {
      const accountRef = doc(db, 'accounts', draggableId);
      await updateDoc(accountRef, {
        stage: newStage,
        lastModified: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating account stage:', error);
      alert('Failed to move account.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Login screen with dark mode
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-white dark:bg-gray-600 opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-60 -right-40 w-96 h-96 bg-white dark:bg-gray-600 opacity-10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-white dark:bg-gray-600 opacity-10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md w-full border border-white/20 dark:border-gray-700/50 transform transition-all hover:scale-105 duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 animate-bounce">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Avco Premier CRM
            </h1>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Restaurant Onboarding Management</p>
          </div>
          
          <button
            onClick={handleSignIn}
            className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-6 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-lg">Sign in with Google</span>
          </button>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
            Secure authentication powered by Google
          </p>
        </div>
      </div>
    );
  }

  // Main application with dark mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 transition-colors duration-300">
      {/* Modern Header with glassmorphism and dark mode */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Avco Premier CRM
                </h1>
              </div>
              
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 transform hover:scale-105 ${
                  showDashboard 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="relative w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full p-0.5 transition-all duration-300 hover:scale-110 shadow-lg"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white dark:bg-gray-900 rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`}>
                  {isDarkMode ? <Moon className="w-3 h-3 text-blue-400" /> : <Sun className="w-3 h-3 text-yellow-500" />}
                </div>
              </button>

              <button
                onClick={() => setShowAccountModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                New Account
              </button>
              
              <button
                onClick={() => setShowTeamModal(true)}
                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Users className="w-4 h-4" />
                Team ({teamMembers.length})
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                <div className="relative group">
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName} 
                    className="w-10 h-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-600 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all cursor-pointer transform hover:scale-110"
                  />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 hidden md:block">{user.displayName}</span>
                <button
                  onClick={handleSignOut}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard View */}
      {showDashboard && (
        <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
          <DashboardView 
            accounts={accounts} 
            sales={sales} 
            activities={activities}
            contacts={contacts}
          />
        </div>
      )}

      {/* Kanban Board */}
      {!showDashboard && (
        <div className="p-6 overflow-x-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-6 min-w-max pb-4">
              {STAGES.map((stage) => (
                <StageColumn
                  key={stage.id}
                  stage={stage}
                  accounts={accounts.filter(acc => acc.stage === stage.id)}
                  onEditAccount={(account) => {
                    setEditingAccount(account);
                    setShowAccountModal(true);
                  }}
                  onViewAccount={setSelectedAccountForDetail}
                  onAddContact={(account) => {
                    setSelectedAccount(account);
                    setShowContactModal(true);
                  }}
                  onAddActivity={(account) => {
                    setSelectedAccount(account);
                    setShowActivityModal(true);
                  }}
                  onAddSale={(account) => {
                    setSelectedAccount(account);
                    setShowSaleModal(true);
                  }}
                />
              ))}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* Modals */}
      {showAccountModal && (
        <AccountModal
          account={editingAccount}
          onClose={() => {
            setShowAccountModal(false);
            setEditingAccount(null);
          }}
          onSave={handleSaveAccount}
        />
      )}

      {showContactModal && selectedAccount && (
        <ContactModal
          accountId={selectedAccount.id}
          accountName={selectedAccount.name}
          onClose={() => {
            setShowContactModal(false);
            setSelectedAccount(null);
          }}
          onSave={handleAddContact}
        />
      )}

      {showActivityModal && selectedAccount && (
        <ActivityModal
          accountId={selectedAccount.id}
          accountName={selectedAccount.name}
          onClose={() => {
            setShowActivityModal(false);
            setSelectedAccount(null);
          }}
          onSave={handleAddActivity}
        />
      )}

      {showSaleModal && selectedAccount && (
        <SaleModal
          accountId={selectedAccount.id}
          accountName={selectedAccount.name}
          onClose={() => {
            setShowSaleModal(false);
            setSelectedAccount(null);
          }}
          onSave={handleAddSale}
        />
      )}

      {showTeamModal && (
        <TeamModal
          teamMembers={teamMembers}
          onClose={() => setShowTeamModal(false)}
        />
      )}

      {selectedAccountForDetail && (
        <AccountDetailModal
          account={selectedAccountForDetail}
          contacts={contacts.filter(c => c.accountId === selectedAccountForDetail.id)}
          activities={activities.filter(a => a.accountId === selectedAccountForDetail.id)}
          sales={sales.filter(s => s.accountId === selectedAccountForDetail.id)}
          onClose={() => setSelectedAccountForDetail(null)}
          onEdit={() => {
            setEditingAccount(selectedAccountForDetail);
            setSelectedAccountForDetail(null);
            setShowAccountModal(true);
          }}
          onDelete={handleDeleteAccount}
          onAddContact={() => {
            setSelectedAccount(selectedAccountForDetail);
            setSelectedAccountForDetail(null);
            setShowContactModal(true);
          }}
          onAddActivity={() => {
            setSelectedAccount(selectedAccountForDetail);
            setSelectedAccountForDetail(null);
            setShowActivityModal(true);
          }}
          onAddSale={() => {
            setSelectedAccount(selectedAccountForDetail);
            setSelectedAccountForDetail(null);
            setShowSaleModal(true);
          }}
        />
      )}

      {/* Add custom styles for animations and dark mode */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }

        /* Dark mode scrollbar */
        .dark ::-webkit-scrollbar {
          width: 8px;
        }

        .dark ::-webkit-scrollbar-track {
          background: #1e293b;
        }

        .dark ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 4px;
        }

        .dark ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }

        /* Smooth transitions */
        * {
          transition-property: background-color, border-color, color, fill, stroke;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 300ms;
        }
      `}</style>
    </div>
  );
}

// Modern Stage Column Component
function StageColumn({ stage, accounts, onEditAccount, onViewAccount, onAddContact, onAddActivity, onAddSale }) {
  const totalValue = accounts.reduce((sum, acc) => sum + (acc.value || 0), 0);

  return (
    <div className="w-80 flex-shrink-0 animate-fade-in">
      <div className={`bg-gradient-to-r ${stage.color} rounded-2xl p-4 shadow-lg mb-4`}>
        <div className="flex items-center justify-between text-white">
          <h3 className="font-bold text-lg">{stage.name}</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold bg-white/20 backdrop-blur px-3 py-1 rounded-full">
              {accounts.length}
            </span>
            {totalValue > 0 && (
              <span className="text-sm font-bold bg-white/30 backdrop-blur px-3 py-1 rounded-full">
                ${totalValue.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`${stage.bgColor} min-h-[600px] p-3 rounded-2xl transition-all duration-300 ${
              snapshot.isDraggingOver ? 'ring-4 ring-blue-400 ring-opacity-50 bg-opacity-70' : 'bg-opacity-40 dark:bg-opacity-20'
            }`}
          >
            {accounts.map((account, index) => (
              <Draggable key={account.id} draggableId={account.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-3 transition-all duration-200 ${
                      snapshot.isDragging ? 'rotate-3 scale-105' : 'hover:scale-102'
                    }`}
                  >
                    <AccountCard
                      account={account}
                      onEdit={onEditAccount}
                      onView={onViewAccount}
                      onAddContact={onAddContact}
                      onAddActivity={onAddActivity}
                      onAddSale={onAddSale}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

// Modern Account Card Component with animations
function AccountCard({ account, onEdit, onView, onAddContact, onAddActivity, onAddSale }) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-700 hover:border-gray-600 group">
      <div onClick={() => onView(account)}>
        <h4 className="font-bold mb-3 text-xl group-hover:text-blue-400 transition-colors">{account.name}</h4>
        
        {account.labels && account.labels.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {account.labels.map((label) => {
              const labelConfig = LABEL_OPTIONS.find(l => l.id === label);
              return (
                <span
                  key={label}
                  className={`${labelConfig?.color || 'bg-gradient-to-r from-gray-500 to-gray-600'} text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md`}
                >
                  {labelConfig?.name || label}
                </span>
              );
            })}
          </div>
        )}

        <div className="space-y-2 text-sm text-gray-300 mb-4">
          {account.email && (
            <div className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
              <span className="truncate">{account.email}</span>
            </div>
          )}
          {account.phone && (
            <div className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
              <span>{account.phone}</span>
            </div>
          )}
          {account.value > 0 && (
            <div className="flex items-center gap-2 text-green-400 font-bold text-base">
              <DollarSign className="w-4 h-4" />
              <span>${account.value.toLocaleString()}</span>
            </div>
          )}
        </div>

        {account.notes && (
          <p className="text-xs text-gray-400 mb-4 line-clamp-2 italic border-l-2 border-gray-700 pl-3">{account.notes}</p>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-700">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(account);
          }}
          className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 transform hover:scale-105"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddActivity(account);
          }}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Log Activity
        </button>
      </div>
    </div>
  );
}

// Account Modal Component
function AccountModal({ account, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: account?.name || '',
    email: account?.email || '',
    phone: account?.phone || '',
    stage: account?.stage || 'Leads',
    labels: account?.labels || [],
    value: account?.value || 0,
    notes: account?.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleLabel = (labelId) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.includes(labelId)
        ? prev.labels.filter(l => l !== labelId)
        : [...prev.labels, labelId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            {account ? 'Edit Account' : 'New Account'}
          </h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Restaurant/Company Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none font-medium"
              placeholder="Enter company name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Stage</label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none font-medium"
            >
              {STAGES.map(stage => (
                <option key={stage.id} value={stage.id}>{stage.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Labels</label>
            <div className="flex flex-wrap gap-2">
              {LABEL_OPTIONS.map(label => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                    formData.labels.includes(label.id)
                      ? `${label.color} text-white shadow-lg`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Potential Deal Value ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none font-medium"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Notes</label>
            <textarea
              rows="4"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none resize-none"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {account ? 'Update' : 'Create'} Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Contact Modal Component
function ContactModal({ accountId, accountName, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    accountId: accountId,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full animate-scale-in">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between text-white">
            <div>
              <h2 className="text-2xl font-bold">Add Contact</h2>
              <p className="text-blue-100 text-sm mt-1">For: {accountName}</p>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 rounded-full p-2 transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none"
              placeholder="Contact name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none"
                placeholder="+1 555 000 0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Title/Role</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none"
              placeholder="e.g. Owner, Manager"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Notes</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none resize-none"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold shadow-lg"
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
function ActivityModal({ accountId, accountName, onClose, onSave }) {
  const [formData, setFormData] = useState({
    type: 'Call',
    accountId: accountId,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full animate-scale-in">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between text-white">
            <div>
              <h2 className="text-2xl font-bold">Log Activity</h2>
              <p className="text-blue-100 text-sm mt-1">For: {accountName}</p>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 rounded-full p-2 transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Activity Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none font-medium"
            >
              {ACTIVITY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Notes *</label>
            <textarea
              rows="5"
              required
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="What happened? What was discussed?"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold shadow-lg"
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
function SaleModal({ accountId, accountName, onClose, onSave }) {
  const [formData, setFormData] = useState({
    accountId: accountId,
    amount: 0,
    product: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full animate-scale-in">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between text-white">
            <div>
              <h2 className="text-2xl font-bold">Record Sale</h2>
              <p className="text-green-100 text-sm mt-1">For: {accountName}</p>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 rounded-full p-2 transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Amount ($) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-green-200 dark:focus:ring-green-800 focus:border-green-500 dark:focus:border-green-400 transition-all outline-none font-medium"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Product/Service *</label>
              <input
                type="text"
                required
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-green-200 dark:focus:ring-green-800 focus:border-green-500 dark:focus:border-green-400 transition-all outline-none"
                placeholder="Product name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Notes</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details about this sale..."
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-green-200 dark:focus:ring-green-800 focus:border-green-500 dark:focus:border-green-400 transition-all outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-semibold shadow-lg"
            >
              Record Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Team Modal Component
function TeamModal({ teamMembers, onClose }) {
  const inviteUrl = window.location.origin;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    alert('Invite link copied to clipboard! Share this with your team members.');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8" />
            Team Members
          </h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 border-2 border-blue-200 dark:border-gray-600 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-blue-900 dark:text-gray-200 mb-2 text-lg">Invite Team Members</h3>
            <p className="text-sm text-blue-800 dark:text-gray-400 mb-4">
              Share this link with your team. Anyone with a Google account can sign in and access the CRM.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={inviteUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-blue-300 dark:border-gray-600 rounded-xl text-sm font-medium"
              />
              <button
                onClick={copyInviteLink}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all text-sm font-bold shadow-lg transform hover:scale-105"
              >
                Copy Link
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-5 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 transition-all"
              >
                <div className="relative">
                  <img
                    src={member.photoURL}
                    alt={member.displayName}
                    className="w-14 h-14 rounded-full ring-4 ring-white dark:ring-gray-800 shadow-lg"
                  />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg">{member.displayName}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                </div>
                <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-bold shadow-md">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Account Detail Modal Component
function AccountDetailModal({ 
  account, 
  contacts, 
  activities, 
  sales, 
  onClose, 
  onEdit, 
  onDelete,
  onAddContact,
  onAddActivity,
  onAddSale 
}) {
  const totalSales = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 rounded-t-3xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{account.name}</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1 bg-white/30 backdrop-blur text-white rounded-lg font-semibold">
                  {STAGES.find(s => s.id === account.stage)?.name}
                </span>
                {account.value > 0 && (
                  <span className="px-3 py-1 bg-white/30 backdrop-blur text-white rounded-lg font-bold">
                    ${account.value.toLocaleString()} potential
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="p-2 text-white hover:bg-white/20 rounded-xl transition-all"
                title="Edit"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(account.id)}
                className="p-2 text-white hover:bg-red-500/50 rounded-xl transition-all"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="p-2 text-white hover:bg-white/20 rounded-xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Account Details */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-600">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 text-lg">Account Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {account.email && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{account.email}</span>
                </div>
              )}
              {account.phone && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{account.phone}</span>
                </div>
              )}
            </div>
            {account.labels && account.labels.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">Labels:</div>
                <div className="flex flex-wrap gap-2">
                  {account.labels.map((label) => {
                    const labelConfig = LABEL_OPTIONS.find(l => l.id === label);
                    return (
                      <span
                        key={label}
                        className={`${labelConfig?.color || 'bg-gradient-to-r from-gray-500 to-gray-600'} text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md`}
                      >
                        {labelConfig?.name || label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {account.notes && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Notes:</div>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic border-l-4 border-blue-500 pl-4">{account.notes}</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-center text-white shadow-lg">
              <div className="text-3xl font-bold mb-1">{contacts.length}</div>
              <div className="text-sm font-medium opacity-90">Contacts</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-center text-white shadow-lg">
              <div className="text-3xl font-bold mb-1">{activities.length}</div>
              <div className="text-sm font-medium opacity-90">Activities</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-center text-white shadow-lg">
              <div className="text-3xl font-bold mb-1">${totalSales.toLocaleString()}</div>
              <div className="text-sm font-medium opacity-90">Total Sales</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={onAddContact}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-bold shadow-lg transform hover:scale-105"
            >
              Add Contact
            </button>
            <button
              onClick={onAddActivity}
              className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all text-sm font-bold shadow-lg transform hover:scale-105"
            >
              Log Activity
            </button>
            <button
              onClick={onAddSale}
              className="px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all text-sm font-bold shadow-lg transform hover:scale-105"
            >
              Record Sale
            </button>
          </div>

          {/* Contacts */}
          {contacts.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 text-lg">Contacts ({contacts.length})</h3>
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 transition-all">
                    <div className="font-bold text-gray-800 dark:text-gray-200">{contact.name}</div>
                    {contact.title && <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{contact.title}</div>}
                    <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {contact.email && <span>{contact.email}</span>}
                      {contact.phone && <span>{contact.phone}</span>}
                    </div>
                    {contact.notes && <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">{contact.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {activities.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 text-lg">Recent Activities ({activities.length})</h3>
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600">
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
function DashboardView({ accounts, sales, activities, contacts }) {
  const totalPipelineValue = accounts.reduce((sum, acc) => sum + (acc.value || 0), 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
  
  const stageStats = STAGES.map(stage => {
    const stageAccounts = accounts.filter(acc => acc.stage === stage.id);
    return {
      name: stage.name,
      count: stageAccounts.length,
      value: stageAccounts.reduce((sum, acc) => sum + (acc.value || 0), 0),
      gradient: stage.color
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
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-200">Total Accounts</h3>
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

      {/* Pipeline by Stage */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-gray-100 dark:border-gray-600">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Pipeline by Stage</h3>
        <div className="space-y-4">
          {stageStats.map((stat) => (
            <div key={stat.name} className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{stat.name}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                  {stat.count} accounts • ${stat.value.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${stat.gradient} h-3 rounded-full transition-all duration-500 group-hover:scale-105`}
                  style={{ width: `${totalPipelineValue > 0 ? (stat.value / totalPipelineValue) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Missing Items Overview */}
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
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{account?.name || 'Unknown Account'}</span>
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