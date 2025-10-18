document.addEventListener('DOMContentLoaded', () => {
    // ===== BAGIAN 0: KONFIGURASI SUPABASE =====
    
    // Ganti dengan URL & Kunci Supabase Anda
    const SUPABASE_URL = 'https://rylytlvqxcsrjnmvqnkq.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHl0bHZxeGNzcmpubXZxbmtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MjUyMDAsImV4cCI6MjA3NTQwMTIwMH0.dJAm0Irq_d67Sw52HR-779gl4BFyHM7k8v7_-MetVRo';
    // Ganti dengan UID Admin Anda
    const ADMIN_UID = 'bdf1a1eb-0c42-4845-814f-161fd6c4f551';
    
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // ===== PENGATURAN AWAL & ELEMEN =====
    const articleGrid = document.getElementById('article-grid');
    const addArticleForm = document.getElementById('add-article-form');
    const formSection = document.getElementById('form-section');
    const formTitle = document.getElementById('form-title');
    const submitButton = document.getElementById('submit-button');
    const articleIdInput = document.getElementById('articleId');
    const categoryFiltersContainer = document.getElementById('category-filters');
    const authContainer = document.getElementById('auth-container');
    const modalContainer = document.getElementById('modal-container');
    const authForm = document.getElementById('auth-form');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const signupBtn = document.getElementById('signup-btn');
    const errorMessage = document.getElementById('error-message');
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    const imageUrlInput = document.getElementById('imageUrl');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const toastContainer = document.getElementById('toast-container'); // Elemen baru untuk toast

    let articles = [];
    let activeFilter = 'all';
    let currentUser = null;

    // Variabel untuk fitur lockout
    const MAX_LOGIN_ATTEMPTS = 4;
    const BASE_LOCKOUT_MINUTES = 5;
    let lockoutTimerInterval = null;

    // ===== FUNGSI OTENTIKASI & UI =====
    
    // FUNGSI BARU UNTUK MENAMPILKAN TOAST
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast p-4 rounded-lg shadow-lg text-white font-semibold`;
        
        if (type === 'success') {
            toast.classList.add('bg-green-500');
        } else { // error
            toast.classList.add('bg-red-500');
        }

        toast.textContent = message;
        toastContainer.appendChild(toast);

        // Hapus toast setelah 5 detik
        setTimeout(() => {
            toast.remove();
        }, 5000);
    };

    const startLockoutTimer = (endTime) => {
        loginSubmitBtn.disabled = true;
        signupBtn.disabled = true;

        if (lockoutTimerInterval) clearInterval(lockoutTimerInterval);

        lockoutTimerInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                clearInterval(lockoutTimerInterval);
                errorMessage.textContent = 'Anda bisa mencoba login kembali.';
                loginSubmitBtn.disabled = false;
                signupBtn.disabled = false;
                localStorage.removeItem('lockoutEndTime');
                localStorage.removeItem('lockoutDuration');
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            errorMessage.textContent = `Terlalu banyak percobaan. Coba lagi dalam ${minutes}m ${seconds}s`;
        }, 1000);
    };

    const handleLogin = async (email, password) => {
        const lockoutEndTime = parseInt(localStorage.getItem('lockoutEndTime') || '0');
        if (new Date().getTime() < lockoutEndTime) {
            startLockoutTimer(lockoutEndTime);
            return;
        }

        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            let attempts = parseInt(localStorage.getItem('loginAttempts') || '0') + 1;
            
            if (attempts >= MAX_LOGIN_ATTEMPTS) {
                let currentDuration = parseInt(localStorage.getItem('lockoutDuration') || '0');
                const newDuration = currentDuration + BASE_LOCKOUT_MINUTES;
                const newEndTime = new Date().getTime() + newDuration * 60 * 1000;

                localStorage.setItem('lockoutEndTime', newEndTime);
                localStorage.setItem('lockoutDuration', newDuration);
                localStorage.setItem('loginAttempts', '0');

                startLockoutTimer(newEndTime);
            } else {
                localStorage.setItem('loginAttempts', attempts);
                errorMessage.textContent = `Email atau sandi salah. Sisa percobaan: ${MAX_LOGIN_ATTEMPTS - attempts}`;
            }
        } else {
            localStorage.removeItem('loginAttempts');
            localStorage.removeItem('lockoutEndTime');
            localStorage.removeItem('lockoutDuration');
            hideModal();
            showToast('Login berhasil!');
        }
    };

    const handleSignUp = async (email, password) => {
        const { error } = await supabaseClient.auth.signUp({ email, password });
        if (error) {
            errorMessage.textContent = error.message;
        } else {
            document.getElementById('modal-message').textContent = 'Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.';
            authForm.classList.add('hidden');
        }
    };

    const handleSignOut = async () => {
        await supabaseClient.auth.signOut();
        showToast('Anda berhasil logout.');
    };

    const hideModal = () => modalContainer.classList.add('hidden');

    const showModal = () => {
        const lockoutEndTime = parseInt(localStorage.getItem('lockoutEndTime') || '0');
        if (new Date().getTime() < lockoutEndTime) {
            startLockoutTimer(lockoutEndTime);
        } else {
            errorMessage.textContent = '';
            loginSubmitBtn.disabled = false;
            signupBtn.disabled = false;
        }
        
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const confirmationButtons = document.getElementById('confirmation-buttons');
        
        modalTitle.textContent = 'Masuk ke Akun Anda';
        modalMessage.textContent = '';
        authForm.classList.remove('hidden');
        if (confirmationButtons) confirmationButtons.classList.add('hidden');
        modalContainer.classList.remove('hidden');
    };
    
    const showConfirmationModal = (onConfirm) => {
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const confirmationButtons = document.getElementById('confirmation-buttons');
        
        authForm.classList.add('hidden');
        if (confirmationButtons) confirmationButtons.classList.remove('hidden');
        modalTitle.textContent = 'Konfirmasi Penghapusan';
        modalMessage.textContent = 'Apakah Anda yakin ingin menghapus artikel ini?';
        modalContainer.classList.remove('hidden');

        const confirmBtn = document.getElementById('confirm-btn');
        const cancelBtn = document.getElementById('cancel-btn');

        if (confirmBtn) confirmBtn.onclick = () => {
            onConfirm();
            hideModal();
        };
        if (cancelBtn) cancelBtn.onclick = () => {
            hideModal();
            authForm.classList.remove('hidden');
            if (confirmationButtons) confirmationButtons.classList.add('hidden');
        };
    };
    
    const updateUI = (user) => {
        currentUser = user;
        if (user && user.id === ADMIN_UID) {
            authContainer.innerHTML = `<div class="flex items-center gap-4"><span class="text-sm text-gray-600">${user.email}</span><button id="logout-button" class="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700">Logout</button></div>`;
            formSection.classList.remove('hidden');
            document.getElementById('logout-button').addEventListener('click', handleSignOut);
        } else if (user) {
            authContainer.innerHTML = `<div class="flex items-center gap-4"><span class="text-sm text-gray-600">${user.email}</span><button id="logout-button" class="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700">Logout</button></div>`;
            formSection.classList.add('hidden');
            document.getElementById('logout-button').addEventListener('click', handleSignOut);
        } else {
            authContainer.innerHTML = `<button id="login-button" class="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">Login/Daftar</button>`;
            formSection.classList.add('hidden');
            const newLoginButton = document.getElementById('login-button');
            if (newLoginButton) newLoginButton.addEventListener('click', showModal);
        }
        renderArticles();
    };

    // ===== EVENT LISTENERS OTENTIKASI =====
    supabaseClient.auth.onAuthStateChange((event, session) => {
        updateUI(session ? session.user : null);
    });

    closeModalBtn.addEventListener('click', hideModal);

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin(document.getElementById('email').value, document.getElementById('password').value);
    });

    signupBtn.addEventListener('click', () => {
        handleSignUp(document.getElementById('email').value, document.getElementById('password').value);
    });

    // ===== FUNGSI DATA & RENDER =====
    const loadingSpinnerHTML = `
        <div id="loading-spinner" class="col-span-full flex justify-center items-center py-20">
            <svg class="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    `;

    const loadArticles = async () => {
        articleGrid.innerHTML = loadingSpinnerHTML;
        try {
            const { data, error } = await supabaseClient.from('articles').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            articles = data;
            renderArticles();
        } catch (error) {
            console.error('Error memuat artikel:', error);
            articleGrid.innerHTML = `<p class="col-span-full text-center text-red-500">Gagal memuat artikel. Coba lagi nanti.</p>`;
        }
    };

    const renderCategoryFilters = () => {
        const categories = ['all', ...new Set(articles.map(article => article.category.toLowerCase()))];
        categoryFiltersContainer.innerHTML = '';
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = `category-btn capitalize px-4 py-2 text-sm font-semibold rounded-full border border-gray-300 transition-colors duration-300 hover:bg-blue-500 hover:text-white`;
            button.textContent = category;
            button.setAttribute('data-category', category);
            if (category === activeFilter) button.classList.add('active');
            button.addEventListener('click', () => {
                activeFilter = category;
                renderArticles();
            });
            categoryFiltersContainer.appendChild(button);
        });
    };

    const createCardElement = (article) => {
        const card = document.createElement('div');
        card.className = 'article-card bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden';
        card.setAttribute('data-id', article.id);

        const adminButtonsHTML = (currentUser && currentUser.id === ADMIN_UID) ? `
            <div class="absolute top-2 right-2 flex gap-2">
                <button class="edit-btn p-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                </button>
                <button class="delete-btn p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" /></svg>
                </button>
            </div>` : '';

        card.innerHTML = `
            <div class="relative">
                <img class="h-56 w-full object-cover" src="${article.imageUrl}" alt="${article.title}">
                ${adminButtonsHTML}
            </div>
            <div class="p-6">
                <p class="text-sm font-semibold text-blue-600 mb-2 capitalize">${article.category}</p>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">${article.title}</h3>
                <p class="text-gray-600 dark:text-gray-300 mb-4 text-base">${article.summary}</p>
                <button class="toggle-button flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                    <span>Pelajari Lebih Lanjut</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 transition-transform duration-300 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                </button>
            </div>
            <div class="expandable-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out">
                <div class="border-t border-gray-200 dark:border-gray-700 p-6 pt-4">
                    <p class="text-gray-700 dark:text-gray-300">${article.content}</p>
                </div>
            </div>`;
        return card;
    };

    const renderArticles = () => {
        articleGrid.innerHTML = '';
        const filteredArticles = articles.filter(article => activeFilter === 'all' || article.category.toLowerCase() === activeFilter);
        if (filteredArticles.length > 0) {
            filteredArticles.forEach(article => articleGrid.appendChild(createCardElement(article)));
        } else if (articles.length > 0) {
            articleGrid.innerHTML = `<p class="text-center text-gray-500 col-span-full">Tidak ada artikel dalam kategori '${activeFilter}'.</p>`;
        } else {
            articleGrid.innerHTML = `<p class="text-center text-gray-500 col-span-full">Belum ada artikel. Jadilah yang pertama membuat!</p>`;
        }
        renderCategoryFilters();
    };

    // ===== EVENT LISTENERS APLIKASI =====
    addArticleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        submitButton.disabled = true;
        submitButton.textContent = 'Menyimpan...';

        const id = articleIdInput.value;
        const articleData = {
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            summary: document.getElementById('summary').value,
            content: document.getElementById('content').value,
            imageUrl: imageUrlInput.value
        };

        try {
            let dbError;
            if (id) {
                const { error } = await supabaseClient.from('articles').update(articleData).eq('id', id);
                dbError = error;
            } else {
                const { error } = await supabaseClient.from('articles').insert([articleData]);
                dbError = error;
            }
            if (dbError) throw dbError;
            showToast(id ? 'Artikel berhasil diperbarui!' : 'Artikel baru berhasil ditambahkan!');
            resetForm();
            await loadArticles();
        } catch (error) {
            console.error('Terjadi kesalahan:', error.message);
            showToast(`Gagal menyimpan artikel: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = articleIdInput.value ? 'Simpan Perubahan' : 'Tambahkan Card';
        }
    });

    articleGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.article-card');
        if (!card) return;
        const id = parseInt(card.getAttribute('data-id'));
        if (e.target.closest('.toggle-button')) {
            const expandableContent = card.querySelector('.expandable-content');
            if (expandableContent.style.maxHeight) {
                expandableContent.style.maxHeight = null;
            } else {
                expandableContent.style.maxHeight = expandableContent.scrollHeight + "px";
            }
        } else if (currentUser && currentUser.id === ADMIN_UID && e.target.closest('.delete-btn')) {
            showConfirmationModal(async () => {
                card.classList.add('opacity-0', 'scale-95');
                setTimeout(async () => {
                    const { error } = await supabaseClient.from('articles').delete().eq('id', id);
                    if (error) {
                        console.error('Error saat menghapus artikel:', error);
                        showToast('Gagal menghapus artikel.', 'error');
                        card.classList.remove('opacity-0', 'scale-95');
                    } else {
                        showToast('Artikel berhasil dihapus.');
                        await loadArticles();
                    }
                }, 300);
            });
        } else if (currentUser && currentUser.id === ADMIN_UID && e.target.closest('.edit-btn')) {
            const articleToEdit = articles.find(a => a.id == id);
            populateFormForEdit(articleToEdit);
        }
    });
    
    const populateFormForEdit = (article) => {
        articleIdInput.value = article.id;
        document.getElementById('title').value = article.title;
        document.getElementById('category').value = article.category;
        document.getElementById('summary').value = article.summary;
        document.getElementById('content').value = article.content;
        
        imageUrlInput.value = article.imageUrl;
        imagePreview.src = article.imageUrl;
        imagePreviewContainer.classList.remove('hidden');

        formTitle.textContent = 'Edit Artikel';
        submitButton.textContent = 'Simpan Perubahan';
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const resetForm = () => {
        addArticleForm.reset();
        articleIdInput.value = '';
        formTitle.textContent = 'Tambah Artikel Baru';
        submitButton.textContent = 'Tambahkan Card';
        imagePreviewContainer.classList.add('hidden');
        imagePreview.src = '';
    };

    // ===== INISIALISASI APLIKASI =====
    loadArticles();
});

