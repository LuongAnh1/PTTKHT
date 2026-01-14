const express = require('express');
const router = express.Router();
const db = require('../db');

// ==========================================
// A. QUẢN LÝ BẢNG GIÁ
// ==========================================

// 1. Lấy danh sách
router.get('/price-lists', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM BANG_GIA ORDER BY ID DESC');
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Lỗi server' }); }
});

// 2. Thêm Bảng giá
router.post('/price-lists', async (req, res) => {
    const { ten, moTa, tienTe, trangThai } = req.body;
    try {
        await db.execute('INSERT INTO BANG_GIA (TenBangGia, MoTa, LoaiTienTe, TrangThai) VALUES (?, ?, ?, ?)', 
            [ten, moTa, tienTe || 'VNĐ', trangThai]);
        res.json({ success: true, message: 'Thêm bảng giá thành công' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 3. Sửa Bảng giá
router.put('/price-lists/:id', async (req, res) => {
    const { ten, moTa, tienTe, trangThai } = req.body;
    try {
        await db.execute('UPDATE BANG_GIA SET TenBangGia=?, MoTa=?, LoaiTienTe=?, TrangThai=? WHERE ID=?', 
            [ten, moTa, tienTe, trangThai, req.params.id]);
        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 4. Xóa Bảng giá
router.delete('/price-lists/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM BANG_GIA WHERE ID=?', [req.params.id]);
        res.json({ success: true, message: 'Đã xóa bảng giá' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ==========================================
// B. QUẢN LÝ KHUYẾN MÃI
// ==========================================

// 1. Lấy danh sách
router.get('/promotions', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM CHUONG_TRINH_KM ORDER BY ID DESC');
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Lỗi server' }); }
});

// 2. Thêm Khuyến mãi
router.post('/promotions', async (req, res) => {
    const { ten, code, batDau, ketThuc, phamVi, mucGiam, trangThai } = req.body;
    try {
        await db.execute('INSERT INTO CHUONG_TRINH_KM (TenCT, MaCode, NgayBatDau, NgayKetThuc, PhamViApDung, MucGiam, TrangThai) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [ten, code, batDau, ketThuc, phamVi, mucGiam, trangThai]);
        res.json({ success: true, message: 'Tạo chương trình thành công' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 3. Sửa Khuyến mãi
router.put('/promotions/:id', async (req, res) => {
    const { ten, code, batDau, ketThuc, phamVi, mucGiam, trangThai } = req.body;
    try {
        await db.execute('UPDATE CHUONG_TRINH_KM SET TenCT=?, MaCode=?, NgayBatDau=?, NgayKetThuc=?, PhamViApDung=?, MucGiam=?, TrangThai=? WHERE ID=?', 
            [ten, code, batDau, ketThuc, phamVi, mucGiam, trangThai, req.params.id]);
        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 4. Xóa Khuyến mãi
router.delete('/promotions/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM CHUONG_TRINH_KM WHERE ID=?', [req.params.id]);
        res.json({ success: true, message: 'Đã xóa chương trình' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;