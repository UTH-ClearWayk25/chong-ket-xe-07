// ==== DỮ LIỆU BÃI XE ====
const parkingLots = [
  { id: 'lot1', name: 'Sân trường (Khu A)', x: 180, y: 350, width: 380, height: 250, capacity: 800, bookings: 0 },
  { id: 'lot2', name: 'Nhà xe 1 (Cổng 1)', x: 190, y: 730, width: 140, height: 60, capacity: 200, bookings: 0 },
  { id: 'lot3', name: 'Nhà xe 2 (Cổng 2)', x: 420, y: 730, width: 140, height: 60, capacity: 150, bookings: 0 },
  { id: 'lot4', name: 'Khu vực C', x: 530, y: 350, width: 90, height: 200, capacity: 150, bookings: 0 }
];

const bookings = [];
let selectedLotId = null;
let blinkState = true;
const tooltip = document.getElementById('tooltip');

// ==== CẬP NHẬT TRẠNG THÁI CHUNG ====
function updateMainStatus(count) {
  const dot = document.querySelector('.status-indicator .dot');
  const text = document.getElementById('status-text');
  if (!dot || !text) return;

  dot.className = 'dot'; 
  if (count <= 300) {
    dot.classList.add('green');
    text.textContent = "Thông thoáng - Có thể gửi xe";
  } else if (count <= 700) {
    dot.classList.add('yellow');
    text.textContent = "Đang đông dần - Tranh thủ";
  } else {
    dot.classList.add('red');
    text.textContent = "Bãi xe sắp đầy - Nên gửi ngoài";
  }
}

// ==== CHUYỂN HƯỚNG SIDEBAR ====
function navigate(page, element) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if(element) element.classList.add('active');

  const mapView = document.getElementById('map-view');
  const altView = document.getElementById('alt-view');
  const pageTitle = document.getElementById('page-title');

  if (page === 'home') {
    mapView.classList.remove('hidden');
    altView.classList.add('hidden');
    pageTitle.textContent = "Dashboard";
  } else if (page === 'alt') {
    mapView.classList.add('hidden');
    altView.classList.remove('hidden');
    pageTitle.textContent = "Chi tiết bãi xe ngoài trường";
  } else if (page === 'traffic') {
    alert("🚦 GIỜ CAO ĐIỂM DỄ KẸT XE:\n- Sáng: 09:30\n- Trưa: 12:10\n- Chiều: 14:40");
  }
}

// Hàm hỗ trợ nút "Quay lại trang chính"
function backToHome() {
  const homeBtn = document.querySelectorAll('.nav-item')[0];
  navigate('home', homeBtn);
}

// ==== HỆ THỐNG ĐĂNG NHẬP ====
function login() {
  const id = document.getElementById("studentId").value;
  const pw = document.getElementById("password").value;
  if (!id || !pw) return alert("Vui lòng nhập đầy đủ thông tin.");
  localStorage.setItem("loggedIn", "true");
  document.getElementById("auth-section").classList.add("hidden");
  document.getElementById("dashboard-section").classList.remove("hidden");
  drawMap(); 
}

function logout() {
  localStorage.removeItem("loggedIn");
  document.getElementById("dashboard-section").classList.add("hidden");
  document.getElementById("auth-section").classList.remove("hidden");
  showLogin();
}

function showForgotPassword() {
  document.getElementById("login-box").classList.add("hidden");
  document.getElementById("forgot-password-box").classList.remove("hidden");
  document.getElementById("forgot-step-1").classList.remove("hidden");
  document.getElementById("forgot-step-2").classList.add("hidden");
  document.getElementById("forgot-step-3").classList.add("hidden");
}

function showLogin() {
  document.getElementById("forgot-password-box").classList.add("hidden");
  document.getElementById("login-box").classList.remove("hidden");
}

function sendOTP() {
  const phone = document.getElementById("phoneNumber").value;
  if (!phone || phone.length < 9) return alert("Vui lòng nhập SĐT hợp lệ!");
  alert("Mã OTP của bạn là: 123456");
  document.getElementById("forgot-step-1").classList.add("hidden");
  document.getElementById("forgot-step-2").classList.remove("hidden");
}

function verifyOTP() {
  const otp = document.getElementById("otpCode").value;
  if (otp !== "123456") return alert("Mã OTP sai!");
  document.getElementById("forgot-step-2").classList.add("hidden");
  document.getElementById("forgot-step-3").classList.remove("hidden");
}

function resetPassword() {
  const newPwd = document.getElementById("newPassword").value;
  const confirmPwd = document.getElementById("confirmPassword").value;
  if (!newPwd || newPwd.length < 6) return alert("Mật khẩu > 6 ký tự!");
  if (newPwd !== confirmPwd) return alert("Mật khẩu không khớp!");
  alert("Đổi mật khẩu thành công!");
  showLogin();
}

// ==== VẼ BẢN ĐỒ CANVAS ====
function drawMap() {
  const canvas = document.getElementById('map');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  parkingLots.forEach(lot => {
    const r = lot.bookings / lot.capacity;
    
    if (r >= 1) ctx.fillStyle = 'rgba(239, 68, 68, 0.7)'; 
    else if (r > 0.8) ctx.fillStyle = 'rgba(245, 158, 11, 0.7)'; 
    else ctx.fillStyle = 'rgba(34, 197, 94, 0.7)'; 

    ctx.fillRect(lot.x, lot.y, lot.width, lot.height);
    
    if (lot.id === selectedLotId) {
      ctx.strokeStyle = blinkState ? '#1d4ed8' : '#ffffff';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(lot.x, lot.y, lot.width, lot.height);
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(lot.x, lot.y, lot.width, lot.height);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 14px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 4;
    ctx.fillText(`${lot.name}`, lot.x + lot.width / 2, lot.y + lot.height / 2 - 10);
    ctx.fillText(`(${lot.bookings}/${lot.capacity})`, lot.x + lot.width / 2, lot.y + lot.height / 2 + 10);
    ctx.shadowBlur = 0; 
  });
}

setInterval(() => {
  if (!selectedLotId) return;
  blinkState = !blinkState;
  drawMap();
}, 600);

// ==== QUẢN LÝ ĐẶT & HỦY CHỖ ====
function bookParking() {
  const lotSelect = document.getElementById("parking-lot").value;
  selectedLotId = lotSelect;

  if (!selectedLotId) return alert("Vui lòng chọn bãi xe!");
  const lot = parkingLots.find(l => l.id === selectedLotId);
  const plate = document.getElementById("plate-number").value.trim();
  const statusMsg = document.getElementById('modal-status-msg');

  if (!plate) return alert("Vui lòng nhập biển số xe!");
  
  if (lot.bookings >= lot.capacity * 0.8) {
    statusMsg.innerHTML = `<span style="color: var(--danger)">${lot.name} đã vượt giới hạn 80%. Không thể đặt.</span>`;
    
    const btnAlt = document.querySelectorAll('.nav-item')[3]; // Nút bãi thay thế giờ đã là index 3
    if(btnAlt) navigate('alt', btnAlt);
    closeParkingModal();
    return;
  }
  
  lot.bookings++;
  bookings.push({ lotId: lot.id, timestamp: Date.now(), plate });
  statusMsg.innerHTML = `<span style="color: var(--success)">✅ Đặt chỗ thành công: ${plate} tại ${lot.name}.</span>`;
  
  const total = parkingLots.reduce((sum, l) => sum + l.bookings, 0);
  updateMainStatus(total);
  drawMap();
}

function cancelBooking() {
  const lotSelect = document.getElementById("parking-lot").value;
  selectedLotId = lotSelect;

  if (!selectedLotId) return alert('Vui lòng chọn bãi xe muốn hủy.');
  const lot = parkingLots.find(l => l.id === selectedLotId);
  const statusMsg = document.getElementById('modal-status-msg');
  const index = bookings.findIndex(b => b.lotId === lot.id);
  
  if (index === -1) {
    statusMsg.innerHTML = `<span style="color: var(--warning)">Không tìm thấy lịch đặt chỗ của bạn tại ${lot.name}.</span>`;
    return;
  }
  
  bookings.splice(index, 1);
  lot.bookings--;
  statusMsg.innerHTML = `<span style="color: var(--text-muted)">🗑️ Đã hủy đặt chỗ tại ${lot.name}.</span>`;
  
  const total = parkingLots.reduce((sum, l) => sum + l.bookings, 0);
  updateMainStatus(total);
  drawMap();
}

function predictParking() {
  const timeInput = document.getElementById("arrival-time").value;
  const statusMsg = document.getElementById('modal-status-msg');
  if (!timeInput) return statusMsg.innerHTML = `<span style="color: var(--danger)">Vui lòng chọn thời gian dự kiến đến!</span>`;
  
  parkingLots.forEach(lot => {
      lot.bookings = Math.floor(Math.random() * lot.capacity);
  });

  const total = parkingLots.reduce((sum, l) => sum + l.bookings, 0);
  statusMsg.innerHTML = `<span style="color: var(--accent)">Đã cập nhật dự báo tương đối cho thời điểm đã chọn.</span>`;
  
  updateMainStatus(total);
  drawMap();
}

// ==== SỰ KIỆN GIAO DIỆN CANAVAS ====
document.getElementById('parking-lot')?.addEventListener('change', e => {
  selectedLotId = e.target.value || null;
  drawMap();
});

document.getElementById("map")?.addEventListener('click', e => {
  const canvas = document.getElementById("map");
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  
  parkingLots.forEach(lot => {
    if (x >= lot.x && x <= lot.x + lot.width && y >= lot.y && y <= lot.y + lot.height) {
      selectedLotId = lot.id;
      showParkingModal();
      document.getElementById('parking-lot').value = lot.id;
      drawMap();
    }
  });
});

document.getElementById("map")?.addEventListener('mousemove', e => {
  if (!tooltip) return;
  const canvas = document.getElementById("map");
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  
  let found = false;
  parkingLots.forEach(lot => {
    if (x >= lot.x && x <= lot.x + lot.width && y >= lot.y && y <= lot.y + lot.height) {
      const percent = ((lot.bookings / lot.capacity) * 100).toFixed(1);
      tooltip.style.display = 'block';
      tooltip.style.left = `${e.clientX + 15}px`;
      tooltip.style.top = `${e.clientY + 15}px`;
      tooltip.innerHTML = `<strong>${lot.name}</strong><br>Trống: ${Math.max(0, lot.capacity - lot.bookings)}<br>Lấp đầy: ${percent}%`;
      found = true;
    }
  });
  if (!found) tooltip.style.display = 'none';
});

document.getElementById("map")?.addEventListener('mouseleave', () => {
  if (tooltip) tooltip.style.display = 'none';
});

// ==== ĐÓNG/MỞ MODAL ====
function showParkingModal() {
  document.getElementById("parking-modal").classList.remove("hidden");
}

function closeParkingModal() {
  document.getElementById("parking-modal").classList.add("hidden");
  document.getElementById('modal-status-msg').innerHTML = "";
  selectedLotId = null;
  drawMap();
}

// ==== HỆ THỐNG XÓA CHỖ TỰ ĐỘNG ====
setInterval(() => {
  if (bookings.length === 0) return;
  const now = Date.now();
  const expired = bookings.filter(b => now - b.timestamp > 15 * 60 * 1000);
  
  if (expired.length > 0) {
    expired.forEach(b => {
      const lot = parkingLots.find(l => l.id === b.lotId);
      if (lot) lot.bookings--;
    });
    
    const validBookings = bookings.filter(b => now - b.timestamp <= 15 * 60 * 1000);
    bookings.length = 0;
    bookings.push(...validBookings);
    
    const total = parkingLots.reduce((sum, lot) => sum + lot.bookings, 0);
    updateMainStatus(total);
    drawMap();
  }
}, 30000); 

// ==== KHỞI TẠO ====
window.onload = function () {
  if (localStorage.getItem("loggedIn") === "true") {
    document.getElementById("auth-section").classList.add("hidden");
    document.getElementById("dashboard-section").classList.remove("hidden");
    drawMap();
  } else {
    document.getElementById("auth-section").classList.remove("hidden");
    document.getElementById("dashboard-section").classList.add("hidden");
  }
};