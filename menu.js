const burgerToggle = document.getElementById("burger-toggle");
const mobileMenu = document.getElementById("mobile-menu");
burgerToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
});

class MobileMenu {
    constructor() {
        this.burgerToggle = document.getElementById('burger-toggle');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.navLinks = this.mobileMenu ? this.mobileMenu.querySelectorAll('a[href]') : [];
        
        this.init();
    }

    init() {
        this.burgerToggle?.addEventListener('click', () => this.toggleMenu());
        
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        document.addEventListener('click', (e) => this.handleOutsideClick(e));
        
        window.addEventListener('resize', () => this.handleResize());
    }

    toggleMenu() {
        this.mobileMenu.classList.toggle('hidden');
        
        const isExpanded = !this.mobileMenu.classList.contains('hidden');
        this.burgerToggle.setAttribute('aria-expanded', isExpanded);
    }

    closeMenu() {
        this.mobileMenu.classList.add('hidden');
        this.burgerToggle.setAttribute('aria-expanded', 'false');
    }

    openMenu() {
        this.mobileMenu.classList.remove('hidden');
        this.burgerToggle.setAttribute('aria-expanded', 'true');
    }

    handleOutsideClick(e) {
        // Close menu jika klik di luar mobile menu dan burger toggle
        if (this.mobileMenu && !this.mobileMenu.classList.contains('hidden')) {
            const isClickInsideMenu = this.mobileMenu.contains(e.target);
            const isClickOnBurger = this.burgerToggle.contains(e.target);
            
            if (!isClickInsideMenu && !isClickOnBurger) {
                this.closeMenu();
            }
        }
    }

    handleResize() {
        if (window.innerWidth >= 768) { // md breakpoint
            this.closeMenu();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MobileMenu();

});
