// ============================================
// SUPER DENSE INTERACTIVE NETWORK BACKGROUND
// ============================================

class NetworkBackground {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.maxDistance = 250;  // Even longer connections!
        this.particleCount = 150;  // 200 particles for SUPER dense effect
        
        this.init();
    }
    
    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        
        const container = document.getElementById('three-container');
        if (container) {
            container.appendChild(this.canvas);
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Create particles
        this.createParticles();
        
        // Event listeners
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Start animation
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2.5 + 1
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach((particle, i) => {
            // Move particles
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Mouse interaction - particles move away from mouse
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                const force = (150 - distance) / 150;
                particle.x -= dx * force * 0.03;
                particle.y -= dy * force * 0.03;
            }
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // Keep within bounds
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            
            // Draw particle with glow
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0, 212, 255, 0.9)';
            this.ctx.fill();
            
            // Draw lines to nearby particles
            for (let j = i + 1; j < this.particles.length; j++) {
                const other = this.particles[j];
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.maxDistance) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    const opacity = (1 - distance / this.maxDistance) * 0.7;  // Higher opacity
                    this.ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
                    this.ctx.lineWidth = 1.2;
                    this.ctx.stroke();
                }
            }
            
            // Draw line to mouse if close
            const mouseDistance = Math.sqrt(
                (particle.x - this.mouseX) ** 2 + (particle.y - this.mouseY) ** 2
            );
            
            if (mouseDistance < this.maxDistance) {
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(this.mouseX, this.mouseY);
                const opacity = (1 - mouseDistance / this.maxDistance) * 0.9;
                this.ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// ENHANCED SPACESHIP CURSOR SYSTEM
// ============================================
let spaceshipX = 0, spaceshipY = 0;
let targetX = 0, targetY = 0;
let velocityX = 0, velocityY = 0;
let lastX = 0, lastY = 0;
let angle = 0;
let speed = 0;
const trails = [];
const maxTrails = 30;

function initSpaceshipCursor() {
    const spaceship = document.getElementById('spaceship-cursor');
    const engineGlow = document.getElementById('engine-glow');
    
    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        
        velocityX = targetX - lastX;
        velocityY = targetY - lastY;
        speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        
        const deltaX = targetX - spaceshipX;
        const deltaY = targetY - spaceshipY;
        angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        
        lastX = targetX;
        lastY = targetY;
        
        createTrailParticle(spaceshipX, spaceshipY);
    });
    
    function updateSpaceship() {
        const ease = 0.15;
        spaceshipX += (targetX - spaceshipX) * ease;
        spaceshipY += (targetY - spaceshipY) * ease;
        
        spaceship.style.left = spaceshipX + 'px';
        spaceship.style.top = spaceshipY + 'px';
        spaceship.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;
        
        const glowIntensity = Math.min(speed / 10, 1);
        engineGlow.style.opacity = 0.5 + (glowIntensity * 0.5);
        engineGlow.style.transform = `scale(${1 + glowIntensity * 0.5})`;
        
        requestAnimationFrame(updateSpaceship);
    }
    updateSpaceship();
}

function createTrailParticle(x, y) {
    if (trails.length >= maxTrails) {
        const oldTrail = trails.shift();
        oldTrail.remove();
    }
    
    const trail = document.createElement('div');
    trail.className = 'spaceship-trail';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    document.body.appendChild(trail);
    trails.push(trail);
    
    setTimeout(() => {
        trail.style.opacity = '0';
        trail.style.transform = 'scale(0)';
    }, 10);
    
    setTimeout(() => {
        trail.remove();
        const index = trails.indexOf(trail);
        if (index > -1) trails.splice(index, 1);
    }, 800);
}

// ============================================
// ALL OTHER FUNCTIONS
// ============================================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

const observerOptions = { threshold: 0.5 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const skillProgress = entry.target;
            const targetWidth = skillProgress.style.width;
            skillProgress.style.width = '0%';
            setTimeout(() => { skillProgress.style.width = targetWidth; }, 100);
        }
    });
}, observerOptions);
document.querySelectorAll('.skill-progress').forEach(bar => observer.observe(bar));

document.querySelectorAll('.ripple-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });
document.querySelectorAll('.glass-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(card);
});

// Initialize everything
window.addEventListener('DOMContentLoaded', () => {
    new NetworkBackground();
    initSpaceshipCursor();
    document.body.classList.add('loaded');
});

let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    const navbar = document.querySelector('header');
    if (currentScroll > lastScroll && currentScroll > 100) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    lastScroll = currentScroll;
});

console.log('%c🌐 SUPER DENSE NETWORK LOADED! ', 'background: #2a2a2a; color: #00d4ff; padding: 12px 24px; border-radius: 8px; font-size: 18px; font-weight: bold;');

