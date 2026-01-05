const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, Images, etc.)
app.use('/PTTKHT', express.static(path.join(__dirname, 'PTTKHT')));

// Helper to hash password with MD5
function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

// API: Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.' });
    }

    try {
        const hashedPassword = md5(password);
        const [rows] = await db.execute(
            'SELECT MaNV, TenDangNhap, HoTen, QuyenHan FROM TAI_KHOAN WHERE TenDangNhap = ? AND MatKhau = ?',
            [username, hashedPassword]
        );

        if (rows.length > 0) {
            const user = rows[0];
            res.json({
                success: true,
                message: 'Đăng nhập thành công!',
                user: {
                    id: user.MaNV,
                    username: user.TenDangNhap,
                    fullName: user.HoTen,
                    role: user.QuyenHan
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu.' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
});

// API: Forget Password
app.post('/api/forget-password', async (req, res) => {
    const { username, email, newPassword } = req.body;

    if (!username || !email || !newPassword) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin.' });
    }

    try {
        const hashedNewPassword = md5(newPassword);

        // Verify user exists with username and Email
        const [rows] = await db.execute(
            'SELECT MaNV FROM TAI_KHOAN WHERE TenDangNhap = ? AND Email = ?',
            [username, email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc Email không đúng.' });
        }

        const userId = rows[0].MaNV;

        // Update to new password
        await db.execute(
            'UPDATE TAI_KHOAN SET MatKhau = ? WHERE MaNV = ?',
            [hashedNewPassword, userId]
        );

        res.json({ success: true, message: 'Đặt lại mật khẩu thành công!' });

    } catch (error) {
        console.error('Forget Password Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
});

// API: Change Password
app.post('/api/change-password', async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin.' });
    }

    try {
        const hashedPassword = md5(oldPassword);
        const hashedNewPassword = md5(newPassword);

        // Verify old password
        const [rows] = await db.execute(
            'SELECT MaNV FROM TAI_KHOAN WHERE MaNV = ? AND MatKhau = ?',
            [userId, hashedOldPassword]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
        }

        // Update to new password
        await db.execute(
            'UPDATE TAI_KHOAN SET MatKhau = ? WHERE MaNV = ?',
            [hashedNewPassword, userId]
        );

        res.json({ success: true, message: 'Đổi mật khẩu thành công!' });

    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
});

// Redirect root to login page
app.get('/', (req, res) => {
    res.redirect('/PTTKHT/QTHT/DN/code.html');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
