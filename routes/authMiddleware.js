const jwt = require('jsonwebtoken');

// KHÓA BÍ MẬT (Nên để trong file .env, ở đây mình viết tạm để bạn chạy được ngay)
const SECRET_KEY = process.env.JWT_SECRET || 'mat_khau_bi_mat_cua_shop_thoi_trang';

// ĐỊNH NGHĨA QUYỀN HẠN (Khớp với DB)
const ROLES = {
    ADMIN: 1,
    SALE: 2,
    KHO: 3
};

// 1. Middleware xác thực: Kiểm tra xem user đã đăng nhập chưa
const verifyToken = (req, res, next) => {
    // Client sẽ gửi token qua header: "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập!' });
    }

    jwt.verify(token, SECRET_KEY, (err, userDecoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
        }
        req.user = userDecoded; // Lưu thông tin user vào biến req để dùng ở bước sau
        next();
    });
};

// 2. Middleware phân quyền: Kiểm tra user có được phép làm hành động này không
// resource: Tên chức năng (ví dụ: 'products', 'users')
const checkPermission = (resource) => {
    return (req, res, next) => {
        const role = req.user.QuyenHan;
        const method = req.method; // GET, POST, PUT, DELETE

        // ADMIN (1): Luôn cho qua
        if (role === ROLES.ADMIN) return next();

        // CẤU HÌNH QUYỀN (Logic Backend dựa trên ma trận của bạn)
        // True: Cho phép, False: Chặn
        let allow = false;

        // --- LOGIC CHO SALE (2) ---
        if (role === ROLES.SALE) {
            switch (resource) {
                case 'users': allow = false; break; // Quản lý người dùng: CẤM
                case 'products': allow = true; break; // Quản lý sản phẩm: FULL QUYỀN (Xem/Sửa)
                case 'inventory': allow = false; break; // Nhập xuất: CẤM
                case 'suppliers': allow = true; break;
                // ... thêm các case khác
                default: allow = true; // Mặc định cho phép xem cái khác (như trang chủ)
            }
        }

        // --- LOGIC CHO KHO (3) ---
        else if (role === ROLES.KHO) {
            switch (resource) {
                case 'users': allow = false; break;
                case 'products': 
                    // Chỉ cho xem (GET), không cho sửa/xóa (POST/PUT/DELETE)
                    if (method === 'GET') allow = true;
                    else allow = false; 
                    break;
                case 'inventory': allow = true; break; // Nhập xuất: FULL
                case 'suppliers': allow = false; break;
                // ... thêm các case khác
                default: allow = true;
            }
        }

        if (allow) {
            next();
        } else {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện chức năng này!' });
        }
    };
};

module.exports = { verifyToken, checkPermission, SECRET_KEY };