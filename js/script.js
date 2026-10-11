const $ = (s) => document.querySelector(s);
const page = document.body.dataset.page;
const user = JSON.parse(sessionStorage.getItem("user") || "null");

// Proteksi halaman: wajib login
if (page !== "login" && !user) location.href = "index.html";

const MENU = [
    { href: "dashboard.html", ico: "DB", label: "Dashboard", key: "dashboard" },
    { href: "stok.html", ico: "BA", label: "Informasi Bahan Ajar", key: "stok" },
    { href: "tracking.html", ico: "TR", label: "Tracking Pengiriman", key: "tracking" },
    {
        ico: "LP", label: "Laporan", children: [
            { ico: "MP", label: "Monitoring Progress DO" },
            { ico: "RK", label: "Rekap Bahan Ajar" }]
    },
    { ico: "HT", label: "Histori Transaksi" }
];
const soon = () => alert("Fitur ini belum tersedia pada Tugas Praktik 1.");

/* Modal */
function initModal() {
    document.querySelectorAll("[data-open]").forEach((b) =>
        b.addEventListener("click", () => $("#" + b.dataset.open).classList.add("show")));
    document.querySelectorAll(".modal-bg").forEach((m) => {
        m.addEventListener("click", (e) => {
            if (e.target === m || e.target.hasAttribute("data-close")) m.classList.remove("show");
        });
    });
}

/* Login */
function initLogin() {
    initModal();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    $("#formLogin").addEventListener("submit", (e) => {
        e.preventDefault();
        const em = $("#email").value.trim().toLowerCase();
        const pw = $("#password").value;
        if (!em || !pw) return alert("Email dan password wajib diisi.");
        const u = dataPengguna.find((x) => x.email.toLowerCase() === em && x.password === pw);
        if (!u) return alert("email/password yang anda masukkan salah");
        sessionStorage.setItem("user", JSON.stringify(u));
        location.href = "dashboard.html";
    });

    $("#formLupa").addEventListener("submit", (e) => {
        e.preventDefault();
        const em = $("#emailLupa").value.trim().toLowerCase();
        if (!emailRe.test(em)) return alert("Format email tidak valid.");
        if (!dataPengguna.some((x) => x.email.toLowerCase() === em))
            return alert("Email tidak terdaftar.");
        alert("Tautan reset password telah dikirim ke " + em + " (simulasi).");
        e.target.reset();
        $("#modalLupa").classList.remove("show");
    });

    $("#formDaftar").addEventListener("submit", (e) => {
        e.preventDefault();
        const nama = $("#regNama").value.trim();
        const em = $("#regEmail").value.trim().toLowerCase();
        const pw = $("#regPass").value;
        if (!nama || !em || !pw) return alert("Semua kolom wajib diisi.");
        if (!emailRe.test(em)) return alert("Format email tidak valid.");
        if (pw.length < 6) return alert("Password minimal 6 karakter.");
        if (dataPengguna.some((x) => x.email.toLowerCase() === em))
            return alert("Email sudah terdaftar.");
        dataPengguna.push({ id: dataPengguna.length + 1, nama, email: em, password: pw, role: "UPBJJ-UT", lokasi: "-" });
        alert("Pendaftaran berhasil! Silakan login. (Data hanya tersimpan sementara di memori)");
        e.target.reset();
        $("#modalDaftar").classList.remove("show");
    });
}

/* Sidebar & Greeting */
function renderSidebar() {
    const nav = MENU.map((m) => {
        if (m.children) {
            return `<button type="button" class="toggle-lap"><span class="ico-s">${m.ico}</span> ${m.label}</button>
        <div id="subLaporan" hidden>${m.children
                    .map((c) => `<button type="button" class="sub soon"><span class="ico-s">${c.ico}</span> ${c.label}</button>`).join("")}</div>`;
        }
        if (!m.href) return `<button type="button" class="soon"><span class="ico-s">${m.ico}</span> ${m.label}</button>`;
        return `<a href="${m.href}" class="${m.key === page ? "active" : ""}"><span class="ico-s">${m.ico}</span> ${m.label}</a>`;
    }).join("");

    $("#sidebar").innerHTML = `
    <div class="brand">SITTA</div>
    <nav class="nav">${nav}</nav>
    <div class="user-box"><b class="user-name">${user.nama}</b><span class="muted">${user.role} - ${user.lokasi}</span>
      <button class="btn btn-outline" id="btnLogout">Keluar</button></div>`;

    document.querySelectorAll(".soon").forEach((b) => b.addEventListener("click", soon));
    document.querySelector(".toggle-lap").addEventListener("click", () => {
        const s = $("#subLaporan"); s.hidden = !s.hidden;
    });
    $("#btnLogout").addEventListener("click", () => {
        if (confirm("Yakin ingin keluar?")) { sessionStorage.removeItem("user"); location.href = "index.html"; }
    });
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 11) return "Selamat Pagi";
    if (h < 15) return "Selamat Siang";
    if (h < 18) return "Selamat Sore";
    return "Selamat Malam";
}

function initDashboard() {
    $("#greeting").textContent = `${getGreeting()}, ${user.nama.split(" ")[0]}!`;
    $("#userInfo").textContent = `${user.role} - ${user.lokasi}`;
    const items = [
        { href: "stok.html", ico: "BA", label: "Informasi Bahan Ajar" },
        { href: "tracking.html", ico: "TR", label: "Tracking Pengiriman" },
        { ico: "MP", label: "Monitoring Progress DO", note: "Laporan" },
        { ico: "RK", label: "Rekap Bahan Ajar", note: "Laporan" },
        { ico: "HT", label: "Histori Transaksi" }
    ];
    $("#menuGrid").innerHTML = items.map((i) =>
        `<a class="menu-card" ${i.href ? `href="${i.href}"` : 'href="#" data-soon'}>
      <span class="ico">${i.ico}</span>${i.label}
      ${i.note ? `<br><small class="muted">${i.note}</small>` : ""}</a>`).join("");
    document.querySelectorAll("[data-soon]").forEach((a) =>
        a.addEventListener("click", (e) => { e.preventDefault(); soon(); }));
}

/* Tracking */
function initTracking() {
    const progressMap = { "Dikirim": 25, "Dalam Perjalanan": 60, "Selesai": 100 };
    $("#formTracking").addEventListener("submit", (e) => {
        e.preventDefault();
        const no = $("#nomorDO").value.trim();
        $("#hasil").hidden = true;
        if (!no) { $("#nomorDO").classList.add("error"); return alert("Nomor Delivery Order wajib diisi."); }
        if (!/^\d+$/.test(no)) { $("#nomorDO").classList.add("error"); return alert("Nomor DO hanya boleh berisi angka."); }
        $("#nomorDO").classList.remove("error");

        const d = dataTracking[no];
        if (!d) return alert("Nomor DO " + no + " tidak ditemukan.");

        $("#tNama").textContent = d.nama;
        $("#tDO").textContent = d.nomorDO;
        $("#tStatus").textContent = d.status;
        $("#tStatus").className = "badge " + d.status.toLowerCase().split(" ")[0];
        $("#tEkspedisi").textContent = d.ekspedisi;
        $("#tTanggal").textContent = new Date(d.tanggalKirim).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
        $("#tPaket").textContent = d.paket;
        $("#tTotal").textContent = d.total;
        $("#timeline").innerHTML = [...d.perjalanan].reverse()
            .map((p) => `<li><time>${p.waktu}</time>${p.keterangan}</li>`).join("");

        $("#bar").style.width = "0";
        $("#hasil").hidden = false;
        setTimeout(() => ($("#bar").style.width = (progressMap[d.status] || 10) + "%"), 50);
    });
}

/* Stok */
function barisStok(b, baru = false) {
    const tr = document.createElement("tr");
    if (baru) tr.className = "baru";
    const cover = b.cover
        ? `<img src="${b.cover}" alt="${b.namaBarang}" onerror="this.style.visibility='hidden'">`
        : `<span class="cover-ph">${b.jenisBarang}</span>`;
    tr.innerHTML = `<td>${cover}</td><td>${b.kodeLokasi}</td><td>${b.kodeBarang}</td>
    <td>${b.namaBarang}</td><td>${b.jenisBarang}</td><td>${b.edisi}</td>
    <td class="${b.stok < 200 ? "stok-low" : ""}">${b.stok}</td>`;
    return tr;
}

function initStok() {
    const tbody = $("#tbodyStok");
    dataBahanAjar.forEach((b) => tbody.appendChild(barisStok(b)));

    $("#formStok").addEventListener("submit", (e) => {
        e.preventDefault();
        const f = ["kodeLokasi", "kodeBarang", "namaBarang", "jenisBarang", "edisi", "stok"];
        const v = {};
        let ok = true;
        f.forEach((id) => {
            const el = $("#" + id);
            v[id] = el.value.trim();
            const kosong = v[id] === "";
            el.classList.toggle("error", kosong);
            if (kosong) ok = false;
        });
        if (!ok) return alert("Semua kolom wajib diisi.");
        if (Number(v.stok) < 0 || Number(v.edisi) < 1) return alert("Stok tidak boleh negatif dan edisi minimal 1.");
        if (dataBahanAjar.some((b) => b.kodeBarang === v.kodeBarang && b.kodeLokasi === v.kodeLokasi))
            return alert("Kombinasi kode lokasi & kode barang sudah ada.");

        const baru = { ...v, stok: Number(v.stok), cover: "" };
        dataBahanAjar.push(baru);
        tbody.appendChild(barisStok(baru, true));
        e.target.reset();
    });
}

/* Router */
if (page === "login") initLogin();
else {
    renderSidebar();
    if (page === "dashboard") initDashboard();
    if (page === "tracking") initTracking();
    if (page === "stok") initStok();
}