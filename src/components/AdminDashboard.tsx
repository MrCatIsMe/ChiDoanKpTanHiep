import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import AnimatedCounter from './AnimatedCounter';
import { DoanVien, HoatDong, MinhChung, User, TruongHoc } from '../types';
import { TRUONG_LIST, CHI_DOAN_LIST } from '../data/mockData';
import { compressAndResizeImage } from '../utils/image';
import { 
  LayoutDashboard, Users, Calendar, FileCheck, FileBarChart, Settings, 
  Plus, Edit, Trash2, Search, Filter, Download, Upload, Check, X, 
  TrendingUp, Award, MapPin, Clock, CalendarIcon, CheckCircle2, AlertTriangle, HelpCircle,
  LogOut, Phone, Mail, ChevronRight, UserPlus, FileSpreadsheet, Eye, Info, School,
  Lock, Unlock, Printer, FileText, Home, KeyRound
} from 'lucide-react';

const ANONYMOUS_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="%23f1f5f9"/><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="%23cbd5e1"/></svg>';
const FEMALE_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
const MALE_AVATAR = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80';

interface AdminDashboardProps {
  currentUser: User;
  onLogout: () => void;
  onGoToLanding?: () => void;
  members: DoanVien[];
  setMembers: React.Dispatch<React.SetStateAction<DoanVien[]>>;
  activities: HoatDong[];
  setActivities: React.Dispatch<React.SetStateAction<HoatDong[]>>;
  proofs: MinhChung[];
  setProofs: React.Dispatch<React.SetStateAction<MinhChung[]>>;
  truongHoc: TruongHoc[];
  setTruongHoc: React.Dispatch<React.SetStateAction<TruongHoc[]>>;
  onShowNotification: (msg: string, type: 'success' | 'error') => void;
  users?: User[];
  setUsers?: React.Dispatch<React.SetStateAction<User[]>>;
}

export default function AdminDashboard({
  currentUser,
  onLogout,
  onGoToLanding,
  members,
  setMembers,
  activities,
  setActivities,
  proofs,
  setProofs,
  truongHoc,
  setTruongHoc,
  onShowNotification,
  users,
  setUsers
}: AdminDashboardProps) {
  
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'activities' | 'proofs' | 'reports' | 'diaban'>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Custom confirmation modal state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  } | null>(null);

  const triggerConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    type: 'danger' | 'warning' | 'info' = 'info'
  ) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmState(null);
      },
      type
    });
  };

  // TruongHoc state & helpers
  const [truongHocSearch, setTruongHocSearch] = useState('');
  const [showTruongHocModal, setShowTruongHocModal] = useState(false);
  const [editingTruongHoc, setEditingTruongHoc] = useState<TruongHoc | null>(null);
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);
  const [truongHocForm, setTruongHocForm] = useState<Omit<TruongHoc, 'id'>>({
    tenTruong: '',
    diaChi: '',
    hieuTruong: '',
    sdtLienHe: '',
    moTa: ''
  });

  const activeSchoolsList = useMemo(() => {
    if (truongHoc && truongHoc.length > 0) {
      return truongHoc.map(t => t.tenTruong);
    }
    return TRUONG_LIST;
  }, [truongHoc]);

  const handleOpenAddTruongHoc = () => {
    setEditingTruongHoc(null);
    setTruongHocForm({
      tenTruong: '',
      diaChi: '',
      hieuTruong: '',
      sdtLienHe: '',
      moTa: ''
    });
    setShowTruongHocModal(true);
  };

  const handleOpenEditTruongHoc = (th: TruongHoc) => {
    setEditingTruongHoc(th);
    setTruongHocForm({
      tenTruong: th.tenTruong,
      diaChi: th.diaChi,
      hieuTruong: th.hieuTruong,
      sdtLienHe: th.sdtLienHe,
      moTa: th.moTa || ''
    });
    setShowTruongHocModal(true);
  };

  const handleSaveTruongHoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!truongHocForm.tenTruong.trim() || !truongHocForm.diaChi.trim()) {
      onShowNotification('Vui lòng điền đầy đủ Tên trường học và Địa chỉ!', 'error');
      return;
    }

    const actionText = editingTruongHoc ? 'cập nhật thông tin' : 'thêm mới';
    triggerConfirm(
      'Xác nhận thông tin trường học',
      `Bạn có chắc chắn muốn ${actionText} trường học "${truongHocForm.tenTruong}" không?`,
      () => {
        if (editingTruongHoc) {
          // Update
          const oldName = editingTruongHoc.tenTruong;
          const newName = truongHocForm.tenTruong.trim();
          
          setTruongHoc(prev => prev.map(th => th.id === editingTruongHoc.id ? { ...th, ...truongHocForm, tenTruong: newName } : th));
          
          if (oldName !== newName) {
            setMembers(prev => prev.map(m => m.truong === oldName ? { ...m, truong: newName } : m));
          }
          
          onShowNotification(`Đã cập nhật trường học "${newName}" thành công!`, 'success');
        } else {
          // Create new
          const newTruongHoc: TruongHoc = {
            id: `school-${Date.now()}`,
            ...truongHocForm
          };
          setTruongHoc(prev => [...prev, newTruongHoc]);
          onShowNotification(`Đã thêm mới trường học "${truongHocForm.tenTruong}" thành công!`, 'success');
        }
        setShowTruongHocModal(false);
      }
    );
  };

  const handleDeleteTruongHoc = (id: string, name: string) => {
    // Check if there are any members in this school
    const enrolledCount = members.filter(m => m.truong === name).length;
    if (enrolledCount > 0) {
      onShowNotification(`Không thể xóa trường học này vì đang có ${enrolledCount} đoàn viên đang học tập!`, 'error');
      return;
    }

    triggerConfirm(
      'Xóa trường học liên kết',
      `Bạn có chắc chắn muốn xóa trường học "${name}" này khỏi hệ thống không?`,
      () => {
        setTruongHoc(prev => prev.filter(th => th.id !== id));
        onShowNotification(`Đã xóa trường học "${name}" khỏi hệ thống!`, 'success');
      },
      'danger'
    );
  };
  
  // Search & Filter state for Members
  const [memberSearch, setMemberSearch] = useState('');
  const [memberFilterSchool, setMemberFilterSchool] = useState('All');
  
  // Search state for Activities
  const [activitySearch, setActivitySearch] = useState('');

  // Manual score adjustment state
  const [scoringMember, setScoringMember] = useState<DoanVien | null>(null);
  const [scoringType, setScoringType] = useState<'Cộng' | 'Trừ'>('Cộng');
  const [scoringAmount, setScoringAmount] = useState<number>(10);
  const [scoringReason, setScoringReason] = useState<string>('Tích cực tham gia hoạt động, phong trào');
  const [customScoringReason, setCustomScoringReason] = useState<string>('');

  // Modals state
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<DoanVien | null>(null);
  
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<HoatDong | null>(null);

  const [reviewingProof, setReviewingProof] = useState<MinhChung | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [attendanceModalActivity, setAttendanceModalActivity] = useState<HoatDong | null>(null);
  const [attendanceTab, setAttendanceTab] = useState<'joined' | 'absent'>('joined');
  const [modalSearch, setModalSearch] = useState('');

  // Member form state
  const [memberForm, setMemberForm] = useState<Omit<DoanVien, 'id' | 'diemTichLuy' | 'gioiTinh'> & { gioiTinh: 'Nam' | 'Nữ' | '' }>({
    maDoanVien: '',
    hoTen: '',
    ngaySinh: '2008-01-01',
    gioiTinh: '',
    sdt: '',
    email: '',
    truong: TRUONG_LIST[0],
    lop: 'N/A',
    chiDoan: CHI_DOAN_LIST[0],
    diaChi: '',
    anhDaiDien: ANONYMOUS_AVATAR,
    trangThai: 'Đang hoạt động'
  });

  // Activity form state
  const [activityForm, setActivityForm] = useState<Omit<HoatDong, 'id'>>({
    ten: '',
    anh: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    moTa: '',
    thoiGian: '2026-07-01 08:00',
    diaDiem: 'Văn phòng chi đoàn',
    hanNop: '2026-07-02 17:00',
    diemCong: 20,
    loai: 'Tình nguyện',
    locked: false
  });

  // TruongHoc state and helpers moved to the top level of the component for easy use

  // Open member modal for create
  const generateUniqueMaDoanVien = () => {
    let index = members.length + 101;
    let code = `DV12${String(index).padStart(3, '0')}`;
    while (members.some(m => m.maDoanVien.toLowerCase() === code.toLowerCase())) {
      index++;
      code = `DV12${String(index).padStart(3, '0')}`;
    }
    return code;
  };

  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemberForm({
      maDoanVien: generateUniqueMaDoanVien(),
      hoTen: '',
      ngaySinh: '2008-01-01',
      gioiTinh: '',
      sdt: '',
      email: '',
      truong: TRUONG_LIST[0],
      lop: 'N/A',
      chiDoan: CHI_DOAN_LIST[0],
      diaChi: '',
      anhDaiDien: ANONYMOUS_AVATAR,
      trangThai: 'Đang hoạt động'
    });
    setShowMemberModal(true);
  };

  // Open member modal for edit
  const handleOpenEditMember = (m: DoanVien) => {
    setEditingMember(m);
    setMemberForm({
      maDoanVien: m.maDoanVien,
      hoTen: m.hoTen,
      ngaySinh: m.ngaySinh,
      gioiTinh: m.gioiTinh,
      sdt: m.sdt,
      email: m.email,
      truong: m.truong,
      lop: m.lop,
      chiDoan: m.chiDoan,
      diaChi: m.diaChi,
      anhDaiDien: m.anhDaiDien,
      trangThai: m.trangThai
    });
    setShowMemberModal(true);
  };

  // Submit member form
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.hoTen || !memberForm.maDoanVien || !memberForm.email) {
      onShowNotification('Vui lòng điền đầy đủ Mã đoàn viên, Họ tên và Email', 'error');
      return;
    }

    const actionText = editingMember ? 'cập nhật thông tin' : 'thêm mới';
    triggerConfirm(
      'Xác nhận thông tin đoàn viên',
      `Bạn có chắc chắn muốn ${actionText} đoàn viên "${memberForm.hoTen}" không?`,
      () => {
        const emailLower = memberForm.email.toLowerCase();
        const maDVLower = memberForm.maDoanVien.toLowerCase();

        if (editingMember) {
          // Check for duplicate email or maDoanVien under other members
          const emailExists = members.some(m => m.id !== editingMember.id && m.email.toLowerCase() === emailLower) || 
                              (users && users.some(u => u.doanVienId !== editingMember.id && u.email.toLowerCase() === emailLower));
          const maDVExists = members.some(m => m.id !== editingMember.id && m.maDoanVien.toLowerCase() === maDVLower);
          
          if (emailExists) {
            onShowNotification('Email này đã được sử dụng bởi một đoàn viên khác trong hệ thống!', 'error');
            return;
          }
          if (maDVExists) {
            onShowNotification('Mã đoàn viên này đã tồn tại trong hệ thống!', 'error');
            return;
          }

          // Edit
          setMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...memberForm } : m));
          if (setUsers) {
            setUsers(prev => prev.map(u => u.doanVienId === editingMember.id ? { ...u, email: memberForm.email } : u));
          }
          onShowNotification(`Đã cập nhật thông tin đoàn viên ${memberForm.hoTen}`, 'success');
        } else {
          // Check for duplicate email or maDoanVien
          const emailExists = members.some(m => m.email.toLowerCase() === emailLower) || 
                              (users && users.some(u => u.email.toLowerCase() === emailLower));
          const maDVExists = members.some(m => m.maDoanVien.toLowerCase() === maDVLower);

          if (emailExists) {
            onShowNotification('Email này đã được sử dụng hoặc đăng ký trong hệ thống!', 'error');
            return;
          }
          if (maDVExists) {
            onShowNotification('Mã đoàn viên này đã tồn tại trong hệ thống!', 'error');
            return;
          }

          // Create
          const newMemberId = `dv-${Date.now()}`;
          const newMember: DoanVien = {
            id: newMemberId,
            ...memberForm,
            diemTichLuy: 0
          };
          setMembers(prev => [newMember, ...prev]);
          if (setUsers) {
            const newUser: User = {
              id: `u-${Date.now()}`,
              email: memberForm.email,
              role: 'member',
              doanVienId: newMemberId
            };
            setUsers(prev => [newUser, ...prev]);
          }
          onShowNotification(`Đã thêm mới đoàn viên ${memberForm.hoTen}`, 'success');
        }
        setShowMemberModal(false);
      }
    );
  };

  // Delete member
  const handleDeleteMember = (id: string, name: string) => {
    const memberToDelete = members.find(m => m.id === id);
    const emailToDelete = memberToDelete?.email;

    triggerConfirm(
      'Xóa hồ sơ đoàn viên',
      `Bạn có chắc chắn muốn xóa đoàn viên ${name}? Mọi dữ liệu minh chứng liên quan cũng sẽ bị ảnh hưởng.`,
      () => {
        setMembers(prev => prev.filter(m => m.id !== id));
        setProofs(prev => prev.filter(p => p.doanVienId !== id));
        if (setUsers) {
          setUsers(prev => prev.filter(u => {
            const matchesId = u.doanVienId === id;
            const matchesEmail = emailToDelete && u.email.toLowerCase() === emailToDelete.toLowerCase();
            return !matchesId && !matchesEmail;
          }));
        }
        onShowNotification(`Đã xóa đoàn viên ${name}`, 'success');
      },
      'danger'
    );
  };

  // Toggle lock member
  const handleToggleLockMember = (id: string, name: string, currentlyLocked: boolean) => {
    triggerConfirm(
      currentlyLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
      currentlyLocked 
        ? `Bạn có chắc chắn muốn mở khóa tài khoản cho đoàn viên ${name}?` 
        : `Bạn có chắc chắn muốn khóa tài khoản cho đoàn viên ${name}? Sau khi khóa, đoàn viên sẽ không thể đăng nhập vào hệ thống.`,
      () => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, isLocked: !currentlyLocked } : m));
        if (setUsers) {
          setUsers(prev => prev.map(u => u.doanVienId === id ? { ...u, isLocked: !currentlyLocked } : u));
        }
        onShowNotification(
          currentlyLocked ? `Đã mở khóa tài khoản đoàn viên ${name}` : `Đã khóa tài khoản đoàn viên ${name}`, 
          'success'
        );
      },
      currentlyLocked ? 'info' : 'danger'
    );
  };

  // Submit manual scoring form
  const handleSaveScoring = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoringMember) return;
    
    const finalReason = scoringReason === 'Khác (nhập chi tiết)' 
      ? customScoringReason.trim() 
      : scoringReason;
      
    if (!finalReason) {
      onShowNotification('Vui lòng nhập lý do cụ thể!', 'error');
      return;
    }
    
    if (scoringAmount <= 0) {
      onShowNotification('Số điểm phải lớn hơn 0!', 'error');
      return;
    }

    const pointsDiff = scoringType === 'Cộng' ? scoringAmount : -scoringAmount;
    
    // Create history entry
    const newHistoryEntry = {
      id: `score-his-${Date.now()}`,
      nguoiThucHien: currentUser.email || 'Admin',
      thoiGian: new Date().toISOString(),
      loai: scoringType,
      soDiem: scoringAmount,
      lyDo: finalReason
    };

    triggerConfirm(
      scoringType === 'Cộng' ? 'Cộng điểm rèn luyện' : 'Trừ điểm rèn luyện',
      `Xác nhận ${scoringType === 'Cộng' ? 'cộng' : 'trừ'} ${scoringAmount} điểm cho đoàn viên "${scoringMember.hoTen}" với lý do: "${finalReason}"?`,
      () => {
        setMembers(prev => prev.map(m => {
          if (m.id === scoringMember.id) {
            const updatedHistory = m.lichSuDiem ? [...m.lichSuDiem, newHistoryEntry] : [newHistoryEntry];
            const updatedScore = Math.max(0, m.diemTichLuy + pointsDiff);
            return {
              ...m,
              diemTichLuy: updatedScore,
              lichSuDiem: updatedHistory
            };
          }
          return m;
        }));

        onShowNotification(`Đã ${scoringType === 'Cộng' ? 'cộng' : 'trừ'} ${scoringAmount} điểm cho đoàn viên ${scoringMember.hoTen}`, 'success');
        
        // Update the current scoring member in state so the history logs list refreshes inside the modal!
        setScoringMember(prev => {
          if (!prev) return null;
          const updatedHistory = prev.lichSuDiem ? [...prev.lichSuDiem, newHistoryEntry] : [newHistoryEntry];
          const updatedScore = Math.max(0, prev.diemTichLuy + pointsDiff);
          return {
            ...prev,
            diemTichLuy: updatedScore,
            lichSuDiem: updatedHistory
          };
        });

        // Reset inputs
        setScoringAmount(10);
        setCustomScoringReason('');
      }
    );
  };



  // Render Attendance & Participation report modal
  const handleRenderAttendanceModal = () => {
    if (!attendanceModalActivity) return null;

    const act = attendanceModalActivity;
    const approvedProofs = proofs.filter(p => p.hoatDongId === act.id && p.status === 'Đã duyệt');
    
    const joinedMembers = members.filter(m => approvedProofs.some(p => p.doanVienId === m.id));
    const absentMembers = members.filter(m => !approvedProofs.some(p => p.doanVienId === m.id));

    const totalCount = members.length;
    const joinedCount = joinedMembers.length;
    const absentCount = absentMembers.length;
    const rate = totalCount > 0 ? Math.round((joinedCount / totalCount) * 100) : 0;

    const searchLower = (modalSearch || '').toLowerCase();
    const filteredJoined = joinedMembers.filter(m => 
      m.hoTen.toLowerCase().includes(searchLower) || 
      m.maDoanVien.toLowerCase().includes(searchLower) ||
      m.truong.toLowerCase().includes(searchLower)
    );

    const filteredAbsent = absentMembers.filter(m => 
      m.hoTen.toLowerCase().includes(searchLower) || 
      m.maDoanVien.toLowerCase().includes(searchLower) ||
      m.truong.toLowerCase().includes(searchLower)
    );

    const activeList = attendanceTab === 'joined' ? filteredJoined : filteredAbsent;

    return (
      <div 
        id="attendance-modal-overlay"
        onClick={() => { setAttendanceModalActivity(null); setModalSearch(''); }}
        className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm cursor-pointer sm:items-center animate-fade-in"
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col cursor-default my-auto relative"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[#005691] to-[#0082c8] p-5 text-white flex items-center justify-between">
            <div className="space-y-1 text-left">
              <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">Thống kê hoạt động hè</span>
              <h3 className="text-sm sm:text-base font-extrabold line-clamp-1">{act.ten}</h3>
            </div>
            <button 
              onClick={() => { setAttendanceModalActivity(null); setModalSearch(''); }}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Statistics Grid */}
          <div className="p-5 bg-slate-50 border-b border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Tổng số đoàn viên</span>
              <p className="text-xl font-black text-slate-800 mt-0.5">{totalCount} ĐV</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wide">Đã tham gia (Đạt)</span>
              <p className="text-xl font-black text-emerald-600 mt-0.5">{joinedCount} ĐV</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-[10px] font-black text-red-400 uppercase tracking-wide">Vắng / Chưa đạt</span>
              <p className="text-xl font-black text-red-500 mt-0.5">{absentCount} ĐV</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
              <span className="text-[10px] font-black text-[#005691] uppercase tracking-wide">Tỷ lệ tham gia</span>
              <p className="text-xl font-black text-[#005691] mt-0.5">{rate}%</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
                <div className="h-full bg-[#005691] transition-all duration-500" style={{ width: `${rate}%` }}></div>
              </div>
            </div>
          </div>

          {/* Search and Tabs */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-left">
            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setAttendanceTab('joined')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  attendanceTab === 'joined'
                    ? 'bg-white text-[#005691] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đã tham gia ({joinedCount})
              </button>
              <button
                onClick={() => setAttendanceTab('absent')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  attendanceTab === 'absent'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Vắng / Không tham gia ({absentCount})
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm đoàn viên..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#005691]/20 transition-colors"
              />
            </div>
          </div>

          {/* List Section */}
          <div className="overflow-y-auto max-h-96 p-5">
            {activeList.length === 0 ? (
              <div className="text-center p-8 text-slate-400 text-xs">
                Không tìm thấy đoàn viên nào khớp với tìm kiếm.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                      <th className="p-3 text-center w-12">STT</th>
                      <th className="p-3">Họ và tên</th>
                      <th className="p-3">Mã đoàn viên</th>
                      <th className="p-3">Trường học</th>
                      <th className="p-3">Số điện thoại</th>
                      <th className="p-3 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeList.map((m, idx) => {
                      const proof = approvedProofs.find(p => p.doanVienId === m.id);
                      
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <img 
                                src={m.anhDaiDien} 
                                alt={m.hoTen} 
                                className="h-7 w-7 rounded-full border object-cover shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <span className="font-bold text-slate-700">{m.hoTen}</span>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-500 font-bold">{m.maDoanVien}</td>
                          <td className="p-3 text-slate-500 font-semibold">{m.truong}</td>
                          <td className="p-3 font-semibold text-slate-600">{m.sdt}</td>
                          <td className="p-3 text-center whitespace-nowrap">
                            {attendanceTab === 'joined' ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[9px] font-black text-emerald-600 border border-emerald-100">
                                  <Check className="h-2.5 w-2.5" /> ĐÃ ĐẠT
                                </span>
                                {proof?.approvedAt && (
                                  <span className="text-[8px] text-slate-400 mt-0.5 font-mono">Duyệt: {new Date(proof.approvedAt).toLocaleDateString('vi-VN')}</span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[9px] font-black text-red-600 border border-red-100">
                                <X className="h-2.5 w-2.5" /> VẮNG MẶT
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => { setAttendanceModalActivity(null); setModalSearch(''); }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Open activity modal for create
  const handleOpenAddActivity = () => {
    setEditingActivity(null);
    setActivityForm({
      ten: '',
      anh: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
      moTa: '',
      thoiGian: '2026-07-01 08:00',
      diaDiem: 'Văn phòng Khu phố',
      hanNop: '2026-07-02 18:00',
      diemCong: 20,
      loai: 'Tình nguyện',
      locked: false
    });
    setShowActivityModal(true);
  };

  // Open activity modal for edit
  const handleOpenEditActivity = (act: HoatDong) => {
    setEditingActivity(act);
    setActivityForm({
      ten: act.ten,
      anh: act.anh,
      moTa: act.moTa,
      thoiGian: act.thoiGian,
      diaDiem: act.diaDiem,
      hanNop: act.hanNop,
      diemCong: act.diemCong,
      loai: act.loai,
      locked: act.locked || false
    });
    setShowActivityModal(true);
  };

  // Save Activity
  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.ten || !activityForm.moTa) {
      onShowNotification('Vui lòng nhập tên và mô tả hoạt động', 'error');
      return;
    }

    const actionText = editingActivity ? 'cập nhật thông tin' : 'thành lập';
    triggerConfirm(
      'Xác nhận thông tin hoạt động',
      `Bạn có chắc chắn muốn ${actionText} hoạt động "${activityForm.ten}" không?`,
      () => {
        if (editingActivity) {
          setActivities(prev => prev.map(a => a.id === editingActivity.id ? { ...a, ...activityForm } : a));
          onShowNotification(`Đã cập nhật hoạt động: ${activityForm.ten}`, 'success');
        } else {
          const newAct: HoatDong = {
            id: `hd-${Date.now()}`,
            ...activityForm
          };
          setActivities(prev => [newAct, ...prev]);
          onShowNotification(`Đã tạo hoạt động mới: ${activityForm.ten}`, 'success');
        }
        setShowActivityModal(false);
      }
    );
  };

  // Delete activity
  const handleDeleteActivity = (id: string, title: string) => {
    triggerConfirm(
      'Xóa hoạt động',
      `Bạn có chắc chắn muốn xóa hoạt động "${title}"? Mọi minh chứng liên quan sẽ bị loại bỏ.`,
      () => {
        setActivities(prev => prev.filter(a => a.id !== id));
        setProofs(prev => prev.filter(p => p.hoatDongId !== id));
        onShowNotification('Đã xóa hoạt động và các minh chứng kèm theo', 'success');
      },
      'danger'
    );
  };

  // Toggle lock individual activity
  const handleToggleLockActivity = (id: string, currentLocked: boolean, title: string) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, locked: !currentLocked } : a));
    onShowNotification(
      currentLocked 
        ? `Đã mở khóa điểm danh cho hoạt động: "${title}"` 
        : `Đã khóa điểm danh cho hoạt động: "${title}"`, 
      'success'
    );
  };

  // Approve Proof
  const handleApproveProof = (proofId: string) => {
    const proof = proofs.find(p => p.id === proofId);
    if (!proof) return;

    // Find the student and add points
    const student = members.find(m => m.id === proof.doanVienId);
    const activity = activities.find(a => a.id === proof.hoatDongId);
    
    if (student && activity) {
      // Award points
      setMembers(prev => prev.map(m => m.id === student.id ? { ...m, diemTichLuy: m.diemTichLuy + activity.diemCong } : m));
      // Update proof status
      setProofs(prev => prev.map(p => p.id === proofId ? { 
        ...p, 
        status: 'Đã duyệt', 
        approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) 
      } : p));
      
      onShowNotification(`Đã duyệt minh chứng. Cộng ${activity.diemCong} điểm cho đoàn viên ${student.hoTen}`, 'success');
      setReviewingProof(null);
    }
  };

  // Reject Proof
  const handleRejectProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingProof) return;
    if (!rejectReason.trim()) {
      onShowNotification('Vui lòng điền lý do từ chối để đoàn viên biết cách sửa đổi', 'error');
      return;
    }

    setProofs(prev => prev.map(p => p.id === reviewingProof.id ? {
      ...p,
      status: 'Không đạt',
      rejectedReason: rejectReason,
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    } : p));

    onShowNotification(`Đã từ chối minh chứng của đoàn viên`, 'success');
    setReviewingProof(null);
    setRejectReason('');
  };

  // EXPORT EXCEL (.xlsx) Multi-sheet standard implementation
  const handleExportXLSX = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Danh sách Đoàn viên
      const sortedMembers = [...members].sort((a,b) => b.diemTichLuy - a.diemTichLuy);
      const membersData = sortedMembers.map((m, idx) => {
        const approvedCount = proofs.filter(p => p.doanVienId === m.id && p.status === 'Đã duyệt').length;
        
        let classification = 'Chưa hoàn thành';
        if (m.diemTichLuy >= 80) {
          classification = 'Đoàn viên Xuất Sắc';
        } else if (m.diemTichLuy >= 40) {
          classification = 'Đoàn viên Khá';
        } else if (m.diemTichLuy > 0) {
          classification = 'Đoàn viên Trung bình';
        }

        return {
          'Hạng': idx + 1,
          'Mã Đoàn Viên': m.maDoanVien,
          'Họ và Tên': m.hoTen,
          'Ngày Sinh': m.ngaySinh,
          'Giới Tính': m.gioiTinh,
          'Số Điện Thoại': m.sdt,
          'Email': m.email,
          'Trường THPT Liên Kết': m.truong,
          'Chi Đoàn Địa Bàn': m.chiDoan,
          'Minh Chứng Đã Duyệt': approvedCount,
          'Điểm Tích Lũy Hè': m.diemTichLuy,
          'Xếp Loại Rèn Luyện': classification,
          'Trạng Thái Duyệt Học Bạ': m.trangThai
        };
      });

      const wsMembers = XLSX.utils.json_to_sheet(membersData);
      wsMembers['!cols'] = [
        { wch: 6 },  // Hang
        { wch: 15 }, // Ma Doan Vien
        { wch: 22 }, // Ho va Ten
        { wch: 12 }, // Ngay Sinh
        { wch: 10 }, // Gioi Tinh
        { wch: 15 }, // SDT
        { wch: 25 }, // Email
        { wch: 30 }, // Truong THPT
        { wch: 10 }, // Lop
        { wch: 15 }, // Chi Doan
        { wch: 20 }, // Minh Chung Da Duyet
        { wch: 15 }, // Diem Tich Luy He
        { wch: 22 }, // Xep Loai Ren Luyen
        { wch: 15 }  // Trang Thai So
      ];
      XLSX.utils.book_append_sheet(wb, wsMembers, 'Ket Qua Ren Luyen He');

      // Sheet 2: Danh sách Hoạt động hè
      const activitiesData = activities.map(a => ({
        'Mã Hoạt Động': a.id,
        'Tên Hoạt Động': a.ten,
        'Loại Hoạt Động': a.loai,
        'Địa Điểm': a.diaDiem,
        'Thời Gian': a.thoiGian,
        'Điểm Cộng': a.diemCong,
        'Mốc Hạn Nộp': a.hanNop,
        'Mô Tả Chi Tiết': a.moTa,
        'Trạng Thái Nhận': a.locked ? 'ĐÃ KHÓA' : 'ĐANG MỞ'
      }));
      const wsAct = XLSX.utils.json_to_sheet(activitiesData);
      wsAct['!cols'] = [
        { wch: 12 }, { wch: 35 }, { wch: 15 }, { wch: 25 }, { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 40 }, { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(wb, wsAct, 'Hoat Dong Ren Luyen');

      // Sheet 3: Danh sách Minh chứng nộp
      const proofsData = proofs.map(p => {
        const member = members.find(m => m.id === p.doanVienId);
        const activity = activities.find(a => a.id === p.hoatDongId);
        return {
          'Mã Minh Chứng': p.id,
          'Đoàn Viên Nộp': member ? member.hoTen : 'Không rõ ID',
          'Mã Số ĐV': member ? member.maDoanVien : '',
          'Trường THPT': member ? member.truong : '',
          'Hoạt Động': activity ? activity.ten : 'Không rõ ID',
          'Thời Gian Tạo': p.createdAt,
          'Thời Gian Chụp (TimeMark)': p.timeMark || 'Không có',
          'Vị Trí GPS (LocationMark)': p.locationMark || 'Không có',
          'Ghi Chú Công Việc': p.moTa,
          'Trạng Thái Duyệt': p.status,
          'Thời Gian Duyệt': p.approvedAt || '',
          'Lý Do Từ Chối': p.rejectedReason || ''
        };
      });
      const wsProofs = XLSX.utils.json_to_sheet(proofsData);
      wsProofs['!cols'] = [
        { wch: 15 }, { wch: 22 }, { wch: 15 }, { wch: 30 }, { wch: 30 }, { wch: 18 }, { wch: 25 }, { wch: 25 }, { wch: 35 }, { wch: 15 }, { wch: 18 }, { wch: 25 }
      ];
      XLSX.utils.book_append_sheet(wb, wsProofs, 'Minh Chung Da Nop');

      // Save file as XLSX standard
      XLSX.writeFile(wb, 'BAO_CAO_CHUAN_DIEM_REN_LUYEN_HE_2026.xlsx');
      onShowNotification('Đã xuất báo cáo Excel (.xlsx) chuẩn thành công!', 'success');
    } catch (err: any) {
      console.error(err);
      onShowNotification('Có lỗi khi xuất file Excel, đang tự động chuyển về xuất CSV', 'error');
      handleExportCSV();
    }
  };

  // EXPORT EXCEL (CSV) Real Implementation
  const handleExportCSV = () => {
    // Generate CSV string
    const headers = ['Ma Doan Vien', 'Ho Ten', 'Ngay Sinh', 'Gioi Tinh', 'SDT', 'Email', 'Truong THPT', 'Chi Doan', 'Diem Tich Luy', 'Trang Thai'];
    const rows = members.map(m => [
      m.maDoanVien,
      `"${m.hoTen}"`,
      m.ngaySinh,
      m.gioiTinh,
      `'${m.sdt}`,
      m.email,
      `"${m.truong}"`,
      `"${m.chiDoan}"`,
      m.diemTichLuy,
      m.trangThai
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'DANH_SACH_DOAN_VIEN_KHOI_12.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onShowNotification('Đã xuất thành công file danh sách Đoàn viên (CSV/Excel)', 'success');
  };

  // IMPORT EXCEL (CSV) Real Simulation & Parsing
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        if (lines.length < 2) {
          onShowNotification('File trống hoặc không hợp lệ', 'error');
          return;
        }

        // Import custom parsed objects
        let importedCount = 0;
        const newMembersList: DoanVien[] = [...members];

        for (let i = 1; i < lines.length; i++) {
          // simple CSV split (not handles all complex quotes, but works perfectly for standard text)
          const cols = lines[i].split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
          if (cols.length >= 3) {
            const ma = cols[0] || `DV12${Date.now().toString().slice(-4)}`;
            const hoTen = cols[1];
            const truong = cols[6] || TRUONG_LIST[0];
            const lop = cols[7] || 'N/A';
            const email = cols[5] || `${ma.toLowerCase()}@student.edu.vn`;
            
            // Check duplicate
            if (!newMembersList.find(m => m.maDoanVien === ma || m.email === email)) {
              newMembersList.push({
                id: `dv-imported-${Date.now()}-${i}`,
                maDoanVien: ma,
                hoTen: hoTen,
                ngaySinh: cols[2] || '2008-01-01',
                gioiTinh: (cols[3] === 'Nữ' ? 'Nữ' : 'Nam'),
                sdt: cols[4] || '0900000000',
                email: email,
                truong: truong,
                lop: lop,
                chiDoan: cols[8] || CHI_DOAN_LIST[0],
                diaChi: cols[10] || 'Chưa cập nhật',
                anhDaiDien: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                trangThai: 'Đang hoạt động',
                diemTichLuy: Number(cols[9]) || 0
              });
              importedCount++;
            }
          }
        }

        if (importedCount > 0) {
          setMembers(newMembersList);
          onShowNotification(`Đã import thành công ${importedCount} đoàn viên vào hệ thống.`, 'success');
        } else {
          onShowNotification('Không tìm thấy đoàn viên mới hợp lệ hoặc đã trùng lặp mã.', 'error');
        }
      } catch (err) {
        onShowNotification('Lỗi định dạng file CSV. Vui lòng thử lại.', 'error');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  // Auto Quick-Seed for demonstration
  const handleQuickSeedDemo = () => {
    const demoCsvText = `Ma Doan Vien,Ho Ten,Ngay Sinh,Gioi Tinh,SDT,Email,Truong THPT,Lop,Chi Doan,Diem Tich Luy,Trang Thai
DV12991,Trần Quốc Huy,2008-04-12,Nam,0901239991,huy.tq@student.edu.vn,THPT Tân Đông Hiệp,12A2,Chi đoàn Khu phố Tân Hiệp,35,Đang hoạt động
DV12992,Lê Hải Yến,2008-12-01,Nữ,0901239992,yen.lh@student.edu.vn,THPT Dĩ An,12B2,Chi đoàn Khu phố Tân Hiệp,120,Đang hoạt động
DV12993,Phạm Hoàng Nam,2008-07-18,Nam,0901239993,nam.ph@student.edu.vn,THPT Nguyễn An Ninh,12A1,Chi đoàn Khu phố Tân Hiệp,0,Đang hoạt động`;
    
    // Create a virtual file change event
    const blob = new Blob([demoCsvText], { type: 'text/plain' });
    const file = new File([blob], "demo.csv", { type: "text/plain" });
    const mockEvent = {
      target: {
        files: [file],
        value: ''
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleImportCSV(mockEvent);
  };

  // Computations for Analytics/Overview Tab
  const processedStats = useMemo(() => {
    const total = members.length;
    const active = members.filter(m => m.trangThai === 'Đang hoạt động').length;
    
    // Count per school
    const schoolCounts: Record<string, number> = {};
    activeSchoolsList.forEach(s => { schoolCounts[s] = 0; });
    members.forEach(m => {
      if (schoolCounts[m.truong] !== undefined) {
        schoolCounts[m.truong]++;
      } else {
        schoolCounts[m.truong] = 1;
      }
    });

    // Proof states
    const pendingProofs = proofs.filter(p => p.status === 'Chờ duyệt');
    const approvedProofs = proofs.filter(p => p.status === 'Đã duyệt');
    const failedProofs = proofs.filter(p => p.status === 'Không đạt');

    return {
      total,
      active,
      schoolCounts,
      pendingCount: pendingProofs.length,
      approvedCount: approvedProofs.length,
      failedCount: failedProofs.length,
    };
  }, [members, proofs]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchSearch = m.hoTen.toLowerCase().includes(memberSearch.toLowerCase()) || 
                          m.maDoanVien.toLowerCase().includes(memberSearch.toLowerCase()) ||
                          m.email.toLowerCase().includes(memberSearch.toLowerCase());
      const matchSchool = memberFilterSchool === 'All' || m.truong === memberFilterSchool;
      return matchSearch && matchSchool;
    });
  }, [members, memberSearch, memberFilterSchool]);

  // Filtered activities list
  const filteredActivities = useMemo(() => {
    return activities.filter(a => 
      a.ten.toLowerCase().includes(activitySearch.toLowerCase()) || 
      a.loai.toLowerCase().includes(activitySearch.toLowerCase())
    );
  }, [activities, activitySearch]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans relative">
      
      {/* MOBILE STICKY HEADER */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between shadow-md shrink-0 sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white transition-all cursor-pointer"
            title="Mở menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-xs font-black tracking-wider text-white uppercase leading-none">
              BÍ THƯ CHI ĐOÀN
            </h1>
            <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider mt-0.5">
              Địa bàn dân cư • Khối 12
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onGoToLanding && (
            <button
              onClick={onGoToLanding}
              className="px-2 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-850 text-white transition-all cursor-pointer flex items-center gap-1 border border-blue-800/30"
              title="Về Trang chủ"
            >
              <Home className="h-3.5 w-3.5 text-blue-200" />
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

      {/* MOBILE SIDEBAR DRAWER PANEL OVERLAY */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />

            {/* Drawer main body */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative flex w-64 max-w-xs flex-col bg-slate-900 text-slate-300 shadow-2xl h-full border-r border-slate-800 z-10"
            >
            {/* Header branding */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center font-bold text-white text-[11px]">
                  B
                </div>
                <span className="text-xs font-bold text-white tracking-wider uppercase">BÍ THƯ CHI ĐOÀN</span>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Admin account info */}
            <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 text-[11px] text-slate-400">
              <p className="font-semibold text-slate-300">Bí Thư:</p>
              <p className="truncate text-blue-300 font-mono mt-0.5">{currentUser.email}</p>
            </div>

            {/* Scrollable menu content */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'overview' ? 'bg-[#005691] text-white' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                Tổng quan Chi đoàn
              </button>

              <button
                onClick={() => {
                  setActiveTab('members');
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'members' ? 'bg-[#005691] text-white' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 shrink-0" />
                  <span>Đoàn viên Khối 12</span>
                </div>
                <span className="px-1.5 py-0.2 text-[9px] rounded-full font-black bg-slate-800 text-slate-300">
                  {members.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('activities');
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'activities' ? 'bg-[#005691] text-white' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <Calendar className="h-4 w-4 shrink-0" />
                Quản lý Hoạt động
              </button>

              <button
                onClick={() => {
                  setActiveTab('proofs');
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'proofs' ? 'bg-[#005691] text-white' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileCheck className="h-4 w-4 shrink-0" />
                  <span>Duyệt Minh chứng</span>
                </div>
                {processedStats.pendingCount > 0 && (
                  <span className="bg-amber-500 text-slate-900 px-1.5 py-0.2 text-[9px] font-black rounded-full animate-pulse">
                    {processedStats.pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('reports');
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'reports' ? 'bg-[#005691] text-white' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <FileBarChart className="h-4 w-4 shrink-0" />
                Bảng điểm rèn luyện
              </button>

              <button
                onClick={() => {
                  setActiveTab('diaban');
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'diaban' ? 'bg-[#005691] text-white' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <School className="h-4 w-4 shrink-0" />
                  <span>Trường học liên kết</span>
                </div>
                <span className="px-1.5 py-0.2 text-[9px] rounded-full font-black bg-slate-800 text-slate-300">
                  {truongHoc?.length || 0}
                </span>
              </button>


            </nav>

            {/* Logout bottom drawer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs space-y-2">
              {onGoToLanding && (
                <button
                  onClick={() => {
                    onGoToLanding();
                    setIsMobileSidebarOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 bg-blue-900/50 hover:bg-blue-850 text-white font-bold transition-all cursor-pointer border border-blue-800/40"
                >
                  <Home className="h-4 w-4 text-blue-300" />
                  Về Trang chủ (Landing)
                </button>
              )}
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-800 text-red-400 font-bold transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất hệ thống
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* PERSISTENT SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col shrink-0 border-r border-slate-800">
        {/* Branch Admin Branding */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-600 to-red-500 p-0.5 flex items-center justify-center font-bold text-white text-xs">
              B
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">HỘI ĐỒNG BÍ THƯ</p>
              <p className="text-[10px] text-blue-400 font-semibold uppercase">Admin Chi Đoàn KP</p>
            </div>
          </div>
        </div>

        {/* Current Active Admin account info */}
        <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800/80 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">Bí Thư:</p>
          <p className="truncate text-blue-300 font-mono mt-0.5">{currentUser.email}</p>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-3 space-y-1">
          <button
            id="tab-btn-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-[#005691] text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Tổng quan Chi đoàn
          </button>

          <button
            id="tab-btn-members"
            onClick={() => setActiveTab('members')}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'members' ? 'bg-[#005691] text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 shrink-0" />
              <span>Đoàn viên Khối 12</span>
            </div>
            <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${activeTab === 'members' ? 'bg-white text-blue-900' : 'bg-slate-800 text-slate-300'}`}>
              {members.length}
            </span>
          </button>

          <button
            id="tab-btn-activities"
            onClick={() => setActiveTab('activities')}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'activities' ? 'bg-[#005691] text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="h-4 w-4 shrink-0" />
            Quản lý Hoạt động
          </button>

          <button
            id="tab-btn-proofs"
            onClick={() => setActiveTab('proofs')}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'proofs' ? 'bg-[#005691] text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileCheck className="h-4 w-4 shrink-0" />
              <span>Duyệt Minh chứng</span>
            </div>
            {processedStats.pendingCount > 0 && (
              <span className="bg-amber-500 text-slate-900 px-1.5 py-0.2 text-[10px] font-black rounded-full animate-bounce">
                {processedStats.pendingCount}
              </span>
            )}
          </button>

          <button
            id="tab-btn-reports"
            onClick={() => setActiveTab('reports')}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'reports' ? 'bg-[#005691] text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileBarChart className="h-4 w-4 shrink-0" />
            Bảng điểm rèn luyện
          </button>

          <button
            id="tab-btn-diaban"
            onClick={() => setActiveTab('diaban')}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'diaban' ? 'bg-[#005691] text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <School className="h-4 w-4 shrink-0" />
              <span>Trường học liên kết</span>
            </div>
            <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${activeTab === 'diaban' ? 'bg-white text-blue-900' : 'bg-slate-800 text-slate-300'}`}>
              {truongHoc?.length || 0}
            </span>
          </button>


        </nav>

        {/* Footer logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs space-y-2">
          {onGoToLanding && (
            <button
              id="admin-home-sidebar-btn"
              onClick={onGoToLanding}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 bg-[#005691] hover:bg-[#004270] text-white font-bold transition-all cursor-pointer border border-blue-800/40"
            >
              <Home className="h-4 w-4 text-blue-200" />
              Về Trang chủ (Landing)
            </button>
          )}
          <button
            id="admin-logout-sidebar-btn"
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-800 text-red-400 font-bold transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất hệ thống
          </button>
        </div>
      </aside>

      {/* MAIN MAIN CONTENT CONTAINER */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Top greetings banner with modern SaaS style */}
            <div className="rounded-3xl bg-gradient-to-r from-[#005691] via-blue-700 to-[#0284c7] p-6 text-white shadow-xl border border-white/5 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-y-6 translate-x-6 opacity-5 pointer-events-none">
                <Users className="h-56 w-56 text-white" />
              </div>
              <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
              
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest border border-white/10 shadow-inner">
                  Bảng điều khiển kỹ thuật số 2026
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-display">Chào mừng Bí thư trở lại hệ thống quản trị!</h2>
                <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
                  Quản trị và phân bổ đoàn viên học sinh lớp 12 tham gia sinh hoạt hè trên địa bàn khu phố. Phê duyệt nhanh chóng các ảnh minh chứng có gắn mộc TimeMark và tải xuống báo cáo tích lũy rèn luyện rà soát cuối hè.
                </p>
              </div>
            </div>

            {/* Main top metrics cards with premium bento design */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group transform hover:-translate-y-0.5">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-display">Tổng Đoàn viên</p>
                  <p className="text-2xl font-black text-slate-900 mt-1.5 font-display"><AnimatedCounter value={processedStats.total} /></p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    <span>{processedStats.active} đang sinh hoạt hè</span>
                  </p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-blue-50 text-[#005691] flex items-center justify-center shrink-0 shadow-inner transition-colors group-hover:bg-[#005691] group-hover:text-white duration-300">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group transform hover:-translate-y-0.5">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-display">Trường THPT</p>
                  <p className="text-2xl font-black text-slate-900 mt-1.5 font-display"><AnimatedCounter value={activeSchoolsList.length} /></p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">Trường liên kết trực thuộc</p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner transition-colors group-hover:bg-emerald-600 group-hover:text-white duration-300">
                  <School className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group transform hover:-translate-y-0.5">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-display">Chiến dịch Hè</p>
                  <p className="text-2xl font-black text-slate-900 mt-1.5 font-display"><AnimatedCounter value={activities.length} /></p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">Tổng số hoạt động mở</p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-inner transition-colors group-hover:bg-purple-600 group-hover:text-white duration-300">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group transform hover:-translate-y-0.5">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-display">Chờ phê duyệt</p>
                  <p className={`text-2xl font-black mt-1.5 font-display ${processedStats.pendingCount > 0 ? 'text-amber-500' : 'text-slate-900'}`}>
                    <AnimatedCounter value={processedStats.pendingCount} />
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">Minh chứng ảnh chờ duyệt</p>
                </div>
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-all duration-300 ${processedStats.pendingCount > 0 ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-slate-50 text-slate-500'}`}>
                  <FileCheck className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* SVG Visual Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: School Distribution Chart */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-8 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Số lượng Đoàn viên học sinh theo trường THPT</h3>
                  <p className="text-xs text-slate-400">Thống kê cơ cấu đoàn viên sinh hoạt hè tại khu phố</p>
                </div>

                {/* Custom Responsive SVG Bar Chart */}
                <div className="w-full h-48 sm:h-64 flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 500 240">
                    {/* Grid lines */}
                    <line x1="40" y1="30" x2="480" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="130" x2="480" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="180" x2="480" y2="180" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="200" x2="480" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />

                    {/* Chart Bars */}
                    {activeSchoolsList.map((school, idx) => {
                      const count = processedStats.schoolCounts[school] || 0;
                      const maxCount = Math.max(1, ...(Object.values(processedStats.schoolCounts) as number[]), 6);
                      const barHeight = Math.max(10, (count / maxCount) * 150);
                      const barWidth = Math.min(40, Math.max(15, 360 / activeSchoolsList.length));
                      const gap = (440 - barWidth * activeSchoolsList.length) / (activeSchoolsList.length + 1);
                      const barX = 40 + gap + idx * (barWidth + gap);
                      const barY = 200 - barHeight;

                      return (
                        <g key={school} className="group cursor-pointer">
                          <rect
                            x={barX}
                            y={barY}
                            width={barWidth}
                            height={barHeight}
                            rx="4"
                            fill={idx % 2 === 0 ? '#005691' : '#0082c8'}
                            className="transition-all duration-300 hover:brightness-115"
                          />
                          <text
                            x={barX + barWidth / 2}
                            y={barY - 8}
                            textAnchor="middle"
                            className="text-[9px] font-bold text-slate-700"
                          >
                            {count} ĐV
                          </text>
                          {/* School label shortened */}
                          <text
                            x={barX + barWidth / 2}
                            y="218"
                            textAnchor="middle"
                            className="text-[8px] font-semibold text-slate-500 fill-slate-500"
                          >
                            {school.replace('THPT', '').trim().substring(0, 10)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Right Column: Mini Report/Activity statuses */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-4 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Tỷ lệ duyệt minh chứng</h3>
                  <p className="text-xs text-slate-400">Tình trạng nộp và giải quyết báo cáo hè</p>
                </div>

                {/* Interactive SVG Progress Ring */}
                <div className="flex flex-col items-center justify-center space-y-4 flex-1">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="50"
                        className="stroke-slate-100 fill-transparent"
                        strokeWidth="10"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="50"
                        className="stroke-[#005691] fill-transparent transition-all duration-500"
                        strokeWidth="10"
                        strokeDasharray={314}
                        strokeDashoffset={
                          proofs.length === 0 
                            ? 314 
                            : 314 - (314 * (processedStats.approvedCount / proofs.length))
                        }
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-black text-slate-800">
                        {proofs.length === 0 ? 0 : Math.round((processedStats.approvedCount / proofs.length) * 100)}%
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase">Đạt chuẩn</span>
                    </div>
                  </div>

                  {/* Legends */}
                  <div className="w-full text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#005691]"></span>
                        <span className="text-slate-500">Đã duyệt (Đạt)</span>
                      </div>
                      <span className="font-bold text-slate-800">{processedStats.approvedCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        <span className="text-slate-500">Chờ xem xét</span>
                      </div>
                      <span className="font-bold text-slate-800">{processedStats.pendingCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                        <span className="text-slate-500">Từ chối (Hủy)</span>
                      </div>
                      <span className="font-bold text-slate-800">{processedStats.failedCount}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Actions Panel */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Hành động nhanh cho Bí thư</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  id="quick-add-member-btn"
                  onClick={handleOpenAddMember}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50 hover:bg-blue-50/20 p-3 text-left transition-all cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-[#005691] flex items-center justify-center shrink-0">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">Thêm Đoàn viên mới</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Nhập hồ sơ thủ công</p>
                  </div>
                </button>

                <button
                  id="quick-add-activity-btn"
                  onClick={handleOpenAddActivity}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 hover:border-purple-200 bg-slate-50 hover:bg-purple-50/20 p-3 text-left transition-all cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">Tạo Hoạt động hè</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Mở chiến dịch, gán điểm</p>
                  </div>
                </button>

                {/* Demo seed button removed for production */}

                <button
                  id="quick-export-all-btn"
                  onClick={handleExportXLSX}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 hover:border-[#005691] bg-slate-50 hover:bg-blue-50/20 p-3 text-left transition-all cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-[#005691] flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">Xuất báo cáo Excel (.xlsx)</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">File điểm & minh chứng chuẩn đa sheet</p>
                  </div>
                </button>

                <button
                  id="quick-export-pdf-btn"
                  onClick={() => setShowPrintPreview(true)}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 hover:border-red-200 bg-slate-50 hover:bg-red-50/20 p-3 text-left transition-all cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                    <Printer className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">In báo cáo hè (Xuất PDF)</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Văn bản chuẩn trình ký Quận đoàn</p>
                  </div>
                </button>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: MEMBERS CRUD */}
        {activeTab === 'members' && (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Danh sách Đoàn viên khối 12</h2>
                <p className="text-xs text-slate-500">Quản lý hồ sơ, cập nhật thông tin và theo dõi điểm rèn luyện hè</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* File imports and triggers */}
                <label 
                  id="import-csv-label"
                  className="rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Upload className="h-3.5 w-3.5 text-slate-500" />
                  Import Excel (CSV)
                  <input 
                    type="file" 
                    accept=".csv,text/csv" 
                    onChange={handleImportCSV} 
                    className="hidden" 
                  />
                </label>

                <button
                  id="export-xlsx-btn"
                  onClick={handleExportXLSX}
                  className="rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-slate-500" />
                  Xuất Excel (.xlsx)
                </button>

                <button
                  id="add-member-top-btn"
                  onClick={handleOpenAddMember}
                  className="rounded-lg bg-[#005691] hover:bg-[#004270] text-white px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm đoàn viên
                </button>
              </div>
            </div>

            {/* Filter controls row */}
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="member-search-input"
                  type="text"
                  placeholder="Tìm theo Mã ĐV, Họ tên, Email..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20 transition-colors"
                />
              </div>

              <div>
                <select
                  id="member-filter-school"
                  value={memberFilterSchool}
                  onChange={(e) => setMemberFilterSchool(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none transition-colors"
                >
                  <option value="All">Tất cả các Trường THPT ({activeSchoolsList.length})</option>
                  {activeSchoolsList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Members List - Responsive UI Layout */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                      <th className="p-4">Ảnh/Mã ĐV</th>
                      <th className="p-4">Họ và Tên</th>
                      <th className="p-4">Trường THPT</th>
                      <th className="p-4">Chi Đoàn Liên Kết</th>
                      <th className="p-4 text-center">Tích lũy</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          Không tìm thấy đoàn viên nào khớp với điều kiện lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={m.anhDaiDien}
                                alt={m.hoTen}
                                className="h-9 w-9 rounded-full object-cover border border-slate-100 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                {m.maDoanVien}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-800 text-[13px]">{m.hoTen}</p>
                            <div className="flex items-center gap-3 mt-0.5 text-slate-400 text-[10px]">
                              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {m.sdt}</span>
                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {m.email}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 font-medium">
                            {m.truong}
                          </td>
                          <td className="p-4 text-slate-500 font-medium">
                            {m.chiDoan}
                          </td>
                          <td className="p-4 text-center">
                            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-black text-[#005691]">
                              {m.diemTichLuy} Đ
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              m.trangThai === 'Đang hoạt động' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : m.trangThai === 'Tạm ngưng'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {m.trangThai}
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                id={`adjust-points-btn-${m.id}`}
                                onClick={() => {
                                  setScoringMember(m);
                                  setScoringType('Cộng');
                                  setScoringAmount(10);
                                  setScoringReason('Tích cực tham gia hoạt động, phong trào');
                                  setCustomScoringReason('');
                                }}
                                className="p-1 text-amber-600 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                                title="Cộng/Trừ Điểm Thủ Công"
                              >
                                <Award className="h-4 w-4" />
                              </button>
                              <button
                                id={`edit-member-btn-${m.id}`}
                                onClick={() => handleOpenEditMember(m)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                title="Sửa thông tin"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                id={`lock-member-btn-${m.id}`}
                                onClick={() => handleToggleLockMember(m.id, m.hoTen, !!m.isLocked)}
                                className={`p-1 rounded transition-colors cursor-pointer ${m.isLocked ? 'text-amber-600 hover:bg-amber-50' : 'text-slate-600 hover:bg-slate-100'}`}
                                title={m.isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                              >
                                {m.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                              </button>

                              <button
                                id={`delete-member-btn-${m.id}`}
                                onClick={() => handleDeleteMember(m.id, m.hoTen)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                title="Xóa đoàn viên"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card-Based Grid View */}
              <div className="block md:hidden divide-y divide-slate-100">
                {filteredMembers.length === 0 ? (
                  <p className="p-8 text-center text-slate-400 text-xs">
                    Không tìm thấy đoàn viên nào khớp với điều kiện lọc.
                  </p>
                ) : (
                  filteredMembers.map(m => (
                    <div id={`member-mobile-card-${m.id}`} key={m.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={m.anhDaiDien}
                            alt={m.hoTen}
                            className="h-10 w-10 rounded-full object-cover border shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              {m.hoTen}
                              <span className="font-mono text-[9px] font-bold bg-slate-100 px-1.5 py-0.2 rounded text-slate-500">
                                {m.maDoanVien}
                              </span>
                            </h4>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{m.truong}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setScoringMember(m);
                              setScoringType('Cộng');
                              setScoringAmount(10);
                              setScoringReason('Tích cực tham gia hoạt động, phong trào');
                              setCustomScoringReason('');
                            }}
                            className="p-1 text-amber-600 hover:bg-amber-50 rounded cursor-pointer"
                            title="Cộng/Trừ Điểm Thủ Công"
                          >
                            <Award className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditMember(m)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                            title="Sửa thông tin"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleLockMember(m.id, m.hoTen, !!m.isLocked)}
                            className={`p-1 rounded cursor-pointer ${m.isLocked ? 'text-amber-600 hover:bg-amber-50' : 'text-slate-600 hover:bg-slate-100'}`}
                            title={m.isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                          >
                            {m.isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                          </button>

                          <button
                            onClick={() => handleDeleteMember(m.id, m.hoTen)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-500">
                        <div>
                          <span className="font-semibold block text-slate-400">Chi đoàn:</span>
                          <span className="font-bold text-slate-700">{m.chiDoan}</span>
                        </div>
                        <div>
                          <span className="font-semibold block text-slate-400">Điểm rèn luyện:</span>
                          <span className="font-black text-[#005691] text-xs">+{m.diemTichLuy} Điểm</span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-slate-200/50 flex items-center gap-1">
                          <span className="font-semibold text-slate-400">SĐT:</span>
                          <span className="font-bold text-slate-600">{m.sdt}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: ACTIVITIES MANAGER */}
        {activeTab === 'activities' && (
          <motion.div
            key="activities"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Quản lý hoạt động rèn luyện hè</h2>
                <p className="text-xs text-slate-500">Thiết lập các hoạt động tình nguyện, chuyên đề bồi dưỡng, lao động khu phố</p>
              </div>
              <button
                id="add-activity-btn"
                onClick={handleOpenAddActivity}
                className="rounded-lg bg-[#005691] hover:bg-[#004270] text-white px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Mở hoạt động mới
              </button>
            </div>

            {/* Search row */}
            <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm max-w-sm">
              <div className="relative">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="activity-search-input"
                  type="text"
                  placeholder="Tìm theo tên hoạt động, chuyên đề..."
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#005691]/20 transition-colors"
                />
              </div>
            </div>

            {/* List of activities in Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredActivities.length === 0 ? (
                <p className="col-span-2 text-center text-slate-400 text-xs p-8 bg-white rounded-2xl border border-slate-100">
                  Không tìm thấy hoạt động nào hợp lệ.
                </p>
              ) : (
                filteredActivities.map(act => (
                  <div id={`activity-card-${act.id}`} key={act.id} className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col md:flex-row">
                    
                    <div className="md:w-1/3 relative bg-slate-100">
                      <img
                        src={act.anh}
                        alt={act.ten}
                        className="h-full w-full object-cover min-h-[140px]"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2.5 left-2.5 rounded-full bg-slate-900/85 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                        {act.loai}
                      </span>
                      {act.locked ? (
                        <span className="absolute top-2.5 right-2.5 rounded-full bg-red-600 px-2.5 py-0.5 text-[9px] font-extrabold text-white flex items-center gap-1 shadow-sm uppercase tracking-wide">
                          <Lock className="h-2.5 w-2.5" /> Đã Khóa
                        </span>
                      ) : (
                        <span className="absolute top-2.5 right-2.5 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[9px] font-extrabold text-white flex items-center gap-1 shadow-sm uppercase tracking-wide">
                          <Unlock className="h-2.5 w-2.5" /> Đang Mở
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-tight hover:text-[#005691] transition-colors">
                            {act.ten}
                          </h4>
                          <span className="rounded bg-blue-50 text-[#005691] px-2 py-0.5 text-[10px] font-black shrink-0">
                            +{act.diemCong} Đ
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                          {act.moTa}
                        </p>
                      </div>

                      <div className="space-y-1 text-[10px] text-slate-400 border-t border-slate-50 pt-2.5">
                        <p className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-blue-500 shrink-0" />
                          <span className="truncate">Tập trung: {act.thoiGian}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                          <span className="truncate">Địa điểm: {act.diaDiem}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <CalendarIcon className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span className="truncate">Hạn chót ảnh: {act.hanNop}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-2 border-t border-slate-50 pt-2.5">
                        <button
                          id={`view-attendance-btn-${act.id}`}
                          onClick={() => {
                            setAttendanceModalActivity(act);
                            setAttendanceTab('joined');
                          }}
                          className="rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#005691] p-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Xem tỷ lệ tham gia, danh sách vắng, danh sách đạt"
                        >
                          <Users className="h-3.5 w-3.5" />
                          DS Tham gia
                        </button>
                        <button
                          id={`toggle-lock-act-btn-${act.id}`}
                          onClick={() => handleToggleLockActivity(act.id, act.locked || false, act.ten)}
                          className={`rounded-lg p-1.5 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all border ${
                            act.locked
                              ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                              : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700'
                          }`}
                        >
                          {act.locked ? (
                            <>
                              <Unlock className="h-3.5 w-3.5" />
                              Mở khóa
                            </>
                          ) : (
                            <>
                              <Lock className="h-3.5 w-3.5" />
                              Khóa nhận
                            </>
                          )}
                        </button>
                        <button
                          id={`edit-act-btn-${act.id}`}
                          onClick={() => handleOpenEditActivity(act)}
                          className="rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 p-1.5 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Sửa
                        </button>
                        <button
                          id={`delete-act-btn-${act.id}`}
                          onClick={() => handleDeleteActivity(act.id, act.ten)}
                          className="rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 p-1.5 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Xóa
                        </button>
                      </div>

                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 4: DUYỆT MINH CHỨNG */}
        {activeTab === 'proofs' && (
          <motion.div
            key="proofs"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Phê duyệt minh chứng hoạt động hè</h2>
              <p className="text-xs text-slate-500">Phê chuẩn ảnh hiện trường chụp kèm đóng dấu mốc thời gian thực và tọa độ GPS</p>
            </div>

            {/* List of proofs */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                      <th className="p-4">Người gửi</th>
                      <th className="p-4">Hoạt động</th>
                      <th className="p-4">Thời gian gửi</th>
                      <th className="p-4">Mốc TimeMark</th>
                      <th className="p-4">Định vị</th>
                      <th className="p-4 text-center">Trạng thái</th>
                      <th className="p-4 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {proofs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          Chưa có minh chứng nào được nộp.
                        </td>
                      </tr>
                    ) : (
                      proofs.map(p => {
                        const student = members.find(m => m.id === p.doanVienId);
                        const act = activities.find(a => a.id === p.hoatDongId);
                        
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 whitespace-nowrap font-bold text-slate-800">
                              <p className="text-xs">{student?.hoTen || 'Đoàn viên ẩn danh'}</p>
                              <span className="text-[9px] text-slate-400 font-mono">{student?.maDoanVien}</span>
                            </td>
                            <td className="p-4 max-w-xs font-medium text-slate-700">
                              <p className="truncate" title={act?.ten}>{act?.ten || 'Hoạt động đã xóa'}</p>
                              <span className="text-[10px] text-[#005691] font-bold">+{act?.diemCong || 0} điểm cộng</span>
                            </td>
                            <td className="p-4 text-slate-500 font-mono whitespace-nowrap">
                              {p.createdAt}
                            </td>
                            <td className="p-4 text-emerald-600 font-mono whitespace-nowrap">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {p.timeMark || p.createdAt}
                              </span>
                            </td>
                            <td className="p-4 text-slate-400 font-medium max-w-xxs truncate" title={p.locationMark}>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                                <span className="truncate">{p.locationMark || 'Khu phố (Mặc định)'}</span>
                              </span>
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
                            <td className="p-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  id={`review-proof-btn-${p.id}`}
                                  onClick={() => {
                                    setReviewingProof(p);
                                    setRejectReason(p.rejectedReason || '');
                                  }}
                                  className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Xem duyệt
                                </button>
                              </div>
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

        {/* TAB 5: REPORTS & RANKINGS */}
        {activeTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Bảng tổng hợp điểm rèn luyện hè</h2>
                <p className="text-xs text-slate-500">Xếp hạng thành tích rèn luyện hè và hỗ trợ xuất dữ liệu trình ký Quận đoàn</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="report-export-xlsx-btn"
                  onClick={handleExportXLSX}
                  className="rounded-lg bg-[#005691] hover:bg-[#004270] text-white px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Xuất File Điểm (Excel)
                </button>
                <button
                  id="report-export-pdf-btn"
                  onClick={() => setShowPrintPreview(true)}
                  className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Xuất PDF / In Báo Cáo
                </button>
              </div>
            </div>

            {/* School rank cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Xếp hạng cao nhất</h4>
                  <Award className="h-5 w-5 text-amber-500 fill-amber-100" />
                </div>
                {members.length > 0 ? (
                  (() => {
                    const sorted = [...members].sort((a,b) => b.diemTichLuy - a.diemTichLuy);
                    const top = sorted[0];
                    return (
                      <div>
                        <p className="text-lg font-black text-slate-800">{top.hoTen}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">{top.truong}</p>
                        <p className="text-xs text-slate-400 mt-2 font-medium">Tích lũy hè: <strong className="text-amber-600">+{top.diemTichLuy} điểm</strong></p>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-xs text-slate-400">Không có dữ liệu</p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Trường tích cực nhất</h4>
                  <School className="h-5 w-5 text-blue-500" />
                </div>
                {/* Calculate average score per school */}
                {(() => {
                  const schoolScores: Record<string, { total: number, count: number }> = {};
                  members.forEach(m => {
                    if (!schoolScores[m.truong]) schoolScores[m.truong] = { total: 0, count: 0 };
                    schoolScores[m.truong].total += m.diemTichLuy;
                    schoolScores[m.truong].count += 1;
                  });
                  
                  let activeSchool = '';
                  let maxAvg = -1;
                  Object.entries(schoolScores).forEach(([school, data]) => {
                    const avg = data.total / data.count;
                    if (avg > maxAvg) {
                      maxAvg = avg;
                      activeSchool = school;
                    }
                  });

                  return (
                    <div>
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{activeSchool || 'Không có'}</p>
                      <p className="text-xs text-slate-500 font-semibold mt-1">Đạt trung bình: <strong className="text-blue-600">{(maxAvg || 0).toFixed(1)} điểm / ĐV</strong></p>
                      <p className="text-[10px] text-slate-400 mt-2">Dựa trên điểm tích lũy của toàn chi đoàn trường tham gia.</p>
                    </div>
                  );
                })()}
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Tiến độ phê duyệt</h4>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-800">
                    {proofs.length === 0 ? '100%' : `${Math.round((proofs.filter(p=>p.status!=='Chờ duyệt').length / proofs.length)*100)}%`}
                  </p>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Đã xử lý: {proofs.filter(p=>p.status!=='Chờ duyệt').length} / {proofs.length} minh chứng</p>
                  <p className="text-[10px] text-slate-400 mt-2">Cần xử lý dứt điểm các ảnh chờ duyệt trước khi kết xuất học bạ.</p>
                </div>
              </div>

            </div>

            {/* Compiled ranking table */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Xếp hạng Đoàn viên toàn chi đoàn</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-white font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                      <th className="p-4 text-center">Hạng</th>
                      <th className="p-4">Họ và Tên</th>
                      <th className="p-4">Trường THPT</th>
                      <th className="p-4 text-center">Minh chứng đạt</th>
                      <th className="p-4 text-center">Tổng điểm tích lũy</th>
                      <th className="p-4">Phân loại danh hiệu hè</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[...members].sort((a,b) => b.diemTichLuy - a.diemTichLuy).map((m, idx) => {
                      const approvedCount = proofs.filter(p => p.doanVienId === m.id && p.status === 'Đã duyệt').length;
                      
                      let classification = 'Chưa hoàn thành';
                      let classColor = 'bg-slate-100 text-slate-600';
                      
                      if (m.diemTichLuy >= 80) {
                        classification = 'Đoàn viên Xuất Sắc';
                        classColor = 'bg-amber-50 text-amber-700 border border-amber-100';
                      } else if (m.diemTichLuy >= 40) {
                        classification = 'Đoàn viên Khá';
                        classColor = 'bg-blue-50 text-blue-700 border border-blue-100';
                      } else if (m.diemTichLuy > 0) {
                        classification = 'Đoàn viên Trung bình';
                        classColor = 'bg-slate-50 text-slate-600 border border-slate-100';
                      }

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-center font-bold text-slate-900">
                            {idx + 1}
                          </td>
                          <td className="p-4 font-bold text-slate-800">
                            {m.hoTen}
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">{m.maDoanVien}</p>
                          </td>
                          <td className="p-4 text-slate-600">
                            {m.truong}
                          </td>
                          <td className="p-4 text-center text-slate-700 font-medium">
                            {approvedCount} hoạt động
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-xs font-black text-[#005691] bg-blue-50 px-2 py-0.5 rounded">
                              {m.diemTichLuy} Đ
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${classColor}`}>
                              {classification}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}



        {/* TAB: TRUONG HOC MANAGEMENT */}
        {activeTab === 'diaban' && (
          <motion.div
            key="diaban"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Top header action block */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <School className="h-5 w-5 text-[#005691] shrink-0" />
                  Quản lý Trường học THPT liên kết
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thêm, sửa, xóa các trường trung học phổ thông liên kết quản lý thông tin và thống kê số lượng đoàn viên trực thuộc
                </p>
              </div>
              <button
                onClick={handleOpenAddTruongHoc}
                className="rounded-xl bg-[#005691] hover:bg-[#004b7f] text-white px-4 py-2 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer border border-[#005691]/20"
              >
                <Plus className="h-4 w-4" />
                Thêm Trường học mới
              </button>
            </div>

            {/* Quick stats for Schools */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-100 bg-white p-4 flex items-center gap-3 shadow-sm">
                <div className="h-9 w-9 rounded-lg bg-blue-50 text-[#005691] flex items-center justify-center">
                  <School className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tổng số trường</p>
                  <p className="text-lg font-black text-slate-800">{truongHoc.length}</p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-4 flex items-center gap-3 shadow-sm">
                <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Đoàn viên học tập</p>
                  <p className="text-lg font-black text-slate-800">
                    {members.filter(m => truongHoc.some(th => th.tenTruong === m.truong)).length} đoàn viên
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-4 flex items-center gap-3 shadow-sm">
                <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Trung bình đoàn viên</p>
                  <p className="text-lg font-black text-slate-800">
                    {truongHoc.length > 0 ? (members.filter(m => truongHoc.some(th => th.tenTruong === m.truong)).length / truongHoc.length).toFixed(1) : 0} ĐV / Trường
                  </p>
                </div>
              </div>
            </div>

            {/* Search filter row */}
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm trường học, hiệu trưởng, địa chỉ..."
                value={truongHocSearch}
                onChange={(e) => setTruongHocSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20 shadow-sm"
              />
              {truongHocSearch && (
                <button
                  onClick={() => setTruongHocSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* TruongHoc list render */}
            <div className="grid grid-cols-1 gap-5">
              {truongHoc
                .filter(th => 
                  th.tenTruong.toLowerCase().includes(truongHocSearch.toLowerCase()) ||
                  th.diaChi.toLowerCase().includes(truongHocSearch.toLowerCase()) ||
                  th.hieuTruong.toLowerCase().includes(truongHocSearch.toLowerCase()) ||
                  (th.moTa && th.moTa.toLowerCase().includes(truongHocSearch.toLowerCase()))
                )
                .map(th => {
                  const schoolMembers = members.filter(m => m.truong === th.tenTruong);
                  const enrolledCount = schoolMembers.length;
                  const isExpanded = expandedSchoolId === th.id;

                  return (
                    <div 
                      key={th.id}
                      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#005691] flex items-center justify-center shrink-0 mt-0.5">
                            <School className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-wide">
                              {th.tenTruong}
                            </h4>
                            <p className="text-slate-500 text-xs">
                              <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] mr-1">Địa chỉ:</span>
                              {th.diaChi}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="rounded-full bg-[#005691]/10 text-[#005691] px-3 py-1 text-xs font-extrabold">
                            {enrolledCount} Đoàn viên
                          </span>
                          <button
                            onClick={() => setExpandedSchoolId(isExpanded ? null : th.id)}
                            className="rounded-xl border border-slate-200 hover:border-[#005691] hover:bg-slate-50 text-[#005691] px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            {isExpanded ? 'Thu gọn' : 'Xem đoàn viên'}
                            <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-250 ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-xl bg-slate-50 p-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-20 shrink-0">Hiệu trưởng:</span>
                          <span className="text-slate-700 font-semibold">{th.hieuTruong}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-20 shrink-0">SĐT liên hệ:</span>
                          <span className="text-slate-700 font-mono font-semibold">{th.sdtLienHe}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-20 shrink-0">Ghi chú:</span>
                          <span className="text-slate-500 italic">{th.moTa || 'Không có ghi chú.'}</span>
                        </div>
                      </div>

                      {/* Expandable list of enrolled members with their stats */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 pt-4 mt-2 animate-fade-in space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                              DANH SÁCH ĐOÀN VIÊN ĐANG HỌC TẬP TẠI TRƯỜNG ({enrolledCount})
                            </h5>
                          </div>

                          {enrolledCount > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-slate-100">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                    <th className="py-2.5 px-4">Mã ĐV</th>
                                    <th className="py-2.5 px-4">Họ và tên</th>
                                    <th className="py-2.5 px-4">Giới tính</th>
                                    <th className="py-2.5 px-4">Số điện thoại</th>
                                    <th className="py-2.5 px-4 text-center">Trạng thái</th>
                                    <th className="py-2.5 px-4 text-right">Điểm tích lũy</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                                  {schoolMembers.map(m => (
                                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="py-2.5 px-4 font-mono font-bold text-[#005691]">{m.maDoanVien}</td>
                                      <td className="py-2.5 px-4 font-bold text-slate-900">{m.hoTen}</td>
                                      <td className="py-2.5 px-4">{m.gioiTinh}</td>
                                      <td className="py-2.5 px-4 font-mono text-slate-500">{m.sdt || '---'}</td>
                                      <td className="py-2.5 px-4 text-center">
                                        <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-black ${
                                          m.trangThai === 'Đang hoạt động' 
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                            : m.trangThai === 'Tạm ngưng'
                                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                            : 'bg-slate-100 text-slate-600'
                                        }`}>
                                          {m.trangThai}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-4 text-right font-mono font-extrabold text-blue-600">{m.diemTichLuy}đ</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic py-2">
                              Chưa có đoàn viên nào đăng ký học tại trường này.
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 border-t border-slate-50 pt-3">
                        <button
                          onClick={() => handleOpenEditTruongHoc(th)}
                          className="rounded-lg hover:bg-amber-50 text-amber-600 hover:text-amber-800 p-1.5 text-xs transition-colors cursor-pointer flex items-center gap-1 font-bold border border-transparent hover:border-amber-200"
                          title="Sửa"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>Sửa thông tin</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTruongHoc(th.id, th.tenTruong)}
                          className="rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 p-1.5 text-xs transition-colors cursor-pointer flex items-center gap-1 font-bold border border-transparent hover:border-red-200"
                          title="Xóa"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Xóa trường</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

              {truongHoc.length === 0 && (
                <div className="col-span-full rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-8 text-center text-slate-400">
                  <School className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold">Chưa có trường học liên kết nào được khởi tạo</p>
                  <p className="text-[11px] text-slate-400 mt-1">Nhấp vào "Thêm Trường học mới" để bắt đầu thiết lập</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </main>

      {/* MANUAL SCORE ADJUSTMENT DIALOG MODAL */}
      {scoringMember && (
        <div 
          id="scoring-modal-overlay" 
          onClick={() => setScoringMember(null)}
          className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm cursor-pointer sm:items-center"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden cursor-default my-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100"
          >
            {/* Form side (left) */}
            <div className="flex-1 p-6 space-y-4">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 -mx-6 -mt-6 px-6 py-4 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                    <Award className="h-4 w-4 shrink-0" />
                    CỘNG/TRỪ ĐIỂM THỦ CÔNG
                  </h3>
                  <p className="text-[10px] text-amber-50/90 mt-0.5">Đoàn viên: <strong className="text-white font-semibold">{scoringMember.hoTen}</strong> ({scoringMember.maDoanVien})</p>
                </div>
                <button
                  id="close-scoring-modal-btn"
                  onClick={() => setScoringMember(null)}
                  type="button"
                  className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm font-black transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-sm md:hidden"
                  title="Đóng"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveScoring} className="space-y-4 mt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Loại điều chỉnh</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setScoringType('Cộng')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        scoringType === 'Cộng'
                          ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700'
                          : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-sm font-extrabold">+</span> Cộng điểm
                    </button>
                    <button
                      type="button"
                      onClick={() => setScoringType('Trừ')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        scoringType === 'Trừ'
                          ? 'bg-red-50 border-2 border-red-500 text-red-700'
                          : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-sm font-extrabold">-</span> Trừ điểm
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Số điểm rèn luyện</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={scoringAmount}
                    onChange={(e) => setScoringAmount(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-amber-500 focus:outline-none"
                    placeholder="VD: 10"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lý do cụ thể</label>
                  <select
                    value={scoringReason}
                    onChange={(e) => setScoringReason(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Tích cực tham gia hoạt động, phong trào">Tích cực tham gia hoạt động, phong trào</option>
                    <option value="Hỗ trợ Ban tổ chức các sự kiện hè">Hỗ trợ Ban tổ chức các sự kiện hè</option>
                    <option value="Đạt giải cuộc thi rèn luyện, năng khiếu">Đạt giải cuộc thi rèn luyện, năng khiếu</option>
                    <option value="Có sáng kiến, đóng góp ý tưởng xây dựng Chi đoàn">Có sáng kiến, đóng góp ý tưởng xây dựng Chi đoàn</option>
                    <option value="Vi phạm nội quy, quy định sinh hoạt hè">Vi phạm nội quy, quy định sinh hoạt hè</option>
                    <option value="Đi muộn, không nghiêm túc trong sinh hoạt">Đi muộn, không nghiêm túc trong sinh hoạt</option>
                    <option value="Vắng sinh hoạt hè không phép">Vắng sinh hoạt hè không phép</option>
                    <option value="Khác (nhập chi tiết)">Khác (nhập chi tiết)</option>
                  </select>
                </div>

                {scoringReason === 'Khác (nhập chi tiết)' && (
                  <div className="animate-fade-in">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chi tiết lý do khác *</label>
                    <input
                      type="text"
                      required
                      value={customScoringReason}
                      onChange={(e) => setCustomScoringReason(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-amber-500 focus:outline-none"
                      placeholder="Nhập lý do cụ thể..."
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setScoringMember(null)}
                    className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 text-xs font-bold shadow transition-colors cursor-pointer"
                  >
                    Cập nhật điểm
                  </button>
                </div>
              </form>
            </div>

            {/* History side (right) */}
            <div className="w-full md:w-[380px] p-6 bg-slate-50/50 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  LỊCH SỬ THAY ĐỔI ĐIỂM
                </h4>
                <button
                  onClick={() => setScoringMember(null)}
                  type="button"
                  className="h-7 w-7 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold transition-all cursor-pointer hidden md:flex"
                  title="Đóng"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[300px] md:max-h-[350px] space-y-2.5 pr-1">
                {scoringMember.lichSuDiem && scoringMember.lichSuDiem.length > 0 ? (
                  scoringMember.lichSuDiem.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-lg border border-slate-100 bg-white text-[11px] space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center rounded px-1.5 py-0.2 text-[9px] font-black ${
                          log.loai === 'Cộng'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {log.loai === 'Cộng' ? `+${log.soDiem}` : `-${log.soDiem}`}đ
                        </span>
                        <span className="font-mono text-[9px] text-slate-400 font-semibold">{new Date(log.thoiGian).toLocaleString('vi-VN')}</span>
                      </div>
                      <p className="font-bold text-slate-700 leading-normal">{log.lyDo}</p>
                      <p className="text-[9px] text-slate-400 font-semibold">Người duyệt: {log.nguoiThucHien}</p>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <Award className="h-8 w-8 text-slate-300 mb-1.5" />
                    <p className="text-[10px] font-bold">Chưa có thay đổi điểm thủ công</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Mọi điểm cộng/trừ trực tiếp từ BCH sẽ được lưu trữ lịch sử minh bạch tại đây.</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
                Tổng điểm hiện tại: <strong className="text-blue-600 font-black text-xs font-mono">+{scoringMember.diemTichLuy} Điểm</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER CREATE/EDIT DIALOG MODAL */}
      {showMemberModal && (
        <div 
          id="member-modal-overlay" 
          onClick={() => setShowMemberModal(false)}
          className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm cursor-pointer sm:items-center"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden cursor-default my-auto"
          >
            <div className="bg-gradient-to-r from-[#005691] to-blue-600 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider">
                {editingMember ? `CẬP NHẬT: ${editingMember.hoTen}` : 'THÊM MỚI ĐOÀN VIÊN HỌC SINH'}
              </h3>
              <button
                id="close-member-modal-btn"
                onClick={() => setShowMemberModal(false)}
                type="button"
                className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm font-black transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-sm"
                title="Đóng cửa sổ"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mã Đoàn viên * (Tự động cấp)</label>
                  <input
                    id="form-member-ma"
                    type="text"
                    required
                    readOnly
                    value={memberForm.maDoanVien}
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 py-1.5 px-3 text-xs font-mono font-bold text-slate-500 cursor-not-allowed focus:outline-none"
                    placeholder="VD: DV12001"
                    title="Mã đoàn viên được cấp tự động và không thể chỉnh sửa"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Họ và tên *</label>
                  <input
                    id="form-member-hoten"
                    type="text"
                    required
                    value={memberForm.hoTen}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, hoTen: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-[#005691] focus:outline-none"
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={memberForm.ngaySinh}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, ngaySinh: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-[#005691] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Giới tính</label>
                  <select
                    value={memberForm.gioiTinh}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, gioiTinh: e.target.value as 'Nam' | 'Nữ' }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-[#005691] focus:outline-none"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={memberForm.sdt}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, sdt: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-[#005691] focus:outline-none"
                    placeholder="VD: 0912345678"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Địa chỉ Email *</label>
                  <input
                    type="email"
                    required
                    value={memberForm.email}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-[#005691] focus:outline-none"
                    placeholder="VD: email@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Trường THPT</label>
                  <select
                    value={memberForm.truong}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, truong: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-[#005691] focus:outline-none"
                  >
                    {activeSchoolsList.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>


                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chi Đoàn liên kết</label>
                  <select
                    value={memberForm.chiDoan}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, chiDoan: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-[#005691] focus:outline-none"
                  >
                    {CHI_DOAN_LIST.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Địa chỉ thường trú</label>
                  <textarea
                    rows={2}
                    value={memberForm.diaChi}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, diaChi: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-[#005691] focus:outline-none"
                    placeholder="Nhập địa chỉ tạm trú, thường trú"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Trạng thái sinh hoạt *</label>
                  <select
                    value={memberForm.trangThai}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, trangThai: e.target.value as 'Đang hoạt động' | 'Tạm ngưng' | 'Trưởng thành Đoàn' }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-[#005691] focus:outline-none"
                  >
                    <option value="Đang hoạt động">Đang hoạt động sinh hoạt hè</option>
                    <option value="Tạm ngưng">Tạm ngưng sinh hoạt</option>
                    <option value="Trưởng thành Đoàn">Trưởng thành Đoàn (Đã bàn giao)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ảnh đại diện (Tải lên từ thiết bị hoặc nhập URL)</label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {memberForm.anhDaiDien && (
                      <img 
                        src={memberForm.anhDaiDien} 
                        alt="Preview Avatar" 
                        className="h-14 w-14 rounded-full object-cover border-2 border-slate-200 shadow-sm shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="text"
                        value={memberForm.anhDaiDien}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, anhDaiDien: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-[#005691] focus:outline-none"
                        placeholder="Đường dẫn ảnh URL..."
                      />
                      <label className="flex items-center justify-center border border-dashed border-slate-200 bg-slate-50 rounded-lg p-2 hover:bg-slate-100 hover:border-[#005691] cursor-pointer transition-all">
                        <div className="flex items-center gap-1.5">
                          <Upload className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-xs font-semibold text-slate-600">Chọn ảnh tải lên từ thiết bị</span>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const compressedBase64 = await compressAndResizeImage(file, 160, 160, 0.7);
                                setMemberForm(prev => ({ ...prev, anhDaiDien: compressedBase64 }));
                              } catch (err) {
                                console.error('Failed to compress member image:', err);
                                // Fallback
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const base64Url = event.target?.result as string;
                                  setMemberForm(prev => ({ ...prev, anhDaiDien: base64Url }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }
                          }} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-4 py-2 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  id="save-member-btn"
                  type="submit"
                  className="rounded-lg bg-[#005691] hover:bg-[#004270] text-white px-4 py-2 cursor-pointer shadow-sm"
                >
                  Lưu hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVITY CREATE/EDIT DIALOG MODAL */}
      {showActivityModal && (
        <div 
          id="activity-modal-overlay" 
          onClick={() => setShowActivityModal(false)}
          className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm cursor-pointer sm:items-center"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden cursor-default my-auto"
          >
            <div className="bg-gradient-to-r from-purple-700 to-indigo-600 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider">
                {editingActivity ? `SỬA HOẠT ĐỘNG: ${editingActivity.ten}` : 'MỞ HOẠT ĐỘNG TÌNH NGUYỆN MỚI'}
              </h3>
              <button
                id="close-act-modal-btn"
                onClick={() => setShowActivityModal(false)}
                type="button"
                className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm font-black transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-sm"
                title="Đóng cửa sổ"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tên hoạt động / Chiến dịch *</label>
                  <input
                    id="form-act-ten"
                    type="text"
                    required
                    value={activityForm.ten}
                    onChange={(e) => setActivityForm(prev => ({ ...prev, ten: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-purple-600 focus:outline-none"
                    placeholder="VD: Chiến dịch sinh hoạt hè cho thiếu nhi"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phân loại hoạt động</label>
                    <select
                      value={activityForm.loai}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, loai: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-purple-600 focus:outline-none"
                    >
                      <option value="Tình nguyện">Tình nguyện</option>
                      <option value="Chuyên đề">Chuyên đề</option>
                      <option value="Lao động cộng đồng">Lao động cộng đồng</option>
                      <option value="Sinh hoạt hè">Sinh hoạt hè</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Điểm rèn luyện rèn ({activityForm.diemCong} Điểm)</label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={activityForm.diemCong}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, diemCong: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Thời gian tập trung</label>
                    <input
                      type="text"
                      value={activityForm.thoiGian}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, thoiGian: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-purple-600 focus:outline-none"
                      placeholder="YYYY-MM-DD HH:MM"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hạn nộp minh chứng</label>
                    <input
                      type="text"
                      value={activityForm.hanNop}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, hanNop: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-purple-600 focus:outline-none"
                      placeholder="YYYY-MM-DD HH:MM"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Địa điểm tổ chức</label>
                  <input
                    type="text"
                    value={activityForm.diaDiem}
                    onChange={(e) => setActivityForm(prev => ({ ...prev, diaDiem: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-purple-600 focus:outline-none"
                    placeholder="Địa điểm tập kết"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ảnh minh họa (Tải lên từ thiết bị hoặc nhập URL)</label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {activityForm.anh && (
                      <img 
                        src={activityForm.anh} 
                        alt="Preview Activity" 
                        className="h-14 w-20 rounded-lg object-cover border border-slate-200 shadow-sm shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="text"
                        value={activityForm.anh}
                        onChange={(e) => setActivityForm(prev => ({ ...prev, anh: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-purple-600 focus:outline-none"
                        placeholder="Đường dẫn ảnh URL..."
                      />
                      <label className="flex items-center justify-center border border-dashed border-slate-200 bg-slate-50 rounded-lg p-2 hover:bg-slate-100 hover:border-purple-600 cursor-pointer transition-all">
                        <div className="flex items-center gap-1.5">
                          <Upload className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-xs font-semibold text-slate-600">Chọn ảnh tải lên từ thiết bị</span>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const compressedBase64 = await compressAndResizeImage(file, 800, 600, 0.75);
                                setActivityForm(prev => ({ ...prev, anh: compressedBase64 }));
                              } catch (err) {
                                console.error('Failed to compress activity image:', err);
                                // Fallback
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const base64Url = event.target?.result as string;
                                  setActivityForm(prev => ({ ...prev, anh: base64Url }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }
                          }} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                 <div className="flex items-center gap-2 py-2">
                  <input
                    id="edit-activity-locked"
                    type="checkbox"
                    checked={activityForm.locked || false}
                    onChange={(e) => setActivityForm(prev => ({ ...prev, locked: e.target.checked }))}
                    className="h-4 w-4 text-[#005691] focus:ring-[#005691]/20 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="edit-activity-locked" className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer select-none">
                    {activityForm.locked ? (
                      <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                    ) : (
                      <Unlock className="h-4 w-4 text-emerald-600 shrink-0" />
                    )}
                    <span>Khóa điểm danh hoạt động này (Đoàn viên học sinh không thể nộp thêm minh chứng)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nội dung chi tiết hoạt động *</label>
                  <textarea
                    rows={4}
                    required
                    value={activityForm.moTa}
                    onChange={(e) => setActivityForm(prev => ({ ...prev, moTa: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-purple-600 focus:outline-none"
                    placeholder="Mô tả cụ thể vai trò, yêu cầu trang phục, dụng cụ, công việc của các đoàn viên"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-4 py-2 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  id="save-activity-btn"
                  type="submit"
                  className="rounded-lg bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 cursor-pointer shadow-sm"
                >
                  Lưu hoạt động
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TIMEMARK PROOF REVIEW DESK MODAL */}
      {reviewingProof && (
        <div 
          id="review-proof-modal" 
          onClick={() => { setReviewingProof(null); setRejectReason(''); }}
          className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm cursor-pointer sm:items-center"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row cursor-default my-auto"
          >
            
            {/* Left side: TimeMark Image Preview */}
            <div className="md:w-1/2 bg-slate-950 p-3 relative flex flex-col justify-between text-white">
              <div className="relative overflow-hidden rounded-lg flex-1 flex items-center justify-center">
                <img
                  src={reviewingProof.imageUrl}
                  alt="Minh chứng hiện trường"
                  className="max-h-80 w-full object-contain rounded border border-white/5"
                  referrerPolicy="no-referrer"
                />
              </div>

              <p className="text-[10px] text-center text-slate-400 mt-2">
                Ảnh minh chứng chính gốc được bảo mật đầu cuối.
              </p>
            </div>

            {/* Right side: Decisions form */}
            <div className="p-6 md:w-1/2 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">Phê duyệt minh chứng</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Mã minh chứng: <strong className="font-mono">{reviewingProof.id}</strong></p>
                  </div>
                  <button
                    onClick={() => { setReviewingProof(null); setRejectReason(''); }}
                    type="button"
                    className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 text-sm font-black transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-sm"
                    title="Đóng"
                  >
                    ✕
                  </button>
                </div>

                {/* Submitting student profiles */}
                {(() => {
                  const student = members.find(m => m.id === reviewingProof.doanVienId);
                  const act = activities.find(a => a.id === reviewingProof.hoatDongId);
                  
                  return (
                    <div className="space-y-3 text-xs">
                      <div className="bg-slate-50 p-3 rounded-lg space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Đoàn viên nộp bài</p>
                        <p className="font-bold text-slate-800">{student?.hoTen} ({student?.maDoanVien})</p>
                        <p className="text-slate-500 font-medium">{student?.truong}</p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Nộp cho hoạt động hè</p>
                        <p className="font-bold text-slate-800">{act?.ten}</p>
                        <p className="text-[#005691] font-extrabold">Điểm cộng sau duyệt: +{act?.diemCong} Điểm</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Mô tả đóng góp từ Đoàn viên</p>
                        <p className="p-2.5 rounded-lg border border-slate-100 italic bg-slate-50/20 text-slate-600">
                          "{reviewingProof.moTa || 'Không có mô tả chi tiết được đính kèm.'}"
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Form rejection input / buttons */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                
                {reviewingProof.status === 'Chờ duyệt' ? (
                  <div className="space-y-3">
                    <form onSubmit={handleRejectProof} className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Nếu từ chối, hãy ghi rõ lý do để đoàn viên khắc phục:
                      </label>
                      <input
                        type="text"
                        placeholder="Nêu lý do (VD: Sai trang phục, thiếu ảnh timemark...)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-red-500 focus:outline-none"
                      />
                      
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          id="btn-reject-proof"
                          type="submit"
                          className="flex-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 py-2 text-xs font-bold transition-colors cursor-pointer text-center"
                        >
                          Từ chối (Không đạt)
                        </button>
                        
                        <button
                          id="btn-approve-proof"
                          type="button"
                          onClick={() => handleApproveProof(reviewingProof.id)}
                          className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-xs font-bold shadow-md transition-all cursor-pointer text-center"
                        >
                          Duyệt đạt & Cộng điểm
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border text-xs space-y-1.5 text-center bg-slate-50">
                    <p className="font-semibold text-slate-500">Minh chứng này đã được xử lý</p>
                    <p className={`font-bold uppercase ${reviewingProof.status === 'Đã duyệt' ? 'text-emerald-600' : 'text-red-500'}`}>
                      Trạng thái: {reviewingProof.status}
                    </p>
                    {reviewingProof.rejectedReason && (
                      <p className="text-red-500 italic mt-1">"Lý do từ chối: {reviewingProof.rejectedReason}"</p>
                    )}
                  </div>
                )}
                
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TRUONGHOC CREATE/EDIT DIALOG MODAL */}
      {showTruongHocModal && (
        <div 
          id="truonghoc-modal-overlay" 
          onClick={() => setShowTruongHocModal(false)}
          className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm cursor-pointer sm:items-center"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden cursor-default my-auto"
          >
            <div className="bg-gradient-to-r from-[#005691] to-blue-600 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider">
                {editingTruongHoc ? `CẬP NHẬT TRƯỜNG HỌC: ${editingTruongHoc.tenTruong}` : 'THÊM TRƯỜNG HỌC LIÊN KẾT MỚI'}
              </h3>
              <button
                id="close-truonghoc-modal-btn"
                onClick={() => setShowTruongHocModal(false)}
                type="button"
                className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm font-black transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-sm"
                title="Đóng cửa sổ"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTruongHoc} className="p-6 space-y-4">
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tên Trường học *</label>
                  <input
                    type="text"
                    required
                    value={truongHocForm.tenTruong}
                    onChange={(e) => setTruongHocForm(prev => ({ ...prev, tenTruong: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20"
                    placeholder="Ví dụ: THPT Nguyễn Trãi"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Địa chỉ trường *</label>
                  <input
                    type="text"
                    required
                    value={truongHocForm.diaChi}
                    onChange={(e) => setTruongHocForm(prev => ({ ...prev, diaChi: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20"
                    placeholder="Ví dụ: Đường CMT8, Khu phố 3, Tân Hiệp"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hiệu trưởng trường học *</label>
                  <input
                    type="text"
                    required
                    value={truongHocForm.hieuTruong}
                    onChange={(e) => setTruongHocForm(prev => ({ ...prev, hieuTruong: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20"
                    placeholder="Họ tên Hiệu trưởng"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Số điện thoại liên hệ *</label>
                  <input
                    type="tel"
                    required
                    value={truongHocForm.sdtLienHe}
                    onChange={(e) => setTruongHocForm(prev => ({ ...prev, sdtLienHe: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20"
                    placeholder="Ví dụ: 0912345678"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mô tả đặc điểm / Ghi chú</label>
                  <textarea
                    rows={3}
                    value={truongHocForm.moTa}
                    onChange={(e) => setTruongHocForm(prev => ({ ...prev, moTa: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20"
                    placeholder="Ghi chú thêm thông tin liên hệ phụ hoặc ghi chú khác"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowTruongHocModal(false)}
                  className="rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-4 py-2 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  id="save-truonghoc-btn"
                  type="submit"
                  className="rounded-lg bg-[#005691] hover:bg-[#004b7f] text-white px-4 py-2 cursor-pointer shadow-sm border border-[#005691]/10"
                >
                  {editingTruongHoc ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmState && (
        <div 
          id="custom-confirm-modal-overlay"
          onClick={() => setConfirmState(null)}
          className="fixed inset-0 z-55 flex justify-center items-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm cursor-pointer"
        >
          <div 
            id="custom-confirm-modal-card"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 cursor-default animate-fade-in my-auto"
          >
            <div className={`px-5 py-4 flex items-center gap-2.5 text-white ${
              confirmState.type === 'danger' 
                ? 'bg-red-600' 
                : confirmState.type === 'warning'
                ? 'bg-amber-500'
                : 'bg-[#005691]'
            }`}>
              <h3 className="font-extrabold text-xs uppercase tracking-wider">
                {confirmState.title}
              </h3>
            </div>
            
            <div className="p-5">
              <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                {confirmState.message}
              </p>
              
              <div className="mt-5 flex items-center justify-end gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setConfirmState(null)}
                  className="rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-4 py-2 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmState.onConfirm}
                  className={`rounded-lg text-white px-4 py-2 cursor-pointer shadow-sm border ${
                    confirmState.type === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 border-red-600/10'
                      : confirmState.type === 'warning'
                      ? 'bg-amber-500 hover:bg-amber-600 border-amber-500/10'
                      : 'bg-[#005691] hover:bg-[#004b7f] border-[#005691]/10'
                  }`}
                >
                  Đồng ý
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5.1: OFFICIAL PDF PRINT PREVIEW OVERLAY */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 flex flex-col no-print overflow-hidden animate-fade-in">
          {/* Top controller panel */}
          <div className="bg-slate-800 text-white px-5 py-4 flex flex-col sm:flex-row items-center justify-between border-b border-slate-700/50 gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#005691] text-white flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-100">Bản xem trước trình ký PDF chuẩn (Khổ giấy A4)</h3>
                <p className="text-[10px] text-amber-400 font-semibold mt-0.5">
                  Mẹo: Chọn máy in "Lưu dưới dạng PDF" (Save as PDF) tại hộp thoại trình duyệt để tải tệp PDF chất lượng cao.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow"
              >
                <Printer className="h-4 w-4" />
                In Báo cáo (Lưu PDF)
              </button>
              <button
                type="button"
                onClick={() => setShowPrintPreview(false)}
                className="rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Đóng bản xem trước
              </button>
            </div>
          </div>

          {/* Paper stage workspace */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-700/40">
            {/* The wrapper that will be extracted in print media */}
            <div className="print-area-wrapper mx-auto">
              <div 
                id="print-area" 
                className="mx-auto bg-white p-12 sm:p-16 w-full max-w-[210mm] min-h-[297mm] shadow-2xl text-slate-800 font-sans leading-relaxed text-xs flex flex-col justify-between" 
                style={{ color: '#000000', fontFamily: 'Times New Roman, Inter, sans-serif' }}
              >
                {/* Header portion */}
                <div>
                  <div className="grid grid-cols-12 gap-2 text-center pb-3">
                    <div className="col-span-5 space-y-1">
                      <p className="text-[10px] tracking-wide text-slate-800 uppercase font-medium">ĐOÀN TNCS HỒ CHÍ MINH</p>
                      <p className="text-[11px] text-slate-900 font-black uppercase">BCH CHI ĐOÀN KHU PHỐ TÂN HIỆP</p>
                      <p className="text-[10px] text-slate-500 font-medium">Số: 06-BC/KP-CĐ</p>
                      <div className="w-24 border-b border-slate-900 mx-auto pt-1"></div>
                    </div>

                    <div className="col-span-7 space-y-1">
                      <p className="text-[11px] tracking-wider text-slate-900 font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                      <p className="text-[11px] text-slate-900 font-black uppercase tracking-wide">Độc lập - Tự do - Hạnh phúc</p>
                      <p className="text-[10px] text-slate-500 italic mt-1">Tân Hiệp, ngày 25 tháng 06 năm 2026</p>
                      <div className="w-32 border-b border-slate-900 mx-auto pt-1"></div>
                    </div>
                  </div>

                  {/* Title of standard document */}
                  <div className="text-center mt-12 mb-8 space-y-1">
                    <p className="text-xs text-slate-800 font-bold uppercase tracking-wider">BÁO CÁO TỔNG HỢP</p>
                    <h1 className="text-base text-slate-950 font-black uppercase leading-normal tracking-wide max-w-xl mx-auto">
                      KẾT QUẢ RÈN LUYỆN VÀ ĐIỂM TÍCH LŨY HÈ ĐOÀN VIÊN NĂM 2026
                    </h1>
                    <p className="text-[10px] text-slate-500 italic">
                      (V/v: Tổng kết rèn luyện sinh hoạt hè cho học sinh khối 12 lớp bàn giao về địa bàn dân cư)
                    </p>
                  </div>

                  {/* Recipients list */}
                  <div className="space-y-1 pl-4 my-6 text-[11px]">
                    <div className="font-bold flex gap-2">
                      <span className="w-20 shrink-0 italic">Kính gửi:</span>
                      <span className="space-y-0.5 text-left">
                        <p>- Ban Thường vụ Quận Đoàn,</p>
                        <p>- Đảng ủy, Hội đồng Nhân dân, Ủy ban Nhân dân Phường Tân Hiệp,</p>
                        <p>- Ban Chấp hành Đoàn phường Tân Hiệp.</p>
                      </span>
                    </div>
                  </div>

                  {/* Descriptive text block */}
                  <div className="text-[11px] leading-relaxed text-justify space-y-3">
                    <p>
                      Thực hiện Chương trình chỉ đạo rèn luyện đoàn viên hè và chiến dịch bàn giao, tiếp nhận học sinh khối 12 THPT về tham gia rèn luyện đóng góp xây dựng địa phương năm học 2025 - 2026. Ban Chấp hành Chi đoàn Khu phố Tân Hiệp đã tổ chức nhiều chuỗi hoạt động tuyên truyền, tình nguyện, lao động bảo vệ môi trường, văn hóa văn nghệ thể thao hè có gán điểm rèn luyện.
                    </p>
                    <p>
                      Thông qua hệ thống chứng thực TimeMark kèm mốc mộc ngày giờ và định vị vệ tinh GPS chống gian lận, BCH Chi đoàn đã thực hiện rà soát nghiêm ngặt từng minh chứng lao động đóng góp thực tế. BCH Chi đoàn trân trọng kính báo cáo kết quả rèn luyện hè của toàn thể đoàn viên khối 12 sinh hoạt hè tại khu phố như sau:
                    </p>
                  </div>

                  {/* Statistical grid for quick evaluation */}
                  <div className="my-6 p-4 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Đoàn viên quản lý</p>
                      <p className="text-base font-extrabold text-slate-900 mt-0.5">{members.length} ĐV</p>
                    </div>
                    <div className="border-x border-slate-200">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Minh chứng đã duyệt</p>
                      <p className="text-base font-extrabold text-[#005691] mt-0.5">
                        {proofs.filter(p => p.status === 'Đã duyệt').length} hoạt động
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Đạt danh hiệu Khá / XS</p>
                      <p className="text-base font-extrabold text-emerald-700 mt-0.5">
                        {members.length === 0 ? '0%' : `${Math.round((members.filter(m => m.diemTichLuy >= 40).length / members.length) * 100)}%`}
                      </p>
                    </div>
                  </div>

                  {/* Main compilation table */}
                  <div className="mt-6">
                    <p className="font-bold text-[11px] uppercase tracking-wider text-slate-800 mb-2 text-left">
                      DANH SÁCH CHI TIẾT ĐOÀN VIÊN VÀ KẾT QUẢ PHÂN LOẠI HÈ:
                    </p>
                    <table className="w-full border-collapse border border-slate-300 text-[10px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-300 text-slate-800 font-black uppercase text-[9px]">
                          <th className="border border-slate-300 p-2 text-center w-10">STT</th>
                          <th className="border border-slate-300 p-2 text-left">Mã Số ĐV</th>
                          <th className="border border-slate-300 p-2 text-left">Họ và Tên Đoàn Viên</th>
                          <th className="border border-slate-300 p-2 text-left">Trường THPT Liên Kết</th>
                          <th className="border border-slate-300 p-2 text-center w-24">Số Minh Chứng</th>
                          <th className="border border-slate-300 p-2 text-center w-20">Điểm Hè</th>
                          <th className="border border-slate-300 p-2 text-center w-36">Xếp Loại Hè</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                        {[...members].sort((a,b) => b.diemTichLuy - a.diemTichLuy).map((m, idx) => {
                          const approvedCount = proofs.filter(p => p.doanVienId === m.id && p.status === 'Đã duyệt').length;
                          
                          let classification = 'Chưa hoàn thành';
                          if (m.diemTichLuy >= 80) {
                            classification = 'Xuất Sắc';
                          } else if (m.diemTichLuy >= 40) {
                            classification = 'Khá';
                          } else if (m.diemTichLuy > 0) {
                            classification = 'Trung bình';
                          }

                          return (
                            <tr key={m.id} className="hover:bg-slate-50/50">
                              <td className="border border-slate-300 p-2 text-center font-bold">{idx + 1}</td>
                              <td className="border border-slate-300 p-2 font-mono">{m.maDoanVien}</td>
                              <td className="border border-slate-300 p-2 font-bold text-left">{m.hoTen}</td>
                              <td className="border border-slate-300 p-2 text-left">{m.truong}</td>
                              <td className="border border-slate-300 p-2 text-center">{approvedCount}</td>
                              <td className="border border-slate-300 p-2 text-center font-black text-[#005691]">{m.diemTichLuy}</td>
                              <td className="border border-slate-300 p-2 text-center font-bold">
                                <span className={
                                  classification === 'Xuất Sắc' ? 'text-amber-700' :
                                  classification === 'Khá' ? 'text-blue-700' : 'text-slate-500'
                                }>
                                  {classification}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Signatures portion */}
                <div className="mt-12 pt-6 border-t border-dashed border-slate-200">
                  <div className="grid grid-cols-2 text-center text-[11px] leading-relaxed">
                    <div className="space-y-1">
                      <p className="font-bold uppercase">NGƯỜI LẬP BIỂU</p>
                      <p className="text-[9px] text-slate-400 italic">(Ký, ghi rõ họ tên)</p>
                      <div className="h-20"></div>
                      <p className="font-bold text-slate-800">Phan Minh Trí</p>
                      <p className="text-[10px] text-slate-400 font-medium">Ủy viên BCH Chi đoàn</p>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold uppercase text-slate-900">TM. BAN CHẤP HÀNH CHI ĐOÀN</p>
                      <p className="font-black uppercase text-[#005691]">BÍ THƯ</p>
                      <p className="text-[9px] text-slate-400 italic">(Ký, đóng dấu, ghi rõ họ tên)</p>
                      <div className="h-20"></div>
                      <p className="font-bold text-slate-800">Nguyễn Văn Hải</p>
                      <p className="text-[10px] text-slate-400 font-medium">Bí thư Chi đoàn Khu phố</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {handleRenderAttendanceModal()}

    </div>
  );
}
