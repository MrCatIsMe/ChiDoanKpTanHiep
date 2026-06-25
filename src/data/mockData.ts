import { DoanVien, HoatDong, MinhChung, User, TruongHoc } from '../types';

export const TRUONG_LIST = [
  'THPT Tân Đông Hiệp',
  'THPT Dĩ An',
  'THPT Nguyễn An Ninh',
  'THPT Bình An',
  'THPT Phan Chu Trinh'
];

export const CHI_DOAN_LIST = [
  'Chi đoàn Khu phố Tân Hiệp'
];

const INITIAL_DOAN_VIEN: DoanVien[] = [];

const INITIAL_HOAT_DONG: HoatDong[] = [];

const INITIAL_MINH_CHUNG: MinhChung[] = [];

const INITIAL_USERS: User[] = [
  {
    id: 'u-admin',
    email: 'admin@doan.vn',
    role: 'admin'
  }
];

const INITIAL_TRUONG_HOC: TruongHoc[] = [];

// LocalStorage helpers
export const getStoredData = () => {
  try {
    const doanVien = localStorage.getItem('qd_th_doan_vien');
    const hoatDong = localStorage.getItem('qd_th_hoat_dong');
    const minhChung = localStorage.getItem('qd_th_minh_chung');
    const users = localStorage.getItem('qd_th_users');
    const truongHoc = localStorage.getItem('qd_th_truong_hoc');

    return {
      doanVien: doanVien ? JSON.parse(doanVien) : INITIAL_DOAN_VIEN,
      hoatDong: hoatDong ? JSON.parse(hoatDong) : INITIAL_HOAT_DONG,
      minhChung: minhChung ? JSON.parse(minhChung) : INITIAL_MINH_CHUNG,
      users: users ? JSON.parse(users) : INITIAL_USERS,
      truongHoc: truongHoc ? JSON.parse(truongHoc) : INITIAL_TRUONG_HOC
    };
  } catch (e) {
    return {
      doanVien: INITIAL_DOAN_VIEN,
      hoatDong: INITIAL_HOAT_DONG,
      minhChung: INITIAL_MINH_CHUNG,
      users: INITIAL_USERS,
      truongHoc: INITIAL_TRUONG_HOC
    };
  }
};

export const saveStoredData = (data: {
  doanVien: DoanVien[];
  hoatDong: HoatDong[];
  minhChung: MinhChung[];
  users: User[];
  truongHoc: TruongHoc[];
}) => {
  try {
    localStorage.setItem('qd_th_doan_vien', JSON.stringify(data.doanVien));
    localStorage.setItem('qd_th_hoat_dong', JSON.stringify(data.hoatDong));
    localStorage.setItem('qd_th_minh_chung', JSON.stringify(data.minhChung));
    localStorage.setItem('qd_th_users', JSON.stringify(data.users));
    localStorage.setItem('qd_th_truong_hoc', JSON.stringify(data.truongHoc));
  } catch (e) {
    console.error('Error writing to localStorage', e);
  }
};
