// File: update_kho.js
const db = require('./db');

async function updateKhoSchema() {
    try {
        // Lấy kết nối từ pool
        const connection = await db.getConnection(); 

        console.log('--- BẮT ĐẦU CẬP NHẬT DATABASE (THÊM KHO) ---');

        // 1. Thêm cột TenKho vào bảng NHẬP KHO
        try {
            console.log('1. Đang thêm cột TenKho vào PHIEU_NHAP_KHO...');
            await connection.execute("ALTER TABLE PHIEU_NHAP_KHO ADD COLUMN TenKho NVARCHAR(100) DEFAULT 'Kho Tổng HCM'");
            console.log('✅ Đã thêm cột thành công.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('⚠️ Cột TenKho đã có sẵn (Bỏ qua).');
            else throw e;
        }

        // 2. Thêm cột TenKho vào bảng XUẤT KHO
        try {
            console.log('2. Đang thêm cột TenKho vào PHIEU_XUAT_KHO...');
            await connection.execute("ALTER TABLE PHIEU_XUAT_KHO ADD COLUMN TenKho NVARCHAR(100) DEFAULT 'Kho Tổng HCM'");
            console.log('✅ Đã thêm cột thành công.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('⚠️ Cột TenKho đã có sẵn (Bỏ qua).');
            else throw e;
        }

        // 3. Cập nhật dữ liệu mẫu (Để test tính năng lọc)
        console.log('3. Đang cập nhật dữ liệu mẫu...');
        // Sửa phiếu nhập PN001 thành Kho Hà Nội (nếu tồn tại)
        await connection.execute("UPDATE PHIEU_NHAP_KHO SET TenKho = 'Kho Hà Nội' WHERE MaPNK = 'PN001'");
        // Sửa phiếu xuất PX001 thành Kho Đà Nẵng (nếu tồn tại)
        await connection.execute("UPDATE PHIEU_XUAT_KHO SET TenKho = 'Kho Đà Nẵng' WHERE MaPXK = 'PX001'");
        console.log('✅ Đã cập nhật dữ liệu mẫu.');

        // Giải phóng kết nối và thoát
        connection.release();
        console.log('🎉 HOÀN TẤT! Bây giờ bạn có thể dùng tính năng lọc kho.');
        process.exit(0);

    } catch (error) {
        console.error('❌ LỖI:', error);
        process.exit(1);
    }
}

updateKhoSchema();