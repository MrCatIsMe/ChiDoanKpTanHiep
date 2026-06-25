import React, { useState, useEffect, useRef } from 'react';
import { User, DoanVien, HoatDong, MinhChung, TruongHoc } from './types';
import { getStoredData, saveStoredData } from './data/mockData';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';
import AuthModal from './components/AuthModal';
import { CheckCircle2, AlertCircle, X, Sparkles, Database } from 'lucide-react';
import { 
  dbGetDoanVien, 
  dbSaveDoanVien, 
  dbDeleteDoanVien,
  dbGetHoatDong, 
  dbSaveHoatDong, 
  dbDeleteHoatDong,
  dbGetMinhChung, 
  dbSaveMinhChung, 
  dbDeleteMinhChung,
  dbGetTruongHoc, 
  dbSaveTruongHoc, 
  dbDeleteTruongHoc,
  dbGetUsers, 
  dbSaveUser, 
  dbDeleteUser,
  dbBulkSync,
  testConnection,
  dbGetSettings,
  dbSaveSettings
} from './lib/firebase';

export default function App() {
  // Load initial data
  const initialData = getStoredData();

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('qd_th_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [members, setMembers] = useState<DoanVien[]>(initialData.doanVien);
  const [activities, setActivities] = useState<HoatDong[]>(initialData.hoatDong);
  const [proofs, setProofs] = useState<MinhChung[]>(initialData.minhChung);
  const [users, setUsers] = useState<User[]>(initialData.users);
  const [truongHoc, setTruongHoc] = useState<TruongHoc[]>(initialData.truongHoc || []);

  // Firebase status
  const [firebaseConnected, setFirebaseConnected] = useState<boolean | null>(null);
  const [syncing, setSyncing] = useState(false);

  // References for tracking changes
  const prevMembersRef = useRef<DoanVien[]>([]);
  const prevActivitiesRef = useRef<HoatDong[]>([]);
  const prevProofsRef = useRef<MinhChung[]>([]);
  const prevUsersRef = useRef<User[]>([]);
  const prevTruongHocRef = useRef<TruongHoc[]>([]);
  const isFirstLoad = useRef(true);

  // Global Toast notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
    id: number;
  } | null>(null);

  // Load from Firebase on boot
  useEffect(() => {
    async function initFirebase() {
      setSyncing(true);
      const isConnected = await testConnection();
      setFirebaseConnected(isConnected);
      if (!isConnected) {
        setSyncing(false);
        isFirstLoad.current = false;
        return;
      }

      try {
        const fsMembers = await dbGetDoanVien();
        const fsActivities = await dbGetHoatDong();
        const fsProofs = await dbGetMinhChung();
        const fsTruongHoc = await dbGetTruongHoc();
        const fsUsers = await dbGetUsers();

        const isDbEmpty = fsMembers.length === 0 && fsActivities.length === 0 && fsTruongHoc.length === 0;

        if (isDbEmpty) {
          console.log('Firebase is empty. Seeding with local/mock data...');
          await dbBulkSync({
            doanVien: members,
            hoatDong: activities,
            minhChung: proofs,
            users: users,
            truongHoc: truongHoc
          });
          prevMembersRef.current = [...members];
          prevActivitiesRef.current = [...activities];
          prevProofsRef.current = [...proofs];
          prevUsersRef.current = [...users];
          prevTruongHocRef.current = [...truongHoc];
        } else {
          setMembers(fsMembers);
          setActivities(fsActivities);
          setProofs(fsProofs);
          setTruongHoc(fsTruongHoc);
          setUsers(fsUsers.length > 0 ? fsUsers : initialData.users);

          prevMembersRef.current = fsMembers;
          prevActivitiesRef.current = fsActivities;
          prevProofsRef.current = fsProofs;
          prevTruongHocRef.current = fsTruongHoc;
          prevUsersRef.current = fsUsers.length > 0 ? fsUsers : initialData.users;
        }
      } catch (err) {
        console.error('Error connecting or seeding with Firebase:', err);
      } finally {
        setSyncing(false);
        isFirstLoad.current = false;
      }
    }

    initFirebase();
  }, []);

  // Auto-save data on changes to localStorage
  useEffect(() => {
    saveStoredData({
      doanVien: members,
      hoatDong: activities,
      minhChung: proofs,
      users: users,
      truongHoc: truongHoc
    });
  }, [members, activities, proofs, users, truongHoc]);

  // Firebase Delta Sync: DoanVien
  useEffect(() => {
    if (isFirstLoad.current || !firebaseConnected) return;

    const addedOrUpdated = members.filter(item => {
      const prev = prevMembersRef.current.find(p => p.id === item.id);
      return !prev || JSON.stringify(prev) !== JSON.stringify(item);
    });

    const deleted = prevMembersRef.current.filter(prev => {
      return !members.some(item => item.id === prev.id);
    });

    if (addedOrUpdated.length > 0 || deleted.length > 0) {
      setSyncing(true);
      Promise.all([
        ...addedOrUpdated.map(item => dbSaveDoanVien(item)),
        ...deleted.map(item => dbDeleteDoanVien(item.id))
      ])
      .catch(err => {
        console.error("Error syncing DoanVien:", err);
        showNotification("Lỗi đồng bộ thông tin đoàn viên lên cơ sở dữ liệu!", "error");
      })
      .finally(() => setSyncing(false));
    }

    prevMembersRef.current = [...members];
  }, [members, firebaseConnected]);

  // Firebase Delta Sync: HoatDong
  useEffect(() => {
    if (isFirstLoad.current || !firebaseConnected) return;

    const addedOrUpdated = activities.filter(item => {
      const prev = prevActivitiesRef.current.find(p => p.id === item.id);
      return !prev || JSON.stringify(prev) !== JSON.stringify(item);
    });

    const deleted = prevActivitiesRef.current.filter(prev => {
      return !activities.some(item => item.id === prev.id);
    });

    if (addedOrUpdated.length > 0 || deleted.length > 0) {
      setSyncing(true);
      Promise.all([
        ...addedOrUpdated.map(item => dbSaveHoatDong(item)),
        ...deleted.map(item => dbDeleteHoatDong(item.id))
      ])
      .catch(err => {
        console.error("Error syncing HoatDong:", err);
        showNotification("Lỗi đồng bộ hoạt động hè lên cơ sở dữ liệu!", "error");
      })
      .finally(() => setSyncing(false));
    }

    prevActivitiesRef.current = [...activities];
  }, [activities, firebaseConnected]);

  // Firebase Delta Sync: MinhChung
  useEffect(() => {
    if (isFirstLoad.current || !firebaseConnected) return;

    const addedOrUpdated = proofs.filter(item => {
      const prev = prevProofsRef.current.find(p => p.id === item.id);
      return !prev || JSON.stringify(prev) !== JSON.stringify(item);
    });

    const deleted = prevProofsRef.current.filter(prev => {
      return !proofs.some(item => item.id === prev.id);
    });

    if (addedOrUpdated.length > 0 || deleted.length > 0) {
      setSyncing(true);
      Promise.all([
        ...addedOrUpdated.map(item => dbSaveMinhChung(item)),
        ...deleted.map(item => dbDeleteMinhChung(item.id))
      ])
      .catch(err => {
        console.error("Error syncing MinhChung:", err);
        showNotification("Lỗi đồng bộ minh chứng lên cơ sở dữ liệu!", "error");
      })
      .finally(() => setSyncing(false));
    }

    prevProofsRef.current = [...proofs];
  }, [proofs, firebaseConnected]);

  // Firebase Delta Sync: Users
  useEffect(() => {
    if (isFirstLoad.current || !firebaseConnected) return;

    const addedOrUpdated = users.filter(item => {
      const prev = prevUsersRef.current.find(p => p.id === item.id);
      return !prev || JSON.stringify(prev) !== JSON.stringify(item);
    });

    const deleted = prevUsersRef.current.filter(prev => {
      return !users.some(item => item.id === prev.id);
    });

    if (addedOrUpdated.length > 0 || deleted.length > 0) {
      setSyncing(true);
      Promise.all([
        ...addedOrUpdated.map(item => dbSaveUser(item)),
        ...deleted.map(item => dbDeleteUser(item.id))
      ])
      .catch(err => {
        console.error("Error syncing Users:", err);
        showNotification("Lỗi đồng bộ tài khoản lên cơ sở dữ liệu!", "error");
      })
      .finally(() => setSyncing(false));
    }

    prevUsersRef.current = [...users];
  }, [users, firebaseConnected]);

  // Firebase Delta Sync: TruongHoc
  useEffect(() => {
    if (isFirstLoad.current || !firebaseConnected) return;

    const addedOrUpdated = truongHoc.filter(item => {
      const prev = prevTruongHocRef.current.find(p => p.id === item.id);
      return !prev || JSON.stringify(prev) !== JSON.stringify(item);
    });

    const deleted = prevTruongHocRef.current.filter(prev => {
      return !truongHoc.some(item => item.id === prev.id);
    });

    if (addedOrUpdated.length > 0 || deleted.length > 0) {
      setSyncing(true);
      Promise.all([
        ...addedOrUpdated.map(item => dbSaveTruongHoc(item)),
        ...deleted.map(item => dbDeleteTruongHoc(item.id))
      ])
      .catch(err => {
        console.error("Error syncing TruongHoc:", err);
        showNotification("Lỗi đồng bộ trường học lên cơ sở dữ liệu!", "error");
      })
      .finally(() => setSyncing(false));
    }

    prevTruongHocRef.current = [...truongHoc];
  }, [truongHoc, firebaseConnected]);

  // Handle Log out
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('qd_th_current_user');
    showNotification('Đã đăng xuất hệ thống thành công!', 'success');
  };

  // Handle Log in
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('qd_th_current_user', JSON.stringify(user));
    showNotification(`Đăng nhập thành công với vai trò ${user.role === 'admin' ? 'Bí thư Chi đoàn' : 'Đoàn viên'}`, 'success');
  };

  // Helper function to trigger elegant notification toasts
  const showNotification = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setNotification({ message, type, id });
    
    // Auto clear after 4 seconds
    setTimeout(() => {
      setNotification(current => {
        if (current && current.id === id) {
          return null;
        }
        return current;
      });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* GLOBAL TOAST NOTIFICATION CONTAINER */}
      {notification && (
        <div 
          id="global-toast-notification"
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl p-4 shadow-xl border transition-all max-w-sm animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-550 bg-emerald-50 text-emerald-800 border-emerald-100'
              : 'bg-red-50 text-red-800 border-red-100'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          )}
          <div className="flex-1 text-xs font-semibold">
            {notification.message}
          </div>
          <button 
            id="close-toast-btn"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* CORE ROUTING ENGINE */}
      {!currentUser ? (
        // Public landing page view
        <LandingPage 
          onOpenLogin={() => setShowLoginModal(true)} 
          activities={activities}
          members={members}
          proofs={proofs}
        />
      ) : currentUser.role === 'admin' ? (
        // Authorized Admin Panel View
        <AdminDashboard 
          currentUser={currentUser}
          onLogout={handleLogout}
          members={members}
          setMembers={setMembers}
          activities={activities}
          setActivities={setActivities}
          proofs={proofs}
          setProofs={setProofs}
          truongHoc={truongHoc}
          setTruongHoc={setTruongHoc}
          onShowNotification={showNotification}
          users={users}
          setUsers={setUsers}
        />
      ) : (
        // Authorized Student Member View
        <MemberDashboard 
          currentUser={currentUser}
          onLogout={handleLogout}
          members={members}
          setMembers={setMembers}
          activities={activities}
          proofs={proofs}
          setProofs={setProofs}
          onShowNotification={showNotification}
        />
      )}

      {/* RENDER AUTHENTICATION MODAL */}
      {showLoginModal && (
        <AuthModal 
          onLogin={handleLogin}
          users={users}
          doanViens={members}
          onClose={() => setShowLoginModal(false)}
          onRegister={(newMember, newUser) => {
            setMembers(prev => [newMember, ...prev]);
            setUsers(prev => [newUser, ...prev]);
            showNotification(`Đăng ký thành công Đoàn viên mới: ${newMember.hoTen}!`, 'success');
          }}
          truongHoc={truongHoc}
        />
      )}

    </div>
  );
}
