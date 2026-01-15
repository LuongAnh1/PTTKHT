require('dotenv').config();
const mysql = require('mysql2');

// In ra để kiểm tra xem code có đọc được file .env không
console.log("--- DEBUG KẾT NỐI ---");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("---------------------");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000, // TiDB dùng port 4000
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false // TiDB cần cái này nếu bạn không cung cấp file chứng chỉ CA
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true, // Giữ kết nối ổn định hơn với Cloud
    keepAliveInitialDelay: 0
});

module.exports = pool.promise();