const kataSpans = document.querySelectorAll("span[tipe]");
const modalspan = document.getElementById("modalSpan");
const modalContentspan = document.getElementById("modalContentspan");
const closeModalspan = document.getElementById("closeModalspan");
const modalNamaspan = document.getElementById("modalNamaSpan");
const modalTypespan = document.getElementById("modalTypeSpan");
const modalStatusspan = document.getElementById("modalStatusSpan");
const modalEmailspan = document.getElementById("modalEmailSpan");
const modalNsmspan = document.getElementById("modalNsmSpan");
const modalBadgespan = document.getElementById("modalBadgeSpan");
kataSpans.forEach(span => {
    span.addEventListener("click", () => {
        const targetTipe = span.getAttribute("tipe");
        const item = anggota.find(a => a.tipe === targetTipe);

        if (!item) return; // kalau tidak ketemu, jangan lakukan apa-apa

        modalNamaspan.textContent = item.nama;
        modalTypespan.textContent = item.type;
        modalEmailspan.textContent = "Email: " + (item.email || "-");
        modalStatusspan.textContent = "Status: " + (item.status || "-");
        modalFoto.src = item.foto || "img/default.jpg";

        // Atur isi lainnya sesuai tipe
        if (item.tipe === "a") {
            modalNsmspan.textContent = "NSM: " + item.nsm;
        } else if (item.tipe === "b") {
            modalNsmspan.classList.add("hidden");
            modalBadgespan.classList.add("hidden");
        }
        // Tampilkan modal
        modalspan.classList.remove("hidden");
        setTimeout(() => {
            modalContentspan.classList.remove("scale-95", "opacity-0");
            modalContentspan.classList.add("scale-100", "opacity-100");
        }, 10);
    });
});
function closeModalspanFn() {
    modalContentspan.classList.remove("scale-100", "opacity-100");
    modalContentspan.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
        modalspan.classList.add("hidden");
    }, 200);
}

closeModalspan.addEventListener("click", closeModalspanFn);
modalspan.addEventListener("click", (e) => {
    if (e.target === modalspan) closeModalspanFn();
});

