document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-link');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.querySelector('i').classList.toggle('fa-bars');
            hamburger.querySelector('i').classList.toggle('fa-times');
        });
    }

    // Close mobile menu on link click
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.querySelector('i').classList.remove('fa-times');
                hamburger.querySelector('i').classList.add('fa-bars');
            }
        });
    });

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); // Optional: re-animate on scroll up by removing this
            }
        });
    }, observerOptions);

    // Apply animation classes to elements
    const animateElements = document.querySelectorAll('.fade-in, .slide-up, .zoom-in, [class*="slide-up-delay"], [class*="fade-in-delay"]');

    // Add base classes for initial state before observing
    document.querySelectorAll('.slide-up, [class*="slide-up-delay"]').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
    });

    document.querySelectorAll('.slide-up-delay-1').forEach(el => el.style.transitionDelay = '0.1s');
    document.querySelectorAll('.slide-up-delay-2').forEach(el => el.style.transitionDelay = '0.2s');
    document.querySelectorAll('.slide-up-delay-3').forEach(el => el.style.transitionDelay = '0.3s');

    document.querySelectorAll('.fade-in-delay').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.8s ease-out';
        el.style.transitionDelay = '0.3s';
    });

    document.querySelectorAll('.zoom-in').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'scale(0.95)';
        el.style.transition = 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
    });

    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Handle class addition for custom delays/transforms
    const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = entry.target.classList.contains('zoom-in') ? 'scale(1)' : 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.slide-up, [class*="slide-up-delay"], .fade-in-delay, .zoom-in').forEach(el => {
        intersectionObserver.observe(el);
    });

    // Form Submission with FastAPI Backend
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
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, message })
                });

                const data = await response.json().catch(() => ({}));

                if (response.ok) {
                    btn.innerHTML = '<i class="fas fa-check-circle"></i> Message Sent Successfully!';
                    btn.style.background = '#10b981'; // Success color
                    contactForm.reset();
                } else {
                    let errMsg = 'Error Sending';
                    if (data.detail) {
                        errMsg = Array.isArray(data.detail) ? data.detail[0].msg : data.detail;
                    }
                    btn.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errMsg}`;
                    btn.style.background = '#ef4444'; // Error color
                }
            } catch (error) {
                console.error("Error submitting form:", error);
                btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Network Connection Error';
                btn.style.background = '#ef4444'; // Error color
            } finally {
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = ''; // Revert to default
                    btn.disabled = false;
                }, 3000);
            }
        });
    }
    //test
    // Smooth scroll for anchor links mostly handled by CSS scroll-behavior
    // but we can add active state highlighting if needed
});
