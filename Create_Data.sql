INSERT INTO LOAI_HANG (TenLoai, MoTa, NhomCha, Tags) VALUES
('Áo Thun', 'Áo thun, sơ mi, áo khoác', 'Thời trang Nam/Nữ', 'Áo,Cotton'),
('Áo Sơ Mi', 'Áo thun, sơ mi, áo khoác', 'Thời trang Nam/Nữ', 'Áo,Cotton'),
('Quần Jean', 'Quần jean, quần âu', 'Thời trang Nam/Nữ', 'Quần,Denim'),
('Quần Tây', 'Quần jean, quần âu', 'Thời trang Nam/Nữ', 'Quần,Công sở'),
('Áo Khoác', 'Áo khoác các loại', 'Thời trang Nam/Nữ', 'Áo'),
('Váy Đầm', 'Váy đầm thời trang', 'Thời trang Nữ', 'Nữ'),
('Chân Váy', 'Chân váy nữ', 'Thời trang Nữ', 'Nữ'),
('Giày Thể Thao', 'Giày sneaker', 'Giày Dép', 'Giày'),
('Túi Xách', 'Túi xách da', 'Phụ Kiện', 'Túi'),
('Phụ Kiện Khác', 'Phụ kiện thời trang', 'Phụ Kiện', 'Phụ kiện');

INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, HoTen, Email, QuyenHan) VALUES 
('admin',     '21232f297a57a5a743894a0e4a801fc3', 'Nguyễn Văn Quản Lý', 'admin@gmail.com',  1), -- Admin (Full quyền)
('nhanvien1', 'e10adc3949ba59abbe56e057f20f883e', 'Trần Thị Bán Hàng',  'nv1@gmail.com',    2), -- Kinh Doanh
('nhanvien2', 'e10adc3949ba59abbe56e057f20f883e', 'Lê Văn C',           'nv2@gmail.com',    2), -- Kinh Doanh
('kho1',      'e10adc3949ba59abbe56e057f20f883e', 'Phạm Thị Kho',       'kho@gmail.com',    3), -- Kho
('sale01',    'e10adc3949ba59abbe56e057f20f883e', 'Hoàng Văn D',        'sale01@gmail.com', 2); -- Kinh Doanh

INSERT INTO NHA_CUNG_CAP (TenNCC, DiaChi, SoDienThoai, Email, NguoiLienHe, SoTienNo) VALUES
('CT Thời Trang ABC','Hà Nội','0241234567','abc@gmail.com','Nguyễn Văn A',5000000),
('Xưởng May XYZ','Đà Nẵng','0235123456','xyz@gmail.com','Lê Thị B',0),
('Nhà cung cấp DEF','TP.HCM','0281234567','def@gmail.com','Trần Văn C',3000000);

INSERT INTO HANG_HOA
(MaHang, TenHang, MaLoai, Size, MauSac, SoLuongTon, DonGiaNhap, DonGiaBan, DonViTinh)
VALUES
('AT-M-TR','Áo Thun Basic',1,'M','Trắng',178,50000,100000,'Cái'),
('AT-L-TR','Áo Thun Basic',1,'L','Trắng',125,50000,100000,'Cái'),
('QJ-29-X','Quần Jean Slimfit',3,'29','Xanh',48,150000,350000,'Cái'),
('ASM-L','Áo Sơ Mi Kẻ',2,'L','Đỏ',15,120000,250000,'Cái'),
('AK-XL-DE','Áo Khoác Da',5,'XL','Đen',24,500000,1200000,'Cái'),
('VD-S','Váy Hoa',6,'S','Vàng',35,180000,400000,'Cái'),
('GIAY-42','Giày Sneaker',8,'42','Trắng',12,300000,650000,'Đôi'),
('TUI-01','Túi Xách Da',9,'Free','Nâu',8,250000,600000,'Cái');

INSERT INTO HOA_DON (MaHD, LoaiHD, MaNV, TongTien) VALUES
('PN001',0,1,10000000),
('HD001',1,2,200000),
('HD002',1,2,700000);

INSERT INTO CHI_TIET_HOA_DON (MaHD, MaHang, SoLuong, DonGia, ThanhTien) VALUES
('PN001','AT-M-TR',200,50000,10000000),
('HD001','AT-M-TR',2,100000,200000),
('HD002','QJ-29-X',2,350000,700000);

INSERT INTO PHIEU_NHAP_KHO (MaPNK, MaNCC, MaNV, TongTien, TrangThai) VALUES
('PNK001',1,4,17500000,1),
('PNK002',2,4,7500000,1);

INSERT INTO CHI_TIET_PHIEU_NHAP_KHO (MaPNK, MaHang, SoLuong, DonGiaNhap, ThanhTien) VALUES
('PNK001','AT-M-TR',200,50000,10000000),
('PNK002','QJ-29-X',30,150000,4500000);

INSERT INTO PHIEU_XUAT_KHO (MaPXK, MaNV, NguoiNhan, TrangThai) VALUES
('PXK001',2,'Khách lẻ',1),
('PXK002',2,'Đại lý',1);

INSERT INTO CHI_TIET_PHIEU_XUAT_KHO (MaPXK, MaHang, SoLuong, DonGiaXuat, ThanhTien) VALUES
('PXK001','AT-M-TR',2,100000,200000),
('PXK002','QJ-29-X',2,350000,700000);

INSERT INTO PHIEU_KIEM_KE (MaPKK, NgayKiemKe, MaNV, TrangThai)
VALUES ('PKK001','2023-10-20',4,1);

INSERT INTO CHI_TIET_PHIEU_KIEM_KE
(MaPKK, MaHang, SoLuongTonKho, SoLuongThucTe, ChenhLech)
VALUES
('PKK001','AT-M-TR',178,180,2),
('PKK001','QJ-29-X',48,47,-1);

INSERT INTO BANG_GIA (TenBangGia, TrangThai) VALUES
('Giá bán lẻ',1),('Giá bán buôn',1),('Giá nhập',1);

INSERT INTO CHUONG_TRINH_KM
(TenCT, MaCode, NgayBatDau, NgayKetThuc, TrangThai)
VALUES
('Sale Hè','SALE23','2023-08-01','2023-08-31',1),
('Black Friday','BF23','2023-11-24','2023-11-26',2);

