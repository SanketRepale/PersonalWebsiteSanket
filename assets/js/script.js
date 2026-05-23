document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
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

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Reveal Animations using Intersection Observer
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Reveal only once
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    revealElements.forEach(el => revealObserver.observe(el));

    // Magnetic / Radial Glow effect for Bento Cards
    document.querySelectorAll('.bento-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Form Submission
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
                    btn.innerHTML = '<i class="fas fa-check"></i> Sent successfully';
                    btn.style.background = '#10b981';
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    const errMsg = data.detail ? (Array.isArray(data.detail) ? data.detail[0].msg : data.detail) : 'Error';
                    btn.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${errMsg}`;
                    btn.style.background = '#ef4444';
                }
            } catch (error) {
                btn.innerHTML = '<i class="fas fa-wifi"></i> Network Error';
                btn.style.background = '#ef4444';
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
