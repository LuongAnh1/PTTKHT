const express = require('express');
const router = express.Router();
const db = require('../db'); // Kết nối đến file db.js của bạn

// 1. Lấy danh sách danh mục (Hỗ trợ tìm kiếm)
router.get('/', async (req, res) => {
    try {
        const keyword = req.query.q;
        let sql = 'SELECT * FROM LOAI_HANG';
        let params = [];

        if (keyword) {
            sql += ' WHERE TenLoai LIKE ?';
            params.push(`%${keyword}%`);
        }
        
        // Sắp xếp giảm dần để thấy cái mới tạo
        sql += ' ORDER BY MaLoai DESC';

        const [rows] = await db.execute(sql, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Lỗi lấy danh mục:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 2. Thêm danh mục mới
router.post('/', async (req, res) => {
    const { tenLoai, moTa, nhomCha, tags } = req.body;
    
    if (!tenLoai) {
        return res.status(400).json({ success: false, message: 'Tên nhóm không được để trống' });
    }

    try {
        const sql = 'INSERT INTO LOAI_HANG (TenLoai, MoTa, NhomCha, Tags) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(sql, [tenLoai, moTa, nhomCha, tags]);
        
        res.json({ 
            success: true, 
            message: 'Thêm thành công!', 
            newItem: { MaLoai: result.insertId, tenLoai, moTa, nhomCha, tags }
        });
    } catch (error) {
        console.error('Lỗi thêm danh mục:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 3. Xóa danh mục
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        // Kiểm tra xem có hàng hóa nào thuộc loại này không trước khi xóa (Ràng buộc khóa ngoại)
        // Tuy nhiên, do CSDL bạn set ON UPDATE CASCADE (chưa set ON DELETE), ta cứ xóa thử.
        // Tốt nhất nên dùng try-catch để bắt lỗi ràng buộc khóa ngoại.
        
        const sql = 'DELETE FROM LOAI_HANG WHERE MaLoai = ?';
        const [result] = await db.execute(sql, [id]);

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Đã xóa thành công' });
        } else {
            res.status(404).json({ success: false, message: 'Không tìm thấy ID để xóa' });
        }
    } catch (error) {
        // Mã lỗi 1451 là lỗi ràng buộc khóa ngoại trong MySQL
        if (error.errno === 1451) {
            res.status(400).json({ success: false, message: 'Không thể xóa danh mục này vì đang có Hàng Hóa thuộc về nó.' });
        } else {
            console.error('Lỗi xóa danh mục:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
});

// 4. Cập nhật danh mục (Sửa)
router.put('/:id', async (req, res) => {
    const id = req.params.id;
    const { tenLoai, moTa, nhomCha, tags } = req.body;

    try {
        const sql = 'UPDATE LOAI_HANG SET TenLoai = ?, MoTa = ?, NhomCha = ?, Tags = ? WHERE MaLoai = ?';
        await db.execute(sql, [tenLoai, moTa, nhomCha, tags, id]);
        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
        console.error('Lỗi sửa danh mục:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;