document.addEventListener('DOMContentLoaded', () => {

    // Record page view count
    const IS_DEV_VIEW = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const VIEW_API_URL = IS_DEV_VIEW ? 'http://localhost:8000/api/view' : '/api/view';
    fetch(VIEW_API_URL, { method: 'POST' }).catch(() => {});

    // ═══════════════════════════════════════════
    // THEME TOGGLE
    // ═══════════════════════════════════════════
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    
    if (themeToggleBtn) {
        const themeIcon = themeToggleBtn.querySelector('.theme-toggle-icon');
        const telemetry = themeToggleBtn.querySelector('.theme-toggle-telemetry');
        
        if (localStorage.getItem('theme') === 'light') {
            body.classList.add('light-mode');
            if (themeIcon) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
            if (telemetry) telemetry.textContent = 'SYS::MODE::LIGHT';
        } else {
            if (telemetry) telemetry.textContent = 'SYS::MODE::DARK';
        }

        themeToggleBtn.addEventListener('click', () => {
            // High-tech activation animation
            themeToggleBtn.classList.add('clicked');
            setTimeout(() => themeToggleBtn.classList.remove('clicked'), 600);

            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');
            
            if (themeIcon) {
                if (isLight) {
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                } else {
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                }
            }

            if (telemetry) {
                telemetry.textContent = isLight ? 'SYS::MODE::LIGHT' : 'SYS::MODE::DARK';
            }

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
    // SCROLL PROGRESS BAR
    // ═══════════════════════════════════════════
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            scrollProgress.style.width = scrollPercent + '%';
        });
    }

    // ═══════════════════════════════════════════
    // ACTIVE NAV LINK TRACKING
    // ═══════════════════════════════════════════
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-link[data-section]');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinksAll.forEach(link => {
                    link.classList.toggle('active-link', link.dataset.section === id);
                });
            }
        });
    }, { threshold: 0.3, rootMargin: '-100px 0px -40% 0px' });

    sections.forEach(section => sectionObserver.observe(section));

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
    // ANIMATED STAT COUNTERS + RING ANIMATION
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

                // Animate the ring on the parent stat-card
                const statCard = entry.target.closest('.stat-card');
                if (statCard) {
                    const ringPercent = parseInt(statCard.dataset.ringPercent) || 50;
                    const circumference = 2 * Math.PI * 40; // r=40
                    const offset = circumference - (circumference * ringPercent / 100);
                    const ringFill = statCard.querySelector('.stat-ring-fill');
                    if (ringFill) {
                        ringFill.style.setProperty('--ring-offset', offset);
                        statCard.classList.add('counted');
                    }
                }

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    // ═══════════════════════════════════════════
    // BENTO CARD - MOUSE GLOW + GRADIENT BORDER + 3D TILT
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

            // 3D Tilt effect
            const tiltX = ((y - cy) / cy) * 4; // max 4deg
            const tiltY = ((x - cx) / cx) * -4;
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-2px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });

        // Sparkle effect on mouse enter
        const sparkleCanvas = card.querySelector('.sparkle-canvas');
        if (sparkleCanvas) {
            card.addEventListener('mouseenter', (e) => {
                createSparkles(sparkleCanvas, e, card);
            });
        }
    });

    // ═══════════════════════════════════════════
    // SPARKLE PARTICLE SYSTEM
    // ═══════════════════════════════════════════
    function createSparkles(canvas, event, card) {
        const ctx = canvas.getContext('2d');
        const rect = card.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const sparkles = [];
        const count = 12;
        const isLight = document.body.classList.contains('light-mode');

        for (let i = 0; i < count; i++) {
            sparkles.push({
                x, y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                radius: Math.random() * 3 + 1,
                alpha: 1,
                color: isLight 
                    ? `hsla(${240 + Math.random() * 60}, 80%, 60%, ` 
                    : `hsla(${180 + Math.random() * 60}, 100%, 70%, `
            });
        }

        let frame = 0;
        function animateSparkles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;
            sparkles.forEach(s => {
                if (s.alpha <= 0) return;
                alive = true;
                s.x += s.vx;
                s.y += s.vy;
                s.alpha -= 0.025;
                s.radius *= 0.97;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                ctx.fillStyle = s.color + s.alpha + ')';
                ctx.fill();
            });
            frame++;
            if (alive && frame < 60) {
                requestAnimationFrame(animateSparkles);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        animateSparkles();
    }

    // ═══════════════════════════════════════════
    // TYPEWRITER EFFECT
    // ═══════════════════════════════════════════
    const typewriterEl = document.getElementById('typewriter');
    if (typewriterEl) {
        const words = JSON.parse(typewriterEl.dataset.words);
        let wordIndex = 0;
        let charIndex = words[0].length; // Start fully typed
        let isDeleting = false;
        let typeDelay = 2500; // Initial pause before starting to delete

        function typeWrite() {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                charIndex--;
                typeDelay = 40;
            } else {
                charIndex++;
                typeDelay = 80;
            }

            typewriterEl.textContent = currentWord.substring(0, charIndex);

            if (!isDeleting && charIndex === currentWord.length) {
                typeDelay = 2500; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeDelay = 400; // Pause before typing next
            }

            setTimeout(typeWrite, typeDelay);
        }

        setTimeout(typeWrite, 2500); // Initial delay before cycling starts
    }

    // ═══════════════════════════════════════════
    // MAGNETIC BUTTON EFFECT
    // ═══════════════════════════════════════════
    document.querySelectorAll('.magnetic-btn').forEach(wrapper => {
        const btn = wrapper.querySelector('.btn');
        if (!btn) return;

        wrapper.addEventListener('mousemove', (e) => {
            const rect = wrapper.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        wrapper.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // ═══════════════════════════════════════════
    // CUSTOM CURSOR
    // ═══════════════════════════════════════════
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    
    if (cursorDot && cursorRing && window.innerWidth > 768) {
        let cursorX = 0, cursorY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            cursorDot.style.left = cursorX + 'px';
            cursorDot.style.top = cursorY + 'px';
        });

        // Smooth ring follow
        function animateRing() {
            ringX += (cursorX - ringX) * 0.15;
            ringY += (cursorY - ringY) * 0.15;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Hover effect on interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .btn, .skill-tag, .bento-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-hover'));
        });
    }

    // ═══════════════════════════════════════════
    // BACK TO TOP BUTTON
    // ═══════════════════════════════════════════
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > window.innerHeight * 0.5);
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ═══════════════════════════════════════════
    // TIMELINE CONNECTOR ANIMATION
    // ═══════════════════════════════════════════
    const timelineAxisContainer = document.querySelector('.timeline-axis-container');
    if (timelineAxisContainer) {
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    timelineObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        timelineObserver.observe(timelineAxisContainer);
    }

    // ═══════════════════════════════════════════
    // EXPERIENCE EXPAND/COLLAPSE
    // ═══════════════════════════════════════════
    document.querySelectorAll('.show-more-btn').forEach(btn => {
        const targetId = btn.dataset.target;
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        // Check if content is actually taller than max-height
        if (targetEl.scrollHeight > 200) {
            btn.style.display = 'inline-flex';
        }

        btn.addEventListener('click', () => {
            const isExpanded = targetEl.classList.toggle('expanded');
            btn.innerHTML = isExpanded 
                ? 'Show less <i class="fas fa-chevron-up" style="font-size:0.7rem; margin-left:4px;"></i>'
                : 'Show more <i class="fas fa-chevron-down" style="font-size:0.7rem; margin-left:4px;"></i>';
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
    // CONTACT FORM SUBMISSION + CONFETTI
    // ═══════════════════════════════════════════
    function launchConfetti() {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        const colors = ['#00f2fe', '#f093fb', '#4facfe', '#ffd700', '#10b981', '#ec4899'];
        for (let i = 0; i < 60; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.top = '-10px';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDelay = Math.random() * 0.8 + 's';
            piece.style.animationDuration = (2 + Math.random() * 2) + 's';
            piece.style.width = (6 + Math.random() * 6) + 'px';
            piece.style.height = (6 + Math.random() * 6) + 'px';
            piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            container.appendChild(piece);
        }

        setTimeout(() => container.remove(), 4000);
    }

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
                    launchConfetti();
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

    // ═══════════════════════════════════════════
    // AI BACKGROUND CANVAS ANIMATION (Enhanced)
    // ═══════════════════════════════════════════
    const canvas = document.getElementById('ai-background-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let dataStreams = [];
        let mouse = { x: null, y: null, radius: 160 };

        // Handle high DPI screens
        function resizeCanvas() {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            initParticles();
            initDataStreams();
        }

        class Particle {
            constructor() {
                this.x = Math.random() * window.innerWidth;
                this.y = Math.random() * window.innerHeight;
                this.vx = (Math.random() - 0.5) * 0.35;
                this.vy = (Math.random() - 0.5) * 0.35;
                this.baseRadius = Math.random() * 2 + 1;
                this.radius = this.baseRadius;
                this.pulseSpeed = 0.01 + Math.random() * 0.02;
                this.pulsePhase = Math.random() * Math.PI * 2;
            }

            update(time) {
                this.x += this.vx;
                this.y += this.vy;

                // Pulsing radius
                this.radius = this.baseRadius + Math.sin(time * this.pulseSpeed + this.pulsePhase) * 0.6;

                // Mouse repulsion
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius * 0.7) {
                        const force = (1 - dist / (mouse.radius * 0.7)) * 0.8;
                        this.x += (dx / dist) * force;
                        this.y += (dy / dist) * force;
                    }
                }

                // Bounce at screen edges
                if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
                if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
            }

            draw(color) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const particleCount = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 16000), 80);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function initDataStreams() {
            dataStreams = [];
            const streamCount = Math.min(Math.floor(window.innerWidth / 96), 18);
            const tokens = ['AI', 'QA', 'CI', 'API', 'POM', 'ETL', 'RUN', 'OK'];
            for (let i = 0; i < streamCount; i++) {
                dataStreams.push({
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    speed: 0.18 + Math.random() * 0.42,
                    token: tokens[Math.floor(Math.random() * tokens.length)],
                    alpha: 0.06 + Math.random() * 0.1
                });
            }
        }

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        let animTime = 0;
        function animate() {
            animTime++;
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            const isLight = document.body.classList.contains('light-mode');
            const nodeColor = isLight ? 'rgba(79, 70, 229, 0.28)' : 'rgba(0, 242, 254, 0.2)';
            const lineColorRaw = isLight ? { r: 79, g: 70, b: 229 } : { r: 0, g: 242, b: 254 };
            const warmColorRaw = isLight ? { r: 236, g: 72, b: 153 } : { r: 240, g: 147, b: 251 };
            const mouseLineColorRaw = isLight ? { r: 236, g: 72, b: 153 } : { r: 240, g: 147, b: 251 };
            const maxDistance = 140;

            ctx.save();
            ctx.font = '700 10px Courier New, monospace';
            ctx.textAlign = 'center';
            dataStreams.forEach(stream => {
                stream.y += stream.speed;
                if (stream.y > window.innerHeight + 24) {
                    stream.y = -24;
                    stream.x = Math.random() * window.innerWidth;
                }
                const streamColor = isLight ? `rgba(79, 70, 229, ${stream.alpha})` : `rgba(0, 242, 254, ${stream.alpha})`;
                ctx.fillStyle = streamColor;
                ctx.fillText(stream.token, stream.x, stream.y);
                ctx.fillRect(stream.x - 1, stream.y + 6, 2, 18);
            });
            ctx.restore();

            // Update & Draw Particles
            for (let i = 0; i < particles.length; i++) {
                particles[i].update(animTime);
                particles[i].draw(nodeColor);
            }

            // Draw Connection Lines between nodes with distance-based color
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDistance) {
                        const ratio = 1 - dist / maxDistance;
                        const alpha = ratio * (isLight ? 0.22 : 0.12);
                        
                        // Color shifts from cool to warm as particles are closer
                        const r = Math.round(lineColorRaw.r + (warmColorRaw.r - lineColorRaw.r) * ratio * 0.5);
                        const g = Math.round(lineColorRaw.g + (warmColorRaw.g - lineColorRaw.g) * ratio * 0.5);
                        const b = Math.round(lineColorRaw.b + (warmColorRaw.b - lineColorRaw.b) * ratio * 0.5);

                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }

                // Connect to Mouse position if close
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = particles[i].x - mouse.x;
                    const dy = particles[i].y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < mouse.radius) {
                        const alpha = (1 - dist / mouse.radius) * (isLight ? 0.26 : 0.16);
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(${mouseLineColorRaw.r}, ${mouseLineColorRaw.g}, ${mouseLineColorRaw.b}, ${alpha})`;
                        ctx.lineWidth = 1.2;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        }

        // Initialize
        resizeCanvas();
        animate();
    }
});
