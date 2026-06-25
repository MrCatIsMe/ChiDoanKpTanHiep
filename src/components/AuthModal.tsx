import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User, DoanVien, TruongHoc } from '../types';
import { TRUONG_LIST, CHI_DOAN_LIST } from '../data/mockData';
import { compressAndResizeImage } from '../utils/image';
import { 
  Shield, GraduationCap, Lock, Mail, Eye, EyeOff, Sparkles, 
  Upload, UserPlus, ArrowLeft, Phone, User as UserIcon, Calendar, MapPin,
  CheckCircle2, Info, KeyRound
} from 'lucide-react';

interface AuthModalProps {
  onLogin: (user: User) => void;
  users: User[];
  doanViens: DoanVien[];
  onClose: () => void;
  onRegister?: (newMember: DoanVien, newUser: User) => void;
  truongHoc?: TruongHoc[];
}

export default function AuthModal({ onLogin, users, doanViens, onClose, onRegister, truongHoc = [] }: AuthModalProps) {
  // Mode: 'login', 'register' or 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const schoolOptions = truongHoc && truongHoc.length > 0 
    ? truongHoc.map(t => t.tenTruong) 
    : TRUONG_LIST;

  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleMode, setRoleMode] = useState<'admin' | 'member'>('member');

  // Register states
  const [regHoTen, setRegHoTen] = useState('');
  const [regMaDV, setRegMaDV] = useState(() => `DV${Math.floor(12000 + Math.random() * 8000)}`);
  const [regNgaySinh, setRegNgaySinh] = useState('2008-01-01');
  const [regGioiTinh, setRegGioiTinh] = useState<'Nam' | 'Nữ'>('Nam');
  const [regSdt, setRegSdt] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTruong, setRegTruong] = useState(schoolOptions[0] || 'THPT Tân Đông Hiệp');
  const [regChiDoan, setRegChiDoan] = useState(CHI_DOAN_LIST[0] || 'Chi đoàn Khu phố Tân Hiệp');
  const [regDiaChi, setRegDiaChi] = useState('');
  const [regAvatar, setRegAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');

  const [error, setError] = useState('');

  // Handle local image avatar upload for registration
  const handleRegAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressAndResizeImage(file, 160, 160, 0.7);
        setRegAvatar(compressedBase64);
      } catch (err) {
        console.error('Failed to compress avatar image:', err);
        // Fallback to standard reader if compression fails
        const reader = new FileReader();
        reader.onload = (event) => {
          setRegAvatar(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ tài khoản và mật khẩu');
      return;
    }

    if (roleMode === 'admin') {
      const isCorrectAdmin = 
        (email.toLowerCase() === 'admin' || email.toLowerCase() === 'admin@doan.vn') && 
        password === 'admin';
        
      if (isCorrectAdmin) {
        const foundAdmin = users.find(u => u.role === 'admin') || {
          id: 'u-admin',
          email: 'admin@doan.vn',
          role: 'admin'
        };
        onLogin(foundAdmin);
        onClose();
      } else {
        setError('Tài khoản hoặc mật khẩu Ban Chấp Hành (Admin) không chính xác.');
      }
      return;
    }

    // Authenticate against our list (for normal members)
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
      if (foundUser.role !== roleMode) {
        setError(`Tài khoản này thuộc vai trò ${foundUser.role === 'admin' ? 'Bí thư' : 'Đoàn viên'}. Hãy chọn đúng vai trò.`);
        return;
      }
      
      onLogin(foundUser);
      onClose();
    } else {
      setError('Tài khoản Email đăng nhập không tồn tại trong hệ thống chi đoàn.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError('Vui lòng nhập địa chỉ email đã đăng ký của em.');
      return;
    }

    setForgotLoading(true);
    setError('');
    setForgotSuccess(false);

    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      let errorMsg = 'Có lỗi xảy ra khi gửi liên kết khôi phục. Vui lòng kiểm tra lại kết nối mạng.';
      if (err.code === 'auth/user-not-found') {
        errorMsg = 'Địa chỉ email này chưa được đăng ký trong hệ thống.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Địa chỉ email không hợp lệ. Vui lòng nhập đúng định dạng.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMsg = 'Không thể kết nối với máy chủ Firebase. Vui lòng thử lại sau.';
      } else if (err.message && err.message.includes('offline')) {
        errorMsg = 'Không thể kết nối. Hệ thống đang hoạt động ở chế độ offline hoặc Firebase chưa được kích hoạt.';
      }
      setError(errorMsg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regHoTen || !regMaDV || !regEmail || !regPassword) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    // Check if email or student ID already exists
    const emailExists = users.some(u => u.email.toLowerCase() === regEmail.toLowerCase());
    const idExists = doanViens.some(d => d.maDoanVien.toLowerCase() === regMaDV.toLowerCase());

    if (emailExists) {
      setError('Email đăng ký đã được sử dụng trong hệ thống.');
      return;
    }
    if (idExists) {
      setError('Mã đoàn viên này đã tồn tại trong hệ thống.');
      return;
    }

    // Create DoanVien and User objects
    const newDoanVienId = `dv-${Date.now()}`;
    const newDoanVien: DoanVien = {
      id: newDoanVienId,
      maDoanVien: regMaDV,
      hoTen: regHoTen,
      ngaySinh: regNgaySinh,
      gioiTinh: regGioiTinh,
      sdt: regSdt || '0900000000',
      email: regEmail,
      truong: regTruong,
      lop: 'N/A',
      chiDoan: regChiDoan,
      diaChi: regDiaChi || 'Chưa cập nhật',
      anhDaiDien: regAvatar,
      trangThai: 'Đang hoạt động',
      diemTichLuy: 0
    };

    const newUser: User = {
      id: `u-${Date.now()}`,
      email: regEmail,
      role: 'member',
      doanVienId: newDoanVienId
    };

    if (onRegister) {
      onRegister(newDoanVien, newUser);
    }
    
    // Automatically log in
    onLogin(newUser);
    onClose();
  };

  const handleQuickLogin = (presetEmail: string, presetRole: 'admin' | 'member') => {
    setRoleMode(presetRole);
    setEmail(presetEmail);
    setPassword('••••••••');
    const foundUser = users.find(u => u.email === presetEmail);
    if (foundUser) {
      onLogin(foundUser);
      onClose();
    }
  };

  return (
    <div 
      id="auth-modal-overlay" 
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm cursor-pointer sm:items-center"
    >
      <div 
        id="auth-modal-card" 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-100 cursor-default my-auto"
      >
        {/* Dynamic header banner with Union Blue gradient */}
        <div className="bg-gradient-to-br from-[#005691] to-[#0082c8] px-6 py-6 text-center text-white relative">
          <div className="absolute top-4 right-4 z-10">
            <button 
              id="auth-close-btn"
              onClick={onClose}
              type="button"
              className="rounded-full bg-white/20 hover:bg-white/30 p-2 text-white hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center h-8 w-8 border border-white/10 shadow-sm"
              title="Đóng"
            >
              <span className="text-sm font-black leading-none">✕</span>
            </button>
          </div>
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
            {mode === 'login' ? (
              <GraduationCap className="h-5 w-5 text-white" />
            ) : mode === 'register' ? (
              <UserPlus className="h-5 w-5 text-white" />
            ) : (
              <KeyRound className="h-5 w-5 text-white animate-pulse" />
            )}
          </div>
          <h3 className="text-base sm:text-lg font-black tracking-wider uppercase">
            {mode === 'login' ? 'HỆ THỐNG ĐĂNG NHẬP' : mode === 'register' ? 'ĐĂNG KÝ ĐOÀN VIÊN MỚI' : 'KHÔI PHỤC MẬT KHẨU'}
          </h3>
          <p className="mt-0.5 text-[10px] sm:text-xs text-blue-100 font-medium">Cổng thông tin & quản lý hoạt động hè Đoàn khối 12</p>
        </div>

        <div className="p-5 sm:p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100 flex items-start gap-1.5 font-semibold">
              <span className="shrink-0 font-extrabold">Lỗi:</span>
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* ================= LOGIN FORM ================= */
            <div className="space-y-4">
              {/* Role selector tabs */}
              <div className="flex rounded-lg bg-slate-100 p-1">
                <button
                  id="tab-role-member"
                  type="button"
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-bold transition-all ${
                    roleMode === 'member'
                      ? 'bg-white text-[#005691] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  onClick={() => {
                    setRoleMode('member');
                    setError('');
                  }}
                >
                  <GraduationCap className="h-4.5 w-4.5" />
                  Đoàn viên học sinh
                </button>
                <button
                  id="tab-role-admin"
                  type="button"
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-bold transition-all ${
                    roleMode === 'admin'
                      ? 'bg-white text-[#005691] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  onClick={() => {
                    setRoleMode('admin');
                    setError('');
                  }}
                >
                  <Shield className="h-4.5 w-4.5" />
                  Bí thư (Admin)
                </button>
              </div>

              <form onSubmit={handleSubmitLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    {roleMode === 'admin' ? 'Tài khoản quản trị' : 'Địa chỉ Email'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                    <input
                      id="login-email-input"
                      type="text"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder={roleMode === 'admin' ? 'Nhập "admin" hoặc email' : 'vd: nguyenvanan@student.edu.vn'}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Mật khẩu đầu vào
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError('');
                        setForgotEmail(email);
                      }}
                      className="text-[10px] font-bold text-[#005691] hover:underline cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Nhập mật khẩu của bạn"
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-xs text-slate-800 focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20"
                    />
                    <button
                      id="toggle-password-btn"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-2.5 right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  className="w-full rounded-lg bg-gradient-to-r from-[#005691] to-[#0082c8] py-2 text-xs font-bold text-white shadow hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer mt-1"
                >
                  ĐĂNG NHẬP NGAY
                </button>
              </form>

              {roleMode === 'member' && (
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500 font-semibold">
                    Chưa có tài khoản đoàn viên?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setError('');
                      }}
                      className="text-[#005691] hover:underline font-extrabold cursor-pointer"
                    >
                      Đăng ký ngay tại đây
                    </button>
                  </p>
                </div>
              )}
            </div>
          ) : mode === 'register' ? (
            /* ================= REGISTER FORM ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#005691]">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Quay lại Đăng nhập</span>
                </button>
              </div>

              {/* Avatar upload */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                <img
                  src={regAvatar}
                  alt="Avatar"
                  className="h-14 w-14 rounded-full object-cover border-2 border-white shadow shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 w-full text-center sm:text-left space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ảnh chân dung cá nhân</p>
                  <label className="inline-flex items-center gap-1.5 bg-[#005691] hover:bg-[#004777] text-white font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-all shadow-sm">
                    <Upload className="h-3.5 w-3.5" />
                    Tải ảnh từ thiết bị
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleRegAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Input grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    Họ và Tên đoàn viên *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={regHoTen}
                      onChange={(e) => setRegHoTen(e.target.value)}
                      placeholder="VD: Trần Hoàng Long"
                      className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    Mã số Đoàn viên *
                  </label>
                  <input
                    type="text"
                    required
                    value={regMaDV}
                    onChange={(e) => setRegMaDV(e.target.value)}
                    placeholder="VD: DV12101"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-mono font-bold text-slate-700 focus:border-[#005691] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    Ngày sinh *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={regNgaySinh}
                      onChange={(e) => setRegNgaySinh(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={regGioiTinh}
                    onChange={(e) => setRegGioiTinh(e.target.value as 'Nam' | 'Nữ')}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    Số điện thoại liên lạc *
                  </label>
                  <div className="relative">
                    <Phone className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={regSdt}
                      onChange={(e) => setRegSdt(e.target.value)}
                      placeholder="VD: 0912445566"
                      className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    Địa chỉ Email đăng nhập *
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="VD: long.tran@student.edu.vn"
                      className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    Mật khẩu đăng nhập *
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Nhập mật khẩu an toàn"
                      className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-9 text-xs text-slate-800 focus:border-[#005691] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-2.5 right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    Trường học hiện tại
                  </label>
                  <select
                    value={regTruong}
                    onChange={(e) => setRegTruong(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none"
                  >
                    {schoolOptions.map(sc => (
                      <option key={sc} value={sc}>{sc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    Chi đoàn Liên kết địa bàn
                  </label>
                  <select
                    value={regChiDoan}
                    onChange={(e) => setRegChiDoan(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none"
                  >
                    {CHI_DOAN_LIST.map(cd => (
                      <option key={cd} value={cd}>{cd}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    Địa chỉ thường trú (Địa bàn sinh hoạt hè) *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                    <textarea
                      required
                      rows={2}
                      value={regDiaChi}
                      onChange={(e) => setRegDiaChi(e.target.value)}
                      placeholder="Nhập địa chỉ nhà của em tại địa bàn quản lý..."
                      className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer mt-2 flex items-center justify-center gap-1.5"
              >
                <UserPlus className="h-4 w-4" />
                <span>ĐĂNG KÝ HỒ SƠ ĐOÀN VIÊN MỚI</span>
              </button>
            </form>
          ) : (
            /* ================= FORGOT PASSWORD FORM ================= */
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#005691]">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setForgotSuccess(false);
                  }}
                  className="flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Quay lại Đăng nhập</span>
                </button>
              </div>

              {forgotSuccess ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-5 text-center space-y-3.5">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-6 w-6 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-800">Gửi yêu cầu thành công!</h4>
                    <p className="text-[11px] text-emerald-700 leading-relaxed mt-1">
                      Hệ thống đã gửi một liên kết khôi phục mật khẩu đến hòm thư <strong className="font-extrabold">{forgotEmail}</strong>. Vui lòng kiểm tra hộp thư đến (và thư rác/spam) để thực hiện đặt lại mật khẩu mới.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setForgotSuccess(false);
                    }}
                    className="w-full rounded-lg bg-[#005691] hover:bg-[#0082c8] text-white py-2 text-xs font-bold transition-all shadow-sm"
                  >
                    Quay lại Đăng nhập
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">


                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                      Email đăng ký khôi phục *
                    </label>
                    <div className="relative">
                      <Mail className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setError('');
                        }}
                        placeholder="vd: nguyenvanan@student.edu.vn"
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-[#005691] focus:outline-none focus:ring-1 focus:ring-[#005691]/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full rounded-lg bg-gradient-to-r from-[#005691] to-[#0082c8] py-2 text-xs font-bold text-white shadow hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    {forgotLoading ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        ĐANG GỬI LIÊN KẾT...
                      </>
                    ) : (
                      'GỬI LIÊN KẾT KHÔI PHỤC'
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Clean back to landing button for production */}
          {mode === 'login' && (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 py-2 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>✕ Quay lại Trang chủ</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
