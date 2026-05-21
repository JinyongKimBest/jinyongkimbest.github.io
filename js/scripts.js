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

    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

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

    window.addEventListener('scroll', function() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollProgress.style.width = scrolled + '%';
    });

    // Enhanced navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 20px rgba(31, 39, 65, 0.25)';
            } else {
                navbar.style.boxShadow = '0 2px 20px rgba(31, 39, 65, 0.15)';
            }
        });
    }

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