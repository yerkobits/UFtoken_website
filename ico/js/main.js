// ============================================
// Main JavaScript
// ============================================

(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initNavigation();
        initScrollAnimations();
        initSmoothScroll();
        initNavbarScroll();
    });

    // ============================================
    // Navigation
    // ============================================
    function initNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        const navLinks = document.querySelectorAll('.nav-link');

        if (navToggle) {
            navToggle.addEventListener('click', function() {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Close menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        });

        // Update active nav link on scroll
        window.addEventListener('scroll', updateActiveNavLink);
        updateActiveNavLink();
    }

    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        let current = '';
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = sectionId;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // ============================================
    // Navbar Scroll Effect
    // ============================================
    function initNavbarScroll() {
        const navbar = document.getElementById('navbar');

        window.addEventListener('scroll', throttle(function() {
            if (window.pageYOffset > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, 10));
    }

    // ============================================
    // Smooth Scroll
    // ============================================
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                if (href === '#' || href === '#!') {
                    e.preventDefault();
                    return;
                }

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();
                    const offsetTop = target.offsetTop - 80;

                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ============================================
    // Scroll Animations
    // ============================================
    function initScrollAnimations() {
        if (!('IntersectionObserver' in window)) {
            animateOnScrollFallback();
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const delay = element.dataset.delay || 0;

                    setTimeout(function() {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }, delay);

                    observer.unobserve(element);
                }
            });
        }, observerOptions);

        // Observe all fade-in-up elements
        document.querySelectorAll('.fade-in-up[data-delay]').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            observer.observe(el);
        });
    }

    function animateOnScrollFallback() {
        const animatedElements = document.querySelectorAll('.fade-in-up[data-delay]');

        function checkVisibility() {
            animatedElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

                if (isVisible) {
                    const delay = parseInt(el.dataset.delay) || 0;
                    setTimeout(function() {
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, delay);
                }
            });
        }

        window.addEventListener('scroll', throttle(checkVisibility, 100));
        checkVisibility();
    }

    // ============================================
    // Utility Functions
    // ============================================
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ============================================
    // Create canvas elements for Three.js
    // ============================================
    function createCanvasElements() {
        // Create particles canvas
        const particlesContainer = document.getElementById('particles-canvas');
        if (particlesContainer && !particlesContainer.querySelector('canvas')) {
            const particlesCanvas = document.createElement('canvas');
            particlesCanvas.id = 'particles-canvas';
            particlesContainer.appendChild(particlesCanvas);
        }

        // Create coin canvas
        const coinContainer = document.getElementById('coin-canvas');
        if (coinContainer && !coinContainer.querySelector('canvas')) {
            const coinCanvas = document.createElement('canvas');
            coinCanvas.id = 'coin-canvas';
            coinContainer.appendChild(coinCanvas);
        }
    }

    // Create canvas elements when DOM is ready
    document.addEventListener('DOMContentLoaded', createCanvasElements);
})();

