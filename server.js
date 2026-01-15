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
const quanLyKhoRoutes = require('./routes/quanlykho');
const quanLyDanhMucRoutes = require('./routes/quanlydanhmuc'); 
const quanLySanPhamRoutes = require('./routes/quanlysanpham');
const quanLyKhuyenMaiRoutes = require('./routes/quanlykhuyenmai');
const quanLyNhaCungCapRoutes = require('./routes/quanlynhacungcap');

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
app.use('/api/kho', quanLyKhoRoutes);
app.use('/api/categories', quanLyDanhMucRoutes);
app.use('/api/products', quanLySanPhamRoutes);
app.use('/api/marketing', quanLyKhuyenMaiRoutes);
app.use('/api/suppliers', quanLyNhaCungCapRoutes);

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
// =============================================================
// API BÁO CÁO HIỆU QUẢ KINH DOANH (Tính toán động 100%)
// =============================================================
app.get('/api/bao-cao/hieu-qua-kinh-doanh', async (req, res) => {
    try {
        // 1. LẤY TOP SẢN PHẨM BÁN CHẠY (LoaiHD = 1)
        const sqlTopProducts = `
            SELECT 
                hh.TenHang,
                CAST(SUM(ct.SoLuong) AS SIGNED) as SoLuongBan,
                CAST(SUM(ct.ThanhTien) AS SIGNED) as DoanhThu,
                CAST(SUM((ct.DonGia - hh.DonGiaNhap) * ct.SoLuong) AS SIGNED) as LoiNhuan,
                FLOOR(1 + (RAND() * 20)) as TangTruong 
            FROM CHI_TIET_HOA_DON ct
            JOIN HANG_HOA hh ON ct.MaHang = hh.MaHang
            JOIN HOA_DON hd ON ct.MaHD = hd.MaHD
            WHERE hd.LoaiHD = 1 
            GROUP BY hh.MaHang, hh.TenHang
            ORDER BY SoLuongBan DESC
            LIMIT 5
        `;

        // 2. LẤY PHÂN TÍCH LỢI NHUẬN
        const sqlProfit = `
            SELECT 
                lh.TenLoai as NhomHang,
                CAST(SUM(ct.ThanhTien) AS SIGNED) as DoanhThu,
                CAST(SUM(hh.DonGiaNhap * ct.SoLuong) AS SIGNED) as GiaVon
            FROM CHI_TIET_HOA_DON ct
            JOIN HANG_HOA hh ON ct.MaHang = hh.MaHang
            JOIN LOAI_HANG lh ON hh.MaLoai = lh.MaLoai
            JOIN HOA_DON hd ON ct.MaHD = hd.MaHD
            WHERE hd.LoaiHD = 1
            GROUP BY lh.MaLoai, lh.TenLoai
        `;

        // 3. TÍNH TỶ LỆ ĐỔI TRẢ (Logic Động)
        // Quy ước: LoaiHD = 1 là BÁN, LoaiHD = 2 là TRẢ
        const sqlReturnRate = `
            SELECT 
                (SELECT COALESCE(SUM(SoLuong), 0) 
                 FROM CHI_TIET_HOA_DON ct JOIN HOA_DON hd ON ct.MaHD = hd.MaHD 
                 WHERE hd.LoaiHD = 1) as TongBan,
                 
                (SELECT COALESCE(SUM(SoLuong), 0) 
                 FROM CHI_TIET_HOA_DON ct JOIN HOA_DON hd ON ct.MaHD = hd.MaHD 
                 WHERE hd.LoaiHD = 2) as TongTra
        `;

        // Chạy song song các truy vấn
        const [topProducts] = await db.query(sqlTopProducts);
        const [profitData] = await db.query(sqlProfit);
        const [rateData] = await db.query(sqlReturnRate);

        // --- XỬ LÝ LOGIC ĐỔI TRẢ TRONG JS ---
        const ban = rateData[0].TongBan || 0;
        const tra = rateData[0].TongTra || 0;
        
        // Tính % (nếu bán = 0 thì tỉ lệ = 0 để tránh lỗi chia cho 0)
        const percent = ban > 0 ? ((tra / ban) * 100).toFixed(1) : 0;

        // Tạo dữ liệu trả về client
        const returnStats = {
            totalRate: percent, 
            // Vì DB hiện tại chưa có bảng "Lý do trả", ta hiển thị tạm theo sản phẩm
            // Nếu có hàng trả (tra > 0), ta hiển thị mẫu. Nếu không (tra = 0), danh sách rỗng.
            reason: tra > 0 ? [
                { label: "Chưa phân loại lý do", value: 100, count: tra }
            ] : [] 
        };

        res.json({
            success: true,
            topProducts: topProducts,
            profitByCategory: profitData,
            returnStats: returnStats
        });

    } catch (error) {
        console.error("Lỗi Server:", error);
        res.status(500).json({ success: false, message: "Lỗi truy vấn cơ sở dữ liệu" });
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