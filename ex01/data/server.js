// Mở Modal
function openModal(id) {
    document.getElementById(id).style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
}

// Đóng Modal
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    document.getElementById('modal-overlay').style.display = 'none';
}

// Xử lý Đăng nhập
document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            document.getElementById('login-message').innerText = data.message;
        } else if (data.error) {
            document.getElementById('login-message').innerText = data.error;
        }
    })
    .catch(error => {
        document.getElementById('login-message').innerText = 'Có lỗi xảy ra';
    });
});

// Xử lý Đăng ký
document.getElementById('register-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.querySelector('input[name="role"]:checked').value;

    fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password, role })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            document.getElementById('register-message').innerText = data.message;
        } else if (data.error) {
            document.getElementById('register-message').innerText = data.error;
        }
    })
    .catch(error => {
        document.getElementById('register-message').innerText = 'Có lỗi xảy ra';
    });
});
