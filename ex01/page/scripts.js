// Cập nhật hiển thị nút Đăng nhập/Đăng xuất
function updateAuthButtons() {
    const userId = localStorage.getItem('userId');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');

    if (userId) {
        if (logoutLink) logoutLink.style.display = 'block';
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
    } else {
        if (logoutLink) logoutLink.style.display = 'none';
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
    }
}

// Xử lý Đăng nhập
function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Kết quả từ API đăng nhập:", data); // Debug dữ liệu API

        if (data.userId) {
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("role", data.role);
            alert(data.message);
            updateAuthButtons(); // Cập nhật ngay sau khi đăng nhập
            setTimeout(() => window.location.href = 'index.html', 500); // Chuyển hướng đến trang index sau 0.5s
        } else {
            alert(data.error);
        }
    })
    .catch(error => console.error("❌ Lỗi đăng nhập:", error));
}

// Xử lý Đăng xuất
function logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    alert("Bạn đã đăng xuất!");
    updateAuthButtons();
    setTimeout(() => window.location.href = 'index.html', 500); // Chuyển hướng đến trang index sau 0.5s
}

// Thêm sản phẩm vào giỏ hàng
function addToCart(productId) {
    if (!productId) {
        console.error("❌ Lỗi: productId không hợp lệ");
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        existingProduct.quantity = (existingProduct.quantity || 0) + 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Sản phẩm đã được thêm vào giỏ hàng!');
}


function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalCount = cart.reduce((sum, item) => {
        const quantity = parseInt(item.quantity) || 0; // Đảm bảo quantity là số hợp lệ
        return sum + quantity;
    }, 0);
    
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.innerText = totalCount;
    } else {
        console.error("❌ Không tìm thấy phần tử #cart-count");
    }
}

// Tải danh sách sản phẩm cho trang index.html
function loadProductsForIndex() {
    fetch('http://localhost:3000/products')
        .then(response => response.json())
        .then(data => {
            const productList = document.getElementById('product-list');
            productList.innerHTML = '';
            data.forEach(product => {
                const productCard = `
                    <div class="col-md-4">
                        <div class="product-card">
                            <img src="${product.image}" class="product-img" alt="${product.name}">
                            <h5>${product.name}</h5>
                            <p>${product.price} VND</p>
                            <button onclick="addToCart(${product.id})" class="btn btn-primary">Thêm vào giỏ hàng</button>
                        </div>
                    </div>
                `;
                productList.innerHTML += productCard;
            });
        })
        .catch(error => {
            console.error('Lỗi khi tải danh sách sản phẩm:', error);
        });
}

// Tải danh sách sản phẩm trong giỏ hàng
function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        document.getElementById('cart-container').innerHTML = '<tr><td colspan="6">Giỏ hàng của bạn trống.</td></tr>';
        document.getElementById('total-price').innerText = '0';
        return;
    }

    fetch('http://localhost:3000/products')
        .then(response => response.json())
        .then(data => {
            const cartContainer = document.getElementById('cart-container');
            cartContainer.innerHTML = '';
            let totalPrice = 0;
            cart.forEach(cartItem => {
                const product = data.find(p => p.id === cartItem.id);
                if (product) {
                    const productPrice = parseFloat(product.price) || 0;
                    const quantity = parseInt(cartItem.quantity) || 1;
                    const productTotal = productPrice * quantity;
                    totalPrice += productTotal;
                    const cartRow = `
                        <tr>
                            <td><img src="${product.image}" class="cart-item-img" alt="${product.name}"></td>
                            <td>${product.name}</td>
                            <td>${productPrice.toFixed(2)} VND</td>
                            <td>
                                <input type="number" value="${cartItem.quantity}" min="1" class="form-control" onchange="updateQuantity(${product.id}, this.value)">
                            </td>
                            <td>${productTotal.toFixed(2)} VND</td>
                            <td><button onclick="removeFromCart(${product.id})" class="btn btn-danger">Xóa</button></td>
                        </tr>
                    `;
                    cartContainer.innerHTML += cartRow;
                }
            });
            document.getElementById('total-price').innerText = totalPrice.toFixed(2); // Đảm bảo hiển thị số hợp lệ
        })
        .catch(error => {
            console.error('Lỗi khi tải danh sách sản phẩm:', error);
        });
}

// Cập nhật số lượng sản phẩm trong giỏ hàng
function updateQuantity(productId, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = cart.find(item => item.id === productId);
    if (product) {
        product.quantity = parseInt(quantity);
        if (isNaN(product.quantity) || product.quantity < 1) {
            product.quantity = 1;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
    }
}

// Xóa sản phẩm khỏi giỏ hàng
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCart();
}

// Xử lý thanh toán
function checkout() {
    alert('Chức năng thanh toán chưa được triển khai.');
}

// Tải danh sách sản phẩm cho trang admin.html
function loadProducts() {
    fetch('http://localhost:3000/products')
        .then(response => response.json())
        .then(data => {
            const productTableBody = document.getElementById('product-table-body');
            productTableBody.innerHTML = '';
            data.forEach(product => {
                const productRow = `
                    <tr>
                        <td>${product.id}</td>
                        <td>${product.name}</td>
                        <td>${product.price} VND</td>
                        <td><img src="${product.image}" class="product-img" alt="${product.name}" style="max-height: 100px;"></td>
                        <td>
                            <button onclick="editProduct(${product.id}, '${product.name}', ${product.price}, '${product.image}')" class="btn btn-warning">Sửa</button>
                            <button onclick="deleteProduct(${product.id})" class="btn btn-danger">Xóa</button>
                        </td>
                    </tr>
                `;
                productTableBody.innerHTML += productRow;
            });
        })
        .catch(error => {
            console.error('Lỗi khi tải danh sách sản phẩm:', error);
        });
}

// Sửa sản phẩm
function editProduct(id, name, price, image) {
    const newName = prompt('Tên sản phẩm mới:', name);
    const newPrice = prompt('Giá sản phẩm mới:', price);
    const newImage = prompt('URL hình ảnh mới:', image);

    if (newName && newPrice && newImage) {
        fetch('http://localhost:3000/products/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, name: newName, price: newPrice, image: newImage })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                loadProducts();
            } else if (data.error) {
                alert(data.error);
            }
        })
        .catch(error => {
            console.error('Lỗi khi cập nhật sản phẩm:', error);
        });
    }
}

// Xóa sản phẩm
function deleteProduct(id) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        fetch(`http://localhost:3000/products/delete/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                loadProducts();
            } else if (data.error) {
                alert(data.error);
            }
        })
        .catch(error => {
            console.error('Lỗi khi xóa sản phẩm:', error);
        });
    }
}

// Cập nhật hiển thị nút khi tải trang
document.addEventListener('DOMContentLoaded', function() {
    updateAuthButtons();
    updateCartCount();
    if (document.getElementById('product-table-body')) {
        loadProducts();
    } else if (document.getElementById('product-list')) {
        loadProductsForIndex();
    }
    if (document.getElementById('cart-container')) {
        loadCart();
    }
});