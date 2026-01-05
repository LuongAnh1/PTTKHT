const db = require('./db');

async function exploreDB() {
    try {
        const connection = await db.getConnection();

        // List tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Tables:', tables.map(t => Object.values(t)[0]));

        // Try to find a user/account table and describe it
        const keywords = ['user', 'account', 'nhanvi', 'dangnhap', 'admin'];
        const userTable = tables.map(t => Object.values(t)[0]).find(name =>
            keywords.some(k => name.toLowerCase().includes(k))
        );

        if (userTable) {
            console.log(`\nFound potential user table: ${userTable}`);
            const [columns] = await connection.execute(`DESCRIBE ${userTable}`);
            console.log('Columns:', columns.map(c => `${c.Field} (${c.Type})`));

            // Peek at data (be careful with passwords)
            const [rows] = await connection.execute(`SELECT * FROM ${userTable} LIMIT 1`);
            console.log('Sample row:', rows);
        } else {
            console.log('\nNo obvious user table found. Please check manually.');
        }

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

exploreDB();
