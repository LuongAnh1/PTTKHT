const db = require('./db');

async function inspectUserTable() {
    try {
        const connection = await db.getConnection();
        const tableName = 'TAI_KHOAN';

        console.log(`Inspecting ${tableName}...`);
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log('Columns:', columns.map(c => `${c.Field} (${c.Type})`));

        const [rows] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 1`);
        console.log('Sample row:', rows);

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

inspectUserTable();
