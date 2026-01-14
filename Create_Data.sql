USE PTTKHT;

-- ============================================
-- 1. DỮ LIỆU LOAI_HANG
-- ============================================
INSERT INTO LOAI_HANG (TenLoai, MoTa, NhomCha, Tags, TrangThai) VALUES 
('Áo Thun', 'Áo thun, sơ mi, áo khoác đa dạng kiểu dáng, chất liệu thoáng mát.', 'Thời trang Nam/Nữ', 'Áo, Hè, Cotton', 1),
('Áo Sơ Mi', 'Áo thun, sơ mi, áo khoác đa dạng kiểu dáng, chất liệu thoáng mát.', 'Thời trang Nam/Nữ', 'Áo, Hè, Cotton', 1),
('Quần Jean', 'Quần Jean, quần âu, quần kaki form dáng chuẩn, bền đẹp.', 'Thời trang Nam/Nữ', 'Quần, Denim, Công sở', 1),
('Quần Tây', 'Quần Jean, quần âu, quần kaki form dáng chuẩn, bền đẹp.', 'Thời trang Nam/Nữ', 'Quần, Denim, Công sở', 1),
('Áo Khoác', 'Áo thun, sơ mi, áo khoác đa dạng kiểu dáng, chất liệu thoáng mát.', 'Thời trang Nam/Nữ', 'Áo, Hè, Cotton', 1),
('Váy Đầm', 'Váy đầm thiết kế thời thượng, tôn dáng phái đẹp.', 'Thời trang Nữ', 'Nữ, Đi tiệc, Dạo phố', 1),
('Chân Váy', 'Váy đầm thiết kế thời thượng, tôn dáng phái đẹp.', 'Thời trang Nữ', 'Nữ, Đi tiệc, Dạo phố', 1),
('Giày Thể Thao', 'Giày sneaker, giày tây, giày cao gót êm chân.', 'Giày Dép', 'Giày, Thể thao, Sneaker', 1),
('Túi Xách', 'Túi xách, thắt lưng, ví da và các phụ kiện thời trang khác.', 'Phụ Kiện', 'Phụ kiện, Da, Túi', 1),
('Phụ Kiện Khác', 'Túi xách, thắt lưng, ví da và các phụ kiện thời trang khác.', 'Phụ Kiện', 'Phụ kiện, Da, Túi', 1);

-- ============================================
-- 2. DỮ LIỆU TAI_KHOAN
-- ============================================
INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, HoTen, Email, QuyenHan, TrangThai) VALUES 
('admin', '21232f297a57a5a743894a0e4a801fc3', 'Nguyễn Văn Quản Lý', 'admin@gmail.com', 0, 1), -- Pass: admin
('nhanvien1', 'e10adc3949ba59abbe56e057f20f883e', 'Trần Thị Bán Hàng', 'nhanvien1@gmail.com', 1, 1), -- Pass: 123456
('nhanvien2', 'e10adc3949ba59abbe56e057f20f883e', 'Lê Văn C', 'nhanvien2@gmail.com', 1, 1),
('kho1', 'e10adc3949ba59abbe56e057f20f883e', 'Phạm Thị Kho', 'kho1@gmail.com', 1, 1),
('sale01', 'e10adc3949ba59abbe56e057f20f883e', 'Hoàng Văn D', 'sale01@gmail.com', 1, 1),
('sale02', 'e10adc3949ba59abbe56e057f20f883e', 'Ngô Thị E', 'sale02@gmail.com', 1, 1),
('quanly2', 'e10adc3949ba59abbe56e057f20f883e', 'Đỗ Văn F', 'quanly2@gmail.com', 0, 1),
('nhanvien3', 'e10adc3949ba59abbe56e057f20f883e', 'Bùi Thị G', 'nhanvien3@gmail.com', 1, 1),
('nhanvien4', 'e10adc3949ba59abbe56e057f20f883e', 'Vũ Văn H', 'nhanvien4@gmail.com', 1, 1),
('nhanvien5', 'e10adc3949ba59abbe56e057f20f883e', 'Đinh Thị K', 'nhanvien5@gmail.com', 1, 1);

-- ============================================
-- 3. DỮ LIỆU HANG_HOA
-- ============================================
INSERT INTO HANG_HOA (MaHang, TenHang, MaLoai, Size, MauSac, DonViTinh, SoLuongTon, DonGiaNhap, DonGiaBan, AnhMinhHoa, TrangThai) VALUES 
('AT-01-M-TR', 'Áo Thun Basic', 1, 'M', 'Trắng', 'Cái', 178, 50000, 100000, 'img/at01m.jpg', 1),
('AT-01-L-TR', 'Áo Thun Basic', 1, 'L', 'Trắng', 'Cái', 125, 50000, 100000, 'img/at01l.jpg', 1),
('AT-01-M-DE', 'Áo Thun Basic', 1, 'M', 'Đen', 'Cái', 27, 50000, 100000, 'img/at01mde.jpg', 1),
('QJ-01-29-X', 'Quần Jean Slimfit', 3, '29', 'Xanh', 'Cái', 48, 150000, 350000, 'img/qj01.jpg', 1),
('QJ-01-30-X', 'Quần Jean Slimfit', 3, '30', 'Xanh', 'Cái', 44, 150000, 350000, 'img/qj01.jpg', 1),
('ASM-02-L-KE', 'Áo Sơ Mi Kẻ Caro', 2, 'L', 'Kẻ Đỏ', 'Cái', 15, 120000, 250000, 'img/asm02.jpg', 1),
('AK-Da-XL-DE', 'Áo Khoác Da Nam', 5, 'XL', 'Đen', 'Cái', 24, 500000, 1200000, 'img/akda.jpg', 1),
('VD-Hoa-S-VA', 'Váy Đầm Hoa Nhí', 6, 'S', 'Vàng', 'Cái', 35, 180000, 400000, 'img/vdhoa.jpg', 1),
('G-Sneaker-42', 'Giày Sneaker Sport', 8, '42', 'Trắng', 'Đôi', 12, 300000, 650000, 'img/giay.jpg', 1),
('TX-Da-01', 'Túi Xách Da Công Sở', 9, 'Free', 'Nâu', 'Cái', 8, 250000, 600000, 'img/tui.jpg', 1);

-- ============================================
-- 4. DỮ LIỆU NHA_CUNG_CAP
-- ============================================
INSERT INTO NHA_CUNG_CAP (TenNCC, DiaChi, SoDienThoai, Email, NguoiLienHe, SoTienNo, HanThanhToan, TrangThai) VALUES
('Công ty Thời Trang ABC', '100 Đường Nguyễn Văn A, Hà Nội', '0241234567', 'contact@abc.com', 'Nguyễn Văn A', 5000000, '2023-11-15', 1),
('Xưởng May XYZ', '200 Đường Lê Văn B, Đà Nẵng', '0235123456', 'info@xyz.com', 'Lê Thị B', 0, NULL, 1),
('Nhà cung cấp DEF', '300 Đường Trần Văn C, TP.HCM', '0281234567', 'sales@def.com', 'Trần Văn C', 3000000, '2023-11-20', 1),
('Công ty Vải GHI', '400 Đường Phạm Văn D, Hải Phòng', '0225123456', 'contact@ghi.com', 'Phạm Thị D', 0, NULL, 1);

-- ============================================
-- 5. DỮ LIỆU HOA_DON (Bao gồm cả Phiếu Nhập và Phiếu Xuất)
-- ============================================
INSERT INTO HOA_DON (MaHD, NgayLap, LoaiHD, MaNV, TongTien, GhiChu, TrangThai) VALUES 
-- Phiếu nhập (LoaiHD = 0)
('PN001', '2023-10-01 08:00:00', 0, 1, 10000000, 'Nhập hàng đầu tháng', 1),
('PN002', '2023-10-05 09:30:00', 0, 1, 5000000, 'Nhập bổ sung quần Jean', 1),
-- Phiếu bán (LoaiHD = 1)
('HD001', '2023-10-06 10:00:00', 1, 2, 200000, 'Khách lẻ vãng lai', 1),
('HD002', '2023-10-06 11:15:00', 1, 2, 700000, 'Anh Nam mua', 1),
('HD003', '2023-10-07 14:20:00', 1, 3, 1200000, 'Chị Lan VIP', 1),
('HD004', '2023-10-07 15:00:00', 1, 2, 350000, NULL, 1),
('HD005', '2023-10-08 09:00:00', 1, 4, 100000, 'Khách quên lấy hóa đơn', 1),
('HD006', '2023-10-08 16:45:00', 1, 5, 1300000, 'Mua giày + tất', 1),
('HD007', '2023-10-09 10:30:00', 1, 3, 400000, NULL, 1),
('HD008', '2023-10-10 19:00:00', 1, 2, 600000, 'Giao hàng tận nơi', 1);

-- ============================================
-- 6. DỮ LIỆU CHI_TIET_HOA_DON
-- ============================================
INSERT INTO CHI_TIET_HOA_DON (MaHD, MaHang, SoLuong, DonGia, ThanhTien) VALUES 
-- Chi tiết cho PN001 (Nhập 200 cái áo thun giá vốn 50k)
('PN001', 'AT-01-M-TR', 200, 50000, 10000000),
-- Chi tiết cho PN002 (Nhập quần Jean)
('PN002', 'QJ-01-29-X', 25, 150000, 3750000),
('PN002', 'QJ-01-30-X', 10, 125000, 1250000),
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

-- ============================================
-- 7. DỮ LIỆU PHIEU_NHAP_KHO
-- ============================================
INSERT INTO PHIEU_NHAP_KHO (MaPNK, NgayNhap, MaNCC, MaNV, TongTien, ChietKhau, TrangThai, GhiChu) VALUES
('PNK001', '2023-10-01 08:00:00', 1, 4, 17500000, 0, 1, 'Nhập hàng đầu tháng từ ABC'), -- Hoàn thành
('PNK002', '2023-10-05 09:30:00', 2, 4, 7500000, 500000, 1, 'Nhập bổ sung quần Jean'), -- Hoàn thành
('PNK003', '2023-10-10 10:00:00', 3, 4, 13500000, 0, 0, 'Nhập hàng bổ sung'), -- Đang xử lý
('PNK004', '2023-10-15 14:00:00', 1, 4, 5000000, 0, 0, 'Nhập áo thun mùa hè'); -- Đang xử lý

-- ============================================
-- 8. DỮ LIỆU CHI_TIET_PHIEU_NHAP_KHO
-- ============================================
INSERT INTO CHI_TIET_PHIEU_NHAP_KHO (MaPNK, MaHang, SoLuong, DonGiaNhap, ThanhTien) VALUES
-- Chi tiết PNK001
('PNK001', 'AT-01-M-TR', 200, 50000, 10000000),
('PNK001', 'AT-01-L-TR', 150, 50000, 7500000),
-- Chi tiết PNK002
('PNK002', 'QJ-01-29-X', 30, 150000, 4500000),
('PNK002', 'QJ-01-30-X', 20, 150000, 3000000),
-- Chi tiết PNK003
('PNK003', 'ASM-02-L-KE', 50, 120000, 6000000),
('PNK003', 'AK-Da-XL-DE', 15, 500000, 7500000),
-- Chi tiết PNK004
('PNK004', 'AT-01-M-DE', 100, 50000, 5000000);

-- ============================================
-- 9. DỮ LIỆU PHIEU_XUAT_KHO
-- ============================================
INSERT INTO PHIEU_XUAT_KHO (MaPXK, NgayXuat, MaNV, NguoiNhan, ChietKhau, TrangThai, GhiChu) VALUES
('PXK001', '2023-10-06 10:00:00', 2, 'Khách lẻ (Walk-in)', 0, 1, 'Xuất cho hóa đơn HD001'), -- Hoàn thành
('PXK002', '2023-10-06 11:15:00', 2, 'Đại lý Minh Châu', 500000, 1, 'Xuất cho hóa đơn HD002'), -- Hoàn thành
('PXK003', '2023-10-07 14:20:00', 3, 'Chi nhánh Cầu Giấy', 0, 0, 'Xuất cho hóa đơn HD003'), -- Đang xử lý
('PXK004', '2023-10-12 09:00:00', 4, 'Siêu thị VinMart', 0, 0, 'Xuất hàng cho khách'), -- Đang xử lý
('PXK005', '2023-10-18 15:00:00', 4, 'Khách lẻ (Walk-in)', 0, 1, 'Hàng bị lỗi, xuất hủy'); -- Hoàn thành

-- ============================================
-- 10. DỮ LIỆU CHI_TIET_PHIEU_XUAT_KHO
-- ============================================
INSERT INTO CHI_TIET_PHIEU_XUAT_KHO (MaPXK, MaHang, SoLuong, DonGiaXuat, ThanhTien) VALUES
-- Chi tiết PXK001
('PXK001', 'AT-01-M-TR', 2, 100000, 200000),
-- Chi tiết PXK002
('PXK002', 'QJ-01-29-X', 2, 350000, 700000),
-- Chi tiết PXK003
('PXK003', 'AK-Da-XL-DE', 1, 1200000, 1200000),
-- Chi tiết PXK004
('PXK004', 'AT-01-M-TR', 20, 100000, 2000000),
('PXK004', 'AT-01-L-TR', 15, 100000, 1500000),
-- Chi tiết PXK005
('PXK005', 'AT-01-M-DE', 3, 50000, 150000);

-- ============================================
-- 11. DỮ LIỆU PHIEU_KIEM_KE
-- ============================================
INSERT INTO PHIEU_KIEM_KE (MaPKK, NgayKiemKe, MaNV, TrangThai, GhiChu) VALUES
('PKK001', '2023-10-20', 4, 1, 'Kiểm kê cuối tháng - Phát hiện một số chênh lệch nhỏ'),
('PKK002', '2023-10-20', 4, 1, 'Kiểm kê định kỳ - Tất cả hàng hóa đều khớp'),
('PKK003', '2023-10-25', 1, 1, 'Kiểm kê đột xuất sau khi có báo cáo mất hàng'),
('PKK004', '2023-11-01', 4, 0, 'Kiểm kê đầu tháng 11 - Đang tiến hành'),
('PKK005', '2023-11-05', 1, 1, 'Kiểm kê sau đợt nhập hàng lớn'),
('PKK006', '2023-11-10', 4, 1, 'Kiểm kê định kỳ giữa tháng'),
('PKK007', '2023-11-15', 1, 0, 'Kiểm kê kiểm tra chất lượng hàng hóa'),
('PKK008', '2023-11-20', 4, 1, 'Kiểm kê cuối tháng 11'),
('PKK009', '2023-11-25', 1, 2, 'Kiểm kê bị hủy do thiếu nhân lực');

-- ============================================
-- 12. DỮ LIỆU CHI_TIET_PHIEU_KIEM_KE
-- ============================================
INSERT INTO CHI_TIET_PHIEU_KIEM_KE (MaPKK, MaHang, SoLuongTonKho, SoLuongThucTe, ChenhLech, LyDoChenhLech) VALUES
-- Chi tiết PKK001 (Kiểm kê cuối tháng 10 - Hoàn thành)
('PKK001', 'AT-01-M-TR', 178, 180, 2, 'Thừa 2 cái do nhập nhầm, chưa cập nhật hệ thống'),
('PKK001', 'AT-01-L-TR', 125, 125, 0, NULL),
('PKK001', 'AT-01-M-DE', 27, 25, -2, 'Thiếu 2 cái, có thể do bán nhưng chưa cập nhật'),
('PKK001', 'QJ-01-29-X', 48, 48, 0, NULL),
('PKK001', 'QJ-01-30-X', 44, 44, 0, NULL),
('PKK001', 'ASM-02-L-KE', 15, 15, 0, NULL),
('PKK001', 'AK-Da-XL-DE', 24, 23, -1, 'Thiếu 1 cái, có thể bị mất hoặc hỏng'),
('PKK001', 'VD-Hoa-S-VA', 35, 35, 0, NULL),
('PKK001', 'G-Sneaker-42', 12, 12, 0, NULL),
('PKK001', 'TX-Da-01', 8, 8, 0, NULL),

-- Chi tiết PKK002 (Kiểm kê định kỳ - Hoàn thành)
('PKK002', 'AT-01-M-TR', 180, 180, 0, NULL),
('PKK002', 'AT-01-L-TR', 125, 125, 0, NULL),
('PKK002', 'QJ-01-29-X', 48, 48, 0, NULL),
('PKK002', 'QJ-01-30-X', 44, 44, 0, NULL),
('PKK002', 'ASM-02-L-KE', 15, 15, 0, NULL),
('PKK002', 'AK-Da-XL-DE', 23, 23, 0, NULL),

-- Chi tiết PKK003 (Kiểm kê đột xuất - Hoàn thành)
('PKK003', 'AT-01-M-TR', 180, 178, -2, 'Phát hiện thiếu 2 cái, đang điều tra'),
('PKK003', 'AT-01-L-TR', 125, 125, 0, NULL),
('PKK003', 'AT-01-M-DE', 25, 25, 0, NULL),
('PKK003', 'QJ-01-29-X', 48, 47, -1, 'Thiếu 1 cái, có thể do lỗi nhập liệu'),
('PKK003', 'AK-Da-XL-DE', 23, 23, 0, NULL),

-- Chi tiết PKK004 (Kiểm kê đầu tháng 11 - Đang kiểm)
('PKK004', 'AT-01-M-TR', 178, 178, 0, NULL),
('PKK004', 'AT-01-L-TR', 125, 125, 0, NULL),
('PKK004', 'AT-01-M-DE', 25, 25, 0, NULL),
('PKK004', 'QJ-01-29-X', 47, 47, 0, NULL),
('PKK004', 'QJ-01-30-X', 44, 44, 0, NULL),
('PKK004', 'ASM-02-L-KE', 15, 15, 0, NULL),
('PKK004', 'AK-Da-XL-DE', 23, 23, 0, NULL),
('PKK004', 'VD-Hoa-S-VA', 35, 35, 0, NULL),
('PKK004', 'G-Sneaker-42', 12, 12, 0, NULL),
('PKK004', 'TX-Da-01', 8, 8, 0, NULL),

-- Chi tiết PKK005 (Kiểm kê sau đợt nhập hàng - Hoàn thành)
('PKK005', 'AT-01-M-TR', 178, 200, 22, 'Thừa 22 cái do nhập thêm hàng mới'),
('PKK005', 'AT-01-L-TR', 125, 150, 25, 'Nhập thêm 25 cái từ đợt nhập hàng'),
('PKK005', 'AT-01-M-DE', 25, 50, 25, 'Nhập thêm 25 cái áo đen'),
('PKK005', 'QJ-01-29-X', 47, 60, 13, 'Nhập thêm 13 cái quần Jean size 29'),
('PKK005', 'QJ-01-30-X', 44, 55, 11, 'Nhập thêm 11 cái quần Jean size 30'),
('PKK005', 'ASM-02-L-KE', 15, 15, 0, NULL),
('PKK005', 'AK-Da-XL-DE', 23, 23, 0, NULL),
('PKK005', 'VD-Hoa-S-VA', 35, 40, 5, 'Nhập thêm 5 cái váy'),
('PKK005', 'G-Sneaker-42', 12, 20, 8, 'Nhập thêm 8 đôi giày'),
('PKK005', 'TX-Da-01', 8, 15, 7, 'Nhập thêm 7 cái túi xách'),

-- Chi tiết PKK006 (Kiểm kê giữa tháng 11 - Hoàn thành)
('PKK006', 'AT-01-M-TR', 200, 195, -5, 'Thiếu 5 cái, đã bán nhưng chưa cập nhật'),
('PKK006', 'AT-01-L-TR', 150, 150, 0, NULL),
('PKK006', 'AT-01-M-DE', 50, 48, -2, 'Thiếu 2 cái, có thể do hỏng'),
('PKK006', 'QJ-01-29-X', 60, 58, -2, 'Thiếu 2 cái, đã bán'),
('PKK006', 'QJ-01-30-X', 55, 55, 0, NULL),
('PKK006', 'ASM-02-L-KE', 15, 15, 0, NULL),
('PKK006', 'AK-Da-XL-DE', 23, 22, -1, 'Thiếu 1 cái, có thể bị mất'),
('PKK006', 'VD-Hoa-S-VA', 40, 40, 0, NULL),
('PKK006', 'G-Sneaker-42', 20, 18, -2, 'Thiếu 2 đôi, đã bán'),
('PKK006', 'TX-Da-01', 15, 15, 0, NULL),

-- Chi tiết PKK007 (Kiểm kê kiểm tra chất lượng - Đang kiểm)
('PKK007', 'AT-01-M-TR', 195, 195, 0, NULL),
('PKK007', 'AT-01-L-TR', 150, 150, 0, NULL),
('PKK007', 'AT-01-M-DE', 48, 48, 0, NULL),
('PKK007', 'QJ-01-29-X', 58, 58, 0, NULL),
('PKK007', 'QJ-01-30-X', 55, 55, 0, NULL),
('PKK007', 'ASM-02-L-KE', 15, 15, 0, NULL),
('PKK007', 'AK-Da-XL-DE', 22, 22, 0, NULL),
('PKK007', 'VD-Hoa-S-VA', 40, 40, 0, NULL),
('PKK007', 'G-Sneaker-42', 18, 18, 0, NULL),
('PKK007', 'TX-Da-01', 15, 15, 0, NULL),

-- Chi tiết PKK008 (Kiểm kê cuối tháng 11 - Hoàn thành)
('PKK008', 'AT-01-M-TR', 195, 190, -5, 'Thiếu 5 cái, đã bán trong tháng'),
('PKK008', 'AT-01-L-TR', 150, 145, -5, 'Thiếu 5 cái, đã bán'),
('PKK008', 'AT-01-M-DE', 48, 45, -3, 'Thiếu 3 cái, đã bán'),
('PKK008', 'QJ-01-29-X', 58, 55, -3, 'Thiếu 3 cái, đã bán'),
('PKK008', 'QJ-01-30-X', 55, 52, -3, 'Thiếu 3 cái, đã bán'),
('PKK008', 'ASM-02-L-KE', 15, 14, -1, 'Thiếu 1 cái, đã bán'),
('PKK008', 'AK-Da-XL-DE', 22, 20, -2, 'Thiếu 2 cái, đã bán'),
('PKK008', 'VD-Hoa-S-VA', 40, 38, -2, 'Thiếu 2 cái, đã bán'),
('PKK008', 'G-Sneaker-42', 18, 16, -2, 'Thiếu 2 đôi, đã bán'),
('PKK008', 'TX-Da-01', 15, 13, -2, 'Thiếu 2 cái, đã bán'),

-- Chi tiết PKK009 (Kiểm kê bị hủy - Đã hủy)
('PKK009', 'AT-01-M-TR', 190, 190, 0, NULL),
('PKK009', 'AT-01-L-TR', 145, 145, 0, NULL);

-- ============================================
-- GHI CHÚ:
-- ============================================
-- 1. Dữ liệu đã được tối ưu để phù hợp với schema mới
-- 2. SoLuongTon trong HANG_HOA đã được cập nhật đúng với các phiếu nhập/xuất
-- 3. Trạng thái phiếu nhập/xuất: 0 = Đang xử lý, 1 = Hoàn thành
-- 4. Email đã được thêm vào tất cả tài khoản
-- 5. Loại bỏ bảng TON_KHO vì đã có SoLuongTon trong HANG_HOA
