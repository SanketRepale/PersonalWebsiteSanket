document.addEventListener('DOMContentLoaded', () => {

    // ═══════════════════════════════════════════
    // THEME TOGGLE
    // ═══════════════════════════════════════════
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    
    if (themeToggleBtn) {
        const themeIcon = themeToggleBtn.querySelector('i');
        if (localStorage.getItem('theme') === 'light') {
            body.classList.add('light-mode');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
        }
        themeToggleBtn.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');
            themeIcon.classList.replace(isLight ? 'fa-sun' : 'fa-moon', isLight ? 'fa-moon' : 'fa-sun');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }

    // ═══════════════════════════════════════════
    // MOBILE NAV TOGGLE
    // ═══════════════════════════════════════════
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-xmark');
        });
        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-xmark');
            });
        });
    }

    // ═══════════════════════════════════════════
    // NAVBAR SCROLL EFFECT
    // ═══════════════════════════════════════════
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ═══════════════════════════════════════════
    // SCROLL REVEAL ANIMATIONS
    // ═══════════════════════════════════════════
    const revealClasses = ['.reveal', '.reveal-left', '.reveal-right', '.reveal-scale'];
    const allReveals = document.querySelectorAll(revealClasses.join(','));
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

    allReveals.forEach(el => revealObserver.observe(el));

    // ═══════════════════════════════════════════
    // ANIMATED STAT COUNTERS
    // ═══════════════════════════════════════════
    const counters = document.querySelectorAll('[data-count]');
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.count);
                let current = 0;
                const duration = 1500;
                const step = target / (duration / 16);
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    entry.target.textContent = Math.floor(current);
                }, 16);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    // ═══════════════════════════════════════════
    // BENTO CARD - MOUSE GLOW + GRADIENT BORDER ROTATION
    // ═══════════════════════════════════════════
    document.querySelectorAll('.bento-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Update mouse position for radial glow
            const glow = card.querySelector('.card-glow');
            if (glow) {
                glow.style.setProperty('--mouse-x', `${x}px`);
                glow.style.setProperty('--mouse-y', `${y}px`);
            }
            
            // Calculate angle for rotating gradient border
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const angle = Math.atan2(y - cy, x - cx) * (180 / Math.PI);
            card.style.setProperty('--card-angle', `${angle + 180}deg`);
        });
    });

    // ═══════════════════════════════════════════
    // SMOOTH SCROLL for nav links
    // ═══════════════════════════════════════════
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ═══════════════════════════════════════════
    // CONTACT FORM SUBMISSION
    // ═══════════════════════════════════════════
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            const IS_DEV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const API_URL = IS_DEV ? 'http://localhost:8000/api/contact' : '/api/contact';

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });

                if (response.ok) {
                    btn.innerHTML = '<i class="fas fa-check"></i> Sent successfully!';
                    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    const errMsg = data.detail ? (Array.isArray(data.detail) ? data.detail[0].msg : data.detail) : 'Error';
                    btn.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${errMsg}`;
                    btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                }
            } catch (error) {
                btn.innerHTML = '<i class="fas fa-wifi"></i> Network Error';
                btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            } finally {
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }
        });
    }
});
