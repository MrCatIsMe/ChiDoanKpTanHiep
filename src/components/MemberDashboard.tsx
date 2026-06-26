import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AnimatedCounter from './AnimatedCounter';
import { DoanVien, HoatDong, MinhChung, User } from '../types';
import { TRUONG_LIST } from '../data/mockData';
import { compressAndResizeImage } from '../utils/image';
import { 
  User as UserIcon, Calendar, FileCheck, History, Award, MapPin, 
  Clock, LogOut, CheckCircle2, AlertTriangle, HelpCircle, ChevronRight,
  Camera, Upload, FileText, Check, ShieldAlert, BookOpen, Star, Phone, Mail,
  Lock, Unlock, Edit, Home
} from 'lucide-react';

interface MemberDashboardProps {
  currentUser: User;
  onLogout: () => void;
  onGoToLanding?: () => void;
  members: DoanVien[];
  setMembers: React.Dispatch<React.SetStateAction<DoanVien[]>>;
  activities: HoatDong[];
  proofs: MinhChung[];
  setProofs: React.Dispatch<React.SetStateAction<MinhChung[]>>;
  onShowNotification: (msg: string, type: 'success' | 'error') => void;
}

export default function MemberDashboard({
  currentUser,
  onLogout,
  onGoToLanding,
  members,
  setMembers,
  activities,
  proofs,
  setProofs,
  onShowNotification
}: MemberDashboardProps) {

  // Current logged in member profile
  const currentMember = useMemo(() => {
    return members.find(m => m.id === currentUser.doanVienId) || members[0];
  }, [members, currentUser]);

  const [activeTab, setActiveTab] = useState<'profile' | 'activities' | 'submit' | 'history'>('profile');
  
  // Submit proof form state
  const [submitActivityId, setSubmitActivityId] = useState(activities[0]?.id || '');
  const [submitDesc, setSubmitDesc] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const selectedActivity = useMemo(() => {
    return activities.find(a => a.id === submitActivityId);
  }, [submitActivityId, activities]);

  const isSelectedActivityLocked = selectedActivity?.locked || false;

  // Simulated TimeMark metadata
  const [simulatedTime, setSimulatedTime] = useState('');
  const [simulatedLocation, setSimulatedLocation] = useState('');

  // Profile edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    hoTen: '',
    ngaySinh: '',
    gioiTinh: 'Nam' as 'Nam' | 'Nữ',
    sdt: '',
    email: '',
    truong: '',
    lop: '',
    diaChi: '',
    anhDaiDien: '',
    chiDoan: ''
  });

  const handleStartEdit = () => {
    setEditForm({
      hoTen: currentMember.hoTen,
      ngaySinh: currentMember.ngaySinh || '',
      gioiTinh: currentMember.gioiTinh || 'Nam',
      sdt: currentMember.sdt || '',
      email: currentMember.email || '',
      truong: currentMember.truong || '',
      lop: currentMember.lop || '',
      diaChi: currentMember.diaChi || '',
      anhDaiDien: currentMember.anhDaiDien || '',
      chiDoan: currentMember.chiDoan || ''
    });
    setIsEditing(true);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // Compress with 400x400 size for avatar
      const compressedBase64 = await compressAndResizeImage(file, 400, 400, 0.7);
      setEditForm(prev => ({ ...prev, anhDaiDien: compressedBase64 }));
      onShowNotification('Đã nạp ảnh đại diện mới!', 'success');
    } catch (err) {
      console.error('Failed to compress avatar image:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        setEditForm(prev => ({ ...prev, anhDaiDien: base64Url }));
        onShowNotification('Đã tải ảnh đại diện lên!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.hoTen.trim()) {
      onShowNotification('Họ và tên không được để trống!', 'error');
      return;
    }
    
    const updatedMember: DoanVien = {
      ...currentMember,
      hoTen: editForm.hoTen.trim(),
      ngaySinh: editForm.ngaySinh,
      gioiTinh: editForm.gioiTinh,
      sdt: editForm.sdt.trim(),
      email: editForm.email.trim(),
      truong: editForm.truong,
      lop: editForm.lop.trim(),
      diaChi: editForm.diaChi.trim(),
      anhDaiDien: editForm.anhDaiDien
    };

    setMembers(prev => prev.map(m => m.id === currentMember.id ? updatedMember : m));
    setIsEditing(false);
    onShowNotification('Cập nhật hồ sơ cá nhân thành công!', 'success');
  };

  // Handle local image file upload (converts to base64 for localstorage persistence)
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedBase64 = await compressAndResizeImage(file, 800, 600, 0.75);
      setSelectedImage(compressedBase64);

      // Generate simulated high-accuracy TimeMark stamp at the moment of photo upload
      const now = new Date();
      const timeStr = now.toISOString().replace('T', ' ').substring(0, 16);
      setSimulatedTime(timeStr);

      // Random local Ward / Coordinate
      const locationCoords = [
        'Khu dân cư Tân Hiệp, Phường Tân Đông Hiệp (10.9124° N, 106.7845° E)',
        'Văn phòng Ban điều hành Khu phố Tân Hiệp (10.9105° N, 106.7821° E)',
        'Hội trường UBND Phường Tân Đông Hiệp (10.9150° N, 106.7892° E)',
        'Nhà Văn hóa Thể thao Tân Hiệp (10.9082° N, 106.7798° E)',
        'Đường ĐT743, KP Tân Hiệp, Phường Tân Đông Hiệp (10.9165° N, 106.7831° E)'
      ];
      const randomLoc = locationCoords[Math.floor(Math.random() * locationCoords.length)];
      setSimulatedLocation(randomLoc);

      onShowNotification('Đã nạp ảnh vào cảm biến TimeMark! Hãy xem dấu mộc thời gian & vị trí.', 'success');
    } catch (err) {
      console.error('Failed to compress proof image:', err);
      // Fallback
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        setSelectedImage(base64Url);

        // Generate simulated high-accuracy TimeMark stamp at the moment of photo upload
        const now = new Date();
        const timeStr = now.toISOString().replace('T', ' ').substring(0, 16);
        setSimulatedTime(timeStr);

        // Random local Ward / Coordinate
        const locationCoords = [
          'Khu dân cư Tân Hiệp, Phường Tân Đông Hiệp (10.9124° N, 106.7845° E)',
          'Văn phòng Ban điều hành Khu phố Tân Hiệp (10.9105° N, 106.7821° E)',
          'Hội trường UBND Phường Tân Đông Hiệp (10.9150° N, 106.7892° E)',
          'Nhà Văn hóa Thể thao Tân Hiệp (10.9082° N, 106.7798° E)',
          'Đường ĐT743, KP Tân Hiệp, Phường Tân Đông Hiệp (10.9165° N, 106.7831° E)'
        ];
        const randomLoc = locationCoords[Math.floor(Math.random() * locationCoords.length)];
        setSimulatedLocation(randomLoc);

        onShowNotification('Đã nạp ảnh vào cảm biến TimeMark! Hãy xem dấu mộc thời gian & vị trí.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit TimeMark Proof
  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitActivityId) {
      onShowNotification('Vui lòng chọn hoạt động bạn đã tham gia', 'error');
      return;
    }
    if (isSelectedActivityLocked) {
      onShowNotification('Hoạt động này hiện đang khóa điểm danh và nộp minh chứng!', 'error');
      return;
    }
    if (!selectedImage) {
      onShowNotification('Vui lòng chụp hoặc tải lên một ảnh minh chứng thực tế', 'error');
      return;
    }
    if (!submitDesc.trim()) {
      onShowNotification('Vui lòng nhập mô tả đóng góp thực tế của bạn', 'error');
      return;
    }

    // Check if already submitted for this activity
    const alreadySubmitted = proofs.some(p => p.doanVienId === currentMember.id && p.hoatDongId === submitActivityId && p.status !== 'Không đạt');
    if (alreadySubmitted) {
      if (!confirm('Bạn đã nộp minh chứng cho hoạt động này trước đây và đang chờ duyệt hoặc đã duyệt. Bạn có chắc chắn muốn gửi thêm một minh chứng khác không?')) {
        return;
      }
    }

    const newProof: MinhChung = {
      id: `mc-${Date.now()}`,
      doanVienId: currentMember.id,
      hoatDongId: submitActivityId,
      imageUrl: selectedImage,
      moTa: submitDesc,
      status: 'Chờ duyệt',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      timeMark: simulatedTime,
      locationMark: simulatedLocation
    };

    setProofs(prev => [newProof, ...prev]);
    onShowNotification('Đã gửi minh chứng TimeMark thành công! Vui lòng chờ Bí thư phê duyệt cộng điểm.', 'success');
    
    // Clear state & navigate to History
    setSubmitDesc('');
    setSelectedImage(null);
    setActiveTab('history');
  };

  // Student specific statistics
  const studentStats = useMemo(() => {
    const studentProofs = proofs.filter(p => p.doanVienId === currentMember.id);
    const approved = studentProofs.filter(p => p.status === 'Đã duyệt');
    const pending = studentProofs.filter(p => p.status === 'Chờ duyệt');
    const rejected = studentProofs.filter(p => p.status === 'Không đạt');

    return {
      totalSubmitted: studentProofs.length,
      approvedCount: approved.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length,
    };
  }, [proofs, currentMember]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* MOBILE HEADER PROFILE ACCENT */}
      <div className="md:hidden bg-[#005691] text-white p-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={currentMember.anhDaiDien}
            alt={currentMember.hoTen}
            className="h-10 w-10 rounded-full object-cover border-2 border-white/40"
            referrerPolicy="no-referrer"
          />
          <div>
            <h3 className="font-bold text-sm leading-tight">{currentMember.hoTen}</h3>
            <p className="text-[10px] text-blue-100">{currentMember.truong}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onGoToLanding && (
            <button
              onClick={onGoToLanding}
              className="px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center gap-1 border border-white/10"
              title="Về Trang chủ"
            >
              <Home className="h-3.5 w-3.5 text-blue-100" />
              <span className="text-[10px] font-bold">Trang chủ</span>
            </button>
          )}
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col shrink-0 border-r border-slate-800">
        {/* Brand */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-600 to-red-500 p-0.5 flex items-center justify-center text-white font-bold text-xs">
            ĐV
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">ĐOÀN VIÊN HỌC SINH</p>
            <p className="text-[10px] text-blue-400 font-semibold uppercase">Chi đoàn Khối 12</p>
          </div>
        </div>

        {/* Big Avatar card */}
        <div className="p-4 border-b border-slate-800/80 text-center space-y-2 bg-slate-900/40">
          <img
            src={currentMember.anhDaiDien}
            alt={currentMember.hoTen}
            className="h-16 w-16 rounded-full object-cover mx-auto border-2 border-[#005691]/60 shadow-lg"
            referrerPolicy="no-referrer"
          />
          <div>
            <h4 className="text-xs font-extrabold text-white">{currentMember.hoTen}</h4>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{currentMember.maDoanVien}</p>
          </div>
          <div className="pt-2">
            <span className="inline-block rounded-full bg-[#005691] px-3 py-1 text-xs font-black text-white shadow">
              +{currentMember.diemTichLuy} Điểm rèn luyện
            </span>
          </div>
        </div>

        {/* Sidebar menu */}
        <nav className="flex-1 p-3 space-y-1">
          <button
            id="member-tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'profile' ? 'bg-[#005691] text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserIcon className="h-4 w-4 shrink-0" />
            Hồ sơ cá nhân
          </button>

          <button
            id="member-tab-activities"
            onClick={() => setActiveTab('activities')}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'activities' ? 'bg-[#005691] text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="h-4 w-4 shrink-0" />
            Hoạt động hè
          </button>

          <button
            id="member-tab-submit"
            onClick={() => setActiveTab('submit')}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'submit' ? 'bg-[#005691] text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="h-4 w-4 shrink-0" />
            <span>Nộp minh chứng TimeMark</span>
          </button>

          <button
            id="member-tab-history"
            onClick={() => setActiveTab('history')}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'history' ? 'bg-[#005691] text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <History className="h-4 w-4 shrink-0" />
              <span>Lịch sử nộp bài</span>
            </div>
            {studentStats.totalSubmitted > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${activeTab === 'history' ? 'bg-white text-blue-900' : 'bg-slate-800 text-slate-300'}`}>
                {studentStats.totalSubmitted}
              </span>
            )}
          </button>
        </nav>

        {/* Logout bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs space-y-2">
          {onGoToLanding && (
            <button
              onClick={onGoToLanding}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 bg-emerald-750 hover:bg-emerald-700 text-white font-bold transition-all cursor-pointer border border-emerald-700/40"
            >
              <Home className="h-4 w-4 text-emerald-200" />
              Về Trang chủ (Landing)
            </button>
          )}
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-800 text-red-400 font-bold transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất tài khoản
          </button>
        </div>
      </aside>

      {/* MAIN MAIN MEMBER CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
        
        {/* TAB 1: PROFILE / OVERVIEW */}
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Greeting card with point display */}
            <div className="rounded-3xl bg-gradient-to-r from-teal-500 via-emerald-500 to-blue-600 p-6 text-white shadow-xl relative overflow-hidden">
              {/* Decorative radial circles */}
              <div className="absolute right-0 bottom-0 translate-y-8 translate-x-8 opacity-10 pointer-events-none">
                <Award className="h-56 w-56 text-white" />
              </div>
              <div className="absolute top-0 right-1/3 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="inline-flex rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest border border-white/10 shadow-sm font-display">
                    Đoàn viên tích cực hè 2026
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black font-display">Chào bạn, {currentMember.hoTen}!</h2>
                  <p className="text-xs text-teal-50 max-w-lg leading-relaxed">
                    Chào mừng bạn đến với Cổng thông tin Chi đoàn khu phố. Điểm tích lũy hè của bạn sẽ được kết xuất gửi về trường THPT làm hồ sơ minh chứng xếp loại cuối khóa lớp 12.
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center shrink-0 shadow-lg transform hover:scale-102 transition-transform">
                  <p className="text-[10px] font-extrabold text-teal-100 uppercase tracking-widest font-display">TỔNG ĐIỂM TÍCH LŨY</p>
                  <p className="text-3xl font-black text-white mt-1 font-display">+<AnimatedCounter value={currentMember.diemTichLuy} /> Điểm</p>
                  <p className="text-[9px] text-teal-100/80 mt-1 uppercase font-bold tracking-wider">Hệ thống thời gian thực</p>
                </div>
              </div>
            </div>

            {/* Fast Stats counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đã tham gia nộp</p>
                  <p className="text-2xl font-black text-slate-900 mt-1"><AnimatedCounter value={studentStats.totalSubmitted} /></p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-blue-50 text-[#005691] flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Minh chứng được duyệt</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1"><AnimatedCounter value={studentStats.approvedCount} /></p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đang chờ xét duyệt</p>
                  <p className="text-2xl font-black text-amber-500 mt-1"><AnimatedCounter value={studentStats.pendingCount} /></p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Không đạt (Cần sửa)</p>
                  <p className="text-2xl font-black text-red-600 mt-1"><AnimatedCounter value={studentStats.rejectedCount} /></p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Profile Info Details Card or Edit Form */}
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-5 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Chỉnh sửa thông tin cá nhân</h3>
                  <span className="text-[10px] text-slate-400">Mã đoàn viên: <strong className="font-mono">{currentMember.maDoanVien}</strong></span>
                </div>

                {/* Avatar Edit Section */}
                <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="relative group shrink-0">
                    <img
                      src={editForm.anhDaiDien || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt="Avatar preview"
                      className="h-20 w-20 rounded-full object-cover border-2 border-[#005691] shadow"
                      referrerPolicy="no-referrer"
                    />
                    <label htmlFor="avatar-file-upload" className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold">
                      Tải ảnh
                    </label>
                    <input
                      id="avatar-file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <h4 className="text-xs font-bold text-slate-800">Ảnh đại diện của bạn</h4>
                    <p className="text-[10px] text-slate-400 max-w-sm">
                      Tải lên một bức chân dung rõ mặt để hiển thị trên danh sách và báo cáo kết quả rèn luyện. Định dạng PNG, JPG, JPEG.
                    </p>
                    <label
                      htmlFor="avatar-file-upload"
                      className="inline-block mt-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer transition-colors"
                    >
                      Thay đổi ảnh đại diện
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Họ và tên */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wider">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={editForm.hoTen}
                      onChange={(e) => setEditForm(prev => ({ ...prev, hoTen: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  {/* Ngày sinh */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wider">Ngày sinh</label>
                    <input
                      type="date"
                      value={editForm.ngaySinh}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ngaySinh: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20"
                    />
                  </div>

                  {/* Giới tính */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wider">Giới tính</label>
                    <select
                      value={editForm.gioiTinh}
                      onChange={(e) => setEditForm(prev => ({ ...prev, gioiTinh: e.target.value as 'Nam' | 'Nữ' }))}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>



                  {/* Trường */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wider">Trường THPT lớp 12 học bạ</label>
                    <select
                      value={editForm.truong}
                      onChange={(e) => setEditForm(prev => ({ ...prev, truong: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20"
                    >
                      {TRUONG_LIST.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Chi đoàn */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wider">Chi đoàn địa bàn dân cư</label>
                    <input
                      type="text"
                      disabled
                      value={editForm.chiDoan}
                      className="w-full rounded-lg border border-slate-100 bg-slate-50 py-2 px-3 text-xs text-slate-500 cursor-not-allowed"
                      title="Chi đoàn địa bàn được ấn định bởi Ban chỉ huy Chi đoàn"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wider">Số điện thoại di động</label>
                    <input
                      type="tel"
                      value={editForm.sdt}
                      onChange={(e) => setEditForm(prev => ({ ...prev, sdt: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20"
                      placeholder="0901234567"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wider">Địa chỉ Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20"
                      placeholder="abc@example.com"
                    />
                  </div>

                  {/* Địa chỉ */}
                  <div className="space-y-1 col-span-1 sm:col-span-2">
                    <label className="block font-bold text-slate-400 uppercase tracking-wider">Địa chỉ thường trú liên lạc</label>
                    <textarea
                      rows={2}
                      value={editForm.diaChi}
                      onChange={(e) => setEditForm(prev => ({ ...prev, diaChi: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20"
                      placeholder="Số 123, đường ĐT743, khu phố Tân Hiệp, phường Tân Đông Hiệp..."
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm cursor-pointer transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#005691] hover:bg-[#004270] px-5 py-2 text-xs font-bold text-white shadow-md cursor-pointer transition-colors"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Thông tin hồ sơ Đoàn viên</h3>
                  <button
                    id="member-profile-edit-btn"
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 px-3 py-1.5 text-xs font-bold text-[#005691] transition-all cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Chỉnh sửa
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  
                  <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-400">Họ và tên:</span>
                    <span className="font-bold block text-slate-800 text-sm">{currentMember.hoTen}</span>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-400">Mã đoàn viên:</span>
                    <span className="font-mono font-bold block text-slate-800 text-sm">{currentMember.maDoanVien}</span>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-400">Ngày sinh:</span>
                    <span className="font-bold block text-slate-800">{currentMember.ngaySinh || 'Chưa cập nhật'}</span>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-400">Giới tính:</span>
                    <span className="font-bold block text-slate-800">{currentMember.gioiTinh || 'Chưa cập nhật'}</span>
                  </div>



                  <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-400">Chi đoàn địa bàn dân cư:</span>
                    <span className="font-bold block text-slate-800">{currentMember.chiDoan}</span>
                  </div>

                  <div className="space-y-1 col-span-1 sm:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-400">Trường THPT lớp 12 học bạ:</span>
                    <span className="font-bold block text-slate-800">{currentMember.truong}</span>
                  </div>

                  <div className="space-y-2 col-span-1 sm:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-400 block">Địa chỉ thường trú liên lạc:</span>
                    <span className="font-medium block text-slate-700">{currentMember.diaChi || 'Chưa cập nhật cụ thể'}</span>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-400 block">Số điện thoại di động:</span>
                    <span className="font-bold text-slate-700 block">{currentMember.sdt || 'Chưa cập nhật'}</span>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-400 block">Địa chỉ Email:</span>
                    <span className="font-bold text-slate-700 block">{currentMember.email || 'Chưa cập nhật'}</span>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-1 sm:col-span-2">
                    <span className="font-semibold text-slate-400 block">Trạng thái đoàn viên:</span>
                    <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 mt-1">
                      {currentMember.trangThai || 'Đang hoạt động'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick action buttons for mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                id="mob-btn-goto-act"
                onClick={() => setActiveTab('activities')}
                className="rounded-xl border border-[#005691]/20 bg-blue-50/50 hover:bg-blue-50 hover:shadow-md p-4 text-center space-y-1 transition-all cursor-pointer"
              >
                <Calendar className="h-6 w-6 mx-auto text-[#005691]" />
                <h4 className="font-bold text-xs text-slate-800">Xem danh sách hoạt động hè</h4>
                <p className="text-[10px] text-slate-400">Tìm kiếm các hoạt động rèn rèn hè mở rộng</p>
              </button>

              <button
                id="mob-btn-goto-submit"
                onClick={() => setActiveTab('submit')}
                className="rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-50 hover:shadow-md p-4 text-center space-y-1 transition-all cursor-pointer"
              >
                <Camera className="h-6 w-6 mx-auto text-teal-600" />
                <h4 className="font-bold text-xs text-slate-800">Nộp minh chứng TimeMark</h4>
                <p className="text-[10px] text-slate-400">Chụp ảnh kèm mốc giờ và tọa độ GPS</p>
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 2: ACTIVITIES CATALOG */}
        {activeTab === 'activities' && (
          <motion.div
            key="activities"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Danh mục hoạt động sinh hoạt hè</h2>
              <p className="text-xs text-slate-500">Danh sách các hoạt động hè đang diễn ra của Chi đoàn khu phố mở cho lớp 12</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activities.map(act => {
                // Check if already submitted
                const hasSubmission = proofs.find(p => p.doanVienId === currentMember.id && p.hoatDongId === act.id);
                
                return (
                  <div id={`member-act-card-${act.id}`} key={act.id} className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
                    
                    <div className="relative h-44 bg-slate-100 shrink-0">
                      <img
                        src={act.anh}
                        alt={act.ten}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2.5 left-2.5 rounded-full bg-slate-900/80 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                        {act.loai}
                      </span>
                      {act.locked && (
                        <span className="absolute top-2.5 left-20 rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <Lock className="h-2.5 w-2.5" /> Đã Khóa
                        </span>
                      )}
                      <div className="absolute top-2.5 right-2.5">
                        <span className="rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-black text-white shadow-md">
                          +{act.diemCong} Điểm
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                          {act.ten}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                          {act.moTa}
                        </p>
                      </div>

                      <div className="space-y-1 text-[10px] text-slate-400 border-t border-slate-50 pt-3">
                        <p className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-blue-500" />
                          <span>Thời gian tập trung: {act.thoiGian}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-red-500" />
                          <span>Địa điểm: {act.diaDiem}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          <span>Hạn nộp minh chứng: <strong>{act.hanNop}</strong></span>
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      {hasSubmission ? (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Trạng thái: <strong className="text-slate-700">{hasSubmission.status}</strong></span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Chưa nộp ảnh</span>
                      )}

                      <button
                        id={`member-submit-act-btn-${act.id}`}
                        onClick={() => {
                          if (act.locked) {
                            onShowNotification('Hoạt động này hiện đang khóa điểm danh và nộp minh chứng!', 'error');
                            return;
                          }
                          setSubmitActivityId(act.id);
                          setActiveTab('submit');
                        }}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm cursor-pointer transition-all ${
                          hasSubmission?.status === 'Đã duyệt' || act.locked
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : 'bg-[#005691] hover:bg-[#004270] text-white'
                        }`}
                        disabled={hasSubmission?.status === 'Đã duyệt' || act.locked}
                      >
                        {act.locked ? 'Đã khóa' : (hasSubmission ? 'Gửi lại minh chứng' : 'Nộp TimeMark')}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 3: TIMEMARK SUBMISSION FORM */}
        {activeTab === 'submit' && (
          <motion.div
            key="submit"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6 max-w-xl"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Cảm biến nộp ảnh TimeMark</h2>
              <p className="text-xs text-slate-500">Hệ thống tự động nhúng vệt mộc ngày giờ thực và tọa độ GPS định vị tại địa phương nhằm bảo chứng kết quả lao động.</p>
            </div>

            {isSelectedActivityLocked && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3 text-red-800 animate-pulse shadow-sm">
                <Lock className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider">Hoạt động hiện đang khóa điểm danh</h3>
                  <p className="text-[11px] text-red-700 leading-relaxed font-medium">
                    Bí thư Chi đoàn đã khóa tính năng nộp minh chứng cho hoạt động "{selectedActivity?.ten}". Bạn không thể thực hiện gửi bài hoặc điểm danh hoạt động này vào lúc này. Vui lòng chọn hoạt động khác.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitProof} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Chọn hoạt động hè đã tham gia *
                </label>
                <select
                  id="submit-activity-select"
                  value={submitActivityId}
                  onChange={(e) => setSubmitActivityId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20"
                >
                  <option value="">-- Chọn hoạt động nộp minh chứng --</option>
                  {activities.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.ten} (+{a.diemCong} điểm rèn luyện) {a.locked ? '(ĐÃ KHÓA)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Advanced Interactive simulated camera upload workspace */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Ảnh chụp hiện trường sinh hoạt thực tế *
                </label>
                
                <div className="space-y-4">
                  {selectedImage ? (
                    <div className="relative overflow-hidden rounded-xl bg-slate-900 aspect-video flex items-center justify-center border border-slate-100 shadow">
                      <img
                        src={selectedImage}
                        alt="TimeMark preview"
                        className="max-h-64 object-contain"
                        referrerPolicy="no-referrer"
                      />

                      {/* Change image trigger overlay */}
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={() => setSelectedImage(null)}
                          disabled={isSelectedActivityLocked}
                          className="rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700 shadow cursor-pointer text-xs disabled:bg-slate-300 disabled:cursor-not-allowed"
                          title="Hủy ảnh"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`rounded-xl border-2 border-dashed border-slate-200 p-6 text-center relative ${
                      isSelectedActivityLocked 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-slate-50 hover:bg-slate-100/50 hover:border-[#005691] cursor-pointer transition-all'
                    }`}>
                      <input
                        id="camera-sim-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isSelectedActivityLocked}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                      />
                      <Camera className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">Tải lên hoặc Chụp ảnh trực tiếp</p>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">
                        Ứng dụng sẽ tự động đóng dấu tọa độ định vị GPS địa phương và thời gian thực hiện để phê chuẩn minh chứng.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nhập nội dung đóng góp thực tế của em *
                </label>
                <textarea
                  id="submit-desc-textarea"
                  rows={3}
                  required
                  value={submitDesc}
                  onChange={(e) => setSubmitDesc(e.target.value)}
                  disabled={isSelectedActivityLocked}
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                  placeholder="Em đã làm những công việc gì, thuộc tổ đội nào, đóng góp thế nào trong buổi sinh hoạt..."
                />
              </div>

              <button
                id="submit-proof-btn"
                type="submit"
                disabled={isSelectedActivityLocked}
                className={`w-full rounded-xl py-2.5 text-xs font-bold text-white shadow-md transition-all ${
                  isSelectedActivityLocked
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:brightness-110 active:scale-[0.99] cursor-pointer'
                }`}
              >
                {isSelectedActivityLocked ? 'Đã khóa nhận minh chứng cho hoạt động này' : 'Gửi minh chứng lên Bí thư chi đoàn'}
              </button>
            </form>
          </motion.div>
        )}

        {/* TAB 4: SUBMISSION HISTORY */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Lịch sử minh chứng đã nộp</h2>
              <p className="text-xs text-slate-500">Xem lại trạng thái rà soát điểm rèn luyện rèn hè và phản hồi từ Bí thư chi đoàn</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                      <th className="p-4">Ảnh/Mã</th>
                      <th className="p-4">Tên hoạt động hè</th>
                      <th className="p-4">Thời gian nộp</th>
                      <th className="p-4">Chứng thực TimeMark</th>
                      <th className="p-4 text-center">Trạng thái duyệt</th>
                      <th className="p-4">Phản hồi từ Bí thư</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {proofs.filter(p => p.doanVienId === currentMember.id).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          Bạn chưa gửi minh chứng nào lên hệ thống.
                        </td>
                      </tr>
                    ) : (
                      proofs.filter(p => p.doanVienId === currentMember.id).map(p => {
                        const act = activities.find(a => a.id === p.hoatDongId);
                        
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 whitespace-nowrap">
                              <img
                                src={p.imageUrl}
                                alt="Proof"
                                className="h-10 w-14 object-cover rounded border"
                                referrerPolicy="no-referrer"
                              />
                            </td>
                            <td className="p-4 font-bold text-slate-800 max-w-xs">
                              <p className="truncate" title={act?.ten}>{act?.ten || 'Hoạt động đã kết thúc'}</p>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-normal italic">
                                "{p.moTa}"
                              </span>
                            </td>
                            <td className="p-4 font-mono text-slate-500 whitespace-nowrap">
                              {p.createdAt}
                            </td>
                            <td className="p-4 text-slate-400 max-w-xxs truncate" title={p.locationMark}>
                              <p className="text-[10px] font-bold text-emerald-600 font-mono flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {p.timeMark || p.createdAt}
                              </p>
                              <p className="text-[9px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 text-red-400" /> {p.locationMark}
                              </p>
                            </td>
                            <td className="p-4 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                p.status === 'Đã duyệt'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : p.status === 'Không đạt'
                                  ? 'bg-red-50 text-red-700 border border-red-100'
                                  : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-slate-500 max-w-xs">
                              {p.status === 'Đã duyệt' && (
                                <span className="text-emerald-600 font-semibold">✓ Đã phê chuẩn cộng điểm rèn luyện!</span>
                              )}
                              {p.status === 'Không đạt' && (
                                <p className="text-red-500 font-bold bg-red-50 p-1.5 rounded text-[10px] border border-red-100">
                                  Lý do: "{p.rejectedReason || 'Thiếu ảnh thực tế'}"
                                </p>
                              )}
                              {p.status === 'Chờ duyệt' && (
                                <span className="text-amber-600">Đang xếp hàng chờ xem xét rà soát...</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-4 py-2 flex justify-around items-center z-40">
        <button
          id="mobile-nav-profile"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 cursor-pointer py-1.5 transition-all w-16 ${
            activeTab === 'profile' ? 'text-[#005691] scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <UserIcon className="h-5 w-5" />
          <span className="text-[10px] font-black tracking-tight">Cá nhân</span>
        </button>

        <button
          id="mobile-nav-activities"
          onClick={() => setActiveTab('activities')}
          className={`flex flex-col items-center gap-1 cursor-pointer py-1.5 transition-all w-16 ${
            activeTab === 'activities' ? 'text-[#005691] scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-[10px] font-black tracking-tight">Hoạt động</span>
        </button>

        <button
          id="mobile-nav-submit"
          onClick={() => setActiveTab('submit')}
          className={`flex flex-col items-center gap-1 cursor-pointer py-1.5 transition-all w-16 ${
            activeTab === 'submit' ? 'text-[#005691] scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Camera className="h-5 w-5" />
          <span className="text-[10px] font-black tracking-tight">Nộp ảnh</span>
        </button>

        <button
          id="mobile-nav-history"
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 cursor-pointer py-1.5 transition-all w-16 relative ${
            activeTab === 'history' ? 'text-[#005691] scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <History className="h-5 w-5" />
          <span className="text-[10px] font-black tracking-tight">Lịch sử</span>
          {studentStats.totalSubmitted > 0 && (
            <span className="absolute top-1 right-2 bg-[#005691] text-white text-[8px] font-black px-1.5 py-0.2 rounded-full shadow border border-white">
              {studentStats.totalSubmitted}
            </span>
          )}
        </button>
      </div>

    </div>
  );
}
