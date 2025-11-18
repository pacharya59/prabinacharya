// ============================================
// REALISTIC SPACE BACKGROUND + ENHANCED SPACESHIP
// ============================================
let scene, camera, renderer;
let stars, distantStars;
let planets = [];
let shootingStars = [];
let mouseX = 0, mouseY = 0;
let smoothMouseX = 0, smoothMouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// Spaceship cursor variables
let spaceshipX = 0, spaceshipY = 0;
let targetX = 0, targetY = 0;
let velocityX = 0, velocityY = 0;
let lastX = 0, lastY = 0;
let angle = 0;
let speed = 0;
const trails = [];
const maxTrails = 30;

function initThreeJS() {
    const container = document.getElementById('three-container');
    if (!container) return;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.00008);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 80);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x222244, 0.2);
    scene.add(ambientLight);

    createStarfield();
    createDistantStarfield();
    createBeautifulPlanets();
    createShootingStars();

    animate();
}

function createStarfield() {
    const starCount = 8000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
        // Spread stars in a sphere around camera
        const radius = 300 + Math.random() * 400;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        // Realistic star colors
        const colorChoice = Math.random();
        let r, g, b;
        if (colorChoice < 0.6) {
            // White stars (most common)
            r = 0.9 + Math.random() * 0.1;
            g = 0.9 + Math.random() * 0.1;
            b = 0.95 + Math.random() * 0.05;
        } else if (colorChoice < 0.8) {
            // Blue-white stars
            r = 0.7 + Math.random() * 0.2;
            g = 0.8 + Math.random() * 0.2;
            b = 1;
        } else if (colorChoice < 0.95) {
            // Yellow-white stars
            r = 1;
            g = 0.95 + Math.random() * 0.05;
            b = 0.8 + Math.random() * 0.15;
        } else {
            // Red stars (rare)
            r = 1;
            g = 0.6 + Math.random() * 0.2;
            b = 0.6 + Math.random() * 0.2;
        }
        
        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
        
        // Varied star sizes for depth
        sizes[i] = Math.random() * 2.5 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
    });

    stars = new THREE.Points(geometry, material);
    scene.add(stars);
}

function createDistantStarfield() {
    // Very distant, smaller stars for depth
    const distantCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(distantCount * 3);
    const colors = new Float32Array(distantCount * 3);
    
    for (let i = 0; i < distantCount; i++) {
        const radius = 800 + Math.random() * 500;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        const brightness = 0.4 + Math.random() * 0.6;
        colors[i * 3] = brightness;
        colors[i * 3 + 1] = brightness;
        colors[i * 3 + 2] = brightness + 0.1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });

    distantStars = new THREE.Points(geometry, material);
    scene.add(distantStars);
}

function createBeautifulPlanets() {
    const planetData = [
        // [x, y, z, size, color, glowColor, hasRings]
        [-180, 50, -280, 8, 0xff8844, 0xff6622, false], // Orange giant
        [200, -60, -350, 6, 0x4488ff, 0x2266dd, false], // Blue planet
        [-150, 80, -200, 5, 0xcc4444, 0xaa2222, false], // Red mars-like
        [220, 40, -400, 10, 0xeebb88, 0xddaa77, true],  // Saturn-like with rings
        [100, -80, -250, 4, 0x88ff88, 0x66dd66, false], // Green exotic
        [-250, -40, -450, 7, 0xaaaaff, 0x8888dd, false], // Purple gas giant
    ];

    planetData.forEach(([x, y, z, size, color, glowColor, hasRings]) => {
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.85
        });
        const planet = new THREE.Mesh(geometry, material);
        planet.position.set(x, y, z);

        // Multi-layer glow for depth
        const glow1 = new THREE.Mesh(
            new THREE.SphereGeometry(size * 1.15, 32, 32),
            new THREE.MeshBasicMaterial({
                color: glowColor,
                transparent: true,
                opacity: 0.3,
                side: THREE.BackSide
            })
        );
        planet.add(glow1);

        const glow2 = new THREE.Mesh(
            new THREE.SphereGeometry(size * 1.3, 32, 32),
            new THREE.MeshBasicMaterial({
                color: glowColor,
                transparent: true,
                opacity: 0.15,
                side: THREE.BackSide
            })
        );
        planet.add(glow2);

        // Add rings for Saturn-like planet
        if (hasRings) {
            const ringGeometry = new THREE.RingGeometry(size * 1.5, size * 2.2, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0xccaa88,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.6
            });
            const rings = new THREE.Mesh(ringGeometry, ringMaterial);
            rings.rotation.x = Math.PI / 2.5;
            planet.add(rings);
        }

        planets.push({
            mesh: planet,
            rotationSpeed: 0.0002 + Math.random() * 0.0003
        });

        scene.add(planet);
    });
}

function createShootingStars() {
    setInterval(() => {
        if (Math.random() < 0.4) { // 40% chance every interval
            const startX = (Math.random() - 0.5) * 300;
            const startY = 50 + Math.random() * 100;
            const startZ = -100 - Math.random() * 200;

            const endX = startX - 80 - Math.random() * 50;
            const endY = startY - 60 - Math.random() * 40;
            const endZ = startZ - 50 - Math.random() * 50;

            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array([
                startX, startY, startZ,
                startX, startY, startZ
            ]);
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const material = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 1,
                linewidth: 2
            });

            const shootingStar = new THREE.Line(geometry, material);
            scene.add(shootingStar);

            let progress = 0;
            const animateShooting = () => {
                progress += 0.03;
                if (progress > 1.2) {
                    scene.remove(shootingStar);
                    return;
                }

                const positions = shootingStar.geometry.attributes.position.array;
                const currentX = startX + (endX - startX) * progress;
                const currentY = startY + (endY - startY) * progress;
                const currentZ = startZ + (endZ - startZ) * progress;

                positions[0] = currentX;
                positions[1] = currentY;
                positions[2] = currentZ;

                const tailProgress = Math.max(0, progress - 0.15);
                positions[3] = startX + (endX - startX) * tailProgress;
                positions[4] = startY + (endY - startY) * tailProgress;
                positions[5] = startZ + (endZ - startZ) * tailProgress;

                shootingStar.geometry.attributes.position.needsUpdate = true;
                shootingStar.material.opacity = Math.max(0, 1 - progress);

                requestAnimationFrame(animateShooting);
            };
            animateShooting();
        }
    }, 2500); // Every 2.5 seconds
}

function animate() {
    requestAnimationFrame(animate);
    
    // PARALLAX EFFECT
    smoothMouseX += (mouseX - smoothMouseX) * 0.05;
    smoothMouseY += (mouseY - smoothMouseY) * 0.05;
    
    camera.position.x = smoothMouseX * 20;
    camera.position.y = -smoothMouseY * 15;
    camera.lookAt(scene.position);
    
    // Rotate starfield with parallax
    if (stars) {
        stars.rotation.y = smoothMouseX * 0.25;
        stars.rotation.x = -smoothMouseY * 0.15;
    }
    
    if (distantStars) {
        distantStars.rotation.y = smoothMouseX * 0.1;
        distantStars.rotation.x = -smoothMouseY * 0.05;
    }

    // Slowly rotate planets
    planets.forEach(p => {
        p.mesh.rotation.y += p.rotationSpeed;
    });

    renderer.render(scene, camera);
}

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
});

window.addEventListener('resize', () => {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});


// ============================================
// ENHANCED SPACESHIP CURSOR SYSTEM
// ============================================
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
// ALL OTHER FUNCTIONS (keeping your existing code)
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

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formSuccess = document.getElementById('formSuccess');
        setTimeout(() => {
            formSuccess.style.display = 'flex';
            contactForm.reset();
            setTimeout(() => { formSuccess.style.display = 'none'; }, 5000);
        }, 1000);
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

window.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
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

console.log('%c🚀 PARALLAX SPACESHIP PORTFOLIO LOADED! ', 'background: #000428; color: #00d4ff; padding: 12px 24px; border-radius: 8px; font-size: 18px; font-weight: bold;');
