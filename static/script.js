// Pet Care Center - Complete JavaScript Functionality
// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Initialize all website functionality
function initializeWebsite() {
    setupNavigation();
    setupScrollAnimations();
    setupCarousel();
    setupGalleryFilters();
    setupFormHandling();
    setupSmoothScrolling();
    setupMobileMenu();
    setMinDate();
}

// Navigation and Mobile Menu
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Sticky navigation
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = '#ffffff';
            header.style.backdropFilter = 'none';
        }
    });
}

function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// Smooth Scrolling
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = section.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Scroll Animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe all elements with fade-in class
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));
}

// Testimonials Carousel
function setupCarousel() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    
    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Show current slide
        slides[index].classList.add('active');
        dots[index].classList.add('active');
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    // Auto-advance carousel
    setInterval(nextSlide, 5000);
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
}

// Gallery Filters
function setupGalleryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const filter = button.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.transform = 'scale(1)';
                        item.style.opacity = '1';
                    }, 10);
                } else {
                    item.style.transform = 'scale(0)';
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Gallery lightbox (simple version)
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Simple alert for demo - in real app, implement proper lightbox
            const category = item.getAttribute('data-category');
            alert(`Viewing ${category} gallery image`);
        });
    });
}

// Form Handling
function setupFormHandling() {
    const form = document.getElementById('appointmentForm');
    const serviceButtons = document.querySelectorAll('.service-btn');
    
    // Handle service button clicks
    serviceButtons.forEach(button => {
        button.addEventListener('click', () => {
            const service = button.getAttribute('data-service');
            const serviceSelect = document.getElementById('service');
            
            if (serviceSelect) {
                serviceSelect.value = service;
            }
            
            scrollToSection('contact');
        });
    });
    
    // Handle form submission
    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }
}

function handleFormSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const appointmentData = {
        phone: formData.get('phone'),
        email: formData.get('email'),
        petType: formData.get('petType'),
        service: formData.get('service'),
        date: formData.get('date'),
        time: formData.get('time'),
        message: formData.get('message') || ''
    };
    
    // Validate form data
    if (!validateFormData(appointmentData)) {
        return;
    }
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Booking...';
    submitButton.disabled = true;

    fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
    })
        .then(async (res) => {
            const data = await res.json().catch(() => ({ ok: res.ok }));
            if (!res.ok || data.ok === false) {
                const errorMsg = (data && (data.error || data.message)) || 'Failed to book appointment.';
                throw new Error(errorMsg);
            }
            showSuccessToast();
            e.target.reset();
        })
        .catch((err) => {
            alert(err.message || 'Something went wrong. Please try again.');
        })
        .finally(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
}

function validateFormData(data) {
    const requiredFields = ['phone', 'petType', 'service', 'date', 'time'];
    
    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
            return false;
        }
    }
    
    // Validate phone number (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(data.phone.replace(/\D/g, '').slice(-10))) {
        alert('Please enter a valid Indian phone number.');
        return false;
    }
    
    // Validate date (not in the past)
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        alert('Please select a future date for your appointment.');
        return false;
    }
    
    return true;
}

function showSuccessToast() {
    const toast = document.getElementById('successToast');
    if (toast) {
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Set minimum date for appointment form
function setMinDate() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const minDate = tomorrow.toISOString().split('T')[0];
        dateInput.setAttribute('min', minDate);
    }
}

// Additional utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(price);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Contact form enhancements
function setupAdvancedFormFeatures() {
    const phoneInput = document.getElementById('phone');
    
    if (phoneInput) {
        // Format phone number as user types
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10);
            
            if (value.length >= 6) {
                value = value.replace(/(\d{5})(\d{1,5})/, '$1 $2');
            }
            
            e.target.value = value;
        });
    }
    
    // Service selection dropdown enhancement
    const serviceSelect = document.getElementById('service');
    const petTypeSelect = document.getElementById('petType');
    
    if (serviceSelect && petTypeSelect) {
        // Update service options based on pet type
        petTypeSelect.addEventListener('change', (e) => {
            const petType = e.target.value;
            updateServiceOptions(petType);
        });
    }
}

function updateServiceOptions(petType) {
    const serviceSelect = document.getElementById('service');
    const services = {
        dog: ['grooming', 'boarding', 'veterinary', 'training'],
        cat: ['grooming', 'boarding', 'veterinary'],
        bird: ['veterinary', 'boarding'],
        other: ['veterinary']
    };
    
    const availableServices = services[petType] || ['veterinary'];
    const options = serviceSelect.querySelectorAll('option');
    
    options.forEach(option => {
        if (option.value === '') return; // Keep the default option
        
        if (availableServices.includes(option.value)) {
            option.style.display = 'block';
            option.disabled = false;
        } else {
            option.style.display = 'none';
            option.disabled = true;
        }
    });
}

// Analytics and tracking (placeholder functions)
function trackPageView(pageName) {
    console.log(`Page view: ${pageName}`);
    // In real implementation, send to Google Analytics or other service
}

function trackEvent(category, action, label) {
    console.log(`Event: ${category} - ${action} - ${label}`);
    // In real implementation, send to analytics service
}

function trackFormSubmission(service) {
    trackEvent('Form', 'Submit', `Appointment - ${service}`);
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // In production, send error details to logging service
});

// Performance monitoring
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page load time: ${loadTime}ms`);
    trackEvent('Performance', 'Load Time', Math.round(loadTime));
});

// Service Worker registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export functions for global access
window.scrollToSection = scrollToSection;
window.formatPrice = formatPrice;
window.trackEvent = trackEvent;

// Initialize advanced features when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAdvancedFormFeatures);
} else {
    setupAdvancedFormFeatures();
} 