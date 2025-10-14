// Three.js Scene Setup
let scene, camera, renderer, particles;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

function initThreeJS() {
    const container = document.getElementById('three-container');
    if (!container) return; // Don't run if container not found

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const color = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() * 2 - 1) * 100;
        positions[i * 3 + 1] = (Math.random() * 2 - 1) * 100;
        positions[i * 3 + 2] = (Math.random() * 2 - 1) * 100;

        const hue = Math.random() * 0.3 + 0.55;
        color.setHSL(hue, 0.7, Math.random() * 0.3 + 0.4);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        sizes[i] = Math.random() * 0.25 + 0.05;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    animateThreeJS(); // Renamed to avoid conflict
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.0005;
    mouseY = (event.clientY - windowHalfY) * 0.0005;
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    if (camera && renderer) { // Check if camera and renderer are initialized
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

function animateThreeJS() { // Renamed
    requestAnimationFrame(animateThreeJS);
    if (particles && camera && scene && renderer) { // Check if all are initialized
        particles.rotation.x += 0.0002;
        particles.rotation.y += 0.0005;
        camera.position.x += (mouseX * 5 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 5 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }
}

// --- Gemini API Integration ---
const API_KEY = ""; // IMPORTANT: Leave empty, Canvas will provide it.

async function callGeminiAPI(promptText, outputElement, spinnerElement) {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    
    const payload = {
        contents: [{
            parts: [{ text: promptText }]
        }]
    };

    spinnerElement.classList.add('show');
    outputElement.classList.remove('show');
    outputElement.textContent = '';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API Error:", errorData);
            outputElement.textContent = `Error: ${errorData.error?.message || response.statusText}`;
        } else {
            const data = await response.json();
            if (data.candidates && data.candidates.length > 0 &&
                data.candidates[0].content && data.candidates[0].content.parts &&
                data.candidates[0].content.parts.length > 0) {
                outputElement.textContent = data.candidates[0].content.parts[0].text;
            } else {
                console.error("Unexpected API response structure:", data);
                outputElement.textContent = "Error: Could not retrieve valid content from AI.";
            }
        }
    } catch (error) {
        console.error("Fetch error:", error);
        outputElement.textContent = "Error: Could not connect to AI service.";
    } finally {
        spinnerElement.classList.remove('show');
        outputElement.classList.add('show');
    }
}

// Initialize scripts when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initThreeJS(); // Initialize 3D background

    // Mobile navigation toggle
    const mobileMenuButton = document.querySelector('.navbar-toggler');
    const mobileMenu = document.getElementById('top_menu_collapse_mobile');
    
    if (mobileMenuButton && mobileMenu) {
        const navLinksMobile = mobileMenu.querySelectorAll('.nav-link');
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex'); 
        });

        navLinksMobile.forEach(link => {
            link.addEventListener('click', () => {
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('flex');
                }
            });
        });
    }
    
    // Set current year in footer
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Active link highlighting for multi-page
    const desktopNavLinks = document.querySelectorAll('header#top-header nav ul:not(#top_menu_collapse_mobile ul) .nav-link');
    const mobileNavLinks = document.querySelectorAll('#top_menu_collapse_mobile .nav-link');
    const currentPage = window.location.pathname.split("/").pop() || "index.html"; // Get current page filename

    function setActiveLink(links) {
        links.forEach(link => {
            const linkPage = link.getAttribute('href').split("/").pop();
            if (linkPage === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    setActiveLink(desktopNavLinks);
    setActiveLink(mobileNavLinks);


    // AI Bio Enhancer (About Page Specific)
    const generateBioButton = document.getElementById('generateBioButton');
    const originalBioContentDiv = document.getElementById('originalBioContent');
    const bioSpinner = document.getElementById('bioSpinner');
    const enhancedBioOutput = document.getElementById('enhancedBioOutput');

    if (generateBioButton && originalBioContentDiv && bioSpinner && enhancedBioOutput) {
        generateBioButton.addEventListener('click', async () => {
            const originalBioText = originalBioContentDiv.innerText;
            const prompt = `Given the following professional bio:\n\n"${originalBioText}"\n\nGenerate 2-3 alternative, concise, and engaging bio snippets. Focus on different angles (e.g., one very short, one highlighting problem-solving, one emphasizing technical skills). Format each snippet clearly, perhaps using bullet points or distinct paragraphs for each alternative.`;
            callGeminiAPI(prompt, enhancedBioOutput, bioSpinner);
        });
    }

    // AI Blog Idea Generator (Blogs Page Specific)
    const generateBlogIdeasButton = document.getElementById('generateBlogIdeasButton');
    const blogTopicInput = document.getElementById('blogTopicInput');
    const blogIdeasSpinner = document.getElementById('blogIdeasSpinner');
    const blogIdeasOutput = document.getElementById('blogIdeasOutput');

    if (generateBlogIdeasButton && blogTopicInput && blogIdeasSpinner && blogIdeasOutput) {
        generateBlogIdeasButton.addEventListener('click', async () => {
            const topic = blogTopicInput.value.trim();
            if (!topic) {
                blogIdeasOutput.textContent = "Please enter a topic.";
                blogIdeasOutput.classList.add('show');
                return;
            }
            const prompt = `I'm an IT professional. Generate 3-5 blog post titles or key discussion points for a blog about "${topic}". Focus on practical insights, tutorials, or emerging trends relevant to IT support, networking, or systems administration. Present each idea clearly.`;
            callGeminiAPI(prompt, blogIdeasOutput, blogIdeasSpinner);
        });
    }
});
 
