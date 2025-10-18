class Carousel {
    constructor() {
        this.carousel = document.getElementById('carousel');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.indicators = document.querySelectorAll('.indicator');
        
        if (!this.carousel) {
            console.error('Carousel element not found!');
            return;
        }
        
        this.slides = this.carousel.children;
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.autoPlayInterval = null;
        this.isAutoPlaying = true;
        
        this.init();
    }
    
    init() {
        // Initialize first slide
        this.updateIndicators();
        
        // Event listeners untuk navigation buttons
        this.prevBtn?.addEventListener('click', () => this.prev());
        this.nextBtn?.addEventListener('click', () => this.next());
        
        // Event listeners untuk indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Auto play
        this.startAutoPlay();
        
        // Pause on hover
        this.carousel.parentElement.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.carousel.parentElement.addEventListener('mouseleave', () => {
            if (this.isAutoPlaying) {
                this.startAutoPlay();
            }
        });
        
        // Touch/swipe support untuk mobile
        this.setupTouchEvents();
    }
    
    showSlide(index) {
        this.currentSlide = (index + this.totalSlides) % this.totalSlides;
        this.carousel.style.transform = `translateX(-${this.currentSlide * 100}%)`;
        this.updateIndicators();
    }
    
    next() {
        this.showSlide(this.currentSlide + 1);
    }
    
    prev() {
        this.showSlide(this.currentSlide - 1);
    }
    
    goToSlide(index) {
        this.showSlide(index);
    }
    
    updateIndicators() {
        this.indicators.forEach((indicator, index) => {
            if (index === this.currentSlide) {
                indicator.classList.add('bg-white');
                indicator.classList.remove('bg-white/50');
            } else {
                indicator.classList.remove('bg-white');
                indicator.classList.add('bg-white/50');
            }
        });
    }
    
    startAutoPlay() {
        this.stopAutoPlay(); // Clear existing interval
        this.autoPlayInterval = setInterval(() => this.next(), 5000); // Ganti slide setiap 5 detik
        this.isAutoPlaying = true;
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        this.isAutoPlaying = false;
    }
    
    setupTouchEvents() {
        let startX = 0;
        let endX = 0;
        
        this.carousel.parentElement.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            this.stopAutoPlay();
        });
        
        this.carousel.parentElement.addEventListener('touchmove', (e) => {
            endX = e.touches[0].clientX;
        });
        
        this.carousel.parentElement.addEventListener('touchend', () => {
            const diff = startX - endX;
            const swipeThreshold = 50;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.next(); // Swipe kiri
                } else {
                    this.prev(); // Swipe kanan
                }
            }
            
            if (this.isAutoPlaying) {
                this.startAutoPlay();
            }
        });
    }
    
    // Destroy method untuk cleanup
    destroy() {
        this.stopAutoPlay();
        this.prevBtn?.removeEventListener('click', () => this.prev());
        this.nextBtn?.removeEventListener('click', () => this.next());
        
        this.indicators.forEach((indicator, index) => {
            indicator.removeEventListener('click', () => this.goToSlide(index));
        });
    }
}

// Initialize carousel saat DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    new Carousel();
});

// Export untuk akses global jika diperlukan
window.Carousel = Carousel;