const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

// 1. Lấy danh sách
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT MaNV, TenDangNhap, MatKhau, HoTen, QuyenHan, Email, TrangThai, NgayTao FROM tai_khoan ORDER BY MaNV DESC';
        const [rows] = await db.execute(query);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
});

// 2. Cập nhật thông tin
router.put('/:id', async (req, res) => {
    const userId = req.params.id;
    const { HoTen, Email, QuyenHan, TrangThai, TenDangNhap, MatKhau } = req.body;
    try {
        let query = '';
        let params = [];
        if (MatKhau && MatKhau.trim() !== '') {
            const hashedPassword = md5(MatKhau);
            query = `UPDATE tai_khoan SET HoTen = ?, Email = ?, QuyenHan = ?, TrangThai = ?, TenDangNhap = ?, MatKhau = ? WHERE MaNV = ?`;
            params = [HoTen, Email, QuyenHan, TrangThai, TenDangNhap, hashedPassword, userId];
        } else {
            query = `UPDATE tai_khoan SET HoTen = ?, Email = ?, QuyenHan = ?, TrangThai = ?, TenDangNhap = ? WHERE MaNV = ?`;
            params = [HoTen, Email, QuyenHan, TrangThai, TenDangNhap, userId];
        }
        await db.execute(query, params);
        res.json({ success: true, message: 'Cập nhật thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi: ' + error.message });
    }
});

// 3. Xóa người dùng
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        await db.execute('DELETE FROM tai_khoan WHERE MaNV = ?', [userId]);
        res.json({ success: true, message: 'Đã xóa người dùng vĩnh viễn!' });
    } catch (error) {
        if (error.errno === 1451) {
            try {
                await db.execute('UPDATE tai_khoan SET TrangThai = 0 WHERE MaNV = ?', [userId]);
                res.json({ success: true, message: 'User có dữ liệu liên quan -> Đã chuyển sang trạng thái "Đã khóa"!' });
            } catch (err) {
                res.status(500).json({ success: false, message: 'Lỗi khóa tài khoản.' });
            }
        } else {
            res.status(500).json({ success: false, message: 'Lỗi server.' });
        }
    }
});

// 4. THÊM MỚI NGƯỜI DÙNG (POST) <-- BẮT BUỘC PHẢI CÓ ĐOẠN NÀY
router.post('/', async (req, res) => {
    const { TenDangNhap, MatKhau, HoTen, Email, QuyenHan, TrangThai } = req.body;

    if (!TenDangNhap || !MatKhau || !HoTen) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc!' });
    }

    try {
        // Kiểm tra trùng tên đăng nhập
        const [check] = await db.execute('SELECT MaNV FROM tai_khoan WHERE TenDangNhap = ?', [TenDangNhap]);
        if (check.length > 0) {
            return res.status(400).json({ success: false, message: 'Tên đăng nhập đã tồn tại!' });
        }

        const hashedPassword = md5(MatKhau);
        // Lưu ý: Đảm bảo MySQL của bạn cột NgayTao cho phép NULL hoặc có giá trị Default, 
        // hoặc truyền ngày vào như dưới đây:
        const ngayTao = new Date();

        const query = `INSERT INTO tai_khoan (TenDangNhap, MatKhau, HoTen, Email, QuyenHan, TrangThai, NgayTao) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await db.execute(query, [TenDangNhap, hashedPassword, HoTen, Email, QuyenHan, TrangThai, ngayTao]);

        res.json({ success: true, message: 'Thêm thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

module.exports = router; 