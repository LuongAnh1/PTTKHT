const express = require('express');
const router = express.Router();
const db = require('../db');

// API 1: Thống kê chung (Có lọc ngày)
router.get('/thong-ke-chung', async (req, res) => {
    try {
        // Lấy ngày từ client gửi lên, nếu không có thì lấy ngày hiện tại
        const filterDate = req.query.date || new Date().toISOString().split('T')[0];

        // 1. Tồn kho (Luôn là hiện tại - Không lọc ngày)
        const [rowsTonKho] = await db.execute('SELECT SUM(SoLuongTon * DonGiaNhap) as TongTien FROM HANG_HOA');
        
        // 2. Nhập kho (Lọc theo ngày chọn)
        const [rowsNhap] = await db.execute('SELECT COUNT(*) as SoLuong FROM HOA_DON WHERE LoaiHD = 0 AND DATE(NgayLap) = ?', [filterDate]);
        
        // 3. Xuất kho (Lọc theo ngày chọn)
        const [rowsXuat] = await db.execute('SELECT COUNT(*) as SoLuong FROM HOA_DON WHERE LoaiHD = 1 AND DATE(NgayLap) = ?', [filterDate]);
        
        // 4. Công nợ (Luôn là hiện tại - Không lọc ngày)
        const [rowsCongNo] = await db.execute('SELECT SUM(SoTienNo) as TongNo FROM NHA_CUNG_CAP');

        res.json({
            success: true,
            data: {
                tongTonKho: rowsTonKho[0].TongTien || 0,
                soNhap: rowsNhap[0].SoLuong || 0,
                soXuat: rowsXuat[0].SoLuong || 0,
                tongCongNo: rowsCongNo[0].TongNo || 0
            }
        });
    } catch (error) {
        console.error("Lỗi Thống kê:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API 2: Cảnh báo tồn kho (Giữ nguyên)
router.get('/canh-bao', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT TenHang, SoLuongTon as SoLuong, ViTri, DinhMucTon 
            FROM HANG_HOA WHERE SoLuongTon < DinhMucTon LIMIT 5
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
});

// API 3: TOP SẢN PHẨM BÁN CHẠY (Có lọc ngày)
router.get('/top-ban-chay', async (req, res) => {
    try {
        const filterDate = req.query.date || new Date().toISOString().split('T')[0];

        const sql = `
            SELECT 
                h.TenHang, 
                h.MaHang,
                l.TenLoai,
                SUM(c.SoLuong) as DaBan,
                SUM(c.ThanhTien) as DoanhThu
            FROM CHI_TIET_HOA_DON c
            JOIN HOA_DON hd ON c.MaHD = hd.MaHD
            JOIN HANG_HOA h ON c.MaHang = h.MaHang
            JOIN LOAI_HANG l ON h.MaLoai = l.MaLoai
            WHERE hd.LoaiHD = 1 
            AND DATE(hd.NgayLap) = ?  -- Thêm điều kiện lọc ngày
            GROUP BY h.MaHang, h.TenHang, l.TenLoai
            ORDER BY DaBan DESC
            LIMIT 5
        `;
        const [rows] = await db.execute(sql, [filterDate]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Lỗi Top bán chạy:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API 4: HOẠT ĐỘNG GẦN ĐÂY (Có lọc ngày)
router.get('/hoat-dong-gan-day', async (req, res) => {
    try {
        const filterDate = req.query.date || new Date().toISOString().split('T')[0];

        const sql = `
            SELECT 
                hd.MaHD, 
                hd.LoaiHD, 
                hd.NgayLap, 
                h.TenHang,
                c.SoLuong,
                (SELECT TenNCC FROM NHA_CUNG_CAP LIMIT 1) as TenDoiTac
            FROM HOA_DON hd
            JOIN CHI_TIET_HOA_DON c ON hd.MaHD = c.MaHD
            JOIN HANG_HOA h ON c.MaHang = h.MaHang
            WHERE DATE(hd.NgayLap) = ? -- Thêm điều kiện lọc ngày
            ORDER BY hd.NgayLap DESC
            LIMIT 5
        `;
        const [rows] = await db.execute(sql, [filterDate]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Lỗi Hoạt động:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API 5: Công nợ NCC (Giữ nguyên)
router.get('/cong-no-ncc', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT TenNCC, SoTienNo, HanThanhToan 
            FROM NHA_CUNG_CAP 
            WHERE SoTienNo > 0 
            ORDER BY HanThanhToan ASC 
            LIMIT 5
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Lỗi Công nợ:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;