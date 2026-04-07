gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {

    // 1. Lenis Setup (Touch interactions disabled for native mobile feel)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false // Keeps native scrolling on mobile phones
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // 2. Mobile Menu Logic
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    let menuOpen = false;

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            menuOpen = !menuOpen;
            if (menuOpen) {
                mobileMenu.style.transform = 'translateY(0)';
                mobileBtn.innerHTML = '<i class="fas fa-times"></i>';
                lenis.stop(); // Prevent scrolling when menu is open
            } else {
                mobileMenu.style.transform = 'translateY(-100%)';
                mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
                lenis.start();
            }
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuOpen = false;
                mobileMenu.style.transform = 'translateY(-100%)';
                mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
                lenis.start();
            });
        });
    }

    // 3. Custom Cursor & Magnetic Elements (Desktop Only)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (window.innerWidth > 768 && !isTouchDevice) {
        const cursor = document.querySelector('.custom-cursor');
        const hoverElements = document.querySelectorAll('.cursor-hover, a, button');
        let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
        let cursorX = mouseX, cursorY = mouseY;

        window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
        gsap.ticker.add(() => {
            const dt = 1.0 - Math.pow(1.0 - 0.2, gsap.ticker.deltaRatio());
            cursorX += (mouseX - cursorX) * dt; cursorY += (mouseY - cursorY) * dt;
            if (cursor) cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        });
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        });

        // Magnetic Pull Effect
        const magneticElements = document.querySelectorAll('.magnetic');
        magneticElements.forEach((el) => {
            el.addEventListener('mousemove', (e) => {
                const position = el.getBoundingClientRect();
                const x = e.clientX - position.left - position.width / 2;
                const y = e.clientY - position.top - position.height / 2;
                gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.5, ease: "power3.out" });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
            });
        });
    }

    // 4. Samsung-Style Cinematic Loader
    const tlLoader = gsap.timeline({
        onComplete: () => {
            startTypewriter();
            const video = document.getElementById('heroVideo');
            if (video && video.paused) video.play().catch(e => console.log("Autoplay blocked."));
        }
    });

    tlLoader.to('.loader-line', { scaleX: 1, duration: 1.5, ease: "power4.inOut" })
        .to('.loader-text', { opacity: 1, duration: 0.5 }, "-=1")
        .to('.loader', { yPercent: -100, duration: 1.2, ease: "expo.inOut" }, "+=0.5")
        .to('.hero-section .mask-text', { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.15 }, "-=0.8");

    // 5. Typewriter Logic
    function startTypewriter() {
        const words = ["Driven By Code.", "Engineered For Speed.", "Designed For Impact."];
        let wordIndex = 0, charIndex = 0, isDeleting = false;
        const typeElement = document.getElementById('typewriter');
        if (!typeElement) return;

        function typeEffect() {
            const currentWord = words[wordIndex];
            if (isDeleting) { typeElement.textContent = currentWord.substring(0, charIndex - 1); charIndex--; }
            else { typeElement.textContent = currentWord.substring(0, charIndex + 1); charIndex++; }

            let typeSpeed = isDeleting ? 40 : 100;
            if (!isDeleting && charIndex === currentWord.length) { typeSpeed = 2500; isDeleting = true; }
            else if (isDeleting && charIndex === 0) { isDeleting = false; wordIndex = (wordIndex + 1) % words.length; typeSpeed = 500; }
            setTimeout(typeEffect, typeSpeed);
        }
        typeEffect();
    }

    // 6. Hero Video Scale Down (Apple Effect)
    gsap.to('.video-container', {
        scale: window.innerWidth < 768 ? 0.95 : 0.85,
        borderRadius: window.innerWidth < 768 ? '16px' : '32px',
        opacity: 0.4, ease: "none",
        scrollTrigger: { trigger: '.hero-section', start: "top top", end: "bottom top", scrub: true }
    });

    // 7. Text Masking Reveal on Scroll
    gsap.utils.toArray('#about .mask-text').forEach(text => {
        gsap.to(text, { y: 0, opacity: 1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: text.parentElement, start: "top 90%" } });
    });

    // 8. Image Scale scrub
    gsap.from('.img-reveal', { scale: 1.5, ease: "none", scrollTrigger: { trigger: '.img-reveal-wrapper', start: "top bottom", end: "bottom top", scrub: true } });

    // 9. Horizontal Scrolling Logic (ONLY ON DESKTOP)
    let mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
        // Setup Projects Scroll
        const workSections = gsap.utils.toArray(".horizontal-item");
        gsap.to(workSections, {
            xPercent: -100 * (workSections.length - 1),
            ease: "none",
            scrollTrigger: {
                trigger: ".horizontal-scroll-wrapper",
                pin: true, scrub: 1,
                snap: 1 / (workSections.length - 1),
                end: () => "+=" + document.querySelector(".horizontal-scroll-wrapper").offsetWidth
            }
        });

        // Add Image Parallax inside Work Cards
        const parallaxImgs = gsap.utils.toArray(".parallax-img");
        parallaxImgs.forEach((img) => {
            gsap.fromTo(img,
                { xPercent: -10 },
                {
                    xPercent: 10,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".horizontal-scroll-wrapper",
                        scrub: 1,
                        start: "top top",
                        end: () => "+=" + document.querySelector(".horizontal-scroll-wrapper").offsetWidth
                    }
                }
            );
        });

        // Setup Certifications Scroll
        const certSections = gsap.utils.toArray(".cert-horizontal-item");
        gsap.to(certSections, {
            xPercent: -100 * (certSections.length - 1),
            ease: "none",
            scrollTrigger: {
                trigger: ".cert-scroll-wrapper",
                pin: true, scrub: 1,
                snap: 1 / (certSections.length - 1),
                end: () => "+=" + document.querySelector(".cert-scroll-wrapper").offsetWidth
            }
        });
    });

    mm.add("(max-width: 767px)", () => {
        // Vertical Image Parallax inside Work Cards for Mobile
        const parallaxImgs = gsap.utils.toArray(".parallax-img");
        parallaxImgs.forEach((img) => {
            gsap.fromTo(img,
                { yPercent: -5 },
                {
                    yPercent: 5,
                    ease: "none",
                    scrollTrigger: {
                        trigger: img.closest('.tilt-card'),
                        scrub: 1,
                        start: "top bottom",
                        end: "bottom top"
                    }
                }
            );
        });
    });

    // 10. General Scrubs
    gsap.from('.scrub-text', { opacity: 0, y: 50, scrollTrigger: { trigger: '.scrub-text', start: "top 85%", end: "top 50%", scrub: true } });
    gsap.from('.scrub-scale', { scale: 0.8, opacity: 0, scrollTrigger: { trigger: '#contact', start: "top bottom", end: "center center", scrub: true } });

    // 11. Sound Toggle
    const soundToggle = document.getElementById('sound-toggle');
    const heroVideo = document.getElementById('heroVideo');
    const soundIcon = document.getElementById('sound-icon');
    const soundText = document.getElementById('sound-text');

    if (soundToggle && heroVideo) {
        soundToggle.addEventListener('click', () => {
            if (heroVideo.muted) {
                heroVideo.muted = false;
                soundIcon.classList.remove('fa-volume-mute');
                soundIcon.classList.add('fa-volume-up');
                if (soundText) soundText.innerText = "Sound On";
            } else {
                heroVideo.muted = true;
                soundIcon.classList.remove('fa-volume-up');
                soundIcon.classList.add('fa-volume-mute');
                if (soundText) soundText.innerText = "Sound Off";
            }
        });
    }

    // 12. 3D Tilt Logic & Spotlight (Desktop Only)
    if (window.innerWidth > 768 && !isTouchDevice) {
        const tiltCards = document.querySelectorAll('.tilt-card');
        tiltCards.forEach(card => {
            const glare = card.querySelector('.inner-glare');
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);

                const centerX = rect.width / 2, centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8; const rotateY = ((x - centerX) / centerX) * 8;

                if (glare) glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15) 0%, transparent 60%)`;
                card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
                card.style.transition = 'none';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                card.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
                if (glare) glare.style.background = 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)';
            });
        });
    }
});