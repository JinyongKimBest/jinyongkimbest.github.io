/*!
* Start Bootstrap - Full Width Pics v5.0.5 (https://startbootstrap.com/template/full-width-pics)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-full-width-pics/blob/master/LICENSE)
*/

// ===== REAL Lab Enhanced Scripts =====

// Back to Top Button
document.addEventListener('DOMContentLoaded', function() {
    // Create back to top button
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '↑';
    backToTop.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTop);

    // Scroll to top on click
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Add scroll progress indicator
    const scrollProgress = document.createElement('div');
    scrollProgress.className = 'scroll-progress';
    document.body.appendChild(scrollProgress);

    // Enhanced navbar scroll effect
    const navbar = document.querySelector('.navbar');

    // Single throttled scroll handler via requestAnimationFrame
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                const scrollY = window.scrollY;

                // Back to top button
                if (scrollY > 300) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }

                // Scroll progress bar
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                scrollProgress.style.width = (scrollY / height * 100) + '%';

                // Navbar shadow
                if (navbar) {
                    navbar.style.boxShadow = scrollY > 50
                        ? '0 4px 20px rgba(31, 39, 65, 0.25)'
                        : '0 2px 20px rgba(31, 39, 65, 0.15)';
                }

                ticking = false;
            });
            ticking = true;
        }
    });

    // Fade-in on scroll for sections
    const fadeElements = document.querySelectorAll('.fade-up-section');
    
    const fadeOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, fadeOptions);

    fadeElements.forEach(element => {
        fadeOnScroll.observe(element);
    });

    // Add loading animation to images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.complete) {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            img.addEventListener('load', function() {
                img.style.opacity = '1';
            });
        }
    });
});

// Console greeting
console.log('%c🔋 REAL Lab - Renewable Engine Analysis Lab', 'color: #1f2741; font-size: 16px; font-weight: bold;');
console.log('%cHanyang University ERICA', 'color: #2d3a5c; font-size: 12px;');