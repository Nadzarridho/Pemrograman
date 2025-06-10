
    // // Anti-inspect
    // document.addEventListener("keydown", function (event) {
    //     if (event.ctrlKey && (event.key === "u" || event.key === "U" || event.key === "i" || event.key === "I" || event.key === "j" || event.key === "J")) {
    //         event.preventDefault();
    //         alert("Akses ini telah diblokir!");
    //     }
    //     if (event.key === "F12") {
    //         event.preventDefault();
    //     }
    // });

    document.getElementById("prfToggle").addEventListener("contextmenu", function (event) {
        event.preventDefault();
    });
    
    // Deklarasi
    let profileImg = document.querySelector(".navbar-profile");
    let header = document.getElementById("header");

    profileImg.addEventListener("mouseenter", function () {
        this.classList.add("hovered");
    });
    profileImg.addEventListener("mouseleave", function () {
        this.classList.remove("hovered");
    });

    // Klik profile
    
    const overlay = document.getElementById("overlay");
    const popups = {
        prf: document.getElementById("prfPopup"),
        mhs: document.getElementById("mhsPopup"),
        bgm: document.getElementById("bgmPopup"),
    };
    
    const toggles = {
        prf: document.getElementById("prfToggle"),
        mhs: document.getElementById("mhsToggle"),
        bgm: document.getElementById("bgmToggle"),
    };
    
    const closeButtons = document.querySelectorAll(".close-btn");
    
    let isPrfOpen = false; // Status khusus untuk profile popup
    
    function openPopup(type) {
        popups[type].classList.add("active");

        if (type === "prf") {
            isPrfOpen = true; // Flag untuk toggle
            header.style.transform = "translateY(0%)";
        } else {
            overlay.classList.add("active");
        }
    }
    
    function closePopup(type) {
        popups[type].classList.remove("active");
    
        if (type === "prf") {
            isPrfOpen = false;
            
        } else if (!popups.mhs.classList.contains("active") && !popups.bgm.classList.contains("active")) {
            overlay.classList.remove("active");
        }
    }
    
    // **Fungsi untuk menutup popup sesuai urutan (hanya menutup anaknya dulu)**
    function closePopupInOrder() {
        if (popups.bgm.classList.contains("active")) {
            closePopup("bgm");
        } else if (popups.mhs.classList.contains("active")) {
            closePopup("mhs");
        } else if (isPrfOpen) {
            closePopup("prf");
        }
    }
    
    // **Event Listener untuk membuka/toggle profile popup**
    toggles.prf.addEventListener("click", function (event) {
        event.stopPropagation(); 
        if (isPrfOpen) {
            closePopup("prf");
        } else {
            openPopup("prf");
        }
    });
    
    // **Event Listener untuk membuka popup lain**
    ["mhs", "bgm"].forEach(type => {
        toggles[type].addEventListener("click", function (event) {
            event.stopPropagation();
            openPopup(type);
        });
    });
    
    // **Tutup popup dengan tombol close (hanya anaknya)**
    closeButtons.forEach(btn => {
        btn.addEventListener("click", function (event) {
            event.stopPropagation();
            closePopupInOrder();
        });
    });
    
    // **Klik di luar popup untuk menutup anaknya terlebih dahulu**
    document.addEventListener("click", function (event) {
        if (!popups.prf.contains(event.target) && 
            !popups.mhs.contains(event.target) && 
            !popups.bgm.contains(event.target) &&
            !overlay.contains(event.target)) {
            closePopupInOrder();
        }
    });
    
    // **Mencegah popup tertutup jika diklik di dalamnya**
    Object.keys(popups).forEach(type => {
        popups[type].addEventListener("click", function (event) {
            event.stopPropagation();
        });
    });
    
    // **Escape Key untuk menutup popup dalam urutan yang benar**
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closePopupInOrder();
        }
    });        

    // Fitur BGM
    const bgm = document.getElementById("bgm");
    const musicList = {
        bgmSenang: "https://files.catbox.moe/cw0c48.mp3",
        bgmSantai: "https://files.catbox.moe/q6zpqv.mp3",
        bgmSuka: "https://files.catbox.moe/pf706k.mp3",
        bgmSuntuk: "https://files.catbox.moe/0rphri.mp3",
        bgmSedih: "https://files.catbox.moe/r93afv.mp3",
    };
    
    let activeButton = null; // Simpan tombol yang sedang aktif
    
    // Ambil semua tombol yang ada di daftar
    Object.keys(musicList).forEach(id => {
        const button = document.getElementById(id);
        
        button.addEventListener("click", function () {
            if (bgm.src.includes(musicList[id]) && !bgm.paused) {
                bgm.pause();
                bgm.src = ""; // Hentikan musik saat tombol diklik lagi
                button.classList.remove("bgmPlaying"); // Hapus efek aktif
                activeButton = null;
            } else {
                // Hentikan musik sebelumnya jika ada
                if (activeButton) {
                    activeButton.classList.remove("bgmPlaying");
                }
    
                bgm.src = musicList[id];
                bgm.play();
                button.classList.add("bgmPlaying"); // Tambahkan efek aktif
                activeButton = button;
            }
        });
    });


    // Deklarasi variabel di navbar
    let modeElement = document.getElementById("modeToggle");
    let root = document.documentElement;
    let navbarIcon = document.getElementsByClassName("navbar-icon")[0];
    let savedMode = localStorage.getItem("theme");

    const svgGelap = `<svg xmlns="assets/icon/sun-2-svgrepo-com.svg" class="modeIcon"  viewBox="0 0 24 24">
    <path xmlns="http://www.w3.org/2000/svg" d="M12 22C17.5228 22 22 17.5228 22 12C22 11.5373 21.3065 11.4608 21.0672 11.8568C19.9289 13.7406 17.8615 15 15.5 15C11.9101 15 9 12.0899 9 8.5C9 6.13845 10.2594 4.07105 12.1432 2.93276C12.5392 2.69347 12.4627 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
    stroke="currentColor" fill="currentColor"/></svg>`;
    const svgTerang =  `<svg xmlns="assets/icon/sun-2-svgrepo-com.svg" class="modeIcon"  viewBox="0 0 24 24">
    <path xmlns="http://www.w3.org/2000/svg" d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z"/>
    <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V4C12.75 4.41421 12.4142 4.75 12 4.75C11.5858 4.75 11.25 4.41421 11.25 4V2C11.25 1.58579 11.5858 1.25 12 1.25ZM3.66865 3.71609C3.94815 3.41039 4.42255 3.38915 4.72825 3.66865L6.95026 5.70024C7.25596 5.97974 7.2772 6.45413 6.9977 6.75983C6.7182 7.06553 6.2438 7.08677 5.9381 6.80727L3.71609 4.77569C3.41039 4.49619 3.38915 4.02179 3.66865 3.71609ZM20.3314 3.71609C20.6109 4.02179 20.5896 4.49619 20.2839 4.77569L18.0619 6.80727C17.7562 7.08677 17.2818 7.06553 17.0023 6.75983C16.7228 6.45413 16.744 5.97974 17.0497 5.70024L19.2718 3.66865C19.5775 3.38915 20.0518 3.41039 20.3314 3.71609ZM1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H4C4.41421 11.25 4.75 11.5858 4.75 12C4.75 12.4142 4.41421 12.75 4 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12ZM19.25 12C19.25 11.5858 19.5858 11.25 20 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H20C19.5858 12.75 19.25 12.4142 19.25 12ZM17.0255 17.0252C17.3184 16.7323 17.7933 16.7323 18.0862 17.0252L20.3082 19.2475C20.6011 19.5404 20.601 20.0153 20.3081 20.3082C20.0152 20.6011 19.5403 20.601 19.2475 20.3081L17.0255 18.0858C16.7326 17.7929 16.7326 17.3181 17.0255 17.0252ZM6.97467 17.0253C7.26756 17.3182 7.26756 17.7931 6.97467 18.086L4.75244 20.3082C4.45955 20.6011 3.98468 20.6011 3.69178 20.3082C3.39889 20.0153 3.39889 19.5404 3.69178 19.2476L5.91401 17.0253C6.2069 16.7324 6.68177 16.7324 6.97467 17.0253ZM12 19.25C12.4142 19.25 12.75 19.5858 12.75 20V22C12.75 22.4142 12.4142 22.75 12 22.75C11.5858 22.75 11.25 22.4142 11.25 22V20C11.25 19.5858 11.5858 19.25 12 19.25Z"/
    stroke="currentColor" fill="currentColor"/></svg>`
    
    // Perubahan antar mode
    function applyMode(mode) {
        if (mode === "gelap") {
            modeElement.innerHTML = svgGelap + "      Tampilan: Gelap";
            root.style.setProperty("--warna-utama", "#191919");
            root.style.setProperty("--warna-kedua", "#fefefe");
            root.style.setProperty("--warna-aksen", "#646464")
            navbarIcon.style.filter = "brightness(0) invert(1)";
            document.body.classList.add("dark-mode");
            document.body.classList.remove("light-mode");
        } else {
            modeElement.innerHTML = svgTerang + "Tampilan: Terang";
            root.style.setProperty("--warna-utama", "#fefefe");
            root.style.setProperty("--warna-kedua", "#191919");
            root.style.setProperty("--warna-aksen", "#dbdbdb")
            navbarIcon.style.filter = "brightness(0)";
            document.body.classList.add("light-mode");
            document.body.classList.remove("dark-mode");
        }
    }

    // Referensi mode
    applyMode(savedMode || "terang");
    modeElement.onclick = function () {
        let newMode = (modeElement.innerText === "Tampilan: Terang") ? "gelap" : "terang";
        localStorage.setItem("theme", newMode);
        applyMode(newMode);
    };

    // Fungsi disko
    let clickCount = 0;
    let timer;
    let discoTimer;
    let lastMode = "terang"; 
    
    document.getElementById("modeToggle").addEventListener("click", function () {
        clickCount++;
    
        if (!timer) {
            timer = setTimeout(() => {
                if (clickCount >= 10) {
                    activateDiscoMode();
                    closePopup("prf")
                } else {
                    lastMode = localStorage.getItem("theme") || "terang";
                    applyMode(lastMode); 
                }
                clickCount = 0;
                clearTimeout(timer);
                timer = null;
            }, 1500); 
        }
    });

    // Fungsi tanggalan
    function updateTime() {
    
    // Deklarasi konstanta (referensi)
        const now = new Date();
        const timeOptions = { 
            hour: "2-digit", 
            minute: "2-digit", 
            second: "2-digit", 
            hour12: false 
        };
        const time = now.toLocaleTimeString("id-ID", timeOptions) + " WIB";
        const dateOptions = { 
            weekday: "long", 
            day: "numeric", 
            month: "long", 
            year: "numeric" 
        };
        const date = now.toLocaleDateString("id-ID", dateOptions);

        // Menampilkan di elemen footer
        document.getElementById("footer-clock").innerHTML = `${time}`;
        document.getElementById("footer-date").innerHTML = `${date}`;
    }
        // Pemanggilan dan update
        updateTime();
        setInterval(updateTime, 1000);

    function setActiveTabButton(tabId) {
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === String(tabId)) {
            btn.classList.add('active');
            }
        });
        }

    function setEqualHeight() {
        document.querySelectorAll(".container-body").forEach(body => {
            let containers = Array.from(body.children).filter(el => el.classList.contains("container-content"));
            let maxHeight = 0;
    
            // Reset tinggi agar tidak menyusut saat dihitung ulang
            containers.forEach(container => {
                container.style.height = "auto";
            });
    
            // Cari tinggi maksimum dari semua container-content dalam satu .container-body
            containers.forEach(container => {
                let height = container.offsetHeight;
                maxHeight = Math.max(maxHeight, height);
            });
    
            // Terapkan tinggi maksimum ke semua container-content di dalam container-body yang sama
            containers.forEach(container => {
                container.style.height = maxHeight + "px";
            });
        });
    }
    
    function scriptContainer() {
    window.addEventListener("load", setEqualHeight);
    window.addEventListener("resize", setEqualHeight);
    document.querySelectorAll(".sakelar").forEach(button => {
        button.addEventListener("click", function() {
            setEqualHeight();
        });
    });
    }

      
