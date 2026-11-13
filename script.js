/* ==========================================================================
   KRUSHNA JAIN | PORTFOLIO REDESIGN ENGINE
   GSAP + Lenis + Canvas Constellation + Web Audio API + Interactive Tilt
   ========================================================================== */

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {

    // -------------------------------------------------------------------------
    // 1. Lenis Smooth Scrolling Engine
    // -------------------------------------------------------------------------
    let lenis;
    try {
        lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 1.5,
        });

        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    } catch (e) {
        console.warn("Lenis initialization skipped:", e);
    }

    // -------------------------------------------------------------------------
    // 2. Custom Magnetic Cursor & Follower (Desktop Only)
    // -------------------------------------------------------------------------
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const cursor = document.querySelector('.custom-cursor');
    const cursorFollower = document.querySelector('.custom-cursor-follower');

    if (window.innerWidth > 768 && !isTouchDevice && cursor && cursorFollower) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let followerX = mouseX;
        let followerY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        });

        gsap.ticker.add(() => {
            followerX += (mouseX - followerX) * 0.18;
            followerY += (mouseY - followerY) * 0.18;
            cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
        });

        // Hover expansions
        const hoverTargets = document.querySelectorAll('a, button, .cursor-hover, .tilt-card, .filter-btn');
        hoverTargets.forEach((el) => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hovered');
                cursorFollower.classList.add('hovered');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovered');
                cursorFollower.classList.remove('hovered');
            });
        });

        // Magnetic element attraction
        const magneticElements = document.querySelectorAll('.magnetic');
        magneticElements.forEach((el) => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(el, { x: x * 0.28, y: y * 0.28, duration: 0.4, ease: "power2.out" });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.35)" });
            });
        });
    }

    // -------------------------------------------------------------------------
    // 3. Interactive Constellation Canvas in Hero
    // -------------------------------------------------------------------------
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let mouseNode = { x: -1000, y: -1000, radius: 140 };

        function resizeCanvas() {
            width = canvas.width = canvas.parentElement.offsetWidth;
            height = canvas.height = canvas.parentElement.offsetHeight;
            initParticles();
        }

        function initParticles() {
            particles = [];
            const count = Math.min(Math.floor((width * height) / 16000), 75);
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.55,
                    vy: (Math.random() - 0.5) * 0.55,
                    radius: Math.random() * 1.8 + 1,
                    alpha: Math.random() * 0.5 + 0.2
                });
            }
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        window.addEventListener('mousemove', (e) => {
            const heroRect = canvas.parentElement.getBoundingClientRect();
            if (e.clientY <= heroRect.bottom) {
                mouseNode.x = e.clientX - heroRect.left;
                mouseNode.y = e.clientY - heroRect.top;
            } else {
                mouseNode.x = -1000;
                mouseNode.y = -1000;
            }
        });

        function animateCanvas() {
            ctx.clearRect(0, 0, width, height);

            // Draw and update particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                // Mouse interaction
                const dxMouse = mouseNode.x - p.x;
                const dyMouse = mouseNode.y - p.y;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                if (distMouse < mouseNode.radius) {
                    const force = (1 - distMouse / mouseNode.radius) * 0.8;
                    p.x -= (dxMouse / distMouse) * force * 1.5;
                    p.y -= (dyMouse / distMouse) * force * 1.5;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(16, 185, 129, ${p.alpha})`;
                ctx.fill();

                // Connect nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 110) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(16, 185, 129, ${0.18 * (1 - dist / 110)})`;
                        ctx.lineWidth = 0.75;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animateCanvas);
        }
        animateCanvas();
    }

    // -------------------------------------------------------------------------
    // 4. Cinematic Preloader & Hero Reveal Sequence
    // -------------------------------------------------------------------------
    const preloader = document.getElementById('preloader');
    const loaderLine = document.querySelector('.loader-line');
    const loaderCounter = document.querySelector('.loader-counter');

    if (preloader) {
        let loadProgress = { value: 0 };
        gsap.to(loadProgress, {
            value: 100,
            duration: 1.4,
            ease: "power2.inOut",
            onUpdate: () => {
                if (loaderCounter) loaderCounter.innerText = Math.round(loadProgress.value) + '%';
                if (loaderLine) loaderLine.style.width = Math.round(loadProgress.value) + '%';
            },
            onComplete: () => {
                gsap.timeline()
                    .to(preloader, {
                        yPercent: -100,
                        duration: 0.9,
                        ease: "expo.inOut"
                    })
                    .from('.hero-badge', { y: 25, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.4")
                    .from('.hero-title-line', {
                        y: 80,
                        opacity: 0,
                        duration: 1,
                        stagger: 0.15,
                        ease: "power4.out"
                    }, "-=0.5")
                    .from('.hero-sub-text', { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
                    .from('.hero-actions', { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
                    .from('.hero-stats', { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.5");
                
                startTypewriter();
            }
        });
    } else {
        startTypewriter();
    }

    // -------------------------------------------------------------------------
    // 5. Dynamic Typewriter Effect
    // -------------------------------------------------------------------------
    function startTypewriter() {
        const phrases = [
            "Full Stack Software Engineer",
            "Local-First & Offline POS Architect",
            "AI & Computer Vision Enthusiast",
            "Crafting Robust C++ & TypeScript Systems",
            "Building Scalable Digital Experiences"
        ];
        let phraseIdx = 0;
        let charIdx = 0;
        let isDeleting = false;
        const target = document.getElementById('typewriter');
        if (!target) return;

        function tick() {
            const current = phrases[phraseIdx];
            if (isDeleting) {
                target.textContent = current.substring(0, charIdx - 1);
                charIdx--;
            } else {
                target.textContent = current.substring(0, charIdx + 1);
                charIdx++;
            }

            let speed = isDeleting ? 30 : 70;

            if (!isDeleting && charIdx === current.length) {
                speed = 2200;
                isDeleting = true;
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                speed = 400;
            }

            setTimeout(tick, speed);
        }
        tick();
    }

    // -------------------------------------------------------------------------
    // 6. Interactive 3D Tilt Effect on Cards
    // -------------------------------------------------------------------------
    if (window.innerWidth > 768 && !isTouchDevice) {
        const tiltCards = document.querySelectorAll('.tilt-card');
        tiltCards.forEach((card) => {
            const glare = card.querySelector('.inner-glare');
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -7;
                const rotateY = ((x - centerX) / centerX) * 7;

                if (glare) {
                    glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.14) 0%, transparent 65%)`;
                }

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                card.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
                if (glare) {
                    glare.style.background = `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)`;
                }
            });

            card.addEventListener('mouseenter', () => {
                card.style.transition = 'none';
            });
        });
    }

    // -------------------------------------------------------------------------
    // 7. Project Category Filter System
    // -------------------------------------------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach((card) => {
                const categories = card.getAttribute('data-category') || '';
                const match = filterValue === 'all' || categories.includes(filterValue);

                if (match) {
                    gsap.to(card, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.35,
                        ease: "power2.out",
                        onStart: () => { card.style.display = 'flex'; }
                    });
                } else {
                    gsap.to(card, {
                        opacity: 0,
                        scale: 0.95,
                        duration: 0.25,
                        ease: "power2.in",
                        onComplete: () => { card.style.display = 'none'; }
                    });
                }
            });

            if (lenis) lenis.resize();
            ScrollTrigger.refresh();
        });
    });

    // -------------------------------------------------------------------------
    // 8. Credentials Lightbox Modal
    // -------------------------------------------------------------------------
    const certModal = document.getElementById('certModal');
    const certModalImg = document.getElementById('certModalImg');
    const certModalTitle = document.getElementById('certModalTitle');
    const certModalIssuer = document.getElementById('certModalIssuer');
    const certModalClose = document.getElementById('certModalClose');
    const certCards = document.querySelectorAll('.cert-card');

    certCards.forEach((card) => {
        card.addEventListener('click', () => {
            const img = card.querySelector('img');
            const title = card.querySelector('.cert-title')?.innerText || 'Verified Certificate';
            const issuer = card.querySelector('.cert-issuer')?.innerText || 'Official Credential';

            if (certModal && certModalImg && img) {
                certModalImg.src = img.src;
                if (certModalTitle) certModalTitle.innerText = title;
                if (certModalIssuer) certModalIssuer.innerText = issuer;

                certModal.classList.remove('inactive');
                certModal.classList.add('active');
                if (lenis) lenis.stop();
            }
        });
    });

    function closeCertModal() {
        if (certModal) {
            certModal.classList.remove('active');
            certModal.classList.add('inactive');
            if (lenis) lenis.start();
        }
    }

    if (certModalClose) certModalClose.addEventListener('click', closeCertModal);
    if (certModal) {
        certModal.addEventListener('click', (e) => {
            if (e.target === certModal) closeCertModal();
        });
    }
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCertModal();
    });

    // -------------------------------------------------------------------------
    // 9. One-Click Email Copy & Toast Notification
    // -------------------------------------------------------------------------
    const copyEmailBtns = document.querySelectorAll('.copy-email-btn');
    const toast = document.getElementById('toastNotification');

    function showToast(msg) {
        if (!toast) return;
        const toastMsg = toast.querySelector('.toast-message');
        if (toastMsg && msg) toastMsg.innerText = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    copyEmailBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = "kj9013866@gmail.com";
            navigator.clipboard.writeText(email).then(() => {
                showToast("Email copied: kj9013866@gmail.com");
                playAudioClick();
            }).catch(() => {
                window.location.href = `mailto:${email}`;
            });
        });
    });

    // -------------------------------------------------------------------------
    // 10. Web Audio API Ambient Synthesizer (Zero 404s!)
    // -------------------------------------------------------------------------
    let audioCtx = null;
    let ambientGain = null;
    let ambientOsc = null;
    let isSoundOn = false;
    const soundToggle = document.getElementById('sound-toggle');
    const soundText = document.getElementById('sound-text');

    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playAudioClick() {
        if (!isSoundOn) return;
        try {
            initAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(580, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.05);

            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.09);
        } catch (e) {
            // Audio context not allowed without interaction
        }
    }

    function startAmbientDrone() {
        try {
            initAudio();
            if (ambientOsc) return;

            ambientOsc = audioCtx.createOscillator();
            const filter = audioCtx.createBiquadFilter();
            ambientGain = audioCtx.createGain();

            ambientOsc.type = 'sine';
            ambientOsc.frequency.setValueAtTime(108, audioCtx.currentTime); // Deep warm ambient fundamental

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(320, audioCtx.currentTime);

            ambientGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
            ambientGain.gain.linearRampToValueAtTime(0.02, audioCtx.currentTime + 1.5);

            ambientOsc.connect(filter);
            filter.connect(ambientGain);
            ambientGain.connect(audioCtx.destination);

            ambientOsc.start();
        } catch (e) {
            console.log("Ambient audio blocked until user gesture.");
        }
    }

    function stopAmbientDrone() {
        if (ambientGain && audioCtx) {
            ambientGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            setTimeout(() => {
                if (ambientOsc) {
                    ambientOsc.stop();
                    ambientOsc.disconnect();
                    ambientOsc = null;
                }
            }, 600);
        }
    }

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            isSoundOn = !isSoundOn;
            if (isSoundOn) {
                soundToggle.classList.add('sound-active');
                if (soundText) soundText.innerText = "Sound On";
                startAmbientDrone();
                playAudioClick();
            } else {
                soundToggle.classList.remove('sound-active');
                if (soundText) soundText.innerText = "Sound Off";
                stopAmbientDrone();
            }
        });
    }

    // Interactive button click feedback sound
    document.querySelectorAll('button, a.btn-primary, a.btn-outline, .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            playAudioClick();
        });
    });

    // -------------------------------------------------------------------------
    // 11. Mobile Drawer Navigation
    // -------------------------------------------------------------------------
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    let isMenuOpen = false;

    if (mobileBtn && mobileMenu) {
        function toggleMenu() {
            isMenuOpen = !isMenuOpen;
            if (isMenuOpen) {
                mobileMenu.style.transform = 'translateY(0)';
                mobileBtn.innerHTML = '<i class="fas fa-times text-xl"></i>';
                if (lenis) lenis.stop();
            } else {
                mobileMenu.style.transform = 'translateY(-100%)';
                mobileBtn.innerHTML = '<i class="fas fa-bars text-xl"></i>';
                if (lenis) lenis.start();
            }
        }

        mobileBtn.addEventListener('click', toggleMenu);
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (isMenuOpen) toggleMenu();
            });
        });
    }

    // -------------------------------------------------------------------------
    // 12. Working Contact Form Simulated Sender
    // -------------------------------------------------------------------------
    const contactForm = document.getElementById('portfolioContactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;

            const name = document.getElementById('senderName')?.value || '';
            const email = document.getElementById('senderEmail')?.value || '';
            const message = document.getElementById('senderMessage')?.value || '';

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Transmitting...';

            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check text-green-400 mr-2"></i> Transmitted!';
                showToast("Thank you " + (name || "") + "! Message dispatched.");

                // Also trigger mailto in background so user's client opens if desired
                const mailtoUrl = `mailto:kj9013866@gmail.com?subject=Project Inquiry from ${encodeURIComponent(name)}&body=${encodeURIComponent("Sender Email: " + email + "\n\nMessage:\n" + message)}`;
                window.open(mailtoUrl, '_blank');

                setTimeout(() => {
                    contactForm.reset();
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalHTML;
                }, 2500);
            }, 1000);
        });
    }

    // -------------------------------------------------------------------------
    // 13. Scroll Trigger Reveals
    // -------------------------------------------------------------------------
    gsap.utils.toArray('.reveal-up').forEach((el) => {
        gsap.from(el, {
            y: 40,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el,
                start: "top 88%",
            }
        });
    });

});
