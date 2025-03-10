const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const cors = require('cors');
const bcrypt = require('bcrypt');

const dbConfig = {
    user: 'sa',
    password: 'ok',
    server: 'DESKTOP-8ECKFC8',
    database: 'databasee',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());

// API đăng ký người dùng
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin." });
    }

    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (result.recordset.length > 0) {
            return res.status(400).json({ error: 'Email đã được đăng ký.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedPassword)
            .input('role', sql.NVarChar, 'user')
            .query("INSERT INTO Users (username, email, password, role) VALUES (@username, @email, @password, @role)");

        res.json({ message: 'Đăng ký thành công!' });
    } catch (err) {
        console.error("Lỗi đăng ký:", err);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi đăng ký.' });
    }
});

// API đăng nhập người dùng
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Vui lòng nhập email và mật khẩu." });
    }

    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng.' });
        }

        const user = result.recordset[0];
        console.log("User data:", user); // Debug thông tin người dùng

        if (!user.password) {
            return res.status(400).json({ error: 'Mật khẩu không tồn tại.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng.' });
        }

        res.json({ message: 'Đăng nhập thành công!', userId: user.id, role: user.role || 'user' });
        console.log("📌 [DEBUG] Kết quả đăng nhập:", { userId: user.id, role: user.role });

    } catch (err) {
        console.error("Lỗi đăng nhập:", err);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi đăng nhập.' });
    }
});

// API thêm sản phẩm
app.post('/products/add', async (req, res) => {
    const { name, price, image } = req.body;

    if (!name || !price || !image) {
        return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin sản phẩm." });
    }

    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('price', sql.Float, price)
            .input('image', sql.NVarChar, image)
            .query("INSERT INTO Products (Name, Price, Image) VALUES (@name, @price, @image)");

        res.json({ message: 'Thêm sản phẩm thành công!' });
    } catch (err) {
        console.error("Lỗi thêm sản phẩm:", err);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi thêm sản phẩm.' });
    }
});

// API cập nhật sản phẩm
app.put('/products/update', async (req, res) => {
    const { id, name, price, image } = req.body;

    if (!id || !name || !price || !image) {
        return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin sản phẩm." });
    }

    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('price', sql.Float, price)
            .input('image', sql.NVarChar, image)
            .query("UPDATE Products SET Name = @name, Price = @price, Image = @image WHERE id = @id");

        res.json({ message: 'Cập nhật sản phẩm thành công!' });
    } catch (err) {
        console.error("Lỗi cập nhật sản phẩm:", err);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi cập nhật sản phẩm.' });
    }
});

app.get('/products', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .query("SELECT id, Name AS name, ISNULL(CAST(Price AS FLOAT), 0) AS price, Image AS image FROM Products");

        console.log("📌 [DEBUG] Danh sách sản phẩm từ database:", result.recordset);
        res.json(result.recordset);
    } catch (err) {
        console.error("❌ [DEBUG] Lỗi lấy danh sách sản phẩm:", err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});




// API tìm kiếm sản phẩm
app.get('/products/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: "Vui lòng nhập từ khóa tìm kiếm." });
    }

    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('query', sql.NVarChar, `%${query}%`)
            .query(`
                SELECT id, Name AS name, Price AS price, Image AS image
                FROM Products
                WHERE Name LIKE @query
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error("Lỗi khi tìm kiếm sản phẩm:", err);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi tìm kiếm sản phẩm.' });
    }
});

// API thêm sản phẩm vào giỏ hàng
app.post('/cart/add', async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('productId', sql.Int, productId)
            .input('quantity', sql.Int, quantity)
            .query(`
                MERGE INTO Cart AS target
                USING (SELECT @userId AS UserId, @productId AS ProductId) AS source
                ON target.UserId = source.UserId AND target.ProductId = source.ProductId
                WHEN MATCHED THEN
                    UPDATE SET target.Quantity = target.Quantity + source.Quantity
                WHEN NOT MATCHED THEN
                    INSERT (UserId, ProductId, Quantity) VALUES (source.UserId, source.ProductId, source.Quantity);
            `);
        res.json({ message: 'Thêm vào giỏ hàng thành công!' });
    } catch (err) {
        console.error("Lỗi thêm vào giỏ hàng:", err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});
// 📌 API cập nhật số lượng sản phẩm trong giỏ hàng
app.put('/cart/update', async (req, res) => {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity < 1) {
        return res.status(400).json({ error: "Thông tin không hợp lệ." });
    }

    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('productId', sql.Int, productId)
            .input('quantity', sql.Int, quantity)
            .query("UPDATE Cart SET Quantity = @quantity WHERE UserId = @userId AND ProductId = @productId");

        res.json({ message: 'Cập nhật số lượng sản phẩm thành công!' });
    } catch (err) {
        console.error("Lỗi cập nhật giỏ hàng:", err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});
// 📌 API lấy giỏ hàng
app.get("/cart/:userId", async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool
            .request()
            .input("userId", sql.Int, req.params.userId)
            .query("SELECT * FROM Cart WHERE userId = @userId");

        res.json(result.recordset.length ? result.recordset : []);
    } catch (err) {
        res.status(500).send("Lỗi server: " + err.message);
    }
});

// API xóa sản phẩm khỏi giỏ hàng
app.delete("/cart/:userId/:productId", async (req, res) => {
    try {
        let pool = await sql.connect(config);
        await pool
            .request()
            .input("userId", sql.Int, req.params.userId)
            .input("productId", sql.Int, req.params.productId)
            .query("DELETE FROM Cart WHERE userId = @userId AND productId = @productId");

        res.send("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (err) {
        res.status(500).send("Lỗi server: " + err.message);
    }
});
app.post('/cart/remove', async (req, res) => {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
        return res.status(400).json({ error: "Thiếu userId hoặc productId." });
    }

    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('productId', sql.Int, productId)
            .query(`
                DELETE FROM Cart WHERE UserId = @userId AND ProductId = @productId
            `);

        console.log(`📌 [DEBUG] Xóa sản phẩm ${productId} khỏi giỏ hàng user ${userId}`);
        res.json({ message: "Sản phẩm đã được xóa khỏi giỏ hàng" });
    } catch (err) {
        console.error("❌ Lỗi khi xóa sản phẩm:", err);
        res.status(500).json({ error: "Lỗi server!" });
    }
});


// Kết nối SQL Server
sql.connect(dbConfig)
    .then(() => console.log("Kết nối SQL Server thành công!"))
    .catch(err => console.error("Lỗi kết nối:", err));

app.listen(port, () => console.log(`Server đang chạy tại http://localhost:${port}`));