/**
 * Eco Code Hackathon Website
 * Interactive JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initNavigation();
    initScrollEffects();
    initScheduleTabs();
    initFAQ();
    initCountdown();
    initStatsCounter();
    initRevealAnimations();
    initMouseGlow();
    initParallax();
});

/**
 * Navigation functionality
 */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Scroll-based effects
 */
function initScrollEffects() {
    const scrollIndicator = document.querySelector('.scroll-indicator');

    // Hide scroll indicator on scroll
    window.addEventListener('scroll', () => {
        if (scrollIndicator) {
            scrollIndicator.style.opacity = window.scrollY > 100 ? '0' : '1';
        }
    });

    // Parallax effect for hero
    const heroBg = document.querySelector('.hero-bg');
    window.addEventListener('scroll', () => {
        if (heroBg && window.scrollY < window.innerHeight) {
            heroBg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
        }
    });
}

/**
 * Schedule tabs functionality
 */
function initScheduleTabs() {
    const tabs = document.querySelectorAll('.schedule-tab');
    const days = document.querySelectorAll('.schedule-day');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetDay = tab.dataset.day;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active day
            days.forEach(day => {
                day.classList.remove('active');
                if (day.dataset.day === targetDay) {
                    day.classList.add('active');
                }
            });
        });
    });
}

/**
 * FAQ accordion functionality
 */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(i => i.classList.remove('active'));

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/**
 * Countdown timer
 *
 * TO ENABLE: Set a real deadline date below (format: 'YYYY-MM-DDTHH:MM:SS')
 * Example: const deadline = new Date('2025-04-05T23:59:59').getTime();
 */
function initCountdown() {
    // TODO: Set the actual deadline date when known
    // const deadline = new Date('2025-04-05T23:59:59').getTime();
    const deadline = null; // Set to null to show "TBD"

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    // If no deadline set, show TBD
    if (!deadline) {
        daysEl.textContent = 'TB';
        hoursEl.textContent = 'D';
        minutesEl.textContent = '--';
        secondsEl.textContent = '--';
        return;
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = deadline - now;

        if (distance < 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

/**
 * Animated stats counter
 */
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number[data-count]');

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    }, observerOptions);

    stats.forEach(stat => observer.observe(stat));
}

function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smoother animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(start + (target - start) * easeOutQuart);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    }

    requestAnimationFrame(updateCounter);
}

/**
 * Reveal animations on scroll
 */
function initRevealAnimations() {
    const reveals = document.querySelectorAll('.section-header, .track-card, .prize-card, .special-card, .team-card, .faq-item, .timeline-item');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered delay based on index
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 50);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

/**
 * Mouse glow effect for track cards
 */
function initMouseGlow() {
    const cards = document.querySelectorAll('.track-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });
}

/**
 * Add floating leaves dynamically (optional enhancement)
 */
function addFloatingLeaves() {
    const container = document.querySelector('.floating-leaves');
    const emojis = ['🍃', '🌿', '🍂', '🌱', '🌾'];

    setInterval(() => {
        const leaf = document.createElement('div');
        leaf.className = 'leaf';
        leaf.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        leaf.style.left = `${Math.random() * 100}%`;
        leaf.style.animationDuration = `${20 + Math.random() * 10}s`;
        container.appendChild(leaf);

        // Remove leaf after animation
        setTimeout(() => {
            leaf.remove();
        }, 30000);
    }, 5000);
}

// Uncomment to enable dynamic leaf generation
// addFloatingLeaves();

// Update copyright year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/**
 * Parallax scrolling for background
 */
function initParallax() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    function updateParallax() {
        document.documentElement.style.setProperty('--scroll-y', window.scrollY);
    }

    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();
}
