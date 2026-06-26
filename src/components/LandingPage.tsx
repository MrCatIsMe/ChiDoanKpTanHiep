import React, { useState, useMemo } from 'react';
import logoImage from '../assets/images/tanhiep_youth_union_logo_1782466186789.jpg';
import Ripple from './RippleEffect';
import { HoatDong, DoanVien, MinhChung, User } from '../types';
import { 
  Users, School, Calendar, FileCheck, ShieldAlert, CheckCircle2, 
  MapPin, Clock, ArrowRight, BookOpen, Star, Info, Mail, Phone, ExternalLink,
  Search, Trophy, Medal, Filter, Award, ChevronDown, ChevronUp, LogOut
} from 'lucide-react';

interface LandingPageProps {
  onOpenLogin: () => void;
  activities: HoatDong[];
  members: DoanVien[];
  proofs: MinhChung[];
  currentUser: User | null;
  onGoToDashboard: () => void;
  onLogout: () => void;
}

export default function LandingPage({ 
  onOpenLogin, 
  activities, 
  members, 
  proofs,
  currentUser,
  onGoToDashboard,
  onLogout
}: LandingPageProps) {
  
  // Leaderboard states
  const [selectedSchool, setSelectedSchool] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(10);

  // Calculate stats
  const totalMembers = members.length;
  const totalSchools = new Set(members.map(m => m.truong)).size;
  const totalActivities = activities.length;
  const totalApprovedProofs = proofs.filter(p => p.status === 'Đã duyệt').length;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and title */}
            <div className="flex items-center gap-3">
              {/* Vietnam Youth Union emblem stylized custom image */}
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-md flex items-center justify-center bg-slate-900 border border-slate-200">
                <img 
                  src={logoImage} 
                  alt="Logo Chi Đoàn" 
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#005691] sm:text-base leading-tight uppercase tracking-tight">
                  Chi Đoàn KP Tân Hiệp
                </h1>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  Phường Tân Đông Hiệp • TP. HCM
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button 
                id="nav-home"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                className="text-slate-600 hover:text-[#005691] transition-colors cursor-pointer"
              >
                Trang chủ
              </button>
              <button 
                id="nav-about"
                onClick={() => scrollToSection('gioi-thieu')} 
                className="text-slate-600 hover:text-[#005691] transition-colors cursor-pointer"
              >
                Giới thiệu
              </button>
              <button 
                id="nav-activities"
                onClick={() => scrollToSection('hoat-dong')} 
                className="text-slate-600 hover:text-[#005691] transition-colors cursor-pointer"
              >
                Hoạt động hè
              </button>
              <button 
                id="nav-leaderboard"
                onClick={() => scrollToSection('xep-hang')} 
                className="text-slate-600 hover:text-[#005691] transition-colors cursor-pointer font-semibold text-[#005691]/90"
              >
                Bảng xếp hạng
              </button>
              <button 
                id="nav-contact"
                onClick={() => scrollToSection('lien-he')} 
                className="text-slate-600 hover:text-[#005691] transition-colors cursor-pointer"
              >
                Liên hệ
              </button>
            </nav>

            {/* Login / Dashboard buttons */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg max-w-[150px] truncate" title={currentUser.email}>
                  {currentUser.role === 'admin' ? 'Bí thư' : 'Đoàn viên'}
                </span>
                <button
                  id="landing-dashboard-btn"
                  onClick={onGoToDashboard}
                  className="rounded-lg bg-[#005691] hover:bg-[#004270] text-white px-3 py-2 text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                >
                  {currentUser.role === 'admin' ? 'Vào Quản Trị' : 'Vào Cá Nhân'}
                  <ExternalLink className="h-3 w-3" />
                </button>
                <button
                  id="landing-logout-btn"
                  onClick={onLogout}
                  className="rounded-lg bg-red-50 hover:bg-red-100 text-red-600 p-2 text-xs font-bold active:scale-95 transition-all flex items-center gap-1 cursor-pointer border border-red-100"
                  title="Đăng xuất"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Đăng xuất</span>
                </button>
              </div>
            ) : (
              <button
                id="landing-login-btn"
                onClick={onOpenLogin}
                className="relative overflow-hidden rounded-lg bg-[#005691] hover:bg-[#004270] text-white px-4 py-2 text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Đăng nhập hệ thống
                <ArrowRight className="h-3.5 w-3.5" />
                <Ripple />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH STARTUP DECORATION */}
      <section className="relative overflow-hidden bg-slate-50 py-16 md:py-24 border-b border-slate-100">
        {/* Abstract background mesh grid & blurred decorative shapes */}
        <div className="absolute inset-0 pointer-events-none opacity-30 select-none">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dotGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#005691" opacity="0.12" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotGrid)" />
          </svg>
          <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-blue-400/20 blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-emerald-300/20 blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50/80 backdrop-blur-sm px-3.5 py-1.5 text-xs font-bold text-[#005691] border border-blue-100 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="font-display uppercase tracking-wider text-[10px]">CỔNG CHUYỂN ĐỔI SỐ HOẠT ĐỘNG HÈ 2026</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl leading-tight font-display">
                Kết nối đoàn viên <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#005691] via-[#0284c7] to-emerald-500 bg-clip-text text-transparent">
                  Lan tỏa hoạt động hè
                </span>
              </h2>
              <p className="mx-auto lg:mx-0 max-w-xl text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                Nền tảng quản trị và ghi nhận rèn rèn hè trực tuyến chuyên nghiệp dành cho học sinh lớp 12 trên địa bàn dân cư. Đơn giản hóa thủ tục, tích điểm công bằng thông qua công nghệ đóng dấu mộc ảnh TimeMark bảo mật cao.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                {currentUser ? (
                  <button
                    id="hero-dashboard-btn"
                    onClick={onGoToDashboard}
                    className="relative overflow-hidden w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-teal-900/15 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {currentUser.role === 'admin' ? 'Vào Bảng Quản Trị' : 'Vào Hồ Sơ Cá Nhân'}
                    <ExternalLink className="h-4 w-4" />
                    <Ripple />
                  </button>
                ) : (
                  <button
                    id="hero-login-btn"
                    onClick={onOpenLogin}
                    className="relative overflow-hidden w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#005691] to-[#0284c7] hover:from-[#004b7f] hover:to-[#0274b0] px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-900/15 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Đăng nhập hệ thống
                    <ArrowRight className="h-4 w-4" />
                    <Ripple />
                  </button>
                )}
                <button
                  id="hero-view-btn"
                  onClick={() => scrollToSection('hoat-dong')}
                  className="relative overflow-hidden w-full sm:w-auto rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 px-6 py-3.5 text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:border-slate-300 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Xem hoạt động hè
                  <Ripple color="rgba(0, 0, 0, 0.08)" />
                </button>
              </div>
            </div>

            {/* Right Media Column - Vietnamese Youth Volunteering Illustration */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 to-emerald-400 opacity-25 blur-2xl"></div>
              <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-3 shadow-2xl transition-all duration-500 hover:scale-[1.01]">
                <img
                  id="hero-img-volunteer"
                  src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80"
                  alt="Thanh niên tình nguyện"
                  className="h-64 sm:h-80 w-full object-cover rounded-2xl"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-slate-900/85 backdrop-blur-md p-4 text-white border border-white/10 shadow-lg">
                  <span className="text-[9px] font-extrabold text-blue-400 tracking-widest uppercase bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">Hoạt động hè tiêu biểu</span>
                  <h4 className="font-bold text-sm sm:text-base mt-2 text-white leading-snug">Chiến dịch Hoa Phượng Đỏ & Mùa hè xanh</h4>
                  <p className="text-[10px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    Chung tay xây dựng cảnh quan địa phương, nếp sống đô thị văn minh và hướng dẫn ôn tập sinh hoạt hè cho các em thiếu nhi.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STATISTICS COUNTERS */}
      <section className="relative z-10 -mt-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-4 rounded-3xl bg-white p-6 shadow-xl md:grid-cols-4 border border-slate-100/80">
            
            <div className="flex flex-col items-center justify-center p-3 text-center border-r last:border-0 border-slate-100 transition-all hover:scale-102">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#005691] mb-2 shadow-inner">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-2xl font-black text-slate-900 font-display">{totalMembers}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Tổng Đoàn viên</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 text-center md:border-r border-slate-100 transition-all hover:scale-102">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-2 shadow-inner">
                <School className="h-5 w-5" />
              </div>
              <span className="text-2xl font-black text-slate-900 font-display">{totalSchools}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Trường THPT</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 text-center border-r border-slate-100 transition-all hover:scale-102">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 mb-2 shadow-inner">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="text-2xl font-black text-slate-900 font-display">{totalActivities}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Hoạt động hè</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 text-center transition-all hover:scale-102">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 mb-2 shadow-inner">
                <FileCheck className="h-5 w-5" />
              </div>
              <span className="text-2xl font-black text-slate-900 font-display">{totalApprovedProofs}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Chứng chỉ đã duyệt</span>
            </div>

          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="gioi-thieu" className="py-20 bg-white border-b border-slate-100 scroll-mt-10 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3.5 mb-16">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#005691] bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 font-display">MÔ HÌNH TIỆN ÍCH CHUYÊN BIỆT</span>
            <h4 className="text-2xl font-black text-slate-900 sm:text-3xl font-display">Giải pháp chuyển đổi số thông minh</h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              Ứng dụng được thiết kế tối ưu hóa cho di động, giao diện thân thiện, dễ nộp minh chứng ngay tại hiện trường hoạt động tình nguyện hè.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            
            <div className="group rounded-3xl border border-slate-100 bg-slate-50/50 p-6 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#005691] mb-5 group-hover:bg-[#005691] group-hover:text-white transition-colors duration-300 shadow-sm">
                <Users className="h-5 w-5" />
              </div>
              <h5 className="font-bold text-sm text-slate-900 mb-2 font-display">Quản lý đoàn viên</h5>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Sắp xếp và quản lý toàn diện thông tin học sinh khối 12 từ các trường THPT Chuyên Hùng Vương, Võ Minh Đức, Nguyễn An Ninh... một cách khoa học.
              </p>
            </div>

            <div className="group rounded-3xl border border-slate-100 bg-slate-50/50 p-6 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Calendar className="h-5 w-5" />
              </div>
              <h5 className="font-bold text-sm text-slate-900 mb-2 font-display">Theo dõi hoạt động</h5>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Cập nhật nhanh nhất thời gian, địa điểm, yêu cầu trang phục và điểm cộng tích lũy cho từng chiến dịch tình nguyện hè sôi động.
              </p>
            </div>

            <div className="group rounded-3xl border border-slate-100 bg-slate-50/50 p-6 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-5 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Clock className="h-5 w-5" />
              </div>
              <h5 className="font-bold text-sm text-slate-900 mb-2 font-display">TimeMark Proof</h5>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Cơ chế nộp ảnh kèm định vị GPS thực tế và mốc giờ chính xác tại địa bàn, đảm bảo sự trung thực và minh bạch tuyệt đối.
              </p>
            </div>

            <div className="group rounded-3xl border border-slate-100 bg-slate-50/50 p-6 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 mb-5 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <FileCheck className="h-5 w-5" />
              </div>
              <h5 className="font-bold text-sm text-slate-900 mb-2 font-display">Tổng hợp & Xếp loại</h5>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Tự động kết xuất báo cáo rèn luyện rà soát cuối hè gửi về Ban giám hiệu các trường THPT để hoàn thiện học bạ, hồ sơ cá nhân.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* HIGHLIGHTED ACTIVITIES */}
      <section id="hoat-dong" className="py-16 bg-slate-50 border-b border-slate-100 scroll-mt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#005691]">Danh mục hoạt động</h3>
              <h4 className="text-2xl font-extrabold text-slate-900 sm:text-3xl mt-1">Chiến dịch & Hoạt động đang diễn ra</h4>
            </div>
            <button
              id="landing-see-all-activities"
              onClick={currentUser ? onGoToDashboard : onOpenLogin}
              className="text-xs font-semibold text-[#005691] hover:text-[#004270] flex items-center gap-1 hover:underline cursor-pointer"
            >
              Xem tất cả và nộp minh chứng
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {activities.map((act) => (
              <div 
                id={`landing-act-card-${act.id}`}
                key={act.id} 
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md hover:shadow-xl transition-all flex flex-col group"
              >
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={act.anh}
                    alt={act.ten}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-slate-900/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                      {act.loai}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="rounded-lg bg-emerald-500 px-2 py-1 text-xs font-black text-white shadow-md">
                      +{act.diemCong} Điểm
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug hover:text-[#005691] transition-colors">
                      {act.ten}
                    </h5>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {act.moTa}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-50 text-[11px] text-slate-500 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-blue-500" />
                      <span>{act.thoiGian}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      <span className="line-clamp-1">{act.diaDiem}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Hạn nộp: <strong className="text-slate-600">{act.hanNop.split(' ')[0]}</strong>
                  </span>
                  <button
                    onClick={currentUser ? onGoToDashboard : onOpenLogin}
                    className="text-xs font-semibold text-[#005691] hover:text-[#004270] flex items-center gap-0.5 cursor-pointer"
                  >
                    Nộp ảnh
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERBOARD SECTION WITH SPECTACULAR BENTO DESIGN */}
      <section id="xep-hang" className="py-20 bg-white border-b border-slate-100 scroll-mt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3.5 mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50/80 px-3.5 py-1.5 text-xs font-bold text-amber-700 border border-amber-100 shadow-sm font-display">
              <Trophy className="h-4 w-4 text-amber-500 fill-amber-500 animate-bounce" />
              <span>BẢNG VINH DANH RÈN LUYỆN HÈ</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 sm:text-3xl font-display">Bảng xếp hạng Đoàn viên khối 12</h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              Thống kê kết quả tích lũy điểm rèn luyện hè minh bạch từ các chiến dịch tình nguyện, lao động công ích, dọn dẹp vệ sinh môi trường tại địa bàn dân cư.
            </p>
          </div>

          {/* Leaderboard Filters Bar */}
          <div className="bg-slate-50/70 p-5 rounded-3xl border border-slate-100 mb-10 space-y-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đoàn viên bằng họ tên hoặc mã..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(10); // reset page view size on new search
                  }}
                  className="w-full rounded-xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-4 text-xs font-medium focus:border-[#005691] focus:outline-none focus:ring-2 focus:ring-[#005691]/10 transition-all placeholder-slate-400"
                />
              </div>

              {/* Summary stat badge */}
              <div className="text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 bg-white/80 border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm">
                Tìm thấy <span className="text-[#005691] font-black">{(members.filter(m => {
                  const matchesSchool = selectedSchool === 'All' || m.truong === selectedSchool;
                  const matchesSearch = !searchQuery || 
                    m.hoTen.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    m.maDoanVien.toLowerCase().includes(searchQuery.toLowerCase());
                  return matchesSchool && matchesSearch;
                })).length}</span> nhân sự rèn luyện
              </div>

            </div>

            {/* School horizontal selector tabs */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-display">LỌC THEO TRƯỜNG THPT</span>
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  onClick={() => {
                    setSelectedSchool('All');
                    setVisibleCount(10);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                    selectedSchool === 'All'
                      ? 'bg-[#005691] text-white border-[#005691] shadow-md shadow-blue-900/10'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  Tất cả trường ({members.length})
                </button>
                {Array.from(new Set(members.map(m => m.truong))).filter(Boolean).map((schoolName) => {
                  const schoolCount = members.filter(m => m.truong === schoolName).length;
                  return (
                    <button
                      key={schoolName}
                      onClick={() => {
                        setSelectedSchool(schoolName);
                        setVisibleCount(10);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                        selectedSchool === schoolName
                          ? 'bg-[#005691] text-white border-[#005691] shadow-md shadow-blue-900/10'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      {schoolName} ({schoolCount})
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Leaderboard Entries */}
          {(() => {
            const filteredAndSorted = [...members]
              .filter(m => {
                const matchesSchool = selectedSchool === 'All' || m.truong === selectedSchool;
                const matchesSearch = !searchQuery || 
                  m.hoTen.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  m.maDoanVien.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesSchool && matchesSearch;
              })
              .sort((a, b) => b.diemTichLuy - a.diemTichLuy);

            if (filteredAndSorted.length === 0) {
              return (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-slate-400" />
                  </div>
                  <h5 className="font-bold text-slate-700 text-sm">Không tìm thấy kết quả phù hợp</h5>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Vui lòng thử điều chỉnh lại bộ lọc trường hoặc thay đổi từ khóa tìm kiếm của bạn.
                  </p>
                </div>
              );
            }

            const visibleMembersList = filteredAndSorted.slice(0, visibleCount);

            return (
              <div className="space-y-6">
                
                {/* Desktop view (Table layout) */}
                <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="p-4 text-center w-20">Hạng</th>
                        <th className="p-4">Họ và Tên</th>
                        <th className="p-4">Trường THPT</th>
                        <th className="p-4 text-center">Tổng điểm rèn hè</th>
                        <th className="p-4">Danh hiệu rèn luyện</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {visibleMembersList.map((m, idx) => {
                        const actualRank = idx + 1;
                        let rankIcon = null;
                        let rankBg = "bg-slate-50 text-slate-500 border border-slate-100";

                        if (actualRank === 1) {
                          rankIcon = <Trophy className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />;
                          rankBg = "bg-amber-50 border border-amber-200 text-amber-600 font-extrabold";
                        } else if (actualRank === 2) {
                          rankIcon = <Medal className="h-4 w-4 text-slate-400 fill-slate-400 shrink-0" />;
                          rankBg = "bg-slate-50 border border-slate-200 text-slate-500 font-extrabold";
                        } else if (actualRank === 3) {
                          rankIcon = <Medal className="h-4 w-4 text-orange-400 fill-orange-400 shrink-0" />;
                          rankBg = "bg-orange-50 border border-orange-100 text-orange-600 font-extrabold";
                        }

                        // Honor badge
                        let honorBadge = (
                          <span className="inline-flex rounded-md bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-400 border border-slate-100 uppercase tracking-wider">
                            Chưa hoạt động
                          </span>
                        );
                        if (m.diemTichLuy >= 80) {
                          honorBadge = (
                            <span className="inline-flex rounded-md bg-emerald-50 px-2.5 py-0.5 text-[9px] font-black text-emerald-700 border border-emerald-100 uppercase tracking-wider shadow-sm">
                              Xuất sắc hè
                            </span>
                          );
                        } else if (m.diemTichLuy >= 40) {
                          honorBadge = (
                            <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-0.5 text-[9px] font-black text-blue-700 border border-blue-100 uppercase tracking-wider shadow-sm">
                              Tiên tiến hè
                            </span>
                          );
                        } else if (m.diemTichLuy > 0) {
                          honorBadge = (
                            <span className="inline-flex rounded-md bg-amber-50 px-2.5 py-0.5 text-[9px] font-black text-amber-700 border border-amber-100 uppercase tracking-wider shadow-sm">
                              Tích cực hè
                            </span>
                          );
                        }

                        return (
                          <tr key={m.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center">
                                <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${rankBg}`}>
                                  {rankIcon || actualRank}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={m.anhDaiDien}
                                  alt={m.hoTen}
                                  className="h-8 w-8 rounded-full object-cover border border-slate-100 shadow-sm shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <p className="font-bold text-slate-800 text-sm leading-tight">{m.hoTen}</p>
                                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">{m.maDoanVien}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-slate-600">
                              {m.truong}
                            </td>
                            <td className="p-4 text-center font-mono font-extrabold text-[#005691] text-sm">
                              {m.diemTichLuy} Đ
                            </td>
                            <td className="p-4">
                              {honorBadge}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile view (Card List layout) */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {visibleMembersList.map((m, idx) => {
                    const actualRank = idx + 1;
                    let rankIcon = null;
                    let rankBg = "bg-slate-50 text-slate-500 border border-slate-100";

                    if (actualRank === 1) {
                      rankBg = "bg-amber-100 text-amber-700 font-extrabold border-amber-300";
                      rankIcon = <Trophy className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />;
                    } else if (actualRank === 2) {
                      rankBg = "bg-slate-100 text-slate-600 font-extrabold border-slate-300";
                    } else if (actualRank === 3) {
                      rankBg = "bg-orange-100 text-orange-700 font-extrabold border-orange-200";
                    }

                    // Honor title text
                    let honorText = "Chưa hoạt động";
                    let honorColor = "text-slate-400";
                    if (m.diemTichLuy >= 80) {
                      honorText = "Xuất sắc hè";
                      honorColor = "text-emerald-600";
                    } else if (m.diemTichLuy >= 40) {
                      honorText = "Tiên tiến hè";
                      honorColor = "text-blue-600";
                    } else if (m.diemTichLuy > 0) {
                      honorText = "Tích cực hè";
                      honorColor = "text-amber-600";
                    }

                    return (
                      <div 
                        key={m.id} 
                        className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 relative overflow-hidden"
                      >
                        {/* Rank Circle */}
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black border ${rankBg} shrink-0`}>
                          {rankIcon || actualRank}
                        </div>

                        {/* Avatar */}
                        <img
                          src={m.anhDaiDien}
                          alt={m.hoTen}
                          className="h-10 w-10 rounded-full object-cover border border-slate-50 shadow shrink-0"
                          referrerPolicy="no-referrer"
                        />

                        {/* Text details */}
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p className="font-extrabold text-xs text-slate-900 leading-snug break-words">{m.hoTen}</p>
                          <p className="text-[10px] text-slate-500 font-medium truncate">{m.truong}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-slate-400">{m.maDoanVien}</span>
                            <span className="text-[8px] h-1 w-1 bg-slate-300 rounded-full"></span>
                            <span className={`text-[9px] font-black uppercase ${honorColor}`}>{honorText}</span>
                          </div>
                        </div>

                        {/* Point Badge on Right */}
                        <div className="text-right shrink-0">
                          <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-black text-[#005691] border border-blue-100 shadow-sm block">
                            {m.diemTichLuy} Đ
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Show more / Collapse Action Buttons */}
                {filteredAndSorted.length > 10 && (
                  <div className="flex justify-center pt-4">
                    {visibleCount < filteredAndSorted.length ? (
                      <button
                        onClick={() => setVisibleCount(filteredAndSorted.length)}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        <span>Xem toàn bộ bảng xếp hạng ({filteredAndSorted.length})</span>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setVisibleCount(10)}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        <span>Thu gọn danh sách</span>
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      </button>
                    )}
                  </div>
                )}

              </div>
            );
          })()}

        </div>
      </section>

      {/* FOOTER */}
      <footer id="lien-he" className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            
            {/* Logo and Intro */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 overflow-hidden rounded-full shadow-md flex items-center justify-center bg-slate-950 border border-slate-700">
                  <img 
                    src={logoImage} 
                    alt="Logo Chi Đoàn" 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-sm tracking-wide uppercase">
                    CHI ĐOÀN KHU PHỐ TÂN HIỆP
                  </h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                    Ban chấp hành chi đoàn địa bàn dân cư • Phường Tân Đông Hiệp • TP. HCM
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Quản lý hoạt động hè cho Đoàn viên học sinh lớp 12 chuẩn bị bàn giao sinh hoạt về các trường học THPT, rèn luyện kỹ năng, phụng sự cộng đồng dân cư tại Khu phố Tân Hiệp.
              </p>
            </div>

            {/* Quicklinks */}
            <div className="md:col-span-3 space-y-3">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider border-l-2 border-[#005691] pl-2">
                Liên kết nhanh
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer">
                    Trang chủ hệ thống
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('gioi-thieu')} className="hover:text-white transition-colors cursor-pointer">
                    Mô hình hoạt động
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('hoat-dong')} className="hover:text-white transition-colors cursor-pointer">
                    Hoạt động tình nguyện
                  </button>
                </li>
                <li>
                  <button onClick={currentUser ? onGoToDashboard : onOpenLogin} className="hover:text-white transition-colors cursor-pointer text-[#005691] font-semibold">
                    {currentUser ? 'Vào bảng điều khiển' : 'Đăng nhập tài khoản'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact info */}
            <div className="md:col-span-4 space-y-3 text-xs">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider border-l-2 border-[#005691] pl-2">
                Thông tin liên hệ
              </h5>
              <div className="space-y-2 text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-400 shrink-0" />
                  <span>Văn phòng Ban điều hành Khu phố Tân Hiệp, Phường Tân Đông Hiệp, TP. HCM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-400" />
                  <span>Hotline: 0912.345.678 (Bí thư Chi đoàn)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span>Email: chidoankhupho@binhduong.vn</span>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-[10px] text-slate-500">
            <p>© 2026 Chi đoàn Khu phố. Phát triển bởi Ban chấp hành Đoàn TNCS Hồ Chí Minh địa phương.</p>
            <p className="mt-1">Ứng dụng quản lý chuyển đổi số hoạt động rèn luyện hè khối 12.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
