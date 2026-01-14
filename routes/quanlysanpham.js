const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Lấy danh sách sản phẩm (Kèm tên loại hàng)
router.get('/', async (req, res) => {
    try {
        const keyword = req.query.q;
        const categoryId = req.query.cate; // Lọc theo loại
        
        let sql = `
            SELECT h.*, l.TenLoai 
            FROM HANG_HOA h
            LEFT JOIN LOAI_HANG l ON h.MaLoai = l.MaLoai
            WHERE 1=1
        `;
        let params = [];

        if (keyword) {
            sql += ` AND (h.TenHang LIKE ? OR h.MaHang LIKE ?)`;
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        if (categoryId) {
            sql += ` AND h.MaLoai = ?`;
            params.push(categoryId);
        }

        sql += ' ORDER BY h.TenHang ASC';

        const [rows] = await db.execute(sql, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Lỗi lấy sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 2. Thêm sản phẩm mới
router.post('/', async (req, res) => {
    const { maHang, tenHang, maLoai, size, mauSac, donViTinh, soLuongTon, donGiaNhap, donGiaBan, anhMinhHoa } = req.body;

    // Validate cơ bản
    if (!maHang || !tenHang) {
        return res.status(400).json({ success: false, message: 'Mã hàng và Tên hàng là bắt buộc' });
    }

    try {
        // Kiểm tra trùng mã SKU
        const [check] = await db.execute('SELECT MaHang FROM HANG_HOA WHERE MaHang = ?', [maHang]);
        if (check.length > 0) {
            return res.status(400).json({ success: false, message: 'Mã hàng (SKU) này đã tồn tại!' });
        }

        const sql = `
            INSERT INTO HANG_HOA 
            (MaHang, TenHang, MaLoai, Size, MauSac, DonViTinh, SoLuongTon, DonGiaNhap, DonGiaBan, AnhMinhHoa)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.execute(sql, [maHang, tenHang, maLoai, size, mauSac, donViTinh, soLuongTon, donGiaNhap, donGiaBan, anhMinhHoa]);
        
        res.json({ success: true, message: 'Thêm sản phẩm thành công!' });
    } catch (error) {
        console.error('Lỗi thêm sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 3. Sửa sản phẩm
router.put('/:id', async (req, res) => {
    const id = req.params.id; // MaHang cũ
    const { tenHang, maLoai, size, mauSac, donViTinh, soLuongTon, donGiaNhap, donGiaBan, anhMinhHoa } = req.body;

    try {
        const sql = `
            UPDATE HANG_HOA 
            SET TenHang=?, MaLoai=?, Size=?, MauSac=?, DonViTinh=?, SoLuongTon=?, DonGiaNhap=?, DonGiaBan=?, AnhMinhHoa=?
            WHERE MaHang=?
        `;
        await db.execute(sql, [tenHang, maLoai, size, mauSac, donViTinh, soLuongTon, donGiaNhap, donGiaBan, anhMinhHoa, id]);
        
        res.json({ success: true, message: 'Cập nhật thành công!' });
    } catch (error) {
        console.error('Lỗi sửa sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 4. Xóa sản phẩm
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await db.execute('DELETE FROM HANG_HOA WHERE MaHang = ?', [id]);
        res.json({ success: true, message: 'Đã xóa sản phẩm' });
    } catch (error) {
        // Lỗi ràng buộc khóa ngoại (đã bán trong hóa đơn)
        if (error.errno === 1451) {
            return res.status(400).json({ success: false, message: 'Không thể xóa vì sản phẩm này đã phát sinh giao dịch (Hóa đơn).' });
        }
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;