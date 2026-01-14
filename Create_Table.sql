-- 1. Tạo Database và chọn sử dụng
DROP DATABASE IF EXISTS PTTKHT;
CREATE DATABASE PTTKHT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE PTTKHT;

-- 2. Tạo bảng LOAI_HANG (Category)
CREATE TABLE LOAI_HANG (
    MaLoai INT AUTO_INCREMENT PRIMARY KEY,
    TenLoai NVARCHAR(100) NOT NULL
);
-- Thêm thuộc tính cho LOAI_HANG
ALTER TABLE LOAI_HANG
ADD COLUMN MoTa TEXT NULL,
ADD COLUMN NhomCha NVARCHAR(100) NULL, -- Lưu tên nhóm cha tạm thời
ADD COLUMN Tags NVARCHAR(255) NULL;    -- Lưu các tag dạng chuỗi, ví dụ: "Nam, Hè"

-- 3. Tạo bảng TAI_KHOAN (User)
CREATE TABLE TAI_KHOAN (
    MaNV INT AUTO_INCREMENT PRIMARY KEY,
    TenDangNhap VARCHAR(50) NOT NULL UNIQUE,
    MatKhau VARCHAR(255) NOT NULL, -- Thực tế nên lưu Hash MD5/SHA
    HoTen NVARCHAR(100) NOT NULL,
    QuyenHan INT DEFAULT 1 COMMENT '0: Admin, 1: NhanVien'
);

-- 4. Tạo bảng HANG_HOA (Product)
CREATE TABLE HANG_HOA (
    MaHang VARCHAR(50) PRIMARY KEY, -- SKU ví dụ: AT-01-M
    TenHang NVARCHAR(200) NOT NULL,
    MaLoai INT,
    Size VARCHAR(10),
    MauSac NVARCHAR(20),
    DonViTinh NVARCHAR(20) DEFAULT 'Cái',
    SoLuongTon INT DEFAULT 0,
    DonGiaNhap DECIMAL(15, 0),
    DonGiaBan DECIMAL(15, 0),
    AnhMinhHoa VARCHAR(255),
    FOREIGN KEY (MaLoai) REFERENCES LOAI_HANG(MaLoai) ON UPDATE CASCADE
);

-- 5. Tạo bảng HOA_DON (Invoice Header)
CREATE TABLE HOA_DON (
    MaHD VARCHAR(20) PRIMARY KEY, -- Ví dụ: HD001, PN001
    NgayLap DATETIME DEFAULT CURRENT_TIMESTAMP,
    LoaiHD INT COMMENT '0: Phieu Nhap, 1: Phieu Xuat',
    MaNV INT,
    TongTien DECIMAL(15, 0) DEFAULT 0,
    GhiChu TEXT,
    FOREIGN KEY (MaNV) REFERENCES TAI_KHOAN(MaNV) ON UPDATE CASCADE
);

-- 6. Tạo bảng CHI_TIET_HOA_DON (Invoice Detail)
CREATE TABLE CHI_TIET_HOA_DON (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    MaHD VARCHAR(20),
    MaHang VARCHAR(50),
    SoLuong INT NOT NULL,
    DonGia DECIMAL(15, 0) NOT NULL,
    ThanhTien DECIMAL(15, 0) NOT NULL, -- Thường sẽ tính toán, nhưng lưu cứng để truy xuất nhanh
    FOREIGN KEY (MaHD) REFERENCES HOA_DON(MaHD) ON DELETE CASCADE, -- Xóa Hóa đơn cha thì xóa luôn Chi tiết con
    FOREIGN KEY (MaHang) REFERENCES HANG_HOA(MaHang)
);