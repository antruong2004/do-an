// database.js
const sql = require('mssql');

// Cấu hình kết nối với SQL Server sử dụng SQL Server Authentication
const dbConfig = {
    user: "user123",
    password: "user123",
    server: "DESKTOP-8ECKFC8",
    database: "databasee",
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

// Kết nối đến SQL Server
async function connectToDatabase() {
    try {
        const pool = await sql.connect(config);
        console.log('Kết nối đến SQL Server thành công');
        return pool;
    } catch (err) {
        console.error('Lỗi kết nối đến SQL Server:', err);
        throw err;
    }
}

// Thêm một sản phẩm vào database
async function addProduct(name, price, image) {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('price', sql.Int, price)
            .input('image', sql.NVarChar, image)
            .query('INSERT INTO products (name, price, image) VALUES (@name, @price, @image)');
        console.log('Sản phẩm đã được thêm vào cơ sở dữ liệu');
    } catch (err) {
        console.error('Lỗi khi thêm sản phẩm vào cơ sở dữ liệu:', err);
        throw err;
    }
}

module.exports = { addProduct };