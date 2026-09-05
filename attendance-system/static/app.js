// MineScan AI - Client Logic & Biometric Face Recognition Controller

let webcamStream = null;
let regWebcamStream = null;
let scanInterval = null;
let isScanning = false;
let currentFacingMode = 'user';
let capturedImageData = null;

// Audio Chime Synthesizer using Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSuccessChime() {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) {
    console.log("Audio not allowed yet:", e);
  }
}

function playAlertBuzzer() {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(180, audioCtx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (e) {}
}

// DOM Elements
document.addEventListener("DOMContentLoaded", () => {
  initClock();
  initTabs();
  initScannerCamera();
  initRegistration();
  initLedger();
  initWorkersDirectory();
  fetchStats();
  fetchAttendanceLogs();
  fetchWorkers();

  // Polling stats every 10 seconds
  setInterval(fetchStats, 10000);
});

// Clock update
function initClock() {
  const clockEl = document.getElementById("liveClock");
  const update = () => {
    const now = new Date();
    clockEl.innerText = now.toLocaleTimeString('en-US', { hour12: false }) + " IST";
  };
  update();
  setInterval(update, 1000);
}

// Tab navigation
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.getAttribute("data-tab");
      document.getElementById(target).classList.add("active");

      if (target === "ledger-tab") {
        fetchAttendanceLogs();
      } else if (target === "workers-tab") {
        fetchWorkers();
      }
    });
  });

  const goToRegBtn = document.getElementById("goToRegisterTabBtn");
  if (goToRegBtn) {
    goToRegBtn.addEventListener("click", () => {
      document.querySelector('[data-tab="register-tab"]').click();
    });
  }
}

// ----------------------------------------------------
// 1. LIVE ATTENDANCE SCANNER
// ----------------------------------------------------
const video = document.getElementById("webcam");
const canvas = document.getElementById("overlayCanvas");
const ctx = canvas.getContext("2d");
const startCamBtn = document.getElementById("startCamBtn");
const cameraFallback = document.getElementById("cameraFallback");
const autoScanToggle = document.getElementById("autoScanToggle");
const manualScanBtn = document.getElementById("manualScanBtn");
const switchCamBtn = document.getElementById("switchCameraBtn");
const thresholdInput = document.getElementById("thresholdInput");
const thresholdVal = document.getElementById("thresholdVal");
const scanLaser = document.getElementById("scanLaser");
const liveStream = document.getElementById("liveActivityStream");
const lastVerifiedCard = document.getElementById("lastVerifiedCard");

thresholdInput.addEventListener("input", (e) => {
  thresholdVal.innerText = `${Math.round(e.target.value * 100)}%`;
});

async function initScannerCamera() {
  const scannerUploadBtn = document.getElementById("scannerUploadBtn");
  const scanPhotoFileBtn = document.getElementById("scanPhotoFileBtn");
  const scannerFileInput = document.getElementById("scannerFileInput");

  startCamBtn.addEventListener("click", () => {
    startCamera(true);
  });

  switchCamBtn.addEventListener("click", () => {
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    startCamera(true);
  });

  manualScanBtn.addEventListener("click", () => scanCurrentFrame(true));

  // Direct photo upload for attendance scanning
  if (scannerUploadBtn) {
    scannerUploadBtn.addEventListener("click", () => scannerFileInput.click());
  }
  if (scanPhotoFileBtn) {
    scanPhotoFileBtn.addEventListener("click", () => scannerFileInput.click());
  }
  if (scannerFileInput) {
    scannerFileInput.addEventListener("change", handleScannerFileUpload);
  }

  autoScanToggle.addEventListener("change", (e) => {
    if (e.target.checked) {
      startAutoScan();
    } else {
      stopAutoScan();
    }
  });

  // Attempt initial camera start without popup spam
  startCamera(false);
}

async function startCamera(isUserClick = false) {
  const fallbackMsg = document.getElementById("cameraFallbackMsg");

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const msg = isLocalhost 
      ? "Webcam API not supported in this browser. Please use Chrome, Edge, or Firefox."
      : "Browser blocks camera on insecure HTTP. Please open using http://localhost:8000 or http://127.0.0.1:8000";
    if (fallbackMsg) fallbackMsg.innerText = msg;
    cameraFallback.style.display = "flex";
    scanLaser.style.display = "none";
    if (isUserClick) showToast(msg, "error");
    return;
  }

  if (webcamStream) {
    webcamStream.getTracks().forEach(track => track.stop());
  }

  try {
    // 1st attempt: with ideal resolution
    try {
      webcamStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
    } catch (e1) {
      // 2nd fallback: basic video constraint
      console.log("Ideal constraints failed, trying basic video:true...", e1);
      webcamStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
    }

    video.srcObject = webcamStream;
    cameraFallback.style.display = "none";
    scanLaser.style.display = "block";

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      if (autoScanToggle.checked) {
        startAutoScan();
      }
    };
    showToast("Camera feed active. Point face towards camera.", "info");
  } catch (err) {
    console.warn("Camera access failed:", err);
    cameraFallback.style.display = "flex";
    scanLaser.style.display = "none";

    let errMsg = "Camera access required for live scanning.";
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      errMsg = "Permission Denied: Click the camera icon in your browser URL address bar to Allow Camera.";
    } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
      errMsg = "No camera device detected on this PC. You can use 'Scan From Photo' to test.";
    } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
      errMsg = "Camera is already in use by another application. Please close other camera apps.";
    }

    if (fallbackMsg) fallbackMsg.innerText = errMsg;
    if (isUserClick) showToast(errMsg, "error");
  }
}

function handleScannerFileUpload(e) {
  if (!e.target.files || e.target.files.length === 0) return;
  const file = e.target.files[0];
  if (!file.type.startsWith("image/")) {
    showToast("Please select a valid photo file.", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = async (event) => {
    const base64Img = event.target.result;
    showToast("Analyzing photo for face biometrics...", "info");

    const img = new Image();
    img.onload = async () => {
      // Draw uploaded image onto canvas
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const threshold = parseFloat(thresholdInput.value);
      try {
        const response = await fetch("/api/attendance/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Img, threshold: threshold })
        });

        const data = await response.json();
        renderDetectionOverlay(data, img.width, img.height);

        if (data.success && data.matches && data.matches.length > 0) {
          data.matches.forEach(match => {
            handleMatchResult(match);
          });
        } else {
          showToast("No face detected in the uploaded photo.", "info");
        }
      } catch (err) {
        showToast("Error processing photo: " + err.message, "error");
      }
    };
    img.src = base64Img;
  };
  reader.readAsDataURL(file);
}

function startAutoScan() {
  if (scanInterval) clearInterval(scanInterval);
  scanInterval = setInterval(() => {
    if (!isScanning && video.readyState === video.HAVE_ENOUGH_DATA) {
      scanCurrentFrame(false);
    }
  }, 1600);
}

function stopAutoScan() {
  if (scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
}

async function scanCurrentFrame(isManual = false) {
  if (isScanning || video.readyState !== video.HAVE_ENOUGH_DATA) return;
  isScanning = true;

  try {
    // Capture snapshot from video to off-screen canvas
    const snapCanvas = document.createElement("canvas");
    snapCanvas.width = video.videoWidth;
    snapCanvas.height = video.videoHeight;
    const snapCtx = snapCanvas.getContext("2d");
    snapCtx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
    const base64Img = snapCanvas.toDataURL("image/jpeg", 0.85);

    const threshold = parseFloat(thresholdInput.value);

    const response = await fetch("/api/attendance/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Img, threshold: threshold })
    });

    const data = await response.json();
    renderDetectionOverlay(data, snapCanvas.width, snapCanvas.height);

    if (data.success && data.matches && data.matches.length > 0) {
      data.matches.forEach(match => {
        handleMatchResult(match);
      });
    } else if (isManual) {
      showToast("No face detected in the frame. Please look directly at the camera.", "info");
    }
  } catch (err) {
    console.error("Scan error:", err);
  } finally {
    isScanning = false;
  }
}

function renderDetectionOverlay(data, vWidth, vHeight) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!data || !data.matches || data.matches.length === 0) return;

  const scaleX = canvas.width / vWidth;
  const scaleY = canvas.height / vHeight;

  data.matches.forEach(m => {
    const b = m.box;
    const x = b.x * scaleX;
    const y = b.y * scaleY;
    const w = b.w * scaleX;
    const h = b.h * scaleY;

    ctx.lineWidth = 3;
    if (m.matched) {
      // Green bounding box for recognized personnel
      ctx.strokeStyle = "#10b981";
      ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
      ctx.strokeRect(x, y, w, h);
      ctx.fillRect(x, y, w, h);

      // Label background
      ctx.fillStyle = "#10b981";
      const label = `${m.worker.name} (${m.confidence}%)`;
      ctx.font = "bold 14px Outfit, sans-serif";
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(x, y - 28, textWidth + 16, 28);

      ctx.fillStyle = "#0b0f19";
      ctx.fillText(label, x + 8, y - 9);
    } else {
      // Red bounding box for unrecognized face
      ctx.strokeStyle = "#ef4444";
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = "#ef4444";
      const label = `Unrecognized (${m.confidence}%)`;
      ctx.font = "13px Outfit, sans-serif";
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(x, y - 24, textWidth + 12, 24);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, x + 6, y - 7);
    }
  });

  // Fade out boxes after 1.2s
  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 1200);
}

function handleMatchResult(match) {
  const timeNow = new Date().toLocaleTimeString();

  if (match.matched && match.worker) {
    if (match.attendance_marked) {
      playSuccessChime();
      showToast(`✅ Attendance Checked In: ${match.worker.name}`, "success");
      fetchStats();
      fetchAttendanceLogs();
    }

    // Update Last Verified Worker card
    lastVerifiedCard.style.display = "block";
    document.getElementById("lastVerifiedName").innerText = match.worker.name;
    document.getElementById("lastVerifiedRole").innerText = match.worker.role;
    document.getElementById("lastVerifiedId").innerText = match.worker.worker_id;
    document.getElementById("lastVerifiedTime").innerText = timeNow;
    document.getElementById("lastVerifiedPhoto").src = match.worker.photo_b64 || '/static/placeholder-avatar.png';
    document.getElementById("lastVerifiedConfBar").style.width = `${match.confidence}%`;
    document.getElementById("lastVerifiedConfText").innerText = `${match.confidence}% Match`;

    // Add to activity stream
    addStreamItem({
      type: "verified",
      name: match.worker.name,
      role: match.worker.role,
      id: match.worker.worker_id,
      time: timeNow,
      photo: match.worker.photo_b64,
      status: match.status_message
    });
  } else {
    // Unrecognized face
    addStreamItem({
      type: "unrecognized",
      name: "Unknown Person",
      role: "Not in Worker Database",
      time: timeNow,
      status: `Confidence ${match.confidence}% (Below threshold)`
    });
  }
}

function addStreamItem(item) {
  const empty = liveStream.querySelector(".empty-state");
  if (empty) empty.remove();

  const el = document.createElement("div");
  el.className = `stream-item ${item.type === 'unrecognized' ? 'unrecognized' : ''}`;
  
  if (item.type === 'verified') {
    el.innerHTML = `
      <img src="${item.photo}" class="stream-thumb" />
      <div class="stream-info">
        <div class="stream-title">${item.name} <span class="badge-role">${item.role}</span></div>
        <div class="stream-time"><i class="fa-solid fa-clock"></i> ${item.time} &bull; ${item.status}</div>
      </div>
    `;
  } else {
    el.innerHTML = `
      <div class="stream-thumb" style="background:#334155; display:flex; align-items:center; justify-content:center; color:#ef4444;"><i class="fa-solid fa-user-slash"></i></div>
      <div class="stream-info">
        <div class="stream-title">${item.name}</div>
        <div class="stream-time"><i class="fa-solid fa-circle-exclamation"></i> ${item.status} &bull; ${item.time}</div>
      </div>
    `;
  }

  liveStream.insertBefore(el, liveStream.firstChild);
  if (liveStream.children.length > 25) {
    liveStream.lastChild.remove();
  }
}

document.getElementById("clearLiveFeedBtn").addEventListener("click", () => {
  liveStream.innerHTML = `
    <div class="empty-state">
      <i class="fa-solid fa-radar"></i>
      <p>Standing by for facial scan detection...</p>
      <small>Position face in front of camera</small>
    </div>
  `;
  lastVerifiedCard.style.display = "none";
});

// ----------------------------------------------------
// 2. ADMIN WORKER REGISTRATION
// ----------------------------------------------------
const regWebcam = document.getElementById("regWebcam");
const regStartCamBtn = document.getElementById("regStartCamBtn");
const regSnapBtn = document.getElementById("regSnapBtn");
const capCamTabBtn = document.getElementById("capCamTabBtn");
const capUploadTabBtn = document.getElementById("capUploadTabBtn");
const capCamPanel = document.getElementById("capCamPanel");
const capUploadPanel = document.getElementById("capUploadPanel");
const regDropZone = document.getElementById("regDropZone");
const regFileInput = document.getElementById("regFileInput");
const capturedPreviewBox = document.getElementById("capturedPreviewBox");
const capturedImgPreview = document.getElementById("capturedImgPreview");
const discardPhotoBtn = document.getElementById("discardPhotoBtn");
const registerForm = document.getElementById("registerWorkerForm");

function initRegistration() {
  capCamTabBtn.addEventListener("click", () => {
    capCamTabBtn.classList.add("active");
    capUploadTabBtn.classList.remove("active");
    capCamPanel.style.display = "block";
    capUploadPanel.style.display = "none";
    startRegCamera();
  });

  capUploadTabBtn.addEventListener("click", () => {
    capUploadTabBtn.classList.add("active");
    capCamTabBtn.classList.remove("active");
    capUploadPanel.style.display = "block";
    capCamPanel.style.display = "none";
  });

  regStartCamBtn.addEventListener("click", startRegCamera);

  regSnapBtn.addEventListener("click", () => {
    if (regWebcam.readyState !== regWebcam.HAVE_ENOUGH_DATA) {
      showToast("Camera is not ready yet. Please wait.", "error");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = regWebcam.videoWidth;
    canvas.height = regWebcam.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(regWebcam, 0, 0, canvas.width, canvas.height);
    capturedImageData = canvas.toDataURL("image/jpeg", 0.9);
    
    capturedImgPreview.src = capturedImageData;
    capturedPreviewBox.style.display = "block";
    showToast("Face snapshot captured successfully!", "info");
  });

  discardPhotoBtn.addEventListener("click", () => {
    capturedImageData = null;
    capturedPreviewBox.style.display = "none";
  });

  // Dropzone handling
  regDropZone.addEventListener("click", () => regFileInput.click());
  regFileInput.addEventListener("change", handleFileSelect);
  regDropZone.addEventListener("dragover", (e) => { e.preventDefault(); regDropZone.style.borderColor = "var(--primary)"; });
  regDropZone.addEventListener("dragleave", () => { regDropZone.style.borderColor = "#334155"; });
  regDropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    regDropZone.style.borderColor = "#334155";
    if (e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  });

  // Form submission
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!capturedImageData) {
      showToast("Please capture or upload a worker face photo first.", "error");
      return;
    }

    const submitBtn = document.getElementById("submitRegisterBtn");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Extracting ML Embeddings & Saving...`;

    const payload = {
      worker_id: document.getElementById("regWorkerId").value.trim(),
      name: document.getElementById("regName").value.trim(),
      role: document.getElementById("regRole").value,
      shift: document.getElementById("regShift").value,
      mine_site: document.getElementById("regMineSite").value,
      image: capturedImageData
    };

    try {
      const res = await fetch("/api/workers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`Worker ${payload.name} registered successfully!`, "success");
        registerForm.reset();
        capturedImageData = null;
        capturedPreviewBox.style.display = "none";
        fetchWorkers();
        fetchStats();
      } else {
        showToast(data.detail || data.message || "Registration failed", "error");
      }
    } catch (err) {
      showToast("Error registering worker: " + err.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-fingerprint"></i> Save Worker & Train ML Embeddings`;
    }
  });
}

async function startRegCamera() {
  try {
    regWebcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    regWebcam.srcObject = regWebcamStream;
  } catch (err) {
    showToast("Unable to start registration camera.", "error");
  }
}

function handleFileSelect(e) {
  if (e.target.files.length > 0) {
    processImageFile(e.target.files[0]);
  }
}

function processImageFile(file) {
  if (!file.type.startsWith("image/")) {
    showToast("Please select a valid image file.", "error");
    return;
  }
  const reader = new FileReader();
  reader.onload = (event) => {
    capturedImageData = event.target.result;
    capturedImgPreview.src = capturedImageData;
    capturedPreviewBox.style.display = "block";
    showToast("Photo uploaded successfully!", "info");
  };
  reader.readAsDataURL(file);
}

// ----------------------------------------------------
// 3. ATTENDANCE LEDGER
// ----------------------------------------------------
let allAttendanceData = [];

function initLedger() {
  const searchInput = document.getElementById("ledgerSearchInput");
  const dateInput = document.getElementById("ledgerDateFilter");
  const exportBtn = document.getElementById("exportCsvBtn");
  const clearBtn = document.getElementById("clearAttendanceBtn");

  searchInput.addEventListener("input", filterAttendanceTable);
  dateInput.addEventListener("change", () => {
    fetchAttendanceLogs(dateInput.value);
  });

  exportBtn.addEventListener("click", exportLedgerToCSV);

  clearBtn.addEventListener("click", async () => {
    if (confirm("Are you sure you want to clear all attendance records?")) {
      await fetch("/api/attendance/clear", { method: "POST" });
      fetchAttendanceLogs();
      fetchStats();
      showToast("Attendance ledger cleared.", "info");
    }
  });
}

async function fetchAttendanceLogs(date = null) {
  try {
    let url = "/api/attendance";
    if (date) url += `?date=${date}`;
    const res = await fetch(url);
    const data = await res.json();
    allAttendanceData = data.attendance || [];
    renderAttendanceTable(allAttendanceData);
  } catch (err) {
    console.error("Failed to fetch logs:", err);
  }
}

function renderAttendanceTable(records) {
  const tbody = document.getElementById("attendanceTableBody");
  if (!records || records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="table-empty">No attendance records found for this date.</td></tr>`;
    return;
  }

  tbody.innerHTML = records.map(r => `
    <tr>
      <td><code>${r.id}</code></td>
      <td><strong>${r.name}</strong><br><small class="worker-id">${r.worker_id}</small></td>
      <td><span class="badge-role">${r.role}</span></td>
      <td>${r.shift}</td>
      <td>${r.date}</td>
      <td><strong style="color:var(--primary); font-family:var(--font-mono);">${r.time}</strong></td>
      <td>
        <span class="badge-status ${r.status.includes('On Time') ? 'status-present' : 'status-late'}">
          <i class="fa-solid fa-circle-check"></i> ${r.status}
        </span>
      </td>
      <td><strong style="color:var(--accent-green); font-family:var(--font-mono);">${r.confidence}</strong></td>
      <td><small style="color:var(--text-secondary);">${r.verification_type}</small></td>
    </tr>
  `).join("");
}

function filterAttendanceTable() {
  const q = document.getElementById("ledgerSearchInput").value.toLowerCase();
  const filtered = allAttendanceData.filter(r => 
    r.name.toLowerCase().includes(q) ||
    r.worker_id.toLowerCase().includes(q) ||
    r.role.toLowerCase().includes(q) ||
    r.shift.toLowerCase().includes(q)
  );
  renderAttendanceTable(filtered);
}

function exportLedgerToCSV() {
  if (allAttendanceData.length === 0) {
    showToast("No attendance data to export.", "error");
    return;
  }

  const headers = ["Record ID", "Worker ID", "Name", "Role", "Shift", "Mine Site", "Date", "Time", "Status", "Confidence", "Verification Type"];
  const rows = allAttendanceData.map(r => [
    r.id, r.worker_id, `"${r.name}"`, `"${r.role}"`, `"${r.shift}"`, `"${r.mine_site}"`, r.date, r.time, `"${r.status}"`, r.confidence, `"${r.verification_type}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Mine_Attendance_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// ----------------------------------------------------
// 4. REGISTERED WORKERS DIRECTORY
// ----------------------------------------------------
let allWorkersList = [];

function initWorkersDirectory() {
  const searchInput = document.getElementById("workersSearchInput");
  searchInput.addEventListener("input", filterWorkersGrid);
}

async function fetchWorkers() {
  try {
    const res = await fetch("/api/workers");
    const data = await res.json();
    allWorkersList = data.workers || [];
    document.getElementById("workerCountBadge").innerText = allWorkersList.length;
    renderWorkersGrid(allWorkersList);
  } catch (err) {
    console.error("Failed to fetch workers:", err);
  }
}

function renderWorkersGrid(workers) {
  const grid = document.getElementById("workersDirectoryGrid");
  if (!workers || workers.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1;" class="empty-state">
        <i class="fa-solid fa-users-slash"></i>
        <p>No registered workers in the system yet.</p>
        <small>Click "Register New Worker" to enroll personnel.</small>
      </div>
    `;
    return;
  }

  grid.innerHTML = workers.map(w => `
    <div class="worker-card">
      <button class="worker-del-btn" title="Delete Worker" onclick="deleteWorker('${w.worker_id}', '${w.name}')">
        <i class="fa-solid fa-trash-can"></i>
      </button>
      <img src="${w.photo_b64 || '/static/placeholder-avatar.png'}" class="worker-photo" alt="${w.name}" />
      <div class="worker-info">
        <h4>${w.name}</h4>
        <div class="worker-id">${w.worker_id}</div>
        <div class="worker-role"><i class="fa-solid fa-briefcase"></i> ${w.role}</div>
        <div class="worker-shift"><i class="fa-solid fa-clock"></i> ${w.shift}</div>
        <div class="worker-shift"><i class="fa-solid fa-location-dot"></i> ${w.mine_site}</div>
      </div>
    </div>
  `).join("");
}

function filterWorkersGrid() {
  const q = document.getElementById("workersSearchInput").value.toLowerCase();
  const filtered = allWorkersList.filter(w =>
    w.name.toLowerCase().includes(q) ||
    w.worker_id.toLowerCase().includes(q) ||
    w.role.toLowerCase().includes(q) ||
    w.shift.toLowerCase().includes(q)
  );
  renderWorkersGrid(filtered);
}

window.deleteWorker = async function(id, name) {
  if (confirm(`Are you sure you want to remove worker ${name} (${id}) from facial recognition database?`)) {
    try {
      const res = await fetch(`/api/workers/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Worker ${name} removed.`, "info");
        fetchWorkers();
        fetchStats();
      }
    } catch (err) {
      showToast("Failed to delete worker.", "error");
    }
  }
};

// ----------------------------------------------------
// 5. STATS & TOAST NOTIFICATIONS
// ----------------------------------------------------
async function fetchStats() {
  try {
    const res = await fetch("/api/stats");
    const data = await res.json();
    document.getElementById("kpiTotalWorkers").innerText = data.total_workers;
    document.getElementById("kpiPresent").innerText = data.present_today;
    document.getElementById("kpiAbsent").innerText = data.absent_today;
    document.getElementById("kpiRate").innerText = data.attendance_rate;
  } catch (err) {}
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "fa-circle-info";
  if (type === "success") icon = "fa-circle-check";
  if (type === "error") icon = "fa-triangle-exclamation";

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
