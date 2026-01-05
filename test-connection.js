const db = require('./db');

async function testConnection() {
    try {
        const connection = await db.getConnection();
        console.log('Successfully connected to TiDB!');

        const [rows] = await connection.execute('SELECT VERSION() as version');
        console.log('Database Version:', rows[0].version);

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
