const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Lấy danh sách sản phẩm (Có bộ lọc)
router.get('/', async (req, res) => {
    try {
        const { q, status, cate, stock } = req.query; // Nhận các tham số từ URL

        let sql = `
            SELECT h.*, l.TenLoai 
            FROM HANG_HOA h
            LEFT JOIN LOAI_HANG l ON h.MaLoai = l.MaLoai
            WHERE 1=1
        `;
        let params = [];

        // 1. Tìm kiếm theo tên hoặc mã
        if (q) {
            sql += ` AND (h.TenHang LIKE ? OR h.MaHang LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`);
        }

        // 2. Lọc theo Trạng thái kinh doanh (active/inactive)
        if (status) {
            if (status === 'active') {
                sql += ` AND h.TrangThai = 1`;
            } else if (status === 'inactive') {
                sql += ` AND h.TrangThai = 0`;
            }
        }

        // 3. Lọc theo Nhóm hàng (Category ID)
        if (cate) {
            sql += ` AND h.MaLoai = ?`;
            params.push(cate);
        }

        // 4. Lọc theo Tồn kho
        if (stock) {
            if (stock === 'available') {
                sql += ` AND h.SoLuongTon > 10`; // Còn hàng nhiều
            } else if (stock === 'low') {
                sql += ` AND h.SoLuongTon > 0 AND h.SoLuongTon <= 10`; // Sắp hết
            } else if (stock === 'out') {
                sql += ` AND h.SoLuongTon = 0`; // Hết hàng
            }
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
    const { 
        maHang, tenHang, maLoai, maNCC, moTa, 
        size, mauSac, donViTinh, 
        soLuongTon, donGiaNhap, donGiaBan, anhMinhHoa 
    } = req.body;

    try {
        // Kiểm tra trùng SKU
        const [check] = await db.execute('SELECT MaHang FROM HANG_HOA WHERE MaHang = ?', [maHang]);
        if (check.length > 0) return res.status(400).json({ success: false, message: 'Mã SKU đã tồn tại!' });

        // --- KHU VỰC SỬA LỖI (DATA SANITIZATION) ---
        // Chuyển tất cả undefined thành null hoặc giá trị mặc định
        
        // 1. Xử lý số (Nếu rỗng hoặc undefined -> về 0 hoặc null)
        const valMaLoai   = maLoai ? parseInt(maLoai) : null; 
        const valMaNCC    = maNCC ? parseInt(maNCC) : null;
        const valSoLuong  = soLuongTon ? parseInt(soLuongTon) : 0;
        const valGiaNhap  = donGiaNhap ? parseFloat(donGiaNhap) : 0;
        const valGiaBan   = donGiaBan ? parseFloat(donGiaBan) : 0;

        // 2. Xử lý chuỗi (Nếu undefined -> về null)
        const valMoTa     = moTa || null;
        const valSize     = size || null;      // <-- Sửa lỗi tại đây
        const valMau      = mauSac || null;    // <-- Sửa lỗi tại đây
        const valAnh      = anhMinhHoa || null;
        const valDVT      = donViTinh || 'Cái'; // Mặc định là 'Cái' nếu thiếu
        // ------------------------------------------

        const sql = `
            INSERT INTO HANG_HOA 
            (MaHang, TenHang, MaLoai, MaNCC, MoTa, Size, MauSac, DonViTinh, SoLuongTon, DonGiaNhap, DonGiaBan, AnhMinhHoa, TrangThai)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `;
        
        // Đảm bảo thứ tự biến khớp 100% với dấu hỏi chấm (?)
        await db.execute(sql, [
            maHang, 
            tenHang, 
            valMaLoai, 
            valMaNCC, 
            valMoTa, 
            valSize, 
            valMau, 
            valDVT, 
            valSoLuong, 
            valGiaNhap, 
            valGiaBan, 
            valAnh
        ]);
        
        res.json({ success: true, message: 'Thêm sản phẩm thành công!' });
    } catch (error) {
        console.error('Lỗi thêm:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

// 3. Cập nhật thông tin sản phẩm (Nút Sửa)
router.put('/:id', async (req, res) => {
    const id = req.params.id;
    const { tenHang, maLoai, size, mauSac, donViTinh, soLuongTon, donGiaNhap, donGiaBan, anhMinhHoa } = req.body;

    try {
        // --- XỬ LÝ DỮ LIỆU ĐẦU VÀO (SỬA LỖI TRUNCATED) ---
        // Nếu maLoai là chuỗi rỗng "", ép về null. Nếu là số thì ép về Int.
        const valMaLoai = maLoai ? parseInt(maLoai) : null; 
        
        // Các trường số khác ép về 0 nếu rỗng
        const valSoLuong = soLuongTon ? parseInt(soLuongTon) : 0;
        const valGiaNhap = donGiaNhap ? parseFloat(donGiaNhap) : 0;
        const valGiaBan = donGiaBan ? parseFloat(donGiaBan) : 0;
        
        // Các trường chuỗi ép về null nếu rỗng
        const valAnh = anhMinhHoa || null;
        const valSize = size || null;
        const valMau = mauSac || null;
        const valDVT = donViTinh || 'Cái';
        // ------------------------------------------------

        const sql = `
            UPDATE HANG_HOA 
            SET TenHang=?, MaLoai=?, Size=?, MauSac=?, DonViTinh=?, SoLuongTon=?, DonGiaNhap=?, DonGiaBan=?, AnhMinhHoa=?
            WHERE MaHang=?
        `;
        
        // Thứ tự params phải chuẩn 100%
        await db.execute(sql, [
            tenHang, 
            valMaLoai, 
            valSize, 
            valMau, 
            valDVT, 
            valSoLuong, 
            valGiaNhap, 
            valGiaBan, 
            valAnh, 
            id
        ]);
        
        res.json({ success: true, message: 'Cập nhật thành công!' });
    } catch (error) {
        console.error('Lỗi sửa:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

// 4. Cập nhật trạng thái
router.put('/:id/status', async (req, res) => {
    const id = req.params.id;
    const { trangThai } = req.body; 

    try {
        await db.execute('UPDATE HANG_HOA SET TrangThai = ? WHERE MaHang = ?', [trangThai, id]);
        res.json({ success: true, message: 'Đã đổi trạng thái' });
    } catch (error) {
        console.error('Lỗi đổi trạng thái:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 5. Xóa sản phẩm
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await db.execute('DELETE FROM HANG_HOA WHERE MaHang = ?', [id]);
        res.json({ success: true, message: 'Đã xóa sản phẩm thành công!' });
    } catch (error) {
        // Mã lỗi 1451: Cannot delete or update a parent row: a foreign key constraint fails
        if (error.errno === 1451) {
            return res.status(400).json({ 
                success: false, 
                message: 'Không thể xóa! Sản phẩm này đã phát sinh giao dịch (Hóa đơn, Nhập kho...). Bạn chỉ có thể chuyển trạng thái sang "Ngừng kinh doanh".' 
            });
        }
        console.error('Lỗi xóa:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

module.exports = router;