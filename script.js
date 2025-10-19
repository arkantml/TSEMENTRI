import { anggota } from "./array.js";
const container = document.getElementById("cardContainer"); 
const filterAngkatan = document.getElementById("filterAngkatan");
const searchInput = document.getElementById("searchInput");


const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");
const modalNama = document.getElementById("modalNama");
const modalType = document.getElementById("modalType")
const modalKelas = document.getElementById("modalKelas");
const modalNisn = document.getElementById("modalNISN");
const modalEmail = document.getElementById("modalEmail");
const modalStatus = document.getElementById("modalStatus")
const modalNsm = document.getElementById("modalNsm");
const modalBadge = document.getElementById("modalBadge");
const modalFoto = document.getElementById("modalFoto");


function renderCards() {
    container.innerHTML = "";
    const searchText = searchInput.value.toLowerCase();
    const selectedAngkatan = filterAngkatan.value;

    const filtered = anggota.filter(item => {
        const matchNama = item.nama.toLowerCase().includes(searchText);
        const matchAngkatan = selectedAngkatan === "all" ||
            (item.angkatan.includes(selectedAngkatan));
        return matchAngkatan && matchNama;
    });

    if (filtered.length === 0) {
        container.innerHTML = "<p class='col-span-full text-center text-gray-500'>Tidak ada hasil<p>";
        return;
    }


    filtered.forEach((item) => {
        const card = document.createElement("div");
        card.className = `rounded-xl shadow p-6 m-1 cursor-pointer hover:scale-105 transition 
      ${item.khusus ? "border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-900" : "bg-white dark:bg-gray-800"}`;

        card.innerHTML = `
      <h3 class="font-bold text-lg dark:text-white">${item.nama}</h3>
      <p class="text-gray-600 dark:text-gray-400">${item.type}</p>
      ${item.khusus ? `<span class="inline-block mt-2 px-2 py-1 text-xs rounded bg-yellow-400 text-black">Khusus</span>` : ""}
    `;

        card.addEventListener("click", () => {
            [modalKelas, modalNisn, modalNsm, modalBadge]
        .forEach(el => el.classList.remove("hidden"));
            modalNama.textContent = item.nama;
            modalType.textContent = item.type;
            modalEmail.textContent = "Email: " + item.email;
            modalStatus.textContent = "Status:" + item.status;

            if (item.tipe === "a") {
                modalNsm.textContent = "NSM: " + item.nsm;
                modalKelas.classList.add("hidden");
                modalNisn.classList.add("hidden");
            }
            else if (item.tipe === "b") {
                modalNsm.classList.add("hidden");
                modalKelas.classList.add("hidden");
                modalNisn.classList.add("hidden");
            }
            else {
                modalKelas.textContent = "kelas:" + item.kelas;
                modalNisn.textContent = "NISN:" + item.nisn
                modalBadge.classList.add("hidden");
                modalNsm.classList.add("hidden");
            }
            modalFoto.src = item.foto || "img/no profile.jpeg";
            modal.classList.remove("hidden");
            // animasi modal
            setTimeout(() => {
                modalContent.classList.remove("scale-95", "opacity-0");
                modalContent.classList.add("scale-100", "opacity-100");
            }, 10);
        });
        container.appendChild(card);

    });
}
function closeModalFn() {
    modalContent.classList.remove("scale-100", "opacity-100");
    modalContent.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
        modal.classList.add("hidden");
    }, 200);
}

document.addEventListener("DOMContentLoaded", () => { 
    const closeModal = document.getElementById("closeModal"); if (closeModal) 
        closeModal.addEventListener("click", closeModalFn); 
});

searchInput.addEventListener("input", renderCards);
filterAngkatan.addEventListener("change", renderCards);
renderCards();

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModalFn();
  }

});






