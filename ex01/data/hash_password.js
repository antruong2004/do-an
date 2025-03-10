const bcrypt = require('bcrypt');

const newPassword = "an2105"; // Mật khẩu mới
bcrypt.hash(newPassword, 10, (err, hash) => {
    if (err) {
        console.error("Lỗi mã hóa:", err);
    } else {
        console.log("Mật khẩu đã mã hóa:", hash);
    }
});
