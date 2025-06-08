let espIp = localStorage.getItem("esp32_ip") || "";
let plcIp = localStorage.getItem("plc_ip") || "";
if (!isValidIp(espIp)) {
    console.warn("ESP32 IP tidak valid di localStorage:", espIp);
    localStorage.removeItem("esp32_ip");
    espIp = "";
}
if (!isValidIp(plcIp)) {
    console.warn("PLC IP tidak valid di localStorage:", plcIp);
    localStorage.removeItem("plc_ip");
    plcIp = "";
}

let espConnected = false;
let plcConnected = false;
let loadingTimeout;
let lastSuccessTime = 0;
const GRACE_PERIOD = 2500; // ms

const modeCoils = ["M3", "M4", "M5", "M6", "M7", "M8"];
const controlCoils = ["M0", "M1", "M2"];
const indicatorMapping = {
    M0: "M10", M1: "M11", M2: "M12",
    M3: "M13", M4: "M14", M5: "M15",
    M6: "M16", M7: "M17", M8: "M18",
    M9: "M19"
};

const outputIndicators = {
    M20: document.getElementById("M20-indicator"),
    M21: document.getElementById("M21-indicator"),
    M22: document.getElementById("M22-indicator")
};

// IP input events
function isValidIp(ip) {
  return (
    typeof ip === "string" &&
    /^\d{1,3}(\.\d{1,3}){3}$/.test(ip) &&
    ip.split(".").every(part => {
      const n = +part;
      return n >= 0 && n <= 255;
    }) &&
    ip !== "0.0.0.0"
  );
}

document.getElementById("esp32-ip").addEventListener("click", () => {
  const ip = prompt("Masukkan alamat IP ESP32:", espIp);
  if (ip !== null && isValidIp(ip.trim())) {
    espIp = ip.trim();
    localStorage.setItem("esp32_ip", espIp);
    updateIpLabels();
    updateStatus(); // langsung coba update setelah diset
  } else if (ip !== null) {
    alert("Format IP ESP32 tidak valid!");
  }
});

document.getElementById("plc-ip").addEventListener("click", () => {
  const ip = prompt("Masukkan alamat IP PLC:", plcIp);
  if (ip !== null && isValidIp(ip.trim())) {
    plcIp = ip.trim();
    localStorage.setItem("plc_ip", plcIp);
    updateIpLabels();

    // Hanya kirim kalau espConnected sudah true (mencegah crash ESP32)
    if (espConnected) {
      sendPlcIpToEsp().catch(err => console.error("Gagal kirim IP PLC:", err));
    } else {
      console.warn("Menunggu ESP32 terhubung sebelum kirim IP PLC");
    }
  } else if (ip !== null) {
    alert("Format IP PLC tidak valid!");
  }
});

function updateIpLabels() {
    document.getElementById("esp32-ip").textContent = espIp || "Isikan Alamat IP ESP32";
    document.getElementById("plc-ip").textContent = plcIp || "Isikan Alamat IP PLC";
}
updateIpLabels();

// Tombol ping = tombol refresh
document.getElementById("M9").addEventListener("click", () => {
    console.log("Ping/Refresh status dimulai");
    updateStatus(); // Tidak tergantung koneksi PLC
});

// Handle tombol momentary
[...controlCoils, ...modeCoils, "M9"].forEach(coil => {
    const btn = document.getElementById(coil);
    if (btn) {
        btn.addEventListener("click", () => handleMomentaryPress(coil));
    }
});

async function handleMomentaryPress(coil) {
    // Izinkan tombol PING (M9) bahkan jika ESP32/PLC tidak terhubung
    if (coil !== "M9" && (!espIp || !plcConnected)) {
        console.warn("Tidak bisa mengirim, ESP32/PLC tidak terhubung");
        return;
    }

    try {
        await sendToESP32(coil, true);
        setTimeout(() => sendToESP32(coil, false), 500);
    } catch (err) {
        console.error(`Gagal kirim coil ${coil}:`, err);
    }
}

async function sendToESP32(coil, value) {
  try {
    const payload = { [coil]: value };
    if (plcIp && isValidIp(plcIp) && !plcConnected) {
      payload.plcIP = plcIp;
    }

    const response = await fetch(`http://${espIp}/write`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const result = await response.json();
    espConnected = true;
    plcConnected = !!result.plcConnected;
    updateConnectionDisplay();
    return result;
  } catch (err) {
    espConnected = false;
    plcConnected = false;
    updateConnectionDisplay();
    throw err;
  }
}

async function sendPlcIpToEsp() {
  if (!isValidIp(espIp) || !isValidIp(plcIp)) {
    console.warn("ESP32 atau PLC IP tidak valid, tidak dikirim.");
    return;
  }

  try {
    const response = await fetch(`http://${espIp}/write`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plcIP: plcIp })
    });

    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const result = await response.json();
    plcConnected = !!result.plcConnected;
    updateConnectionDisplay();
    console.log("IP PLC dikirim:", plcIp, "Status:", plcConnected);
  } catch (err) {
    plcConnected = false;
    updateConnectionDisplay();
    console.error("Gagal kirim IP PLC:", err);
  }
}

async function updateStatus() {
    if (!espIp) return;
    
    const now = Date.now();
    const timeSinceLastSuccess = now - lastSuccessTime;

    if (timeSinceLastSuccess > GRACE_PERIOD) {
        document.getElementById("esp32-status").textContent = "ESP32: Loading...";
        document.getElementById("esp32-status").style.color = "orange";
    }

    clearTimeout(loadingTimeout);
    loadingTimeout = setTimeout(() => {
        espConnected = false;
        plcConnected = false;
        updateConnectionDisplay();
    }, 3000);

    try {
        const response = await fetch(`http://${espIp}/read`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        clearTimeout(loadingTimeout);

        espConnected = true;
        plcConnected = !!data.plcConnected;
        updateConnectionDisplay();

        // Cari mode aktif pertama (prioritas M3 > M4 > ... > M8)
        let activeMode = null;
        for (const id of modeCoils) {
            if (data[indicatorMapping[id]]) {
                activeMode = id;
                break;
            }
        }

        // Update tampilan semua mode coils
        modeCoils.forEach(id => {
            const btn = document.getElementById(id);
            // Hanya aktif jika ini adalah mode aktif yang terdeteksi
            const isActive = (id === activeMode);
            btn.classList.toggle("active", isActive);
            btn.classList.toggle("dimmed", !isActive);
        });

        // Update control coils dan indikator lainnya
        controlCoils.forEach(id => {
            const btn = document.getElementById(id);
            const isActive = !!data[indicatorMapping[id]];
            btn.classList.toggle("active", isActive);
        });

        Object.entries(indicatorMapping).forEach(([btnId, indId]) => {
            if (modeCoils.includes(btnId) || controlCoils.includes(btnId)) return;
            const el = document.getElementById(`${indId}-indicator`);
            if (el) el.classList.toggle("active", !!data[indId]);
        });

        Object.entries(outputIndicators).forEach(([id, el]) => {
            el.classList.toggle("active", !!data[id]);
        });

        document.getElementById("control-section").style.display = activeMode ? "block" : "none";
    } catch (err) {
        clearTimeout(loadingTimeout);
        espConnected = false;
        plcConnected = false;
        updateConnectionDisplay();
        console.error("updateStatus error:", err);
    }
}

function updateConnectionDisplay() {
    lastSuccessTime = Date.now();
    const espText = document.getElementById("esp32-status");
    const plcText = document.getElementById("plc-status");

    espText.textContent = `ESP32: ${espConnected ? "Terhubung" : "Terputus"}`;
    espText.style.color = espConnected ? "green" : "red";

    plcText.textContent = `PLC: ${plcConnected ? "Terhubung" : "Terputus"}`;
    plcText.style.color = plcConnected ? "green" : "red";

    const buttons = document.querySelectorAll(".btn");
    buttons.forEach(btn => {
        btn.classList.toggle("disconnected", !(espConnected && plcConnected));
        btn.disabled = !(espConnected && plcConnected);
    });
}

// Inisialisasi
updateStatus();
setInterval(updateStatus, 750);
