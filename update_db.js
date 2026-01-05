const db = require('./db');

async function updateSchema() {
    try {
        const connection = await db.getConnection();

        console.log('Adding Email column to TAI_KHOAN...');
        try {
            await connection.execute('ALTER TABLE TAI_KHOAN ADD COLUMN Email VARCHAR(100)');
            console.log('Column added successfully.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('Column already exists.');
            } else {
                throw e;
            }
        }

        console.log('Updating admin email...');
        await connection.execute('UPDATE TAI_KHOAN SET Email = ? WHERE TenDangNhap = ?', ['admin@example.com', 'admin']);
        console.log('Admin email updated to admin@example.com');

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateSchema();
