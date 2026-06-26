export interface DoanVien {
  id: string;
  maDoanVien: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: 'Nam' | 'Nữ';
  sdt: string;
  email: string;
  truong: string;
  lop: string;
  chiDoan: string;
  diaChi: string;
  anhDaiDien: string;
  trangThai: 'Đang hoạt động' | 'Tạm ngưng' | 'Trưởng thành Đoàn';
  diemTichLuy: number;
  isLocked?: boolean;
}

export interface HoatDong {
  id: string;
  ten: string;
  anh: string;
  moTa: string;
  thoiGian: string;
  diaDiem: string;
  hanNop: string;
  diemCong: number;
  loai: 'Sinh hoạt hè' | 'Tình nguyện' | 'Lao động cộng đồng' | 'Chuyên đề' | string;
  locked?: boolean;
}

export interface MinhChung {
  id: string;
  doanVienId: string;
  hoatDongId: string;
  imageUrl: string;
  moTa: string;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Không đạt';
  createdAt: string;
  approvedAt?: string;
  rejectedReason?: string;
  timeMark?: string; // Real simulated TimeMark timestamp
  locationMark?: string; // Real simulated TimeMark location (GPS/Ward)
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'member';
  doanVienId?: string;
  password?: string;
  isLocked?: boolean;
}

export interface TruongHoc {
  id: string;
  tenTruong: string; // E.g., "THPT Hùng Vương", "THPT Nguyễn Trãi"
  diaChi: string;
  hieuTruong: string;
  sdtLienHe: string;
  moTa?: string;
}

