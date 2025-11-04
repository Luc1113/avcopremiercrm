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
  Tag,
  X,
  Edit2,
  Trash2,
  FileText,
  BarChart3
} from 'lucide-react';

// Firebase configuration - YOU NEED TO REPLACE THIS
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Stage configuration
const STAGES = [
  { id: 'Leads', name: 'Leads', color: 'bg-blue-100' },
  { id: 'Ready For Onboarding', name: 'Ready For Onboarding', color: 'bg-purple-100' },
  { id: 'Stuck', name: 'Stuck', color: 'bg-yellow-100' },
  { id: 'Live', name: 'Live', color: 'bg-green-100' },
  { id: 'Post Launch, need of marketing', name: 'Post Launch, Need Marketing', color: 'bg-pink-100' }
];

// Label configuration with colors
const LABEL_OPTIONS = [
  { id: 'Missing Tablet', name: 'Missing Tablet', color: 'bg-red-500' },
  { id: 'Missing Website Setup', name: 'Missing Website Setup', color: 'bg-orange-500' },
  { id: 'Missing Stripe', name: 'Missing Stripe', color: 'bg-yellow-500' },
  { id: 'Missing Restaurant Info', name: 'Missing Restaurant Info', color: 'bg-blue-500' },
  { id: 'Missing Menu', name: 'Missing Menu', color: 'bg-purple-500' }
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

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if user is in team members, if not add them
        const teamRef = collection(db, 'teamMembers');
        const q = query(teamRef, where('email', '==', currentUser.email));
        const unsubTeam = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            // Add user as first admin or regular member
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

    // Accounts listener
    const accountsQuery = query(collection(db, 'accounts'), orderBy('createdAt', 'desc'));
    const unsubAccounts = onSnapshot(accountsQuery, (snapshot) => {
      const accountsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAccounts(accountsData);
    });

    // Contacts listener
    const contactsQuery = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
    const unsubContacts = onSnapshot(contactsQuery, (snapshot) => {
      const contactsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContacts(contactsData);
    });

    // Activities listener
    const activitiesQuery = query(collection(db, 'activities'), orderBy('date', 'desc'));
    const unsubActivities = onSnapshot(activitiesQuery, (snapshot) => {
      const activitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(activitiesData);
    });

    // Sales listener
    const salesQuery = query(collection(db, 'sales'), orderBy('date', 'desc'));
    const unsubSales = onSnapshot(salesQuery, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSales(salesData);
    });

    // Team members listener
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

  // Sign in with Google
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Add or update account
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

  // Delete account
  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
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

  // Add contact
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

  // Add activity
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

  // Add sale
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

  // Handle drag end
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

  // Calculate dashboard stats
  const calculateStats = () => {
    const totalValue = accounts.reduce((sum, acc) => sum + (acc.value || 0), 0);
    const totalSales = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
    const stageDistribution = STAGES.map(stage => ({
      stage: stage.name,
      count: accounts.filter(acc => acc.stage === stage.id).length,
      value: accounts.filter(acc => acc.stage === stage.id).reduce((sum, acc) => sum + (acc.value || 0), 0)
    }));

    return { totalValue, totalSales, stageDistribution };
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Avco Premier CRM</h1>
            <p className="text-gray-600">Restaurant Onboarding Management</p>
          </div>
          <button
            onClick={handleSignIn}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Sign in with your Google account to access the CRM
          </p>
        </div>
      </div>
    );
  }

  // Main application
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Avco Premier CRM</h1>
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                showDashboard 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAccountModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Account
            </button>
            <button
              onClick={() => setShowTeamModal(true)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Team ({teamMembers.length})
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <img 
                src={user.photoURL} 
                alt={user.displayName} 
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gray-700">{user.displayName}</span>
              <button
                onClick={handleSignOut}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard View */}
      {showDashboard && (
        <div className="max-w-7xl mx-auto px-4 py-8">
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
        <div className="p-4 overflow-x-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 min-w-max pb-4">
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
    </div>
  );
}

// Stage Column Component
function StageColumn({ stage, accounts, onEditAccount, onViewAccount, onAddContact, onAddActivity, onAddSale }) {
  const totalValue = accounts.reduce((sum, acc) => sum + (acc.value || 0), 0);

  return (
    <div className="w-80 flex-shrink-0">
      <div className={`${stage.color} rounded-t-lg p-3 border-b-2 border-gray-300`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{stage.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{accounts.length}</span>
            {totalValue > 0 && (
              <span className="text-sm font-medium text-gray-700">
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
            className={`${stage.color} min-h-screen p-2 transition-colors ${
              snapshot.isDraggingOver ? 'bg-opacity-70' : 'bg-opacity-30'
            }`}
          >
            {accounts.map((account, index) => (
              <Draggable key={account.id} draggableId={account.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-2 ${snapshot.isDragging ? 'rotate-2' : ''}`}
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

// Account Card Component
function AccountCard({ account, onEdit, onView, onAddContact, onAddActivity, onAddSale }) {
  return (
    <div className="bg-gray-800 text-white rounded-lg p-4 shadow-md hover:shadow-lg transition cursor-pointer">
      <div onClick={() => onView(account)}>
        <h4 className="font-semibold mb-2 text-lg">{account.name}</h4>
        
        {account.labels && account.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {account.labels.map((label) => {
              const labelConfig = LABEL_OPTIONS.find(l => l.id === label);
              return (
                <span
                  key={label}
                  className={`${labelConfig?.color || 'bg-gray-500'} text-white text-xs px-2 py-1 rounded-full`}
                >
                  {labelConfig?.name || label}
                </span>
              );
            })}
          </div>
        )}

        <div className="space-y-1 text-sm text-gray-300 mb-3">
          {account.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3" />
              <span className="truncate">{account.email}</span>
            </div>
          )}
          {account.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3" />
              <span>{account.phone}</span>
            </div>
          )}
          {account.value > 0 && (
            <div className="flex items-center gap-2 text-green-400 font-medium">
              <DollarSign className="w-3 h-3" />
              <span>${account.value.toLocaleString()}</span>
            </div>
          )}
        </div>

        {account.notes && (
          <p className="text-xs text-gray-400 mb-3 line-clamp-2">{account.notes}</p>
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-700">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(account);
          }}
          className="flex-1 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs transition"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddActivity(account);
          }}
          className="flex-1 bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-xs transition"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {account ? 'Edit Account' : 'New Account'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restaurant/Company Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STAGES.map(stage => (
                <option key={stage.id} value={stage.id}>{stage.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Labels</label>
            <div className="flex flex-wrap gap-2">
              {LABEL_OPTIONS.map(label => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    formData.labels.includes(label.id)
                      ? `${label.color} text-white`
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Potential Deal Value ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows="4"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Add Contact</h2>
            <p className="text-sm text-gray-600">For: {accountName}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title/Role</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Log Activity</h2>
            <p className="text-sm text-gray-600">For: {accountName}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ACTIVITY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes *</label>
            <textarea
              rows="4"
              required
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="What happened? What was discussed?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Record Sale</h2>
            <p className="text-sm text-gray-600">For: {accountName}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product/Service *</label>
              <input
                type="text"
                required
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details about this sale..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
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
  const [showInvite, setShowInvite] = useState(false);
  const inviteUrl = window.location.origin;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    alert('Invite link copied to clipboard! Share this with your team members.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Team Members</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Invite Team Members</h3>
            <p className="text-sm text-blue-800 mb-3">
              Share this link with your team. Anyone with a Google account can sign in and access the CRM.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm"
              />
              <button
                onClick={copyInviteLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Copy Link
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <img
                  src={member.photoURL}
                  alt={member.displayName}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{member.displayName}</h4>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{account.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {STAGES.find(s => s.id === account.stage)?.name}
                </span>
                {account.value > 0 && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-medium">
                    ${account.value.toLocaleString()} potential
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Edit"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(account.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Account Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Account Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {account.email && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{account.email}</span>
                </div>
              )}
              {account.phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{account.phone}</span>
                </div>
              )}
            </div>
            {account.labels && account.labels.length > 0 && (
              <div className="mt-3">
                <div className="text-sm text-gray-600 mb-2">Labels:</div>
                <div className="flex flex-wrap gap-2">
                  {account.labels.map((label) => {
                    const labelConfig = LABEL_OPTIONS.find(l => l.id === label);
                    return (
                      <span
                        key={label}
                        className={`${labelConfig?.color || 'bg-gray-500'} text-white text-xs px-3 py-1 rounded-full`}
                      >
                        {labelConfig?.name || label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {account.notes && (
              <div className="mt-3">
                <div className="text-sm text-gray-600 mb-1">Notes:</div>
                <p className="text-sm text-gray-700">{account.notes}</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{contacts.length}</div>
              <div className="text-sm text-gray-600">Contacts</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{activities.length}</div>
              <div className="text-sm text-gray-600">Activities</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">${totalSales.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Sales</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={onAddContact}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Add Contact
            </button>
            <button
              onClick={onAddActivity}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
            >
              Log Activity
            </button>
            <button
              onClick={onAddSale}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
            >
              Record Sale
            </button>
          </div>

          {/* Contacts */}
          {contacts.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Contacts ({contacts.length})</h3>
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div key={contact.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-800">{contact.name}</div>
                    {contact.title && <div className="text-sm text-gray-600">{contact.title}</div>}
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      {contact.email && <span>{contact.email}</span>}
                      {contact.phone && <span>{contact.phone}</span>}
                    </div>
                    {contact.notes && <div className="text-sm text-gray-600 mt-2">{contact.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {activities.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Recent Activities ({activities.length})</h3>
              <div className="space-y-2">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800">{activity.type}</span>
                      <span className="text-xs text-gray-500">
                        {activity.date?.toDate?.()?.toLocaleDateString() || 'Just now'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.notes}</p>
                    <div className="text-xs text-gray-500 mt-1">By: {activity.createdBy}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales */}
          {sales.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Sales History ({sales.length})</h3>
              <div className="space-y-2">
                {sales.map((sale) => (
                  <div key={sale.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800">{sale.product}</span>
                      <span className="font-bold text-green-600">${sale.amount.toLocaleString()}</span>
                    </div>
                    {sale.notes && <p className="text-sm text-gray-600">{sale.notes}</p>}
                    <div className="text-xs text-gray-500 mt-1">
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
      color: stage.color
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Accounts</h3>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">{accounts.length}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Pipeline Value</h3>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">${totalPipelineValue.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">${totalRevenue.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Activities</h3>
            <Calendar className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">{activities.length}</div>
        </div>
      </div>

      {/* Pipeline by Stage */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pipeline by Stage</h3>
        <div className="space-y-3">
          {stageStats.map((stat) => (
            <div key={stat.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{stat.name}</span>
                <span className="text-sm text-gray-600">
                  {stat.count} accounts • ${stat.value.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${stat.color} h-2 rounded-full`}
                  style={{ width: `${(stat.value / totalPipelineValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Missing Items Overview */}
      {labelStats.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Items Requiring Attention</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {labelStats.map((stat) => (
              <div key={stat.name} className="text-center">
                <div className={`${stat.color} text-white rounded-lg p-4 mb-2`}>
                  <div className="text-2xl font-bold">{stat.count}</div>
                </div>
                <div className="text-sm text-gray-600">{stat.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activities.slice(0, 10).map((activity) => {
            const account = accounts.find(acc => acc.id === activity.accountId);
            return (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">{activity.type}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{account?.name || 'Unknown Account'}</span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.notes}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{activity.createdBy}</span>
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
