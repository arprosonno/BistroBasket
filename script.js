// script.js

const API_BASE = "https://bistrobasket.onrender.com";

// ================== GLOBALS ==================
let menuData = [];
let cart = [];
let currentUser = null;
let total = 0;

// ===== Fetch Menu =====
async function loadMenu() {
  try {
    const res = await fetch(`${API_BASE}/api/menu`);
    menuData = await res.json();
    renderMenu();
  } catch (err) {
    document.getElementById("menuMessage").innerText =
      "Failed to load menu.";
    console.error(err);
  }
}

function renderMenu() {
  const grid = document.getElementById("menuGrid");
  grid.innerHTML = "";
  menuData.forEach((item) => {
    const card = document.createElement("div");
    card.className = "menu-card";
    card.innerHTML = `
      <h3>${item.MenuName}</h3>
      <p>Price: $${item.Price.toFixed(2)}</p>
      <div class="menu-actions">
        <button class="small-btn btn-details" onclick='showFoodModal(${item.Item})'>Details</button>
        <button class="small-btn btn-add" onclick='addToCart(${item.Item})'>Add to Cart</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ===== Food Modal =====
function showFoodModal(itemId) {
  const item = menuData.find((i) => i.Item === itemId);
  const modal = document.getElementById("foodModal");
  const body = document.getElementById("foodModalBody");

  let content = `<h3>${item.MenuName}</h3>`;

  if (item.FoodNames.length > 0) {
    item.FoodNames.forEach((name, idx) => {
      content += `
        <h4>${name}</h4>
        <p>${item.Descriptions[idx]}</p>
        <p><b>Ingredients:</b> ${item.Ingredients[idx]}</p>
        <hr>
      `;
    });
  } else {
    content += `<p>No description available</p>`;
  }

  body.innerHTML = content;
  modal.setAttribute("aria-hidden", "false");
}

function closeFoodModal() {
  document.getElementById("foodModal").setAttribute("aria-hidden", "true");
}

// ===== Cart =====
function addToCart(itemId) {
  const item = menuData.find((i) => i.Item === itemId);
  cart.push(item);
  renderCart();
}

function renderCart() {
  total = 0;
  const box = document.getElementById("cartBox");
  box.innerHTML = "";

  cart.forEach((item, idx) => {
    total += item.Price;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span>${item.MenuName} - $${item.Price.toFixed(2)}</span>
      <button onclick="removeCartItem(${idx})">Remove</button>
    `;
    box.appendChild(div);
  });

  document.getElementById(
    "cartTotal"
  ).innerText = `Total: $${total.toFixed(2)}`;
}

function removeCartItem(idx) {
  cart.splice(idx, 1);
  renderCart();
}

// ===== Login/Signup =====
function showAuthTab(tab) {
  document
    .getElementById("tabLogin")
    .classList.toggle("active", tab === "login");
  document
    .getElementById("tabSignup")
    .classList.toggle("active", tab === "signup");
  document.getElementById("loginForm").style.display =
    tab === "login" ? "block" : "none";
  document.getElementById("signupForm").style.display =
    tab === "signup" ? "block" : "none";
}

function openAuthModal() {
  document.getElementById("authModal").setAttribute("aria-hidden", "false");
}
function closeAuthModal() {
  document.getElementById("authModal").setAttribute("aria-hidden", "true");
}

document.getElementById("authBtn").onclick = openAuthModal;
document.getElementById("logoutBtn").onclick = () => {
  currentUser = null;
  document.getElementById("welcomeTxt").hidden = true;
  document.getElementById("authBtn").style.display = "inline-block";
  document.getElementById("logoutBtn").style.display = "none";
};

// ===== Login =====
document.getElementById("formLogin").onsubmit = async (e) => {
  e.preventDefault();
  const phone = e.target.phone.value;
  const password = e.target.password.value;

  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });

  const data = await res.json();
  document.getElementById("loginMsg").innerText = data.msg || "";

  if (data.success) {
    currentUser = data.user;
    document.getElementById("welcomeTxt").hidden = false;
    document.getElementById("usernameShow").innerText =
      currentUser.Cus_Name;
    document.getElementById("authBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";
    closeAuthModal();
  }
};

// ===== Signup =====
document.getElementById("formSignup").onsubmit = async (e) => {
  e.preventDefault();
  const { name, phone, email, password } = e.target;

  const res = await fetch(`${API_BASE}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      phone: phone.value,
      email: email.value,
      password: password.value,
    }),
  });

  const data = await res.json();
  document.getElementById("signupMsg").innerText = data.msg || "";
  console.log(data);

  if (data.success) {
    currentUser = data.user;
    document.getElementById("welcomeTxt").hidden = false;
    document.getElementById("usernameShow").innerText =
      currentUser.Cus_Name;
    document.getElementById("authBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";
    closeAuthModal();
  }
};

// ===== Checkout =====
document.getElementById("checkoutBtn").onclick = async () => {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }
  if (!currentUser) {
    alert("Login first to checkout");
    return;
  }

  const res = await fetch(`${API_BASE}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Amount: parseFloat(total.toFixed(2)),
      Cus_Details_Cus_Id: parseInt(currentUser.Cus_Id),
      Date: new Date().toISOString().slice(0, 19).replace("T", " "),
    }),
  });

  const data = await res.json();

  if (data.success) {
    alert(
      `Thank you ${currentUser.Cus_Name}! Your order of $${total.toFixed(
        2
      )} has been placed.`
    );
    cart = [];
    renderCart();
  }
};

// Auto-load menu
loadMenu();
