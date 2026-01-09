const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const db = require('./db'); 
require('dotenv').config();

// [1] IMPORT CÁC ROUTE
const baoCaoRoutes = require('./routes/baocao');
const trangChuRoutes = require('./routes/trangchu'); 
const quanLyNguoiDungRoutes = require('./routes/quanlynguoidung');

const app = express(); // <--- Tạo app tại đây
const PORT = process.env.PORT || 3000;

// [2] MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/PTTKHT', express.static(path.join(__dirname, 'PTTKHT')));

// [3] ĐĂNG KÝ ROUTE (Phải đặt ở dưới dòng const app = express())
app.use('/api/bao-cao', baoCaoRoutes);
app.use('/api/trang-chu', trangChuRoutes); 
app.use('/api/users', quanLyNguoiDungRoutes);

// Hàm mã hóa MD5
function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

// [4] CÁC API HỆ THỐNG

// API: Đăng nhập
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) 
        return res.status(400).json({ success: false, message: 'Thiếu thông tin.' });

    try {
        const hashedPassword = md5(password);
        // Chỉ lấy các trường cần thiết, tránh lấy mật khẩu trả về client
        const [rows] = await db.execute(
            'SELECT MaNV, TenDangNhap, HoTen, QuyenHan, Email FROM TAI_KHOAN WHERE TenDangNhap = ? AND MatKhau = ?',
            [username, hashedPassword]
        );

        if (rows.length > 0) {
            const user = rows[0];
            res.json({ success: true, message: 'Đăng nhập thành công!', user: user });
        } else {
            res.status(401).json({ success: false, message: 'Sai thông tin đăng nhập.' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
});

// API: Quên mật khẩu
app.post('/api/forget-password', async (req, res) => {
    const { username, email, newPassword } = req.body;
    if (!username || !email || !newPassword) 
        return res.status(400).json({ success: false, message: 'Thiếu thông tin.' });

    try {
        const hashedNewPassword = md5(newPassword);
        
        // Kiểm tra xem username và email có khớp nhau không
        const [rows] = await db.execute(
            'SELECT MaNV FROM TAI_KHOAN WHERE TenDangNhap = ? AND Email = ?', 
            [username, email]
        );

        if (rows.length === 0) 
            return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc Email không đúng.' });

        // Cập nhật mật khẩu
        await db.execute('UPDATE TAI_KHOAN SET MatKhau = ? WHERE MaNV = ?', [hashedNewPassword, rows[0].MaNV]);
        res.json({ success: true, message: 'Đặt lại mật khẩu thành công!' });
    } catch (error) {
        console.error('Forget Pass Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
});

// API: Đổi mật khẩu
app.post('/api/change-password', async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) 
        return res.status(400).json({ success: false, message: 'Thiếu thông tin.' });

    try {
        const hashedOldPassword = md5(oldPassword);
        const hashedNewPassword = md5(newPassword);

        // Kiểm tra mật khẩu cũ
        const [rows] = await db.execute(
            'SELECT MaNV FROM TAI_KHOAN WHERE MaNV = ? AND MatKhau = ?', 
            [userId, hashedOldPassword]
        );
        
        if (rows.length === 0) 
            return res.status(401).json({ success: false, message: 'Mật khẩu cũ không đúng.' });

        // Cập nhật mật khẩu mới
        await db.execute('UPDATE TAI_KHOAN SET MatKhau = ? WHERE MaNV = ?', [hashedNewPassword, userId]);
        res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        console.error('Change Pass Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
});

// Trang chủ chuyển hướng về trang đăng nhập
app.get('/', (req, res) => {
    res.redirect('/PTTKHT/QTHT/DN/code.html');
});

// Chạy server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});