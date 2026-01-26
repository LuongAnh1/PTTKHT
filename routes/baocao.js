const express = require('express'); 
const db = require('../db'); 
const router = express.Router();    

router.get('/ton-kho', async (req, res) => {
    try {
        const sql = `
            SELECT 
                hh.MaHang AS sku,
                hh.TenHang AS name,
                hh.MauSac AS color,
                hh.Size AS size,
                DATE_FORMAT(pnk.NgayNhap, '%Y-%m-%d') AS date,
                'Nhập kho' AS type,
                ctn.SoLuong AS qty,
                'Kho Tổng' AS warehouse,
                pnk.GhiChu AS note,
                hh.SoLuongTon AS stock,
                CASE WHEN hh.SoLuongTon < 10 THEN 'Sắp hết' ELSE 'An toàn' END AS status
            FROM CHI_TIET_PHIEU_NHAP_KHO ctn
            JOIN PHIEU_NHAP_KHO pnk ON ctn.MaPNK = pnk.MaPNK
            JOIN HANG_HOA hh ON ctn.MaHang = hh.MaHang

            UNION ALL

            SELECT 
                hh.MaHang AS sku,
                hh.TenHang AS name,
                hh.MauSac AS color,
                hh.Size AS size,
                DATE_FORMAT(pxk.NgayXuat, '%Y-%m-%d') AS date,
                'Xuất kho' AS type,
                
                CAST(ctx.SoLuong AS SIGNED) * -1 AS qty,
                'Kho Tổng' AS warehouse,
                pxk.GhiChu AS note,
                hh.SoLuongTon AS stock,
                CASE WHEN hh.SoLuongTon < 10 THEN 'Sắp hết' ELSE 'An toàn' END AS status
            FROM CHI_TIET_PHIEU_XUAT_KHO ctx
            JOIN PHIEU_XUAT_KHO pxk ON ctx.MaPXK = pxk.MaPXK
            JOIN HANG_HOA hh ON ctx.MaHang = hh.MaHang
            
            ORDER BY date DESC;
        `;

        const [rows] = await db.execute(sql);
        res.json(rows);

    } catch (error) {
        console.error('Lỗi lấy báo cáo tồn kho:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy tồn kho' });
    }
});

module.exports = router;