-- 1. Tạo Database và chọn sử dụng
DROP DATABASE IF EXISTS PTTKHT;
CREATE DATABASE PTTKHT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE PTTKHT;

-- ============================================
-- 2. TẠO CÁC BẢNG
-- ============================================

-- 2.1. Bảng LOAI_HANG (Category)
CREATE TABLE LOAI_HANG (
    MaLoai INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    TenLoai NVARCHAR(100) NOT NULL,
    MoTa TEXT NULL,
    NhomCha NVARCHAR(100) NULL,
    Tags NVARCHAR(255) NULL,
    TrangThai TINYINT UNSIGNED DEFAULT 1 COMMENT '1: Hoạt động, 0: Vô hiệu',
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_TenLoai (TenLoai),
    INDEX idx_TrangThai (TrangThai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.2. Bảng TAI_KHOAN (User)
CREATE TABLE TAI_KHOAN (
    MaNV INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    TenDangNhap VARCHAR(50) NOT NULL UNIQUE,
    MatKhau VARCHAR(255) NOT NULL COMMENT 'Lưu Hash (MD5/SHA256)',
    HoTen NVARCHAR(100) NOT NULL,
    Email VARCHAR(100) NULL,
    QuyenHan TINYINT UNSIGNED DEFAULT 1 COMMENT '0: Admin, 1: NhanVien',
    TrangThai TINYINT UNSIGNED DEFAULT 1 COMMENT '1: Hoạt động, 0: Khóa',
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_TenDangNhap (TenDangNhap),
    INDEX idx_Email (Email),
    INDEX idx_QuyenHan (QuyenHan),
    INDEX idx_TrangThai (TrangThai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.3. Bảng HANG_HOA (Product)
CREATE TABLE HANG_HOA (
    MaHang VARCHAR(50) PRIMARY KEY,
    TenHang NVARCHAR(200) NOT NULL,
    MaLoai INT UNSIGNED NOT NULL,
    Size VARCHAR(10) NULL,
    MauSac NVARCHAR(20) NULL,
    DonViTinh NVARCHAR(20) DEFAULT 'Cái',
    SoLuongTon INT UNSIGNED DEFAULT 0 CHECK (SoLuongTon >= 0),
    DonGiaNhap DECIMAL(15, 0) UNSIGNED NOT NULL CHECK (DonGiaNhap >= 0),
    DonGiaBan DECIMAL(15, 0) UNSIGNED NOT NULL CHECK (DonGiaBan >= 0),
    AnhMinhHoa VARCHAR(255) NULL,
    TrangThai TINYINT UNSIGNED DEFAULT 1 COMMENT '1: Đang bán, 0: Ngừng bán',
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (MaLoai) REFERENCES LOAI_HANG(MaLoai) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_TenHang (TenHang),
    INDEX idx_MaLoai (MaLoai),
    INDEX idx_TrangThai (TrangThai),
    INDEX idx_SoLuongTon (SoLuongTon),
    INDEX idx_MaLoai_TrangThai (MaLoai, TrangThai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.4. Bảng HOA_DON (Invoice Header)
CREATE TABLE HOA_DON (
    MaHD VARCHAR(20) PRIMARY KEY,
    NgayLap DATETIME DEFAULT CURRENT_TIMESTAMP,
    LoaiHD TINYINT UNSIGNED NOT NULL COMMENT '0: Phieu Nhap, 1: Phieu Xuat',
    MaNV INT UNSIGNED NOT NULL,
    TongTien DECIMAL(15, 0) UNSIGNED DEFAULT 0 CHECK (TongTien >= 0),
    GhiChu TEXT NULL,
    TrangThai TINYINT UNSIGNED DEFAULT 1 COMMENT '1: Hợp lệ, 0: Đã hủy',
    FOREIGN KEY (MaNV) REFERENCES TAI_KHOAN(MaNV) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_NgayLap (NgayLap),
    INDEX idx_LoaiHD (LoaiHD),
    INDEX idx_MaNV (MaNV),
    INDEX idx_TrangThai (TrangThai),
    INDEX idx_NgayLap_LoaiHD (NgayLap, LoaiHD),
    INDEX idx_MaNV_NgayLap (MaNV, NgayLap)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.5. Bảng CHI_TIET_HOA_DON (Invoice Detail)
CREATE TABLE CHI_TIET_HOA_DON (
    ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaHD VARCHAR(20) NOT NULL,
    MaHang VARCHAR(50) NOT NULL,
    SoLuong INT UNSIGNED NOT NULL CHECK (SoLuong > 0),
    DonGia DECIMAL(15, 0) UNSIGNED NOT NULL CHECK (DonGia >= 0),
    ThanhTien DECIMAL(15, 0) UNSIGNED NOT NULL CHECK (ThanhTien >= 0),
    FOREIGN KEY (MaHD) REFERENCES HOA_DON(MaHD) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MaHang) REFERENCES HANG_HOA(MaHang) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_MaHD (MaHD),
    INDEX idx_MaHang (MaHang),
    INDEX idx_MaHD_MaHang (MaHD, MaHang),
    UNIQUE KEY uk_MaHD_MaHang (MaHD, MaHang) COMMENT 'Mỗi hóa đơn chỉ có 1 dòng cho 1 mặt hàng'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PHẦN QUẢN LÝ KHO
-- ============================================

-- 2.6. Bảng NHA_CUNG_CAP (Supplier)
CREATE TABLE NHA_CUNG_CAP (
    MaNCC INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    TenNCC NVARCHAR(200) NOT NULL,
    DiaChi NVARCHAR(255) NULL,
    SoDienThoai VARCHAR(20) NULL,
    Email VARCHAR(100) NULL,
    NguoiLienHe NVARCHAR(100) NULL,
    SoTienNo DECIMAL(15, 0) UNSIGNED DEFAULT 0 CHECK (SoTienNo >= 0),
    HanThanhToan DATE NULL,
    TrangThai TINYINT UNSIGNED DEFAULT 1 COMMENT '1: Hoạt động, 0: Ngừng hợp tác',
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_TenNCC (TenNCC),
    INDEX idx_TrangThai (TrangThai),
    INDEX idx_SoDienThoai (SoDienThoai),
    INDEX idx_Email (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.7. Bảng PHIEU_NHAP_KHO (Warehouse Receipt)
CREATE TABLE PHIEU_NHAP_KHO (
    MaPNK VARCHAR(20) PRIMARY KEY,
    NgayNhap DATETIME DEFAULT CURRENT_TIMESTAMP,
    MaNCC INT UNSIGNED NULL,
    MaNV INT UNSIGNED NOT NULL,
    TongTien DECIMAL(15, 0) UNSIGNED DEFAULT 0 CHECK (TongTien >= 0),
    ChietKhau DECIMAL(15, 0) UNSIGNED DEFAULT 0 CHECK (ChietKhau >= 0) COMMENT 'Chiết khấu/giảm giá',
    TrangThai TINYINT UNSIGNED DEFAULT 0 COMMENT '0: Đang xử lý, 1: Hoàn thành',
    GhiChu TEXT NULL,
    FOREIGN KEY (MaNCC) REFERENCES NHA_CUNG_CAP(MaNCC) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (MaNV) REFERENCES TAI_KHOAN(MaNV) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_NgayNhap (NgayNhap),
    INDEX idx_MaNCC (MaNCC),
    INDEX idx_MaNV (MaNV),
    INDEX idx_TrangThai (TrangThai),
    INDEX idx_NgayNhap_TrangThai (NgayNhap, TrangThai),
    INDEX idx_MaNCC_NgayNhap (MaNCC, NgayNhap)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.8. Bảng CHI_TIET_PHIEU_NHAP_KHO (Receipt Detail)
CREATE TABLE CHI_TIET_PHIEU_NHAP_KHO (
    ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaPNK VARCHAR(20) NOT NULL,
    MaHang VARCHAR(50) NOT NULL,
    SoLuong INT UNSIGNED NOT NULL CHECK (SoLuong > 0),
    DonGiaNhap DECIMAL(15, 0) UNSIGNED NOT NULL CHECK (DonGiaNhap >= 0),
    ThanhTien DECIMAL(15, 0) UNSIGNED NOT NULL CHECK (ThanhTien >= 0),
    FOREIGN KEY (MaPNK) REFERENCES PHIEU_NHAP_KHO(MaPNK) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MaHang) REFERENCES HANG_HOA(MaHang) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_MaPNK (MaPNK),
    INDEX idx_MaHang (MaHang),
    INDEX idx_MaPNK_MaHang (MaPNK, MaHang),
    UNIQUE KEY uk_MaPNK_MaHang (MaPNK, MaHang) COMMENT 'Mỗi phiếu nhập chỉ có 1 dòng cho 1 mặt hàng'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.9. Bảng PHIEU_XUAT_KHO (Warehouse Issue)
CREATE TABLE PHIEU_XUAT_KHO (
    MaPXK VARCHAR(20) PRIMARY KEY,
    NgayXuat DATETIME DEFAULT CURRENT_TIMESTAMP,
    MaNV INT UNSIGNED NOT NULL,
    NguoiNhan NVARCHAR(255) NULL COMMENT 'Tên người nhận (Khách lẻ, Đại lý, Chi nhánh...)',
    ChietKhau DECIMAL(15, 0) UNSIGNED DEFAULT 0 CHECK (ChietKhau >= 0) COMMENT 'Chiết khấu/giảm giá',
    TrangThai TINYINT UNSIGNED DEFAULT 0 COMMENT '0: Đang xử lý, 1: Hoàn thành',
    GhiChu TEXT NULL,
    FOREIGN KEY (MaNV) REFERENCES TAI_KHOAN(MaNV) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_NgayXuat (NgayXuat),
    INDEX idx_MaNV (MaNV),
    INDEX idx_TrangThai (TrangThai),
    INDEX idx_NguoiNhan (NguoiNhan(50)),
    INDEX idx_NgayXuat_TrangThai (NgayXuat, TrangThai),
    INDEX idx_MaNV_NgayXuat (MaNV, NgayXuat)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.10. Bảng CHI_TIET_PHIEU_XUAT_KHO (Issue Detail)
CREATE TABLE CHI_TIET_PHIEU_XUAT_KHO (
    ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaPXK VARCHAR(20) NOT NULL,
    MaHang VARCHAR(50) NOT NULL,
    SoLuong INT UNSIGNED NOT NULL CHECK (SoLuong > 0),
    DonGiaXuat DECIMAL(15, 0) UNSIGNED NOT NULL CHECK (DonGiaXuat >= 0),
    ThanhTien DECIMAL(15, 0) UNSIGNED NOT NULL CHECK (ThanhTien >= 0),
    FOREIGN KEY (MaPXK) REFERENCES PHIEU_XUAT_KHO(MaPXK) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MaHang) REFERENCES HANG_HOA(MaHang) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_MaPXK (MaPXK),
    INDEX idx_MaHang (MaHang),
    INDEX idx_MaPXK_MaHang (MaPXK, MaHang),
    UNIQUE KEY uk_MaPXK_MaHang (MaPXK, MaHang) COMMENT 'Mỗi phiếu xuất chỉ có 1 dòng cho 1 mặt hàng'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.11. Bảng PHIEU_KIEM_KE (Inventory Count)
CREATE TABLE PHIEU_KIEM_KE (
    MaPKK VARCHAR(20) PRIMARY KEY,
    NgayKiemKe DATE NOT NULL,
    MaNV INT UNSIGNED NOT NULL,
    TrangThai TINYINT UNSIGNED DEFAULT 0 COMMENT '0: Đang kiểm, 1: Đã hoàn thành, 2: Đã hủy',
    GhiChu TEXT NULL,
    FOREIGN KEY (MaNV) REFERENCES TAI_KHOAN(MaNV) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_NgayKiemKe (NgayKiemKe),
    INDEX idx_MaNV (MaNV),
    INDEX idx_TrangThai (TrangThai),
    INDEX idx_NgayKiemKe_TrangThai (NgayKiemKe, TrangThai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.12. Bảng CHI_TIET_PHIEU_KIEM_KE (Count Detail)
CREATE TABLE CHI_TIET_PHIEU_KIEM_KE (
    ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaPKK VARCHAR(20) NOT NULL,
    MaHang VARCHAR(50) NOT NULL,
    SoLuongTonKho INT UNSIGNED NOT NULL COMMENT 'Số lượng theo hệ thống',
    SoLuongThucTe INT UNSIGNED NOT NULL COMMENT 'Số lượng đếm thực tế',
    ChenhLech INT NOT NULL COMMENT 'ThucTe - TonKho',
    LyDoChenhLech NVARCHAR(255) NULL,
    FOREIGN KEY (MaPKK) REFERENCES PHIEU_KIEM_KE(MaPKK) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MaHang) REFERENCES HANG_HOA(MaHang) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_MaPKK (MaPKK),
    INDEX idx_MaHang (MaHang),
    INDEX idx_MaPKK_MaHang (MaPKK, MaHang),
    INDEX idx_ChenhLech (ChenhLech),
    UNIQUE KEY uk_MaPKK_MaHang (MaPKK, MaHang) COMMENT 'Mỗi phiếu kiểm kê chỉ có 1 dòng cho 1 mặt hàng'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- GHI CHÚ TỐI ƯU HÓA:
-- ============================================
-- 1. Sử dụng INT UNSIGNED cho các ID và số lượng (tiết kiệm 50% không gian)
-- 2. Thêm indexes trên tất cả foreign keys và các cột thường query
-- 3. Thêm composite indexes cho các query pattern phổ biến
-- 4. Sử dụng ENGINE=InnoDB cho transaction support và foreign keys
-- 5. Thêm CHECK constraints để đảm bảo tính toàn vẹn dữ liệu
-- 6. Thêm UNIQUE constraints để tránh duplicate chi tiết
-- 7. Thêm cột TrangThai và timestamps (NgayTao, NgayCapNhat) cho soft delete và audit
-- 8. Loại bỏ bảng TON_KHO vì đã có SoLuongTon trong HANG_HOA (tránh redundancy)
-- 9. Sử dụng ON DELETE RESTRICT cho các bảng quan trọng để tránh mất dữ liệu
-- 10. Sử dụng ON DELETE SET NULL cho MaNCC trong PHIEU_NHAP_KHO (có thể xóa NCC nhưng giữ lịch sử)
