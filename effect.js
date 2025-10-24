document.addEventListener('DOMContentLoaded', () => {
    // Buat "mata" pengamat (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        // Loop melalui setiap elemen yang diamati
        entries.forEach(entry => {
            // 'isIntersecting' bernilai true jika elemennya terlihat di layar
            if (entry.isIntersecting) {
                // Tambahkan kelas 'visible' untuk memicu animasi
                entry.target.classList.add('visible');
                // Hentikan pengamatan pada elemen ini agar animasi tidak berulang
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Memicu saat 10% dari elemen terlihat
    });

    // Ambil SEMUA elemen yang ingin kita animasikan
    const elementsToReveal = document.querySelectorAll('.reveal-on-scroll');

    // Suruh "mata" untuk mulai mengamati setiap elemen tersebut
    elementsToReveal.forEach(el => {
        observer.observe(el);
    });
});