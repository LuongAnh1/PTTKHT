const express = require('express'); 
const db = require('../db'); // Kết nối CSDL (lùi lại 1 thư mục để tìm file db.js)
const router = express.Router(); // <--- DÒNG NÀY RẤT QUAN TRỌNG ĐỂ SỬA LỖI

// ============================================
// VIẾT CÁC API LIÊN QUAN ĐẾN BÁO CÁO Ở ĐÂY
// ============================================

// Ví dụ API: Lấy danh sách báo cáo
// URL gọi: GET http://localhost:3000/api/bao-cao/danh-sach
router.get('/danh-sach', async (req, res) => {
    try {
        // Giả sử bảng tên là BAO_CAO
        const [rows] = await db.execute('SELECT * FROM BAO_CAO');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi lấy dữ liệu báo cáo' });
    }
});

// Ví dụ API: Tạo báo cáo mới
// URL gọi: POST http://localhost:3000/api/bao-cao/tao-moi
router.post('/tao-moi', async (req, res) => {
    const { tenBaoCao, noiDung } = req.body;
    try {
        // Code insert vào database...
        res.json({ success: true, message: 'Đã tạo báo cáo' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi tạo báo cáo' });
    }
});

// ============================================
module.exports = router; // 