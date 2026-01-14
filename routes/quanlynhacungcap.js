const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Lấy danh sách nhà cung cấp (Có tìm kiếm)
router.get('/', async (req, res) => {
    try {
        const keyword = req.query.q;
        let sql = 'SELECT * FROM NHA_CUNG_CAP WHERE 1=1';
        let params = [];

        if (keyword) {
            sql += ' AND (TenNCC LIKE ? OR SoDienThoai LIKE ? OR Email LIKE ? OR NguoiLienHe LIKE ?)';
            const k = `%${keyword}%`;
            params.push(k, k, k, k);
        }

        sql += ' ORDER BY MaNCC DESC'; // Mới nhất lên đầu

        const [rows] = await db.execute(sql, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 2. Thêm nhà cung cấp mới
router.post('/', async (req, res) => {
    const { tenNCC, sdt, email, diaChi, nguoiLienHe, ghiChu, soTienNo } = req.body;
    
    if (!tenNCC) return res.status(400).json({ success: false, message: 'Tên NCC là bắt buộc' });

    try {
        const sql = `
            INSERT INTO NHA_CUNG_CAP (TenNCC, SoDienThoai, Email, DiaChi, NguoiLienHe, GhiChu, SoTienNo, TrangThai) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `;
        await db.execute(sql, [tenNCC, sdt, email, diaChi, nguoiLienHe, ghiChu, soTienNo || 0]);
        res.json({ success: true, message: 'Thêm thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Cập nhật thông tin
router.put('/:id', async (req, res) => {
    const id = req.params.id;
    const { tenNCC, sdt, email, diaChi, nguoiLienHe, ghiChu, soTienNo } = req.body;

    try {
        const sql = `
            UPDATE NHA_CUNG_CAP 
            SET TenNCC=?, SoDienThoai=?, Email=?, DiaChi=?, NguoiLienHe=?, GhiChu=?, SoTienNo=?
            WHERE MaNCC=?
        `;
        await db.execute(sql, [tenNCC, sdt, email, diaChi, nguoiLienHe, ghiChu, soTienNo || 0, id]);
        res.json({ success: true, message: 'Cập nhật thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. Xóa nhà cung cấp
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM NHA_CUNG_CAP WHERE MaNCC = ?', [req.params.id]);
        res.json({ success: true, message: 'Đã xóa thành công' });
    } catch (error) {
        if (error.errno === 1451) {
            return res.status(400).json({ success: false, message: 'Không thể xóa NCC này vì đã có phiếu nhập kho!' });
        }
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;