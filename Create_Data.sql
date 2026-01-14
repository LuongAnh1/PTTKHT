INSERT INTO LOAI_HANG (TenLoai) VALUES 
('Áo Thun'), 
('Áo Sơ Mi'), 
('Quần Jean'), 
('Quần Tây'), 
('Áo Khoác'), 
('Váy Đầm'), 
('Chân Váy'), 
('Giày Thể Thao'), 
('Túi Xách'), 
('Phụ Kiện Khác');

INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, HoTen, QuyenHan) VALUES 
('admin', 'e10adc3949ba59abbe56e057f20f883e', 'Nguyễn Văn Quản Lý', 0), -- Pass: 123456
('nhanvien1', 'e10adc3949ba59abbe56e057f20f883e', 'Trần Thị Bán Hàng', 1),
('nhanvien2', 'e10adc3949ba59abbe56e057f20f883e', 'Lê Văn C', 1),
('kho1', 'e10adc3949ba59abbe56e057f20f883e', 'Phạm Thị Kho', 1),
('sale01', 'e10adc3949ba59abbe56e057f20f883e', 'Hoàng Văn D', 1),
('sale02', 'e10adc3949ba59abbe56e057f20f883e', 'Ngô Thị E', 1),
('quanly2', 'e10adc3949ba59abbe56e057f20f883e', 'Đỗ Văn F', 0),
('nhanvien3', 'e10adc3949ba59abbe56e057f20f883e', 'Bùi Thị G', 1),
('nhanvien4', 'e10adc3949ba59abbe56e057f20f883e', 'Vũ Văn H', 1),
('nhanvien5', 'e10adc3949ba59abbe56e057f20f883e', 'Đinh Thị K', 1);

INSERT INTO HANG_HOA (MaHang, TenHang, MaLoai, Size, MauSac, DonViTinh, SoLuongTon, DonGiaNhap, DonGiaBan, AnhMinhHoa) VALUES 
('AT-01-M-TR', 'Áo Thun Basic', 1, 'M', 'Trắng', 'Cái', 50, 50000, 100000, 'img/at01m.jpg'),
('AT-01-L-TR', 'Áo Thun Basic', 1, 'L', 'Trắng', 'Cái', 40, 50000, 100000, 'img/at01l.jpg'),
('AT-01-M-DE', 'Áo Thun Basic', 1, 'M', 'Đen', 'Cái', 30, 50000, 100000, 'img/at01mde.jpg'),
('QJ-01-29-X', 'Quần Jean Slimfit', 3, '29', 'Xanh', 'Cái', 20, 150000, 350000, 'img/qj01.jpg'),
('QJ-01-30-X', 'Quần Jean Slimfit', 3, '30', 'Xanh', 'Cái', 25, 150000, 350000, 'img/qj01.jpg'),
('ASM-02-L-KE', 'Áo Sơ Mi Kẻ Caro', 2, 'L', 'Kẻ Đỏ', 'Cái', 15, 120000, 250000, 'img/asm02.jpg'),
('AK-Da-XL-DE', 'Áo Khoác Da Nam', 5, 'XL', 'Đen', 'Cái', 10, 500000, 1200000, 'img/akda.jpg'),
('VD-Hoa-S-VA', 'Váy Đầm Hoa Nhí', 6, 'S', 'Vàng', 'Cái', 35, 180000, 400000, 'img/vdhoa.jpg'),
('G-Sneaker-42', 'Giày Sneaker Sport', 8, '42', 'Trắng', 'Đôi', 12, 300000, 650000, 'img/giay.jpg'),
('TX-Da-01', 'Túi Xách Da Công Sở', 9, 'Free', 'Nâu', 'Cái', 8, 250000, 600000, 'img/tui.jpg');

INSERT INTO HOA_DON (MaHD, NgayLap, LoaiHD, MaNV, TongTien, GhiChu) VALUES 
('PN001', '2023-10-01 08:00:00', 0, 1, 10000000, 'Nhập hàng đầu tháng'), -- Phiếu nhập
('PN002', '2023-10-05 09:30:00', 0, 1, 5000000, 'Nhập bổ sung quần Jean'),
('HD001', '2023-10-06 10:00:00', 1, 2, 200000, 'Khách lẻ vãng lai'), -- Phiếu bán
('HD002', '2023-10-06 11:15:00', 1, 2, 700000, 'Anh Nam mua'),
('HD003', '2023-10-07 14:20:00', 1, 3, 1200000, 'Chị Lan VIP'),
('HD004', '2023-10-07 15:00:00', 1, 2, 350000, NULL),
('HD005', '2023-10-08 09:00:00', 1, 4, 100000, 'Khách quên lấy hóa đơn'),
('HD006', '2023-10-08 16:45:00', 1, 5, 1300000, 'Mua giày + tất'),
('HD007', '2023-10-09 10:30:00', 1, 3, 400000, NULL),
('HD008', '2023-10-10 19:00:00', 1, 2, 600000, 'Giao hàng tận nơi');

INSERT INTO CHI_TIET_HOA_DON (MaHD, MaHang, SoLuong, DonGia, ThanhTien) VALUES 
-- Chi tiết cho PN001 (Nhập 200 cái áo thun giá vốn 50k)
('PN001', 'AT-01-M-TR', 200, 50000, 10000000),

-- Chi tiết cho PN002 (Nhập 25 cái quần Jean giá vốn 150k + 10 cái size khác)
('PN002', 'QJ-01-29-X', 25, 150000, 3750000),
('PN002', 'QJ-01-30-X', 10, 125000, 1250000), -- Giả sử đợt này nhập rẻ hơn

-- Chi tiết cho HD001 (Bán 2 áo thun)
('HD001', 'AT-01-M-TR', 2, 100000, 200000),

-- Chi tiết cho HD002 (Bán 2 quần Jean)
('HD002', 'QJ-01-29-X', 2, 350000, 700000),

-- Chi tiết cho HD003 (Bán 1 áo da)
('HD003', 'AK-Da-XL-DE', 1, 1200000, 1200000),

-- Chi tiết cho HD004 (Bán 1 quần Jean)
('HD004', 'QJ-01-30-X', 1, 350000, 350000),

-- Chi tiết cho HD005 (Bán 1 áo thun)
('HD005', 'AT-01-M-DE', 1, 100000, 100000),

-- Chi tiết cho HD006 (Bán 2 đôi giày)
('HD006', 'G-Sneaker-42', 2, 650000, 1300000),

-- Chi tiết cho HD007 (Bán 1 Váy)
('HD007', 'VD-Hoa-S-VA', 1, 400000, 400000),

-- Chi tiết cho HD008 (Bán 1 túi xách)
('HD008', 'TX-Da-01', 1, 600000, 600000);

-- 1. Cập nhật cho nhóm Áo
UPDATE LOAI_HANG 
SET MoTa = 'Áo thun, sơ mi, áo khoác đa dạng kiểu dáng, chất liệu thoáng mát.',
    NhomCha = 'Thời trang Nam/Nữ',
    Tags = 'Áo, Hè, Cotton'
WHERE TenLoai LIKE '%Áo%';

-- 2. Cập nhật cho nhóm Quần
UPDATE LOAI_HANG 
SET MoTa = 'Quần Jean, quần âu, quần kaki form dáng chuẩn, bền đẹp.',
    NhomCha = 'Thời trang Nam/Nữ',
    Tags = 'Quần, Denim, Công sở'
WHERE TenLoai LIKE '%Quần%';

-- 3. Cập nhật cho Váy/Đầm
UPDATE LOAI_HANG 
SET MoTa = 'Váy đầm thiết kế thời thượng, tôn dáng phái đẹp.',
    NhomCha = 'Thời trang Nữ',
    Tags = 'Nữ, Đi tiệc, Dạo phố'
WHERE TenLoai LIKE '%Váy%' OR TenLoai LIKE '%Đầm%';

-- 4. Cập nhật cho Giày
UPDATE LOAI_HANG 
SET MoTa = 'Giày sneaker, giày tây, giày cao gót êm chân.',
    NhomCha = 'Giày Dép',
    Tags = 'Giày, Thể thao, Sneaker'
WHERE TenLoai LIKE '%Giày%';

-- 5. Cập nhật cho Túi/Phụ kiện
UPDATE LOAI_HANG 
SET MoTa = 'Túi xách, thắt lưng, ví da và các phụ kiện thời trang khác.',
    NhomCha = 'Phụ Kiện',
    Tags = 'Phụ kiện, Da, Túi'
WHERE TenLoai LIKE '%Túi%' OR TenLoai LIKE '%Phụ Kiện%';

-- Kiểm tra lại kết quả
SELECT * FROM LOAI_HANG;

