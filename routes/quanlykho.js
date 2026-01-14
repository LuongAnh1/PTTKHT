const express = require('express');
const db = require('../db');
const router = express.Router();

// ============================================
// API QUẢN LÝ KHO
// ============================================

// API kho đã bị loại bỏ - không còn cần thiết

// Lấy danh sách nhà cung cấp
router.get('/nha-cung-cap', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM NHA_CUNG_CAP WHERE TrangThai = 1 ORDER BY TenNCC'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Lỗi lấy danh sách nhà cung cấp:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách nhà cung cấp' });
    }
});

// Lấy danh sách hàng hóa
router.get('/hang-hoa', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM HANG_HOA ORDER BY MaHang'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Lỗi lấy danh sách hàng hóa:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách hàng hóa' });
    }
});

// Lấy mã phiếu nhập kho tiếp theo
router.get('/nhap-kho/next-code', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT MaPNK FROM PHIEU_NHAP_KHO 
             WHERE MaPNK LIKE 'PNK%' 
             ORDER BY CAST(SUBSTRING(MaPNK, 4) AS UNSIGNED) DESC 
             LIMIT 1`
        );
        
        let nextNumber = 1;
        if (rows.length > 0) {
            const lastCode = rows[0].MaPNK;
            const lastNumber = parseInt(lastCode.substring(3)) || 0;
            nextNumber = lastNumber + 1;
        }
        
        const nextCode = `PNK${String(nextNumber).padStart(3, '0')}`;
        res.json({ success: true, data: { MaPNK: nextCode } });
    } catch (error) {
        console.error('Lỗi lấy mã phiếu nhập kho tiếp theo:', error);
        // Fallback: tạo mã ngẫu nhiên
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        res.json({ success: true, data: { MaPNK: `PNK${year}${random}` } });
    }
});

// Lấy mã phiếu xuất kho tiếp theo
router.get('/xuat-kho/next-code', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT MaPXK FROM PHIEU_XUAT_KHO 
             WHERE MaPXK LIKE 'PXK%' 
             ORDER BY CAST(SUBSTRING(MaPXK, 4) AS UNSIGNED) DESC 
             LIMIT 1`
        );
        
        let nextNumber = 1;
        if (rows.length > 0) {
            const lastCode = rows[0].MaPXK;
            const lastNumber = parseInt(lastCode.substring(3)) || 0;
            nextNumber = lastNumber + 1;
        }
        
        const nextCode = `PXK${String(nextNumber).padStart(3, '0')}`;
        res.json({ success: true, data: { MaPXK: nextCode } });
    } catch (error) {
        console.error('Lỗi lấy mã phiếu xuất kho tiếp theo:', error);
        // Fallback: tạo mã ngẫu nhiên
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        res.json({ success: true, data: { MaPXK: `PXK${year}${random}` } });
    }
});

// ============================================
// PHIẾU NHẬP KHO
// ============================================

// Lấy danh sách phiếu nhập kho
router.get('/nhap-kho', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT pnk.*, ncc.TenNCC, tk.HoTen as TenNguoiTao
            FROM PHIEU_NHAP_KHO pnk
            LEFT JOIN NHA_CUNG_CAP ncc ON pnk.MaNCC = ncc.MaNCC
            LEFT JOIN TAI_KHOAN tk ON pnk.MaNV = tk.MaNV
            ORDER BY pnk.NgayNhap DESC
        `);
        res.json({ success: true, data: rows || [] });
    } catch (error) {
        console.error('Lỗi lấy danh sách phiếu nhập kho:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách phiếu nhập kho: ' + error.message });
    }
});

// Lấy chi tiết phiếu nhập kho
router.get('/nhap-kho/:maPNK', async (req, res) => {
    try {
        const { maPNK } = req.params;
        
        // Lấy thông tin phiếu nhập
        const [phieuRows] = await db.execute(`
            SELECT pnk.*, ncc.TenNCC, tk.HoTen as TenNguoiTao
            FROM PHIEU_NHAP_KHO pnk
            LEFT JOIN NHA_CUNG_CAP ncc ON pnk.MaNCC = ncc.MaNCC
            LEFT JOIN TAI_KHOAN tk ON pnk.MaNV = tk.MaNV
            WHERE pnk.MaPNK = ?
        `, [maPNK]);
        
        if (phieuRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu nhập kho' });
        }
        
        // Lấy chi tiết hàng hóa
        const [chiTietRows] = await db.execute(`
            SELECT ct.*, hh.TenHang, hh.DonViTinh
            FROM CHI_TIET_PHIEU_NHAP_KHO ct
            LEFT JOIN HANG_HOA hh ON ct.MaHang = hh.MaHang
            WHERE ct.MaPNK = ?
        `, [maPNK]);
        
        res.json({
            success: true,
            data: {
                ...phieuRows[0],
                DanhSachHang: chiTietRows
            }
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết phiếu nhập kho:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy chi tiết phiếu nhập kho' });
    }
});

// Tạo phiếu nhập kho mới
router.post('/nhap-kho', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { MaPNK, NgayNhap, MaNCC, MaNV, TongTien, ChietKhau, GhiChu, DanhSachHang } = req.body;
        
        // Tạo phiếu nhập kho - mặc định TrangThai = 0 (Đang xử lý)
        const { TrangThai: trangThaiMoi } = req.body;
        const trangThai = trangThaiMoi !== undefined ? trangThaiMoi : 0;
        await connection.execute(
            `INSERT INTO PHIEU_NHAP_KHO (MaPNK, NgayNhap, MaNCC, MaNV, TongTien, ChietKhau, TrangThai, GhiChu)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [MaPNK, NgayNhap, MaNCC || null, MaNV, TongTien || 0, ChietKhau || 0, trangThai, GhiChu || null]
        );
        
        // Thêm chi tiết hàng hóa
        if (DanhSachHang && DanhSachHang.length > 0) {
            for (const hang of DanhSachHang) {
                // Kiểm tra xem hàng hóa đã tồn tại trong HANG_HOA chưa
                const [existingHang] = await connection.execute(
                    'SELECT MaHang FROM HANG_HOA WHERE MaHang = ?',
                    [hang.MaHang]
                );
                
                // Nếu chưa tồn tại, tạo mới hàng hóa
                if (existingHang.length === 0) {
                    const tenHang = hang.TenHang || hang.MaHang || 'Hàng hóa mới';
                    const donViTinh = hang.DVT || hang.DonViTinh || 'Cái';
                    const donGiaNhap = Number(hang.DonGiaNhap) || 0;
                    const donGiaBan = donGiaNhap > 0 ? donGiaNhap * 2 : 0; // Mặc định giá bán = giá nhập * 2
                    const maLoai = 1; // Mặc định loại hàng = 1 (Áo Thun)
                    
                    await connection.execute(
                        `INSERT INTO HANG_HOA (MaHang, TenHang, MaLoai, DonViTinh, SoLuongTon, DonGiaNhap, DonGiaBan, TrangThai)
                         VALUES (?, ?, ?, ?, 0, ?, ?, 1)`,
                        [hang.MaHang, tenHang, maLoai, donViTinh, donGiaNhap, donGiaBan]
                    );
                }
                
                await connection.execute(
                    `INSERT INTO CHI_TIET_PHIEU_NHAP_KHO (MaPNK, MaHang, SoLuong, DonGiaNhap, ThanhTien)
                     VALUES (?, ?, ?, ?, ?)`,
                    [MaPNK, hang.MaHang, hang.SoLuong, hang.DonGiaNhap, hang.ThanhTien]
                );
                
                // Cập nhật tồn kho trong HANG_HOA - CHỈ khi phiếu hoàn thành (TrangThai = 1)
                if (trangThai === 1) {
                    await connection.execute(
                        'UPDATE HANG_HOA SET SoLuongTon = SoLuongTon + ? WHERE MaHang = ?',
                        [hang.SoLuong, hang.MaHang]
                    );
                }
            }
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Tạo phiếu nhập kho thành công', data: { MaPNK } });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi tạo phiếu nhập kho:', error);
        res.status(500).json({ success: false, message: 'Lỗi tạo phiếu nhập kho: ' + error.message });
    } finally {
        connection.release();
    }
});

// Cập nhật phiếu nhập kho
router.put('/nhap-kho/:maPNK', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { maPNK } = req.params;
        const { NgayNhap, MaNCC, TongTien, ChietKhau, GhiChu, DanhSachHang, TrangThai } = req.body;
        
        // Kiểm tra phiếu có tồn tại không
        const [phieuRows] = await connection.execute(
            'SELECT * FROM PHIEU_NHAP_KHO WHERE MaPNK = ?',
            [maPNK]
        );
        
        if (phieuRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu nhập kho' });
        }
        
        const phieuCu = phieuRows[0];
        
        // Nếu phiếu đã hoàn thành (TrangThai = 1), không cho sửa
        if (phieuCu.TrangThai === 1 && TrangThai !== 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Phiếu nhập kho đã hoàn thành, không thể chỉnh sửa' });
        }
        
        // Cập nhật phiếu nhập kho
        await connection.execute(
            `UPDATE PHIEU_NHAP_KHO 
             SET NgayNhap = ?, MaNCC = ?, TongTien = ?, ChietKhau = ?, GhiChu = ?, TrangThai = ?
             WHERE MaPNK = ?`,
            [NgayNhap, MaNCC || null, TongTien || 0, ChietKhau || 0, GhiChu || null, TrangThai || phieuCu.TrangThai, maPNK]
        );
        
        // Xóa chi tiết cũ và thêm mới
        if (DanhSachHang && DanhSachHang.length > 0) {
            // Hoàn trả tồn kho cũ - CHỈ nếu phiếu cũ đã hoàn thành (TrangThai = 1)
            const [chiTietCu] = await connection.execute(
                'SELECT * FROM CHI_TIET_PHIEU_NHAP_KHO WHERE MaPNK = ?',
                [maPNK]
            );
            
            // Chỉ hoàn trả tồn kho nếu phiếu cũ đã hoàn thành
            if (phieuCu.TrangThai === 1) {
                for (const hangCu of chiTietCu) {
                    // Hoàn trả tồn kho trong HANG_HOA (đảm bảo không âm)
                    await connection.execute(
                        'UPDATE HANG_HOA SET SoLuongTon = GREATEST(0, SoLuongTon - ?) WHERE MaHang = ?',
                        [hangCu.SoLuong, hangCu.MaHang]
                    );
                }
            }
            
            // Xóa chi tiết cũ
            await connection.execute('DELETE FROM CHI_TIET_PHIEU_NHAP_KHO WHERE MaPNK = ?', [maPNK]);
            
            // Thêm chi tiết mới
            for (const hang of DanhSachHang) {
                // Kiểm tra xem hàng hóa đã tồn tại trong HANG_HOA chưa
                const [existingHang] = await connection.execute(
                    'SELECT MaHang FROM HANG_HOA WHERE MaHang = ?',
                    [hang.MaHang]
                );
                
                // Nếu chưa tồn tại, tạo mới hàng hóa
                if (existingHang.length === 0) {
                    const tenHang = hang.TenHang || hang.MaHang || 'Hàng hóa mới';
                    const donViTinh = hang.DVT || hang.DonViTinh || 'Cái';
                    const donGiaNhap = Number(hang.DonGiaNhap) || 0;
                    const donGiaBan = donGiaNhap > 0 ? donGiaNhap * 2 : 0; // Mặc định giá bán = giá nhập * 2
                    const maLoai = 1; // Mặc định loại hàng = 1 (Áo Thun)
                    
                    await connection.execute(
                        `INSERT INTO HANG_HOA (MaHang, TenHang, MaLoai, DonViTinh, SoLuongTon, DonGiaNhap, DonGiaBan, TrangThai)
                         VALUES (?, ?, ?, ?, 0, ?, ?, 1)`,
                        [hang.MaHang, tenHang, maLoai, donViTinh, donGiaNhap, donGiaBan]
                    );
                }
                
                await connection.execute(
                    `INSERT INTO CHI_TIET_PHIEU_NHAP_KHO (MaPNK, MaHang, SoLuong, DonGiaNhap, ThanhTien)
                     VALUES (?, ?, ?, ?, ?)`,
                    [maPNK, hang.MaHang, hang.SoLuong, hang.DonGiaNhap, hang.ThanhTien]
                );
                
                // Cập nhật tồn kho trong HANG_HOA - CHỈ nếu phiếu mới hoàn thành
                // Nếu đang cập nhật từ đang xử lý sang hoàn thành, mới cộng tồn kho
                const trangThaiMoi = TrangThai !== undefined ? TrangThai : phieuCu.TrangThai;
                if (trangThaiMoi === 1) {
                    await connection.execute(
                        'UPDATE HANG_HOA SET SoLuongTon = SoLuongTon + ? WHERE MaHang = ?',
                        [hang.SoLuong, hang.MaHang]
                    );
                }
            }
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Cập nhật phiếu nhập kho thành công' });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi cập nhật phiếu nhập kho:', error);
        res.status(500).json({ success: false, message: 'Lỗi cập nhật phiếu nhập kho: ' + error.message });
    } finally {
        connection.release();
    }
});

// Hủy phiếu nhập kho
router.put('/nhap-kho/:maPNK/cancel', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { maPNK } = req.params;
        
        // Kiểm tra phiếu có tồn tại không
        const [phieuRows] = await connection.execute(
            'SELECT * FROM PHIEU_NHAP_KHO WHERE MaPNK = ?',
            [maPNK]
        );
        
        if (phieuRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu nhập kho' });
        }
        
        const phieu = phieuRows[0];
        
        // Nếu phiếu đã hoàn thành, hoàn trả tồn kho
        if (phieu.TrangThai === 1) {
            const [chiTietRows] = await connection.execute(
                'SELECT * FROM CHI_TIET_PHIEU_NHAP_KHO WHERE MaPNK = ?',
                [maPNK]
            );
            
            for (const hang of chiTietRows) {
                // Hoàn trả tồn kho trong HANG_HOA (đảm bảo không âm)
                await connection.execute(
                    'UPDATE HANG_HOA SET SoLuongTon = GREATEST(0, SoLuongTon - ?) WHERE MaHang = ?',
                    [hang.SoLuong, hang.MaHang]
                );
            }
        }
        
        // Cập nhật trạng thái hủy
        await connection.execute(
            'UPDATE PHIEU_NHAP_KHO SET TrangThai = 0 WHERE MaPNK = ?',
            [maPNK]
        );
        
        await connection.commit();
        res.json({ success: true, message: 'Hủy phiếu nhập kho thành công' });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi hủy phiếu nhập kho:', error);
        res.status(500).json({ success: false, message: 'Lỗi hủy phiếu nhập kho: ' + error.message });
    } finally {
        connection.release();
    }
});

// ============================================
// PHIẾU XUẤT KHO
// ============================================

// Lấy danh sách phiếu xuất kho
router.get('/xuat-kho', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT pxk.*, tk.HoTen as TenNguoiTao
            FROM PHIEU_XUAT_KHO pxk
            LEFT JOIN TAI_KHOAN tk ON pxk.MaNV = tk.MaNV
            ORDER BY pxk.NgayXuat DESC
        `);
        // Map dữ liệu để tương thích với cả database cũ và mới
        rows.forEach(row => {
            // Nếu có LyDoXuat nhưng không có NguoiNhan (database cũ)
            if (row.LyDoXuat && !row.NguoiNhan) {
                row.NguoiNhan = row.LyDoXuat;
            }
            // Nếu có NguoiNhan nhưng không có LyDoXuat (để tương thích với code cũ đang dùng LyDoXuat)
            if (row.NguoiNhan && !row.LyDoXuat) {
                row.LyDoXuat = row.NguoiNhan;
            }
        });
        res.json({ success: true, data: rows || [] });
    } catch (error) {
        console.error('Lỗi lấy danh sách phiếu xuất kho:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách phiếu xuất kho: ' + error.message });
    }
});

// Lấy chi tiết phiếu xuất kho
router.get('/xuat-kho/:maPXK', async (req, res) => {
    try {
        const { maPXK } = req.params;
        
        // Lấy thông tin phiếu xuất
        const [phieuRows] = await db.execute(`
            SELECT pxk.*, tk.HoTen as TenNguoiTao
            FROM PHIEU_XUAT_KHO pxk
            LEFT JOIN TAI_KHOAN tk ON pxk.MaNV = tk.MaNV
            WHERE pxk.MaPXK = ?
        `, [maPXK]);
        
        if (phieuRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu xuất kho' });
        }
        
        // Lấy chi tiết hàng hóa
        const [chiTietRows] = await db.execute(`
            SELECT ct.*, hh.TenHang, hh.DonViTinh
            FROM CHI_TIET_PHIEU_XUAT_KHO ct
            LEFT JOIN HANG_HOA hh ON ct.MaHang = hh.MaHang
            WHERE ct.MaPXK = ?
        `, [maPXK]);
        
        const phieuData = phieuRows[0];
        // Tương thích với code cũ: map NguoiNhan thành LyDoXuat nếu code cũ đang dùng LyDoXuat
        if (phieuData.NguoiNhan && !phieuData.LyDoXuat) {
            phieuData.LyDoXuat = phieuData.NguoiNhan;
        }
        // Ngược lại, nếu có LyDoXuat nhưng không có NguoiNhan (database cũ)
        if (phieuData.LyDoXuat && !phieuData.NguoiNhan) {
            phieuData.NguoiNhan = phieuData.LyDoXuat;
        }
        
        res.json({
            success: true,
            data: {
                ...phieuData,
                DanhSachHang: chiTietRows
            }
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết phiếu xuất kho:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy chi tiết phiếu xuất kho' });
    }
});

// Tạo phiếu xuất kho mới
router.post('/xuat-kho', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { MaPXK, NgayXuat, MaNV, NguoiNhan, LyDoXuat, ChietKhau, GhiChu, DanhSachHang } = req.body;
        // Tương thích với code cũ: nếu có LyDoXuat nhưng không có NguoiNhan thì dùng LyDoXuat
        const nguoiNhanValue = NguoiNhan || LyDoXuat || null;
        
        // Kiểm tra tồn kho trước khi xuất
        for (const hang of DanhSachHang || []) {
            const [tonKhoRows] = await connection.execute(
                'SELECT SoLuongTon FROM HANG_HOA WHERE MaHang = ?',
                [hang.MaHang]
            );
            
            const tonKho = tonKhoRows.length > 0 ? tonKhoRows[0].SoLuongTon : 0;
            if (tonKho < hang.SoLuong) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Hàng hóa ${hang.MaHang} không đủ tồn kho. Tồn kho hiện tại: ${tonKho}, yêu cầu: ${hang.SoLuong}`
                });
            }
        }
        
        // Tính tổng tiền
        const TongTien = (DanhSachHang || []).reduce((sum, h) => sum + (h.ThanhTien || 0), 0);
        
        // Tạo phiếu xuất kho - mặc định TrangThai = 0 (Đang xử lý)
        const { TrangThai: trangThaiXuatMoi } = req.body;
        const trangThaiXuat = trangThaiXuatMoi !== undefined ? trangThaiXuatMoi : 0;
        await connection.execute(
            `INSERT INTO PHIEU_XUAT_KHO (MaPXK, NgayXuat, MaNV, NguoiNhan, ChietKhau, TrangThai, GhiChu)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [MaPXK, NgayXuat, MaNV, nguoiNhanValue, ChietKhau || 0, trangThaiXuat, GhiChu || null]
        );
        
        // Thêm chi tiết hàng hóa và cập nhật tồn kho
        if (DanhSachHang && DanhSachHang.length > 0) {
            for (const hang of DanhSachHang) {
                await connection.execute(
                    `INSERT INTO CHI_TIET_PHIEU_XUAT_KHO (MaPXK, MaHang, SoLuong, DonGiaXuat, ThanhTien)
                     VALUES (?, ?, ?, ?, ?)`,
                    [MaPXK, hang.MaHang, hang.SoLuong, hang.DonGiaXuat, hang.ThanhTien]
                );
                
                // Giảm tồn kho trong HANG_HOA
                await connection.execute(
                    'UPDATE HANG_HOA SET SoLuongTon = SoLuongTon - ? WHERE MaHang = ?',
                    [hang.SoLuong, hang.MaHang]
                );
            }
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Tạo phiếu xuất kho thành công', data: { MaPXK } });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi tạo phiếu xuất kho:', error);
        res.status(500).json({ success: false, message: 'Lỗi tạo phiếu xuất kho: ' + error.message });
    } finally {
        connection.release();
    }
});

// Cập nhật phiếu xuất kho
router.put('/xuat-kho/:maPXK', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { maPXK } = req.params;
        const { NgayXuat, NguoiNhan, LyDoXuat, ChietKhau, GhiChu, DanhSachHang, TrangThai } = req.body;
        // Tương thích với code cũ: nếu có LyDoXuat nhưng không có NguoiNhan thì dùng LyDoXuat
        const nguoiNhanValue = NguoiNhan || LyDoXuat || null;
        
        // Kiểm tra phiếu có tồn tại không
        const [phieuRows] = await connection.execute(
            'SELECT * FROM PHIEU_XUAT_KHO WHERE MaPXK = ?',
            [maPXK]
        );
        
        if (phieuRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu xuất kho' });
        }
        
        const phieuCu = phieuRows[0];
        
        // Nếu phiếu đã hoàn thành (TrangThai = 1), không cho sửa
        if (phieuCu.TrangThai === 1 && TrangThai !== 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Phiếu xuất kho đã hoàn thành, không thể chỉnh sửa' });
        }
        
        // Cập nhật phiếu xuất kho
        await connection.execute(
            `UPDATE PHIEU_XUAT_KHO 
             SET NgayXuat = ?, NguoiNhan = ?, ChietKhau = ?, GhiChu = ?, TrangThai = ?
             WHERE MaPXK = ?`,
            [NgayXuat, nguoiNhanValue, ChietKhau || 0, GhiChu || null, TrangThai || phieuCu.TrangThai, maPXK]
        );
        
        // Xóa chi tiết cũ và thêm mới
        if (DanhSachHang && DanhSachHang.length > 0) {
            // Hoàn trả tồn kho cũ - CHỈ nếu phiếu cũ đã hoàn thành (TrangThai = 1)
            const [chiTietCu] = await connection.execute(
                'SELECT * FROM CHI_TIET_PHIEU_XUAT_KHO WHERE MaPXK = ?',
                [maPXK]
            );
            
            // Chỉ hoàn trả tồn kho nếu phiếu cũ đã hoàn thành
            if (phieuCu.TrangThai === 1) {
                for (const hangCu of chiTietCu) {
                    // Hoàn trả tồn kho trong HANG_HOA
                    await connection.execute(
                        'UPDATE HANG_HOA SET SoLuongTon = SoLuongTon + ? WHERE MaHang = ?',
                        [hangCu.SoLuong, hangCu.MaHang]
                    );
                }
            }
            
            // Xóa chi tiết cũ
            await connection.execute('DELETE FROM CHI_TIET_PHIEU_XUAT_KHO WHERE MaPXK = ?', [maPXK]);
            
            // Kiểm tra tồn kho mới - CHỈ khi phiếu mới sẽ hoàn thành
            const trangThaiMoi = TrangThai !== undefined ? TrangThai : phieuCu.TrangThai;
            if (trangThaiMoi === 1) {
                for (const hang of DanhSachHang) {
                    const [tonKhoRows] = await connection.execute(
                        'SELECT SoLuongTon FROM HANG_HOA WHERE MaHang = ?',
                        [hang.MaHang]
                    );
                    
                    const tonKho = tonKhoRows.length > 0 ? tonKhoRows[0].SoLuongTon : 0;
                    if (tonKho < hang.SoLuong) {
                        await connection.rollback();
                        return res.status(400).json({
                            success: false,
                            message: `Hàng hóa ${hang.MaHang} không đủ tồn kho. Tồn kho hiện tại: ${tonKho}, yêu cầu: ${hang.SoLuong}`
                        });
                    }
                }
            }
            
            // Thêm chi tiết mới
            for (const hang of DanhSachHang) {
                await connection.execute(
                    `INSERT INTO CHI_TIET_PHIEU_XUAT_KHO (MaPXK, MaHang, SoLuong, DonGiaXuat, ThanhTien)
                     VALUES (?, ?, ?, ?, ?)`,
                    [maPXK, hang.MaHang, hang.SoLuong, hang.DonGiaXuat, hang.ThanhTien]
                );
                
                // Giảm tồn kho trong HANG_HOA - CHỈ khi phiếu mới hoàn thành
                if (trangThaiMoi === 1) {
                    await connection.execute(
                        'UPDATE HANG_HOA SET SoLuongTon = GREATEST(0, SoLuongTon - ?) WHERE MaHang = ?',
                        [hang.SoLuong, hang.MaHang]
                    );
                }
            }
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Cập nhật phiếu xuất kho thành công' });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi cập nhật phiếu xuất kho:', error);
        res.status(500).json({ success: false, message: 'Lỗi cập nhật phiếu xuất kho: ' + error.message });
    } finally {
        connection.release();
    }
});

// Hủy phiếu xuất kho
router.put('/xuat-kho/:maPXK/cancel', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { maPXK } = req.params;
        
        // Kiểm tra phiếu có tồn tại không
        const [phieuRows] = await connection.execute(
            'SELECT * FROM PHIEU_XUAT_KHO WHERE MaPXK = ?',
            [maPXK]
        );
        
        if (phieuRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu xuất kho' });
        }
        
        const phieu = phieuRows[0];
        
        // Nếu phiếu đã hoàn thành, hoàn trả tồn kho
        if (phieu.TrangThai === 1) {
            const [chiTietRows] = await connection.execute(
                'SELECT * FROM CHI_TIET_PHIEU_XUAT_KHO WHERE MaPXK = ?',
                [maPXK]
            );
            
            for (const hang of chiTietRows) {
                // Hoàn trả tồn kho trong HANG_HOA
                await connection.execute(
                    'UPDATE HANG_HOA SET SoLuongTon = SoLuongTon + ? WHERE MaHang = ?',
                    [hang.SoLuong, hang.MaHang]
                );
            }
        }
        
        // Cập nhật trạng thái hủy
        await connection.execute(
            'UPDATE PHIEU_XUAT_KHO SET TrangThai = 0 WHERE MaPXK = ?',
            [maPXK]
        );
        
        await connection.commit();
        res.json({ success: true, message: 'Hủy phiếu xuất kho thành công' });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi hủy phiếu xuất kho:', error);
        res.status(500).json({ success: false, message: 'Lỗi hủy phiếu xuất kho: ' + error.message });
    } finally {
        connection.release();
    }
});

// ============================================
// KIỂM KÊ KHO
// ============================================

// Lấy danh sách phiếu kiểm kê
router.get('/kiem-ke', async (req, res) => {
    try {
        const { from, to } = req.query; // YYYY-MM-DD

        const where = [];
        const params = [];
        if (from) {
            where.push('DATE(pkk.NgayKiemKe) >= DATE(?)');
            params.push(from);
        }
        if (to) {
            where.push('DATE(pkk.NgayKiemKe) <= DATE(?)');
            params.push(to);
        }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const [rows] = await db.execute(
            `
            SELECT 
                pkk.*, 
                tk.HoTen as TenNguoiKiemKe,
                COALESCE(lechs.TongMaLech, 0) as TongMaLech
            FROM PHIEU_KIEM_KE pkk
            LEFT JOIN TAI_KHOAN tk ON pkk.MaNV = tk.MaNV
            LEFT JOIN (
                SELECT MaPKK, COUNT(*) as TongMaLech
                FROM CHI_TIET_PHIEU_KIEM_KE
                WHERE ChenhLech <> 0
                GROUP BY MaPKK
            ) lechs ON lechs.MaPKK = pkk.MaPKK
            ${whereSql}
            ORDER BY pkk.NgayKiemKe DESC
            `,
            params
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Lỗi lấy danh sách phiếu kiểm kê:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách phiếu kiểm kê' });
    }
});

// Lấy tồn kho để kiểm kê (PHẢI ĐẶT TRƯỚC route có tham số)
router.get('/kiem-ke/ton-kho', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT hh.MaHang, hh.TenHang, hh.Size, hh.MauSac, hh.DonViTinh,
                   hh.SoLuongTon as SoLuongPhanMem
            FROM HANG_HOA hh
            ORDER BY hh.MaHang
        `);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Lỗi lấy tồn kho:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy tồn kho' });
    }
});

// Lấy mã phiếu kiểm kê tiếp theo (PHẢI ĐẶT TRƯỚC route có tham số)
router.get('/kiem-ke/next-code', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT MaPKK FROM PHIEU_KIEM_KE 
             WHERE MaPKK LIKE 'PKK%' 
             ORDER BY CAST(SUBSTRING(MaPKK, 4) AS UNSIGNED) DESC 
             LIMIT 1`
        );
        
        let nextNumber = 1;
        if (rows.length > 0) {
            const lastCode = rows[0].MaPKK;
            const lastNumber = parseInt(lastCode.substring(3)) || 0;
            nextNumber = lastNumber + 1;
        }
        
        const nextCode = `PKK${String(nextNumber).padStart(3, '0')}`;
        res.json({ success: true, data: { MaPKK: nextCode } });
    } catch (error) {
        console.error('Lỗi lấy mã phiếu kiểm kê tiếp theo:', error);
        // Fallback: tạo mã ngẫu nhiên
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        res.json({ success: true, data: { MaPKK: `PKK${year}${random}` } });
    }
});

// Lấy chi tiết phiếu kiểm kê (PHẢI ĐẶT SAU các route cụ thể)
router.get('/kiem-ke/:maPKK', async (req, res) => {
    try {
        const { maPKK } = req.params;
        
        // Lấy thông tin phiếu kiểm kê
        const [phieuRows] = await db.execute(`
            SELECT pkk.*, tk.HoTen as TenNguoiKiemKe
            FROM PHIEU_KIEM_KE pkk
            LEFT JOIN TAI_KHOAN tk ON pkk.MaNV = tk.MaNV
            WHERE pkk.MaPKK = ?
        `, [maPKK]);
        
        if (phieuRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu kiểm kê' });
        }
        
        // Lấy chi tiết hàng hóa
        const [chiTietRows] = await db.execute(`
            SELECT ct.*, hh.TenHang, hh.DonViTinh
            FROM CHI_TIET_PHIEU_KIEM_KE ct
            LEFT JOIN HANG_HOA hh ON ct.MaHang = hh.MaHang
            WHERE ct.MaPKK = ?
        `, [maPKK]);
        
        res.json({
            success: true,
            data: {
                ...phieuRows[0],
                DanhSachHang: chiTietRows
            }
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết phiếu kiểm kê:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy chi tiết phiếu kiểm kê' });
    }
});

// Tạo phiếu kiểm kê mới
router.post('/kiem-ke', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { MaPKK, NgayKiemKe, MaNV, TrangThai, GhiChu, DanhSachHang } = req.body;
        
        // Tạo phiếu kiểm kê
        // Đảm bảo NgayKiemKe chỉ là ngày (YYYY-MM-DD) không có giờ
        const ngayKiemKe = NgayKiemKe || new Date().toISOString().split('T')[0];
        await connection.execute(
            `INSERT INTO PHIEU_KIEM_KE (MaPKK, NgayKiemKe, MaNV, TrangThai, GhiChu)
             VALUES (?, ?, ?, ?, ?)`,
            [MaPKK, ngayKiemKe, MaNV, TrangThai || 0, GhiChu || null]
        );
        
        // Thêm chi tiết phiếu kiểm kê
        for (const hang of DanhSachHang || []) {
            await connection.execute(
                `INSERT INTO CHI_TIET_PHIEU_KIEM_KE (MaPKK, MaHang, SoLuongTonKho, SoLuongThucTe, ChenhLech, LyDoChenhLech)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    MaPKK,
                    hang.MaHang,
                    hang.SoLuongTonKho || 0,
                    hang.SoLuongThucTe || 0,
                    hang.ChenhLech || 0,
                    hang.LyDoChenhLech || null
                ]
            );
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Tạo phiếu kiểm kê thành công' });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi tạo phiếu kiểm kê:', error);
        res.status(500).json({ success: false, message: 'Lỗi tạo phiếu kiểm kê: ' + error.message });
    } finally {
        connection.release();
    }
});

// Cập nhật phiếu kiểm kê
router.put('/kiem-ke/:maPKK', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { maPKK } = req.params;
        const { NgayKiemKe, MaNV, TrangThai, GhiChu, DanhSachHang } = req.body;
        
        // Cập nhật phiếu kiểm kê
        await connection.execute(
            `UPDATE PHIEU_KIEM_KE 
             SET NgayKiemKe = ?, MaNV = ?, TrangThai = ?, GhiChu = ?
             WHERE MaPKK = ?`,
            [NgayKiemKe, MaNV, TrangThai || 0, GhiChu || null, maPKK]
        );
        
        // Xóa chi tiết cũ
        await connection.execute(
            'DELETE FROM CHI_TIET_PHIEU_KIEM_KE WHERE MaPKK = ?',
            [maPKK]
        );
        
        // Thêm chi tiết mới
        for (const hang of DanhSachHang || []) {
            await connection.execute(
                `INSERT INTO CHI_TIET_PHIEU_KIEM_KE (MaPKK, MaHang, SoLuongTonKho, SoLuongThucTe, ChenhLech, LyDoChenhLech)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    maPKK,
                    hang.MaHang,
                    hang.SoLuongTonKho || 0,
                    hang.SoLuongThucTe || 0,
                    hang.ChenhLech || 0,
                    hang.LyDoChenhLech || null
                ]
            );
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Cập nhật phiếu kiểm kê thành công' });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi cập nhật phiếu kiểm kê:', error);
        res.status(500).json({ success: false, message: 'Lỗi cập nhật phiếu kiểm kê: ' + error.message });
    } finally {
        connection.release();
    }
});

// Cập nhật tồn kho sau kiểm kê
router.post('/kiem-ke/cap-nhat-ton-kho', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { DanhSachHang } = req.body;
        
        for (const hang of DanhSachHang || []) {
            // Cập nhật tồn kho trong HANG_HOA
            await connection.execute(
                'UPDATE HANG_HOA SET SoLuongTon = ? WHERE MaHang = ?',
                [hang.SoLuongThucTe, hang.MaHang]
            );
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Cập nhật tồn kho thành công' });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi cập nhật tồn kho:', error);
        res.status(500).json({ success: false, message: 'Lỗi cập nhật tồn kho: ' + error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
