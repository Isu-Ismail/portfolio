import { data } from './data.js';

// Initialize Lucide Icons
const initIcons = () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }
};

// --- NEW FUNCTION: Update Resume Links in Nav ---
const updateResumeLinks = () => {
    const resumeLinks = document.querySelectorAll('.resume-link');
    resumeLinks.forEach(link => {
        link.href = data.resume;
        link.setAttribute('download', ''); // Force download
    });
};

// Render Functions
// ... existing imports ...

// 1. UPDATED RENDER HERO (Circular Layout)
const renderHero = () => {
    const hero = document.getElementById('hero');
    hero.innerHTML = `
        <div class="container hero-grid">
            <div class="hero-text fade-in-up">
                <span style="color: var(--primary); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.875rem;">
                    ${data.role}
                </span>
                <h1>
                    Hello, I'm <br />
                    <span style="color: var(--primary)">${data.name.split(" ")[1]}</span>.
                </h1>
                <p>${data.about.substring(0, 100)}...</p>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <a href="#projects" class="btn btn-primary">
                        View Projects <i data-lucide="arrow-right"></i>
                    </a>
                    <a href="${data.resume}" download class="btn btn-outline">
                        Resume <i data-lucide="download"></i>
                    </a>
                </div>
                <div style="display: flex; gap: 1.5rem; margin-top: 2rem;">
                    ${data.contact.github ? `<a href="${data.contact.github}" target="_blank"><i data-lucide="github"></i></a>` : ''}
                    ${data.contact.linkedin ? `<a href="${data.contact.linkedin}" target="_blank"><i data-lucide="linkedin"></i></a>` : ''}
                    <a href="mailto:${data.contact.email}"><i data-lucide="mail"></i></a>
                </div>
            </div>
            
            <div class="hero-image fade-in game-wrapper">
                <div class="game-window">
                    <div class="score-board">Score: <span id="scoreVal">0</span></div>
                    <canvas id="runnerCanvas"></canvas>
                    <div id="gameOverlay">
                        <div class="overlay-content">
                            <i data-lucide="play" style="width: 40px; height: 40px; margin-bottom: 10px;"></i>
                            <p>Press SPACE to Run</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// 2. UPDATED GAME LOGIC (Centered Road)
const initDinoGame = () => {
    const canvas = document.getElementById('runnerCanvas');
    const overlay = document.getElementById('gameOverlay');
    const scoreEl = document.getElementById('scoreVal');
    
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Resolution (Matches your CSS 550px)
    canvas.width = 550;
    canvas.height = 550;

    const GROUND_Y = 350;
    
    let gameRunning = false;
    let score = 0;
    let animationId;
    
    // Initial Speed
    let baseSpeed = 5; 
    let gameSpeed = baseSpeed;

    const dino = {
        x: 60,
        y: GROUND_Y - 30,
        width: 30,
        height: 30,
        dy: 0,
        // TWEAKED FOR SMOOTHNESS
        jumpPower: -9,   // Lower force (was -12)
        gravity: 0.3,    // Lower gravity (was 0.6) for floatier jump
        grounded: false
    };

    let obstacles = [];
    let frame = 0;

    const getColors = () => {
        const style = getComputedStyle(document.body);
        return {
            primary: style.getPropertyValue('--primary').trim(),
            text: style.getPropertyValue('--text').trim(),
            bg: style.getPropertyValue('--bg').trim(),
            muted: style.getPropertyValue('--muted').trim()
        };
    };

    function spawnObstacle() {
        const height = Math.random() * (50 - 25) + 25;
        obstacles.push({
            x: canvas.width,
            y: GROUND_Y - height,
            width: 20,
            height: height, 
            passed: false
        });
    }

    function draw() {
        const colors = getColors();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Road
        ctx.fillStyle = colors.text;
        ctx.fillRect(0, GROUND_Y, canvas.width, 4); 

        // Ground Fill
        ctx.fillStyle = colors.muted; 
        ctx.globalAlpha = 0.2; 
        ctx.fillRect(0, GROUND_Y + 4, canvas.width, canvas.height - GROUND_Y);
        ctx.globalAlpha = 1.0;

        // Dino
        ctx.fillStyle = colors.primary;
        ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
        ctx.fillStyle = colors.bg;
        ctx.fillRect(dino.x + 20, dino.y + 5, 4, 4);

        // Obstacles
        ctx.fillStyle = colors.text;
        obstacles.forEach(obs => {
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });
    }

    function update() {
        if (!gameRunning) return;

        animationId = requestAnimationFrame(update);
        frame++;

        // --- NEW SPEED LOGIC ---
        // Speed increases by 0.1 for every point scored
        // Cap the max speed at 15 so it doesn't become impossible
        gameSpeed = Math.min(10, baseSpeed + (score * 0.01));

        // Physics
        dino.dy += dino.gravity;
        dino.y += dino.dy;

        // Ground Collision
        if (dino.y + dino.height > GROUND_Y) {
            dino.y = GROUND_Y - dino.height;
            dino.dy = 0;
            dino.grounded = true;
        } else {
            dino.grounded = false;
        }

        // Spawning (Adjust rate based on speed so gaps don't get too wide)
        // As speed goes up, we spawn slightly faster to keep difficulty consistent
        let spawnRate = Math.floor(100 - (gameSpeed * 2)); 
        if (frame % spawnRate === 0) {
            spawnObstacle();
        }

        // Obstacles Movement & Collision
        for (let i = 0; i < obstacles.length; i++) {
            let obs = obstacles[i];
            obs.x -= gameSpeed;

            // Collision
            if (
                dino.x < obs.x + obs.width &&
                dino.x + dino.width > obs.x &&
                dino.y < obs.y + obs.height &&
                dino.y + dino.height > obs.y
            ) {
                gameOver();
            }

            // Score update
            if (obs.x + obs.width < 0) {
                obstacles.splice(i, 1);
                score++;
                scoreEl.textContent = score;
                i--;
            }
        }
        draw();
    }

    function jump() {
        if (dino.grounded) {
            dino.dy = dino.jumpPower;
            dino.grounded = false;
        }
    }

    function startGame() {
        if (gameRunning) return;
        gameRunning = true;
        score = 0;
        gameSpeed = baseSpeed; // Reset speed
        scoreEl.textContent = 0;
        obstacles = [];
        dino.y = GROUND_Y - 30;
        frame = 0;
        overlay.style.display = 'none';
        update();
    }

    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        overlay.style.display = 'flex';
        overlay.innerHTML = `
            <div class="overlay-content">
                <h3 style="color:var(--primary); margin-bottom:10px;">System Crashed!</h3>
                <p style="font-size:1.5rem; font-weight:bold;">Score: ${score}</p>
                <p style="font-size:0.9rem; margin-top:10px; color:var(--muted)">Tap or Space to Reboot</p>
            </div>
        `;
    }

    // Input Listeners
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (!gameRunning) {
                if(overlay.innerHTML.includes("Crashed")) startGame();
                else startGame();
            } else {
                jump();
            }
        }
    });

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!gameRunning) startGame();
        else jump();
    });
    
    draw();
};

// ... Call initDinoGame() inside DOMContentLoaded ...

const renderAbout = () => {
    const about = document.getElementById('about');
    about.innerHTML = `
        <div class="container about-grid">
            <div class="about-image fade-in-left">
                 <div style="aspect-ratio: 4/5; border-radius: 1rem; overflow: hidden; transform: rotate(-3deg); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                    <img src="${data.images.profile}" alt="Ismail" style="width: 100%; height: 100%; object-fit: cover;">
                 </div>
            </div>
            <div class="about-text fade-in-right">
                <h2 style="font-size: 2.5rem; margin-bottom: 1.5rem;">About Me</h2>
                <p style="color: var(--muted); font-size: 1.1rem; margin-bottom: 1rem;">
                    ${data.about}
                </p>
                
                <div class="stats">
                    <div class="stat-card">
                        <span class="stat-number">Waiting to gain some + </span>
                        <span class="stat-label">Years Experience</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${data.projects.length}+</span>
                        <span class="stat-label">Projects Completed</span>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const renderEducation = () => {
    const education = document.getElementById('education');
    const items = data.education.map(edu => `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-date">
                <i data-lucide="calendar" width="14"></i> ${edu.period}
            </div>
            <h3>${edu.degree}</h3>
            <h4 style="color: var(--muted); margin-bottom: 0.5rem;">${edu.institution}</h4>
            <p style="color: var(--muted); font-size: 0.9rem;">${edu.description || ''}</p>
        </div>
    `).join('');

    education.innerHTML = `
        <div class="container">
             <div style="text-center; max-width: 600px; margin: 0 auto 3rem auto; text-align: center;">
                <h2 style="font-size: 2.5rem; margin-bottom: 0.5rem;">Education</h2>
                <p style="color: var(--muted);">My academic journey.</p>
            </div>
            <div class="timeline" style="max-width: 800px; margin: 0 auto;">
                ${items}
            </div>
        </div>
    `;
};

const renderProjects = () => {
    const projects = document.getElementById('projects');
    const items = data.projects.map(project => `
        <div class="project-card">
            <div>
                <div class="project-header">
                    <h3 style="font-size: 1.25rem;">${project.title}</h3>
                    ${project.link !== '#' ? `<a href="${project.link}" target="_blank" style="color: var(--muted);"><i data-lucide="arrow-up-right"></i></a>` : ''}
                </div>
                <p style="color: var(--muted); font-size: 0.9rem;">${project.description}</p>
            </div>
            <div class="project-tags">
                ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');

    projects.innerHTML = `
        <div class="container">
            <div style="text-center; max-width: 600px; margin: 0 auto 3rem auto; text-align: center;">
                <h2 style="font-size: 2.5rem; margin-bottom: 0.5rem;">Featured Projects</h2>
                <p style="color: var(--muted);">Architecture. Development. Innovation.</p>
            </div>
            <div class="projects-grid">
                ${items}
            </div>
        </div>
    `;
};

const renderCertificates = () => {
    const certSection = document.getElementById('certificates');
    
    // Check if certificates exist
    if (!data.certificates || data.certificates.length === 0) return;

    // Generate Slides HTML
    const slidesHTML = data.certificates.map((cert, index) => `
        <div class="carousel-slide">
            <img src="${cert.image}" alt="${cert.title}">
            <div class="carousel-caption">
                <h3>${cert.title}</h3>
                <p>${cert.desc}</p>
            </div>
        </div>
    `).join('');

    // Generate Dots HTML
    const dotsHTML = data.certificates.map((_, index) => `
        <span class="dot" data-index="${index}"></span>
    `).join('');

    // Inject Structure
    certSection.innerHTML = `
        <div class="container">
            <div style="text-align: center; max-width: 600px; margin: 0 auto 3rem auto;">
                <h2 style="font-size: 2.5rem; margin-bottom: 0.5rem;">Certifications</h2>
                <p style="color: var(--muted);">My credentials and achievements.</p>
            </div>
            
            <div class="carousel-container">
                <div class="carousel-track" id="track">
                    ${slidesHTML}
                </div>
            </div>
            
            <div class="carousel-dots" id="dots-container">
                ${dotsHTML}
            </div>
        </div>
    `;

    // Start the Carousel Logic
    initCarousel();
};

// === CAROUSEL LOGIC ===
const initCarousel = () => {
    const track = document.getElementById('track');
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.carousel-slide');
    
    if(!track || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;

    // Function to update slide
    const updateSlide = (index) => {
        track.style.transform = `translateX(-${index * 100}%)`;
        
        // Update dots
        dots.forEach(dot => dot.classList.remove('active'));
        if(dots[index]) dots[index].classList.add('active');
        
        currentIndex = index;
    };

    // Auto Slide Loop
    const startAutoSlide = () => {
        return setInterval(() => {
            let nextIndex = (currentIndex + 1) % totalSlides;
            updateSlide(nextIndex);
        }, 4000); // Change image every 4 seconds
    };

    // Initialize first state
    updateSlide(0);
    let slideInterval = startAutoSlide();

    // Add Click Listeners to Dots (Manual Navigation)
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            clearInterval(slideInterval); // Stop auto slide on interaction
            updateSlide(index);
            slideInterval = startAutoSlide(); // Restart auto slide
        });
    });
};

// ... (Keep the main event listener at the bottom) ...


const renderSkills = () => {
    const skills = document.getElementById('skills');
    const items = data.skills.map(skill => `
        <span class="skill-pill">${skill}</span>
    `).join('');

    skills.innerHTML = `
        <div class="container section">
            <div style="text-align: center; margin-bottom: 3rem;">
                <h2 style="font-size: 2.5rem;">Technical Arsenal</h2>
            </div>
            <div class="skills-container">
                ${items}
            </div>
        </div>
    `;
};

const renderContact = () => {
    const contact = document.getElementById('contact');
    contact.innerHTML = `
        <div class="container contact-grid">
            <div>
                <h2 style="font-size: 3rem; margin-bottom: 1.5rem; line-height: 1.1;">Let's work together.</h2>
                <p style="font-size: 1.1rem; color: var(--muted); margin-bottom: 3rem;">
                    I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
                </p>
                
                <div class="contact-info">
                    <div class="contact-info-item">
                        <div class="icon-box"><i data-lucide="mail"></i></div>
                        <span>${data.contact.email}</span>
                    </div>
                    <div class="contact-info-item">
                        <div class="icon-box"><i data-lucide="phone"></i></div>
                        <span>${data.contact.phone}</span>
                    </div>
                    <div class="contact-info-item">
                        <div class="icon-box"><i data-lucide="map-pin"></i></div>
                        <span>${data.contact.location}</span>
                    </div>
                </div>
            </div>
            
            <div style="background: var(--card-bg); padding: 2rem; border-radius: 1rem; border: 1px solid var(--border); backdrop-filter: blur(5px);">
                <form>
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" class="form-input" placeholder="Your Name">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" class="form-input" placeholder="john@example.com">
                    </div>
                    <div class="form-group">
                        <label>Message</label>
                        <textarea class="form-input" rows="4" placeholder="Tell me about your project..."></textarea>
                    </div>
                    <button type="button" class="btn btn-primary" style="width: 100%;">Send Message</button>
                </form>
            </div>
        </div>
    `;
};

const renderFooter = () => {
    document.getElementById('footer-year').textContent = new Date().getFullYear();
    document.getElementById('footer-name').textContent = data.name;
};

// Theme Toggle
const initTheme = () => {
    const toggle = document.getElementById('theme-toggle');
    const toggleMobile = document.getElementById('theme-toggle-mobile');
    const body = document.body;
    
    // Check saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
        updateIcons(savedTheme);
    }

    const toggleTheme = () => {
        const current = body.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateIcons(next);
    };

    if(toggle) toggle.addEventListener('click', toggleTheme);
    if(toggleMobile) toggleMobile.addEventListener('click', toggleTheme);
};

const updateIcons = (theme) => {
    const icons = document.querySelectorAll('.theme-icon');
    icons.forEach(icon => {
        if(theme === 'dark') {
            icon.setAttribute('data-lucide', 'sun');
        } else {
            icon.setAttribute('data-lucide', 'moon');
        }
    });
    initIcons(); // Re-render icons
};

// Mobile Menu
const initMobileMenu = () => {
    const btn = document.getElementById('mobile-menu-btn');
    const close = document.getElementById('mobile-close');
    const menu = document.getElementById('mobile-menu');
    const links = document.querySelectorAll('.mobile-link');

    const toggleMenu = () => {
        menu.classList.toggle('open');
    };

    if(btn) btn.addEventListener('click', toggleMenu);
    if(close) close.addEventListener('click', toggleMenu);
    
    links.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });
};

// Terminal Logic
const initTerminal = () => {
    const overlay = document.getElementById('terminal-overlay');
    const openBtn = document.getElementById('term-toggle');
    const closeBtn = document.getElementById('close-terminal');
    const input = document.getElementById('commandInput');
    const output = document.getElementById('terminalOutput');

    // Open Terminal
    if(openBtn) {
        openBtn.addEventListener('click', () => {
            overlay.classList.remove('hidden');
            input.focus();
        });
    }

    // Close Terminal
    const closeTerminal = () => {
        overlay.classList.add('hidden');
    };

    if(closeBtn) closeBtn.addEventListener('click', closeTerminal);
    
    // Close on click outside
    overlay.addEventListener('click', (e) => {
        if(e.target === overlay) closeTerminal();
    });

    // Handle Input
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = input.value.trim().toLowerCase();
            handleCommand(command);
            input.value = '';
        }
    });

    const handleCommand = (cmd) => {
        // Add user command to history
        output.innerHTML += `<div class="output-line"><span class="prompt">➜</span> <span class="cmd">${cmd}</span></div>`;

        let response = '';

        switch(cmd) {
            case 'help':
                response = `Available commands: <span class="highlight">about, education, projects, skills, certificates, contact, clear, exit</span>`;
                break;
            case 'about':
                response = data.about;
                break;
            case 'education':
                data.education.forEach(edu => {
                    response += `<div style="margin-bottom: 5px; color: #fff;">${edu.degree}</div><div style="color: #888;">${edu.institution} (${edu.period})</div><br>`;
                });
                break;
            case 'projects':
                data.projects.forEach(p => {
                    response += `<div style="margin-bottom: 5px;"><span class="highlight">${p.title}</span> <span style="font-size: 0.8em; color: #666;">[${p.tags.join(', ')}]</span></div><div style="color: #ccc; margin-bottom: 10px;">${p.description}</div>`;
                });
                break;
            case 'certificates':
                 if(data.certificates) {
                    data.certificates.forEach(c => {
                        response += `<div><span class="highlight">★ ${c.title}</span></div><div style="color:#888; margin-bottom: 5px;">${c.issuer} - ${c.date}</div>`;
                    });
                 } else {
                     response = "No certificates loaded.";
                 }
                 break;
            case 'skills':
                response = data.skills.join('  •  ');
                break;
            case 'contact':
                response = `Email: ${data.contact.email}<br>GitHub: ${data.contact.github}<br>Phone: ${data.contact.phone}`;
                break;
            case 'clear':
                output.innerHTML = '';
                return;
            case 'exit':
                closeTerminal();
                return;
            default:
                response = `Command not found: ${cmd}. Type 'help'.`;
        }

        if(response) {
            output.innerHTML += `<div class="response">${response}</div>`;
        }
        
        // Scroll to bottom
        output.scrollTop = output.scrollHeight;
    };
};

// Main Init
document.addEventListener('DOMContentLoaded', () => {
    renderHero();
    initDinoGame();
    renderAbout();
    renderEducation();
    renderProjects();
    renderCertificates();
    renderSkills();
    renderContact();
    renderFooter();
    
    updateResumeLinks(); // Update navbar resume links
    initTheme();
    initMobileMenu();
    initIcons();
    initTerminal();
});