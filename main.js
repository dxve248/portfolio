
(function() {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const customCursor = finePointer && !prefersReduced;

    // ===== LOADING SCREEN =====
    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loaderBar');
    const loaderPercent = document.getElementById('loaderPercent');
    let loadInterval = null;
    if (prefersReduced) {
        loader.classList.add('hidden');
    } else {
        let loadProgress = 0;
        loadInterval = setInterval(() => {
            loadProgress += Math.random() * 15 + 5;
            if (loadProgress >= 100) {
                loadProgress = 100;
                clearInterval(loadInterval);
                setTimeout(() => loader.classList.add('hidden'), 400);
            }
            loaderBar.style.width = loadProgress + '%';
            loaderPercent.textContent = Math.floor(loadProgress) + '%';
        }, 120);
    }
    window.addEventListener('load', () => {
        setTimeout(() => { clearInterval(loadInterval); loader.classList.add('hidden'); }, 2500);
    });

    // ===== CUSTOM CURSOR =====
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');

    if (customCursor) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX; mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });

    function animateRing() {
        requestAnimationFrame(animateRing);
        if (document.hidden) return;
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
    }
    animateRing();

    document.querySelectorAll('a, button, .btn, .skill-card, .bento-card, .timeline-item, .edu-card, .contact-card, .marquee-item').forEach(el => {
        el.addEventListener('mouseenter', () => { dot.classList.add('hovering'); ring.classList.add('hovering'); });
        el.addEventListener('mouseleave', () => { dot.classList.remove('hovering'); ring.classList.remove('hovering'); });
    });

    document.addEventListener('mousedown', () => dot.classList.add('clicking'));
    document.addEventListener('mouseup', () => dot.classList.remove('clicking'));

    // ===== CURSOR TRAIL =====
    const trailParticles = [];
    const maxTrail = 12;
    for (let i = 0; i < maxTrail; i++) {
        const p = document.createElement('div');
        p.className = 'trail-particle';
        p.style.opacity = '0';
        document.body.appendChild(p);
        trailParticles.push({ el: p, x: 0, y: 0 });
    }
    let trailIndex = 0;

    document.addEventListener('mousemove', e => {
        const t = trailParticles[trailIndex];
        t.x = e.clientX; t.y = e.clientY;
        t.el.style.left = t.x + 'px';
        t.el.style.top = t.y + 'px';
        t.el.style.opacity = '0.5';
        t.el.style.transition = 'none';
        t.el.style.transform = 'translate(-50%, -50%) scale(1)';
        setTimeout(() => {
            t.el.style.transition = 'opacity 0.5s, transform 0.5s';
            t.el.style.opacity = '0';
            t.el.style.transform = 'translate(-50%, -50%) scale(0)';
        }, 50);
        trailIndex = (trailIndex + 1) % maxTrail;
    });
    }

    // ===== SCROLL PROGRESS =====
    const scrollProgress = document.getElementById('scrollProgress');
    function onScrollProgress() {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        if (h > 0) scrollProgress.style.width = (window.scrollY / h * 100) + '%';
    }

    // ===== NAVBAR =====
    const navbar = document.getElementById('navbar');
    function onNavbarScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    }

    // ===== ACTIVE NAV HIGHLIGHTING =====
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-links a');
    function updateActiveNav() {
        let current = '';
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 150) current = section.id;
        });
        navLinksAll.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }


    // ===== HAMBURGER =====
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', navLinks.classList.contains('active') ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // ===== TYPEWRITER EFFECT =====
    const typewriterEl = document.getElementById('typewriter');
    const typewriterRoles = [
        'IT Administrator',
        'Automation Specialist',
        'Power BI Developer',
        'Workflow Architect',
        'Problem Solver'
    ];
    let twRoleIdx = 0, twCharIdx = 0, twDeleting = false, twPause = 0;

    function typewrite() {
        const current = typewriterRoles[twRoleIdx];
        if (!twDeleting) {
            typewriterEl.innerHTML = current.substring(0, twCharIdx + 1) + '<span class="typewriter-cursor"></span>';
            twCharIdx++;
            if (twCharIdx === current.length) {
                twDeleting = true;
                twPause = 0;
                setTimeout(typewrite, 2000);
                return;
            }
            setTimeout(typewrite, 80 + Math.random() * 40);
        } else {
            typewriterEl.innerHTML = current.substring(0, twCharIdx) + '<span class="typewriter-cursor"></span>';
            twCharIdx--;
            if (twCharIdx < 0) {
                twDeleting = false;
                twCharIdx = 0;
                twRoleIdx = (twRoleIdx + 1) % typewriterRoles.length;
                setTimeout(typewrite, 500);
                return;
            }
            setTimeout(typewrite, 40);
        }
    }
    if (prefersReduced) {
        typewriterEl.innerHTML = typewriterRoles[0] + '<span class="typewriter-cursor"></span>';
    } else {
        setTimeout(typewrite, 1200);
    }

    // ===== HERO TEXT ANIMATION =====
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.querySelectorAll('.hero h1 .line span').forEach((span, i) => {
                setTimeout(() => {
                    span.style.transition = 'transform 1s cubic-bezier(0.16,1,0.3,1)';
                    span.style.transform = 'translateY(0)';
                }, 300 + i * 150);
            });
            document.querySelector('.hero-overline').style.transition = 'opacity 0.8s, transform 0.8s';
            document.querySelector('.hero-overline').style.opacity = '1';
            document.querySelector('.hero-overline').style.transform = 'translateY(0)';

            ['.hero-desc', '.hero-actions', '.hero-socials'].forEach((sel, i) => {
                setTimeout(() => {
                    const el = document.querySelector(sel);
                    el.style.transition = 'opacity 0.8s, transform 0.8s';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, 800 + i * 200);
            });
        }, 600);
    });

    // ===== SCROLL REVEAL =====
    if (prefersReduced) {
        document.querySelectorAll('.reveal, .reveal-scale').forEach(el => el.classList.add('visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal, .reveal-scale').forEach(el => revealObserver.observe(el));
    }

    // ===== COUNTER ANIMATION =====
    function setFinalCount(el) {
        const target = parseFloat(el.dataset.count);
        const isDecimal = String(el.dataset.count).includes('.');
        el.childNodes[0].textContent = isDecimal ? target.toFixed(1) : String(target);
    }

    if (prefersReduced) {
        document.querySelectorAll('.stat-num').forEach(setFinalCount);
    } else {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseFloat(el.dataset.count);
                    const isDecimal = String(el.dataset.count).includes('.');
                    let current = 0;
                    const duration = 1800;
                    const step = target / (duration / 16);
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        el.childNodes[0].textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
                    }, 16);
                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));
    }

    // ===== 3D TILT EFFECT =====
    if (!prefersReduced) {
    document.querySelectorAll('.skill-card, .bento-card, .edu-card, .contact-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const tiltX = (y - 0.5) * 8;
            const tiltY = (x - 0.5) * -8;
            card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
            card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
        });
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s ease';
        });
    });
    }

    // ===== SKILL CARD GLOW FOLLOW =====
    document.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
            card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
        });
    });

    // ===== BUTTON RIPPLE =====
    if (!prefersReduced) {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const rect = btn.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
    }

    // ===== MARQUEE CLONE =====
    const marqueeTrack = document.getElementById('marqueeTrack');
    if (marqueeTrack) {
        const clone = marqueeTrack.innerHTML;
        marqueeTrack.innerHTML += clone;
    }

    // ===== TERMINAL TYPING =====
    const terminalBody = document.getElementById('terminalBody');
    if (terminalBody) {
        const terminalLines = [
            { type: 'cmd', prompt: '~', text: 'whoami' },
            { type: 'output', text: 'Christian Dave Sicat — IT Admin & Automation Specialist' },
            { type: 'cmd', prompt: '~', text: 'cat skills.json | jq ".expertise"' },
            { type: 'output', text: '["AI Automation", "Power BI", "Network Admin", "CRM Platforms", "Python"]' },
            { type: 'cmd', prompt: '~', text: 'echo $CURRENT_ROLE' },
            { type: 'output', text: 'IT Administrator @ Winning Star Labels & Tapes' },
            { type: 'cmd', prompt: '~', text: 'git log --oneline -3' },
            { type: 'output', text: 'a3f7b2c Automated enquiry system with Zapier + n8n' },
            { type: 'output', text: 'b8e1d4f Built Power BI dashboard for PwC stakeholders' },
            { type: 'output', text: 'c2a9f6e Deployed LLM agent for stock report automation' },
            { type: 'cmd', prompt: '~', text: 'echo "Let\'s build something great together \uD83D\uDE80"' },
            { type: 'output', text: "Let's build something great together \uD83D\uDE80" },
            { type: 'cursor', text: '' }
        ];

        let termLineIdx = 0, termCharIdx = 0, termCurrentEl = null;

        function typeTerminal() {
            if (termLineIdx >= terminalLines.length) return;
            const line = terminalLines[termLineIdx];

            if (line.type === 'cmd') {
                if (termCharIdx === 0) {
                    const div = document.createElement('div');
                    div.className = 'terminal-line';
                    div.innerHTML = `<span class="terminal-prompt">${line.prompt}</span><span class="terminal-cmd"></span>`;
                    terminalBody.appendChild(div);
                    termCurrentEl = div.querySelector('.terminal-cmd');
                }
                if (termCharIdx < line.text.length) {
                    termCurrentEl.textContent += line.text[termCharIdx];
                    termCharIdx++;
                    setTimeout(typeTerminal, prefersReduced ? 0 : 35 + Math.random() * 25);
                } else {
                    termCharIdx = 0;
                    termLineIdx++;
                    setTimeout(typeTerminal, prefersReduced ? 0 : 400);
                }
            } else if (line.type === 'output') {
                const div = document.createElement('div');
                div.className = 'terminal-output';
                div.textContent = line.text;
                terminalBody.appendChild(div);
                termLineIdx++;
                setTimeout(typeTerminal, prefersReduced ? 0 : 100);
            } else if (line.type === 'cursor') {
                const div = document.createElement('div');
                div.className = 'terminal-line';
                div.innerHTML = `<span class="terminal-prompt">~</span><span class="terminal-cursor"></span>`;
                terminalBody.appendChild(div);
            }
        }

        const termObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(typeTerminal, prefersReduced ? 0 : 500);
                    termObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        termObserver.observe(terminalBody);
    }

    // ===== TIMELINE PROGRESS =====
    const timelineEl = document.querySelector('.timeline');
    const timelineProgressEl = document.getElementById('timelineProgress');
    function onTimelineScroll() {
        if (!timelineEl || !timelineProgressEl) return;
        const rect = timelineEl.getBoundingClientRect();
        const start = rect.top + window.scrollY;
        const end = start + rect.height - window.innerHeight;
        const progress = Math.max(0, Math.min(1, (window.scrollY - start + window.innerHeight * 0.5) / (end - start + window.innerHeight * 0.5)));
        timelineProgressEl.style.height = (progress * 100) + '%';
    }

    // ===== PARTICLE CANVAS =====
    if (!prefersReduced) {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let canvasMouseX = 0, canvasMouseY = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mousemove', e => { canvasMouseX = e.clientX; canvasMouseY = e.clientY; });

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            const dx = canvasMouseX - this.x;
            const dy = canvasMouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                this.x -= dx * 0.003;
                this.y -= dy * 0.003;
            }
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(124,106,255,${this.opacity})`;
            ctx.fill();
        }
    }

    const particleCount = Math.min(80, Math.floor(window.innerWidth * window.innerHeight / 15000));
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(124,106,255,${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        requestAnimationFrame(animateParticles);
        if (document.hidden) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        connectParticles();
    }
    animateParticles();
    }

    // ===== MAGNETIC BUTTONS =====
    if (!prefersReduced && finePointer) {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
    }

    // ===== PARALLAX ORBS =====
    if (!prefersReduced) {
    document.addEventListener('mousemove', e => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        document.querySelectorAll('.hero-bg-orb').forEach((orb, i) => {
            const speed = (i + 1) * 12;
            orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });
    }

    // ===== PAGE TRANSITION CURTAIN =====
    const curtain = document.getElementById('pageCurtain');
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const target = document.querySelector(href);
            if (!target) return;
            if (prefersReduced) {
                target.scrollIntoView({ block: 'start' });
                return;
            }
            curtain.classList.add('active');
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'auto', block: 'start' });
            }, 350);
            setTimeout(() => {
                curtain.classList.remove('active');
            }, 800);
        });
    });

    // ===== GLITCH EFFECT ON HOVER =====
    const glitchEl = document.querySelector('.glitch-wrap');
    if (glitchEl && !prefersReduced) {
        glitchEl.addEventListener('mouseenter', () => {
            glitchEl.classList.add('glitching');
            setTimeout(() => glitchEl.classList.remove('glitching'), 400);
        });
    }

    // ===== TEXT SCRAMBLE ON HOVER =====
    const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    function scrambleText(el) {
        const original = el.dataset.original || el.textContent;
        el.dataset.original = original;
        let iterations = 0;
        const maxIterations = original.length * 2;
        const interval = setInterval(() => {
            el.textContent = original.split('').map((char, i) => {
                if (i < iterations / 2) return original[i];
                if (char === ' ') return ' ';
                return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            }).join('');
            iterations++;
            if (iterations > maxIterations) {
                clearInterval(interval);
                el.textContent = original;
            }
        }, 30);
    }
    if (!prefersReduced) {
        document.querySelectorAll('.nav-links a, .section-label').forEach(el => {
            el.addEventListener('mouseenter', () => scrambleText(el));
        });
    }

    // ===== HOVER SPOTLIGHT =====
    document.querySelectorAll('.spotlight-section').forEach(section => {
        section.addEventListener('mousemove', e => {
            const rect = section.getBoundingClientRect();
            section.style.setProperty('--spot-x', (e.clientX - rect.left) + 'px');
            section.style.setProperty('--spot-y', (e.clientY - rect.top) + 'px');
        });
    });

    // ===== STAGGERED LETTER REVEAL =====
    document.querySelectorAll('.section-title').forEach(title => {
        const text = title.textContent;
        title.innerHTML = '';
        title.classList.add('letter-reveal');
        [...text].forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'letter';
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.transitionDelay = (i * 0.03) + 's';
            title.appendChild(span);
        });
    });
    if (prefersReduced) {
        document.querySelectorAll('.letter-reveal').forEach(el => el.classList.add('visible'));
    } else {
        const letterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    letterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        document.querySelectorAll('.letter-reveal').forEach(el => letterObserver.observe(el));
    }

    // ===== CLICK PARTICLE BURST =====
    if (!prefersReduced && finePointer) {
    document.addEventListener('click', e => {
        const colors = ['#7c6aff', '#a78bfa', '#34d399', '#ff3366', '#fbbf24'];
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.className = 'burst-particle';
            const angle = (Math.PI * 2 / 12) * i;
            const distance = 40 + Math.random() * 60;
            const bx = Math.cos(angle) * distance;
            const by = Math.sin(angle) * distance;
            p.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:${3+Math.random()*4}px;height:${3+Math.random()*4}px;background:${colors[i%colors.length]};--bx:${bx}px;--by:${by}px;`;
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 600);
        }
    });
    }

    // ===== CURSOR MORPHING =====
    if (customCursor) {
    document.querySelectorAll('.skill-card, .project-card').forEach(el => {
        el.addEventListener('mouseenter', () => dot.classList.add('morph-square'));
        el.addEventListener('mouseleave', () => dot.classList.remove('morph-square'));
    });
    document.querySelectorAll('.marquee-item, .hero-socials a, .footer-socials a').forEach(el => {
        el.addEventListener('mouseenter', () => dot.classList.add('morph-ring'));
        el.addEventListener('mouseleave', () => dot.classList.remove('morph-ring'));
    });
    }

    // ===== BACK TO TOP =====
    const backToTop = document.getElementById('backToTop');
    function onBackToTopScroll() {
        backToTop.classList.toggle('visible', window.scrollY > 600);
    }
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });

    // ===== SKILL BARS ANIMATION =====
    if (prefersReduced) {
        document.querySelectorAll('.skill-bar-fill').forEach(fill => {
            fill.style.width = fill.dataset.width + '%';
        });
    } else {
        const skillBarObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.querySelectorAll('.skill-bar-fill').forEach(fill => {
                        fill.style.width = fill.dataset.width + '%';
                    });
                    skillBarObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        document.querySelectorAll('.skill-bars-grid').forEach(el => skillBarObserver.observe(el));
    }

    // ===== CONSOLIDATED SCROLL HANDLER =====
    const scrollHandlers = [onScrollProgress, onNavbarScroll, updateActiveNav, onTimelineScroll, onBackToTopScroll];
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
            scrollHandlers.forEach(fn => fn());
            scrollTicking = false;
        });
    }, { passive: true });

    // ===== THEME TOGGLE =====
    const themeToggle = document.getElementById('themeToggle');
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta && document.documentElement.getAttribute('data-theme') === 'light') {
        themeMeta.setAttribute('content', '#f6f7fb');
    }
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            if (isLight) {
                document.documentElement.removeAttribute('data-theme');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
            }
            try { localStorage.setItem('theme', isLight ? 'dark' : 'light'); } catch (e) {}
            if (themeMeta) themeMeta.setAttribute('content', isLight ? '#06060a' : '#f6f7fb');
        });
    }

    // ===== KONAMI CODE EASTER EGG =====
    const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let konamiIndex = 0;
    document.addEventListener('keydown', e => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                document.getElementById('easterEgg').classList.add('active');
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

})();
