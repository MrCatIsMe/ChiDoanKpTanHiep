import { DoanVien, HoatDong, MinhChung, User, TruongHoc, BaiViet } from '../types';

export const TRUONG_LIST = [
  'THPT Tân Đông Hiệp',
  'THPT Dĩ An',
  'THPT Nguyễn An Ninh',
  'THPT Bình An',
  'THPT Phan Chu Trinh'
];

export const CHI_DOAN_LIST = [
  'Chi đoàn Khu phố Tân Hiệp',
  'Chi đoàn Khu phố Tân Hiệp 1',
  'Chi đoàn Khu phố Tân Hiệp 2'
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

const INITIAL_BAI_VIET: BaiViet[] = [
  {
    id: 'bv-1',
    tieude: 'Kế hoạch Chiến dịch Tình nguyện hè năm 2026',
    tomtat: 'Chi tiết kế hoạch triển khai các hoạt động tình nguyện hè, hỗ trợ cộng đồng và đền ơn đáp nghĩa trên địa bàn phường Tân Đông Hiệp.',
    noidung: `## KẾ HOẠCH CHI TIẾT CHIẾN DỊCH TÌNH NGUYỆN HÈ 2026

Chào mừng kỷ niệm các ngày lễ lớn và nhằm tạo sân chơi bổ ích, lành mạnh cho Đoàn viên, học sinh khối THPT trong dịp hè năm 2026, **Ban Chấp hành Đoàn phường Tân Đông Hiệp** ban hành kế hoạch tổ chức Chiến dịch Tình nguyện hè với các nội dung trọng tâm sau:

### I. MỤC TIÊU & CHỈ TIÊU
- Thu hút hơn **200 lượt Đoàn viên, học sinh** tham gia tích cực.
- Thực hiện **03 công trình thanh niên** dọn dẹp vệ sinh, sơn sửa khu vui chơi thiếu nhi.
- Tuyên truyền bảo vệ môi trường, phân loại rác thải tại nguồn cho **500 hộ dân**.

### II. NỘI DUNG HOẠT ĐỘNG
1. **Ngày Chủ nhật Xanh**: Ra quân dọn dẹp vệ sinh các tuyến đường thanh niên tự quản, xóa biển quảng cáo rác.
2. **Hành trình Đền ơn đáp nghĩa**: Thăm hỏi, tặng quà các gia đình chính sách, người có công với cách mạng nhân ngày 27/7.
3. **Chiến dịch "Hoa phượng đỏ"**: Hỗ trợ sinh hoạt hè, ôn tập văn hóa và dạy bơi miễn phí cho thiếu nhi trên địa bàn dân cư.

### III. THỜI GIAN & ĐỊA ĐIỂM
- **Thời gian**: Từ ngày 01/06/2026 đến ngày 15/08/2026.
- **Địa điểm**: Trên địa bàn các khu phố thuộc phường Tân Đông Hiệp.

Ban Chấp hành Đoàn phường kêu gọi toàn thể các bạn Đoàn viên, học sinh tích cực đăng ký tham gia các hoạt động để cùng chung tay xây dựng quê hương giàu đẹp!`,
    anh: 'https://images.unsplash.com/photo-1559027615-cd44874e96e4?auto=format&fit=crop&q=80&w=600',
    ngayDang: '2026-06-25 08:30',
    nguoiDang: 'BCH Đoàn Phường',
    luotXem: 142,
    ghim: true
  },
  {
    id: 'bv-2',
    tieude: 'Hướng dẫn nộp minh chứng và tích lũy điểm rèn luyện hè',
    tomtat: 'Bài viết hướng dẫn chi tiết các bước chụp ảnh Timemark, định vị GPS và cách thức nộp minh chứng trên hệ thống quản lý đoàn viên.',
    noidung: `## HƯỚNG DẪN NỘP MINH CHỨNG TÍCH LŨY ĐIỂM HÈ

Để đảm bảo tính minh bạch và công bằng trong việc đánh giá điểm rèn luyện hè của Đoàn viên học sinh, **Ban Chấp hành Đoàn phường** hướng dẫn quy trình nộp minh chứng tham gia hoạt động như sau:

### Bước 1: Tham gia hoạt động và chụp ảnh minh chứng
- Các bạn bắt buộc sử dụng các ứng dụng chụp ảnh có hiển thị **Thời gian thực (TimeMark)** và **Định vị vị trí (GPS/Địa bàn)**.
- Ảnh chụp phải rõ mặt Đoàn viên đang tham gia hoạt động, mặc trang phục lịch sự hoặc áo Thanh niên Việt Nam (nếu có).

### Bước 2: Đăng nhập hệ thống và chọn hoạt động
- Truy cập vào tài khoản cá nhân của bạn trên ứng dụng.
- Chuyển sang tab **"Nộp minh chứng"**.
- Chọn đúng hoạt động bạn đã tham gia từ danh sách hoạt động đang diễn ra.

### Bước 3: Đính kèm ảnh và mô tả đóng góp
- Tải ảnh minh chứng đã chụp ở Bước 1 lên hệ thống.
- Ghi ngắn gọn mô tả công việc bạn đã làm (Ví dụ: *"Dọn dẹp vệ sinh tuyến đường Trần Hưng Đạo, quét dọn rác thải và trồng hoa"*).
- Bấm nút **"Gửi minh chứng chờ duyệt"**.

### Bước 4: Theo dõi kết quả phê duyệt
- Ban Chấp hành Đoàn phường sẽ rà soát và duyệt minh chứng của bạn.
- Điểm rèn luyện tương ứng sẽ được cộng tự động vào tài khoản ngay khi minh chứng được phê duyệt đạt.
- Nếu có sai sót, lý do từ chối sẽ hiển thị rõ tại tab **"Lịch sử nộp"** để bạn kịp thời bổ sung, điều chỉnh.

*Mọi thắc mắc vui lòng liên hệ trực tiếp Bí thư Chi đoàn khu phố hoặc gửi phản hồi qua hòm thư hỗ trợ.*`,
    anh: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
    ngayDang: '2026-06-26 14:15',
    nguoiDang: 'Ban Quản Trị Hệ Thống',
    luotXem: 98,
    ghim: false
  }
];

// LocalStorage helpers
export const getStoredData = () => {
  try {
    const doanVien = localStorage.getItem('qd_th_doan_vien');
    const hoatDong = localStorage.getItem('qd_th_hoat_dong');
    const minhChung = localStorage.getItem('qd_th_minh_chung');
    const users = localStorage.getItem('qd_th_users');
    const truongHoc = localStorage.getItem('qd_th_truong_hoc');
    const baiViet = localStorage.getItem('qd_th_bai_viet');

    return {
      doanVien: doanVien ? JSON.parse(doanVien) : INITIAL_DOAN_VIEN,
      hoatDong: hoatDong ? JSON.parse(hoatDong) : INITIAL_HOAT_DONG,
      minhChung: minhChung ? JSON.parse(minhChung) : INITIAL_MINH_CHUNG,
      users: users ? JSON.parse(users) : INITIAL_USERS,
      truongHoc: truongHoc ? JSON.parse(truongHoc) : INITIAL_TRUONG_HOC,
      baiViet: baiViet ? JSON.parse(baiViet) : INITIAL_BAI_VIET
    };
  } catch (e) {
    return {
      doanVien: INITIAL_DOAN_VIEN,
      hoatDong: INITIAL_HOAT_DONG,
      minhChung: INITIAL_MINH_CHUNG,
      users: INITIAL_USERS,
      truongHoc: INITIAL_TRUONG_HOC,
      baiViet: INITIAL_BAI_VIET
    };
  }
};

export const saveStoredData = (data: {
  doanVien: DoanVien[];
  hoatDong: HoatDong[];
  minhChung: MinhChung[];
  users: User[];
  truongHoc: TruongHoc[];
  baiViet: BaiViet[];
}) => {
  try {
    localStorage.setItem('qd_th_doan_vien', JSON.stringify(data.doanVien));
    localStorage.setItem('qd_th_hoat_dong', JSON.stringify(data.hoatDong));
    localStorage.setItem('qd_th_minh_chung', JSON.stringify(data.minhChung));
    localStorage.setItem('qd_th_users', JSON.stringify(data.users));
    localStorage.setItem('qd_th_truong_hoc', JSON.stringify(data.truongHoc));
    localStorage.setItem('qd_th_bai_viet', JSON.stringify(data.baiViet));
  } catch (e) {
    console.error('Error writing to localStorage', e);
  }
};
