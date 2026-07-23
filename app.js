// Pre-configured registered users database
const userDatabase = {
  "sanjaioff@gmail.com": {
    email: "sanjaioff@gmail.com",
    name: "Sanjai L",
    regNo: "212223230184",
    department: "Artificial Intelligence & Data Science",
    college: "SEC (Saveetha Engineering College)",
    route: "Redhills 7",
    stopNo: "7",
    routeDetails: "Redhills Alamaram → Thandalam Campus",
    passType: "Annual Pass",
    status: "Paid",
    phone: "8428882006",
    bloodGroup: "B+",
    initials: "S",
    busNo: "TN87F5379",
    verifyBusNo: "TN87F5379",
    verifyBusRoute: "7 – Redhills",
    verifyPassRoute: "7 – Redhills",
    driverName: "R. Murugan",
    driverPhone: "+91 98401 23456"
  },
  "dharshandhiren@gmail.com": {
    email: "dharshandhiren@gmail.com",
    name: "Dharshan D",
    regNo: "212223230045",
    department: "Computer Science & Engineering",
    college: "SEC (Saveetha Engineering College)",
    route: "Retteri 5",
    stopNo: "5",
    routeDetails: "Retteri → Thandalam Campus",
    passType: "Annual Pass",
    status: "Paid",
    phone: "8946074206",
    bloodGroup: "B+",
    initials: "D",
    busNo: "TN87F5343",
    verifyBusNo: "TN87F5343",
    verifyBusRoute: "5 – Retteri",
    verifyPassRoute: "5 – Retteri",
    driverName: "R. Murugan",
    driverPhone: "+91 98401 23456"
  }
};

const SESSION_KEY = "simats_bus_session_v1";
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes session duration

// Application State
const appState = {
  student: { ...userDatabase["sanjaioff@gmail.com"] },
  timerSeconds: 60,
  timerInterval: null,
  currentManualCode: "246 243",
  busTracking: {
    currentStopIndex: 4,
    speed: 48,
    occupancy: 34,
    maxSeats: 52,
    etaMinutes: 18,
    isMoving: true,
    busProgress: 65, // percentage along route
    stops: [
      { name: "Redhills Market", time: "06:00 AM", status: "completed" },
      { name: "Puzhal Lake", time: "07:02 AM", status: "completed" },
      { name: "Kolathur Junction", time: "07:18 AM", status: "completed" },
      { name: "Retteri Flyover", time: "07:30 AM", status: "completed" },
      { name: "Koyambedu Flyover", time: "07:50 AM", status: "in-transit", active: true },
      { name: "Poonamallee Bypass", time: "08:15 AM", status: "upcoming" },
      { name: "Thandalam Campus", time: "08:35 AM", status: "upcoming" }
    ]
  }
};

// Session Management Functions
function saveSession(email) {
  const sessionData = {
    email: email,
    expiresAt: Date.now() + SESSION_DURATION_MS
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
}

function getActiveSession() {
  try {
    const dataStr = localStorage.getItem(SESSION_KEY);
    if (!dataStr) return null;
    const data = JSON.parse(dataStr);
    if (data && data.expiresAt && Date.now() < data.expiresAt) {
      return data;
    }
  } catch (e) {
    console.error("Session check error:", e);
  }
  return null;
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function updateStudentUI(studentData) {
  appState.student = { ...studentData };

  const avatarEl = document.getElementById("profile-avatar");
  if (avatarEl) avatarEl.textContent = studentData.initials || studentData.name.charAt(0).toUpperCase();

  const nameEl = document.getElementById("display-student-name");
  if (nameEl) nameEl.textContent = studentData.name;

  const regEl = document.getElementById("display-student-reg");
  if (regEl) regEl.textContent = `Register No: ${studentData.regNo}`;

  const deptEl = document.getElementById("display-student-dept");
  if (deptEl) deptEl.textContent = studentData.department;

  const routeEl = document.getElementById("display-student-route");
  if (routeEl) {
    routeEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bus w-4 h-4 text-blue-600" aria-hidden="true"><path d="M8 6v6"></path><path d="M15 6v6"></path><path d="M2 12h19.6"></path><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"></path><circle cx="7" cy="18" r="2"></circle><path d="M9 18h5"></path><circle cx="16" cy="18" r="2"></circle></svg>${studentData.route}<span class="text-gray-400">· ${studentData.stopNo}</span>`;
  }

  const pickupEl = document.getElementById("display-student-pickup");
  if (pickupEl) pickupEl.textContent = studentData.routeDetails;

  const helplineEl = document.getElementById("display-student-helpline");
  if (helplineEl) {
    helplineEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone w-3 h-3 text-slate-400" aria-hidden="true"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path></svg>Helpline: ${studentData.phone}`;
  }

  const bloodEl = document.getElementById("display-student-blood");
  if (bloodEl) {
    bloodEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-droplet w-3 h-3 text-rose-500" aria-hidden="true"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>Blood: ${studentData.bloodGroup}`;
  }

  generateQRCode();
}

function loginWithEmail(email, showNotification = true) {
  const cleanEmail = email.trim().toLowerCase();
  const user = userDatabase[cleanEmail];

  if (!user) {
    const errorEl = document.getElementById("login-error-msg");
    if (errorEl) {
      errorEl.textContent = "Email not found. Please use sanjaioff@gmail.com or dharshandhiren@gmail.com";
      errorEl.classList.remove("hidden");
    }
    return false;
  }

  // Update UI and save 30-minute session
  updateStudentUI(user);
  saveSession(cleanEmail);

  // Close Login Modal
  const loginModal = document.getElementById("modal-login-auth");
  if (loginModal) loginModal.classList.add("hidden");

  if (showNotification) {
    showToast(`Logged in as ${user.name}. Session active for 30 mins.`, "success");
    playBeep('success');
  }
  return true;
}

function quickLogin(email) {
  const inputEl = document.getElementById("login-email-input");
  if (inputEl) inputEl.value = email;
  loginWithEmail(email, true);
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const inputEl = document.getElementById("login-email-input");
  if (inputEl) {
    loginWithEmail(inputEl.value, true);
  }
}

function openLoginModal() {
  const loginModal = document.getElementById("modal-login-auth");
  if (loginModal) {
    const errorEl = document.getElementById("login-error-msg");
    if (errorEl) errorEl.classList.add("hidden");
    loginModal.classList.remove("hidden");
  }
}

function handleLogout() {
  clearSession();
  openLoginModal();
  showToast("Logged out of SIMATS Viana Study Portal", "info");
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Check 30-minute active session state
  const activeSession = getActiveSession();
  if (activeSession && userDatabase[activeSession.email]) {
    loginWithEmail(activeSession.email, false);
    // Renew session expiration for another 30 mins
    saveSession(activeSession.email);
  } else {
    // Show login modal if session missing or expired
    openLoginModal();
  }

  // Start Manual Code Countdown Timer
  startOTPCountdown();

  // Attach Event Listeners
  attachEventListeners();
});

// Sound Generator using Web Audio API
function playBeep(type = 'success') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.log("Audio not supported or blocked");
  }
}

// Ensure QR Code Image display
function generateQRCode() {
  const qrImg = document.getElementById("pass-qr-image");
  if (qrImg) {
    qrImg.src = "qr.jpg";
  }
}

// Fallback Canvas QR rendering
function renderFallbackQR(canvas) {
  const ctx = canvas.getContext('2d');
  const size = 168;
  canvas.width = size;
  canvas.height = size;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#0f172a';
  const tileSize = 7;
  const count = size / tileSize;

  // Simple pseudo-random QR pattern generation based on regNo
  const seed = appState.student.regNo + appState.currentManualCode;

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      // Draw corner positioning squares
      if ((r < 6 && c < 6) || (r < 6 && c > count - 7) || (r > count - 7 && c < 6)) {
        if (r === 0 || r === 5 || c === 0 || c === 5 || (r >= 2 && r <= 3 && c >= 2 && c <= 3) ||
          (r === 0 && c >= count - 6) || (r === 5 && c >= count - 6) || (c === count - 6) || (c === count - 1) ||
          (r > count - 7 && (c === 0 || c === 5 || r === count - 7 || r === count - 1))) {
          ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
        }
        continue;
      }

      const val = (r * 31 + c * 17 + seed.charCodeAt((r + c) % seed.length)) % 5;
      if (val < 2) {
        ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
      }
    }
  }
}

// Countdown Timer & Manual OTP Generator
function startOTPCountdown() {
  clearInterval(appState.timerInterval);
  appState.timerSeconds = 60;
  updateTimerUI();

  appState.timerInterval = setInterval(() => {
    appState.timerSeconds--;
    updateTimerUI();

    if (appState.timerSeconds <= 0) {
      refreshManualCode(false);
    }
  }, 1000);
}

function updateTimerUI() {
  const timerText = document.getElementById("timer-text");
  if (timerText) {
    timerText.textContent = `Refreshes in ${appState.timerSeconds}s`;
  }
}

// Refresh 6-digit OTP manual code
function refreshManualCode(isUserTriggered = true) {
  const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
  const formattedCode = randomCode.substring(0, 3) + " " + randomCode.substring(3, 6);
  appState.currentManualCode = formattedCode;

  const codeEl = document.getElementById("manual-otp-code");
  if (codeEl) {
    codeEl.textContent = formattedCode;
    codeEl.classList.add("scale-105", "text-blue-600");
    setTimeout(() => codeEl.classList.remove("scale-105", "text-blue-600"), 300);
  }

  generateQRCode();
  startOTPCountdown();

  if (isUserTriggered) {
    playBeep('success');
    showToast("Manual security code refreshed!");
  }
}

// Toast Notifications
function showToast(message, type = "info") {
  const container = document.querySelector("[data-rht-toaster]");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold transform transition-all duration-300 translate-y-2 opacity-0 pointer-events-auto max-w-sm mb-2 ${type === "error"
    ? "bg-red-900 text-white border-red-700"
    : type === "success"
      ? "bg-slate-900 text-white border-slate-700"
      : "bg-slate-900 text-white border-slate-700"
    }`;

  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full ${type === 'error' ? 'bg-red-400' : 'bg-emerald-400'} animate-ping"></span>
    <span class="flex-1">${message}</span>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white">&times;</button>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  });

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Attach UI Event Listeners
function attachEventListeners() {
  // Refresh OTP Button
  const refreshBtn = document.getElementById("refresh-otp-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => refreshManualCode(true));
  }

  // Scan to Verify Button
  const scanBtn = document.getElementById("btn-scan-verify");
  if (scanBtn) {
    scanBtn.addEventListener("click", openScanModal);
  }

  // Track My Bus Button
  const trackBtn = document.getElementById("btn-track-bus");
  if (trackBtn) {
    trackBtn.addEventListener("click", openTrackModal);
  }

  // Logout Button
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  // Profile Edit / Details trigger
  const profileAvatar = document.getElementById("profile-avatar");
  if (profileAvatar) {
    profileAvatar.addEventListener("click", openProfileModal);
  }

  // Close buttons for modals
  document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal-wrapper");
      if (modal) modal.classList.add("hidden");
    });
  });
}

// --- TRACK MY BUS MODAL LOGIC ---
let busAnimationTimer = null;

function openTrackModal() {
  const modal = document.getElementById("modal-track-bus");
  if (!modal) return;

  modal.classList.remove("hidden");
  renderBusTrackRoute();

  // Start animated bus movement simulation
  clearInterval(busAnimationTimer);
  busAnimationTimer = setInterval(() => {
    appState.busTracking.busProgress += 0.8;
    if (appState.busTracking.busProgress > 95) {
      appState.busTracking.busProgress = 15;
    }

    // Calculate speed fluctuations
    appState.busTracking.speed = Math.floor(40 + Math.random() * 15);
    updateBusProgressUI();
  }, 1000);
}

function renderBusTrackRoute() {
  const container = document.getElementById("route-stops-list");
  if (!container) return;

  container.innerHTML = appState.busTracking.stops.map((stop, idx) => {
    const isCompleted = idx < appState.busTracking.currentStopIndex;
    const isCurrent = idx === appState.busTracking.currentStopIndex;
    const isUpcoming = idx > appState.busTracking.currentStopIndex;

    return `
      <div class="relative flex items-start gap-4 pb-6 last:pb-0">
        ${idx !== appState.busTracking.stops.length - 1 ? `
          <div class="absolute left-[15px] top-6 bottom-0 w-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}"></div>
        ` : ''}
        <div class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${isCurrent
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50 ring-4 ring-blue-100 animate-bounce'
        : isCompleted
          ? 'bg-emerald-500 text-white'
          : 'bg-slate-100 text-slate-400 border border-slate-300'
      } font-bold text-xs">
          ${isCompleted ? '✓' : idx + 1}
        </div>
        <div class="flex-1 min-w-0 pt-0.5">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold ${isCurrent ? 'text-blue-600' : 'text-slate-800'}">${stop.name}</h4>
            <span class="text-xs font-mono font-medium ${isCurrent ? 'text-blue-600 font-bold' : 'text-slate-500'}">${stop.time}</span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">${isCurrent ? '🚌 Bus Current Location (In Transit)' : isCompleted ? 'Passed' : 'Scheduled Stop'
      }</p>
        </div>
      </div>
    `;
  }).join('');

  updateBusProgressUI();
}

function updateBusProgressUI() {
  const progressBar = document.getElementById("bus-live-progress-bar");
  const busIcon = document.getElementById("bus-moving-icon");
  const speedText = document.getElementById("bus-speed-text");
  const etaText = document.getElementById("bus-eta-text");
  const seatsText = document.getElementById("bus-seats-text");

  if (progressBar) progressBar.style.width = `${appState.busTracking.busProgress}%`;
  if (busIcon) busIcon.style.left = `calc(${appState.busTracking.busProgress}% - 14px)`;
  if (speedText) speedText.textContent = `${appState.busTracking.speed} km/h`;
  if (etaText) {
    const remainingEta = Math.max(2, Math.round(appState.busTracking.etaMinutes * (1 - (appState.busTracking.busProgress - 20) / 80)));
    etaText.textContent = `${remainingEta} mins`;
  }
  if (seatsText) seatsText.textContent = `${appState.busTracking.occupancy} / ${appState.busTracking.maxSeats} Seats`;
}


// --- SCAN TO VERIFY BUS MODAL LOGIC ---
let cameraStream = null;
let scanTimer = null;

function openScanModal() {
  const modal = document.getElementById("modal-scan-verify");
  if (!modal) return;

  // Ensure result modal is closed when starting a new scan
  closeVerifyResultModal();

  modal.classList.remove("hidden");

  const videoEl = document.getElementById("camera-video-feed");
  const placeholderEl = document.getElementById("camera-placeholder");
  const progressBar = document.getElementById("scan-progress-bar");
  const countdownText = document.getElementById("scan-timer-countdown");
  const statusText = document.getElementById("scan-status-text");

  if (progressBar) progressBar.style.width = "0%";
  if (countdownText) countdownText.textContent = "4s";
  if (statusText) statusText.textContent = "Scanning in progress...";

  // Attempt real camera stream access
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        cameraStream = stream;
        if (videoEl) {
          videoEl.srcObject = stream;
          videoEl.classList.remove("hidden");
        }
        if (placeholderEl) placeholderEl.classList.add("hidden");
      })
      .catch((err) => {
        console.log("Webcam access info:", err.message);
        if (videoEl) videoEl.classList.add("hidden");
        if (placeholderEl) placeholderEl.classList.remove("hidden");
      });
  }

  // 4-Second Scanning progress timer
  let elapsed = 0;
  const totalDuration = 4000; // 4 seconds
  const intervalTime = 50;

  clearInterval(scanTimer);
  scanTimer = setInterval(() => {
    elapsed += intervalTime;
    const percentage = Math.min(100, (elapsed / totalDuration) * 100);
    const remainingSecs = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000));

    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (countdownText) countdownText.textContent = `${remainingSecs}s`;

    if (elapsed >= totalDuration) {
      clearInterval(scanTimer);
      stopCameraStream();

      // Close scanner camera modal
      modal.classList.add("hidden");

      // Play success chime sound
      playBeep('success');

      // Open verification result modal ("Allowed to Travel") after 4 seconds
      openVerifyResultModal();
    }
  }, intervalTime);
}

function stopCameraStream() {
  clearInterval(scanTimer);
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
}

function openVerifyResultModal() {
  const resultModal = document.getElementById("modal-scan-result");
  if (resultModal) {
    const busNoEl = document.getElementById("scan-result-bus-no");
    const busRouteEl = document.getElementById("scan-result-bus-route");
    const passRouteEl = document.getElementById("scan-result-pass-route");

    const currentStudent = appState.student;
    if (busNoEl) busNoEl.textContent = currentStudent.verifyBusNo || "TN87F5343";
    if (busRouteEl) busRouteEl.textContent = currentStudent.verifyBusRoute || "5 – Retteri";
    if (passRouteEl) passRouteEl.textContent = currentStudent.verifyPassRoute || "5 – Retteri";

    resultModal.classList.remove("hidden");
  }
}

function closeVerifyResultModal() {
  const resultModal = document.getElementById("modal-scan-result");
  if (resultModal) {
    resultModal.classList.add("hidden");
  }
}

function rescanBus() {
  closeVerifyResultModal();
  openScanModal();
}

function openShowResultModal() {
  const resultModal = document.getElementById("modal-show-result");
  if (resultModal) {
    resultModal.classList.remove("hidden");
  }
}

function closeShowResultModal() {
  const resultModal = document.getElementById("modal-show-result");
  if (resultModal) {
    resultModal.classList.add("hidden");
  }
}


// --- STUDENT PROFILE / DEMO EDIT MODAL ---
function openProfileModal() {
  const modal = document.getElementById("modal-profile-edit");
  if (!modal) return;

  document.getElementById("input-student-name").value = appState.student.name;
  document.getElementById("input-student-reg").value = appState.student.regNo;
  document.getElementById("input-student-dept").value = appState.student.department;
  document.getElementById("input-student-route").value = appState.student.route;

  modal.classList.remove("hidden");
}

function saveProfileChanges(e) {
  e.preventDefault();

  appState.student.name = document.getElementById("input-student-name").value || appState.student.name;
  appState.student.regNo = document.getElementById("input-student-reg").value || appState.student.regNo;
  appState.student.department = document.getElementById("input-student-dept").value || appState.student.department;
  appState.student.route = document.getElementById("input-student-route").value || appState.student.route;
  appState.student.initials = appState.student.name.charAt(0).toUpperCase();

  // Update UI Elements
  document.getElementById("display-student-name").textContent = appState.student.name;
  document.getElementById("display-student-reg").textContent = `Register No: ${appState.student.regNo}`;
  document.getElementById("display-student-dept").textContent = appState.student.department;
  document.getElementById("display-student-route").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bus w-4 h-4 text-blue-600" aria-hidden="true"><path d="M8 6v6"></path><path d="M15 6v6"></path><path d="M2 12h19.6"></path><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"></path><circle cx="7" cy="18" r="2"></circle><path d="M9 18h5"></path><circle cx="16" cy="18" r="2"></circle></svg>${appState.student.route}<span class="text-gray-400">· 7</span>`;
  document.getElementById("profile-avatar").textContent = appState.student.initials;

  generateQRCode();
  document.getElementById("modal-profile-edit").classList.add("hidden");
  showToast("Profile details updated successfully!", "success");
}

// Print Handler
function triggerPrintPass() {
  window.print();
}
