/**
 * IndexAI - Core Application Logic
 */

const app = {
    state: {
        user: null,
        data: {
            images: [],
            ideas: [],
            knowledge: []
        },
        currentView: 'dashboard'
    },

    init() {
        console.log('IndexAI Initializing...');
        this.mockData.generateIfNeeded();
        this.threeBg.init();
        this.auth.check();
        this.ui.bindEvents();
    },

    // --- Mock Data Module ---
    mockData: {
        generateIfNeeded() {
            if (!localStorage.getItem('indexai_data')) {
                const data = {
                    images: Array.from({ length: 8 }).map((_, i) => ({
                        id: i,
                        url: `https://picsum.photos/seed/${i + 100}/400/300`,
                        tags: ['design', 'inspiration', 'ui'][i % 3 ? 0 : 1],
                        date: new Date().toISOString()
                    })),
                    ideas: [
                        { id: 1, title: 'AI Brain Concept', content: 'Use Three.js for neurons...', date: new Date().toISOString() },
                        { id: 2, title: 'Marketing Strategy', content: '# Q1 Goals\n- Reach 1M users', date: new Date().toISOString() }
                    ],
                    knowledge: [
                        { id: 1, title: 'React Hooks Guide', category: 'Dev', content: 'useEffect dependecy array...', date: new Date().toISOString() }
                    ]
                };
                localStorage.setItem('indexai_data', JSON.stringify(data));
            }
            app.state.data = JSON.parse(localStorage.getItem('indexai_data'));
        }
    },

    // --- Auth Module ---
    auth: {
        check() {
            const user = localStorage.getItem('indexai_user');
            if (user) {
                app.state.user = JSON.parse(user);
                app.router.navigate('dashboard');
                document.getElementById('login-screen').classList.add('hidden');
                document.getElementById('main-dashboard').classList.remove('hidden');
            }
        },
        login() {
            // Simulate network delay
            const btn = document.querySelector('#login-form button');
            const originalText = btn.innerText;
            btn.innerHTML = '<span class="loading loading-spinner"></span> ERROR_CORRECTION...';

            setTimeout(() => {
                const user = { name: 'Neo', email: 'neo@matrix.com', avatar: 'https://ui-avatars.com/api/?name=Neo' };
                localStorage.setItem('indexai_user', JSON.stringify(user));
                app.state.user = user;

                // Transition
                document.getElementById('login-screen').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('login-screen').classList.add('hidden');
                    document.getElementById('main-dashboard').classList.remove('hidden');
                    app.router.navigate('dashboard');
                }, 500);
            }, 1200);
        },
        logout() {
            localStorage.removeItem('indexai_user');
            location.reload();
        },
        toggleForm() {
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');

            if (loginForm.classList.contains('opacity-0')) {
                // Show Login
                loginForm.classList.remove('opacity-0', '-translate-x-full');
                registerForm.classList.add('opacity-0', 'translate-x-full');
                setTimeout(() => registerForm.classList.add('hidden'), 500);
                loginForm.classList.remove('hidden');
            } else {
                // Show Register
                loginForm.classList.add('opacity-0', '-translate-x-full');
                setTimeout(() => loginForm.classList.add('hidden'), 500);
                registerForm.classList.remove('hidden');
                // timeout to allow display:block to apply before opacity transition
                setTimeout(() => {
                    registerForm.classList.remove('opacity-0', 'translate-x-full');
                }, 50);
            }
        }
    },

    // --- Router Module ---
    router: {
        navigate(viewName) {
            app.state.currentView = viewName;

            // Update Nav State
            document.querySelectorAll('.nav-item').forEach(el => {
                if (el.dataset.view === viewName) {
                    el.classList.add('bg-white/10', 'text-white');
                    el.classList.remove('text-gray-400');
                } else {
                    el.classList.remove('bg-white/10', 'text-white');
                    el.classList.add('text-gray-400');
                }
            });

            // Update Header
            document.getElementById('current-view-name').innerText = viewName.charAt(0).toUpperCase() + viewName.slice(1);

            // Render Content
            const container = document.getElementById('content-area');
            container.innerHTML = '<div class="flex h-full items-center justify-center"><span class="loading loading-bars loading-lg text-primary"></span></div>';

            setTimeout(() => {
                app.ui.render(viewName);

                // Post-render initializations
                if (viewName === 'ideas' || viewName === 'knowledge') {
                    // Initialize SimpleMDE if text area exists
                    if (document.getElementById('idea-editor')) {
                        new SimpleMDE({ element: document.getElementById('idea-editor') });
                    }
                }
                if (viewName === 'images') {
                    app.ui.initDragDrop();
                }

            }, 300);
        }
    },

    // --- UI Rendering ---
    ui: {
        bindEvents() {
            document.querySelectorAll('.nav-item').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    app.router.navigate(link.dataset.view);
                });
            });
        },

        render(view) {
            const container = document.getElementById('content-area');
            let html = '';

            if (view === 'dashboard') {
                html = this.templates.dashboard();
                container.innerHTML = html;
                app.ui.initCharts();
            } else if (view === 'images') {
                html = this.templates.images();
                container.innerHTML = html;
            } else if (view === 'ideas') {
                html = this.templates.ideas();
                container.innerHTML = html;
            } else if (view === 'knowledge') {
                html = this.templates.knowledge();
                container.innerHTML = html;
            }
        },

        initDragDrop() {
            const dropZone = document.getElementById('upload-zone');
            if (!dropZone) return;

            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, preventDefaults, false);
            });

            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }

            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, highlight, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, unhighlight, false);
            });

            function highlight(e) {
                dropZone.classList.add('border-primary', 'bg-primary/10');
            }

            function unhighlight(e) {
                dropZone.classList.remove('border-primary', 'bg-primary/10');
            }

            dropZone.addEventListener('drop', handleDrop, false);

            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                handleFiles(files);
            }

            function handleFiles(files) {
                // Simulate upload
                const filesArray = [...files];
                filesArray.forEach(uploadFile);
            }

            function uploadFile(file) {
                // Mock upload
                // In a real app, you'd verify type, size, then upload.
                // Here we just add a mock image to the list for demo.
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = function () {
                    const newImg = {
                        id: Date.now(),
                        url: reader.result,
                        tags: 'upload',
                        date: new Date().toISOString()
                    };
                    app.state.data.images.unshift(newImg);
                    app.router.navigate('images'); // Re-render

                    // Show toast
                    // (Simplification: just basic alert or console for now, or daisyUI toast if we had the container)
                    console.log('Image uploaded');
                }
            }
        },

        templates: {
            dashboard() {
                const { images, ideas, knowledge } = app.state.data;
                return `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <!-- Stat Cards -->
                        <div class="glass-panel p-6 rounded-2xl hover-card-effect">
                            <div class="stat-title text-gray-400 text-sm font-medium uppercase tracking-wider">Total Logic</div>
                            <div class="stat-value text-3xl font-bold mt-2 text-white">${images.length + ideas.length + knowledge.length}</div>
                            <div class="stat-desc text-green-400 mt-2 flex items-center gap-1"><i class="fas fa-arrow-up"></i> 12% growth</div>
                        </div>
                        <div class="glass-panel p-6 rounded-2xl hover-card-effect border-l-4 border-l-primary">
                            <div class="stat-title text-gray-400 text-sm font-medium uppercase tracking-wider">Visual Memories</div>
                            <div class="stat-value text-3xl font-bold mt-2 text-white">${images.length}</div>
                        </div>
                        <div class="glass-panel p-6 rounded-2xl hover-card-effect border-l-4 border-l-secondary">
                            <div class="stat-title text-gray-400 text-sm font-medium uppercase tracking-wider">Sparks</div>
                            <div class="stat-value text-3xl font-bold mt-2 text-white">${ideas.length}</div>
                        </div>
                        <div class="glass-panel p-6 rounded-2xl hover-card-effect border-l-4 border-l-accent">
                            <div class="stat-title text-gray-400 text-sm font-medium uppercase tracking-wider">Knowledge Nodes</div>
                            <div class="stat-value text-3xl font-bold mt-2 text-white">${knowledge.length}</div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
                        <div class="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col">
                            <h3 class="text-lg font-bold mb-4">Neural Activity</h3>
                            <div class="flex-1 relative w-full h-full">
                                <canvas id="chart-activity"></canvas>
                            </div>
                        </div>
                        <div class="glass-panel p-6 rounded-2xl flex flex-col">
                            <h3 class="text-lg font-bold mb-4">Data Composition</h3>
                            <div class="flex-1 relative w-full h-full flex items-center justify-center">
                                <canvas id="chart-composition"></canvas>
                            </div>
                        </div>
                    </div>
                `;
            },
            images() {
                return `
                    <div class="mb-6 flex justify-between items-center">
                        <div class="flex gap-2">
                             <input type="text" placeholder="Search visuals..." class="input input-bordered input-sm bg-black/20 w-64" />
                        </div>
                        <button class="btn btn-primary btn-sm gap-2">
                            <i class="fas fa-cloud-upload-alt"></i> Upload
                        </button>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                         <!-- Upload Zone -->
                         <div id="upload-zone" class="border-2 border-dashed border-gray-700/50 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-primary/50 hover:text-primary transition-all cursor-pointer min-h-[200px]">
                            <i class="fas fa-plus text-2xl mb-2"></i>
                            <span class="text-sm">Drop images here</span>
                        </div>
                        ${app.state.data.images.map(img => `
                            <div class="group relative aspect-square rounded-xl overflow-hidden cursor-pointer">
                                <img src="${img.url}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <span class="badge badge-primary badge-sm">${img.tags}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            },
            ideas() {
                return `
                    <div class="mb-6 flex justify-end">
                         <button class="btn btn-primary btn-sm gap-2" onclick="document.getElementById('new-idea-modal').showModal()">
                            <i class="fas fa-plus"></i> New Idea
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${app.state.data.ideas.map(idea => `
                            <div class="glass-panel p-6 rounded-2xl hover:border-primary/30 transition-colors cursor-pointer group">
                                <div class="flex justify-between items-start mb-4">
                                    <div class="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                        <i class="fas fa-lightbulb"></i>
                                    </div>
                                    <span class="text-xs text-gray-500">${new Date(idea.date).toLocaleDateString()}</span>
                                </div>
                                <h3 class="text-xl font-bold mb-2 group-hover:text-primary transition-colors">${idea.title}</h3>
                                <p class="text-gray-400 text-sm line-clamp-3">${idea.content}</p>
                            </div>
                        `).join('')}
                    </div>

                    <!-- New Idea Modal -->
                    <dialog id="new-idea-modal" class="modal">
                        <div class="modal-box w-11/12 max-w-4xl bg-[#1a1a1a] border border-white/10" style="height: 80vh">
                            <h3 class="font-bold text-lg mb-4">Capture Spark</h3>
                            <input type="text" placeholder="Idea Title..." class="input input-bordered w-full mb-4 bg-black/20" />
                            <textarea id="idea-editor"></textarea>
                            <div class="modal-action">
                                <form method="dialog">
                                    <button class="btn btn-ghost">Discard</button>
                                    <button class="btn btn-primary" onclick="/* Save logic here */">Save Spark</button>
                                </form>
                            </div>
                        </div>
                    </dialog>
                `;
            },
            knowledge() {
                // Generate simple graph data if not present
                const nodes = [
                    { id: 1, x: 50, y: 50, label: 'AI Core' },
                    { id: 2, x: 30, y: 30, label: 'ML' },
                    { id: 3, x: 70, y: 30, label: 'Neural Net' },
                    { id: 4, x: 20, y: 70, label: 'Python' },
                    { id: 5, x: 80, y: 70, label: 'Three.js' }
                ];

                // SVG Lines
                const lines = `
                    <line x1="50%" y1="50%" x2="30%" y2="30%" stroke="rgba(59, 130, 246, 0.3)" stroke-width="2" />
                    <line x1="50%" y1="50%" x2="70%" y2="30%" stroke="rgba(59, 130, 246, 0.3)" stroke-width="2" />
                    <line x1="50%" y1="50%" x2="20%" y2="70%" stroke="rgba(59, 130, 246, 0.3)" stroke-width="2" />
                    <line x1="50%" y1="50%" x2="80%" y2="70%" stroke="rgba(59, 130, 246, 0.3)" stroke-width="2" />
                `;

                return `
                    <div class="glass-panel p-6 rounded-2xl h-[calc(100vh-140px)] relative overflow-hidden flex flex-col">
                        <div class="flex justify-between items-center mb-4 z-10">
                            <h3 class="text-xl font-bold">Knowledge Network</h3>
                             <button class="btn btn-primary btn-sm gap-2">
                                <i class="fas fa-plus"></i> Add Node
                            </button>
                        </div>
                        
                        <div class="flex-1 relative bg-black/20 rounded-xl overflow-hidden cursor-move">
                            <svg class="absolute inset-0 w-full h-full pointer-events-none">
                                ${lines}
                            </svg>
                            
                            <!-- Central Node -->
                            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary/20 backdrop-blur-md rounded-full border border-primary flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.5)] z-10">
                                <span class="font-bold text-white">IndexAI</span>
                            </div>

                            <!-- Satellite Nodes -->
                            <div class="absolute top-[30%] left-[30%] w-16 h-16 bg-secondary/20 backdrop-blur-md rounded-full border border-secondary flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10">
                                <span class="text-xs text-secondary font-bold">ML</span>
                            </div>
                            <div class="absolute top-[30%] left-[70%] w-16 h-16 bg-accent/20 backdrop-blur-md rounded-full border border-accent flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10">
                                <span class="text-xs text-accent font-bold">DeepL</span>
                            </div>
                            <div class="absolute top-[70%] left-[20%] w-20 h-20 bg-green-500/20 backdrop-blur-md rounded-full border border-green-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10">
                                <span class="text-xs text-green-400 font-bold">Python</span>
                            </div>
                             <div class="absolute top-[70%] left-[80%] w-18 h-18 bg-yellow-500/20 backdrop-blur-md rounded-full border border-yellow-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10">
                                <span class="text-xs text-yellow-400 font-bold">JavaScript</span>
                            </div>

                        </div>
                        
                        <div class="mt-4 p-4 bg-white/5 rounded-xl">
                            <h4 class="font-bold mb-2 text-sm text-gray-400">Selected Node Details</h4>
                            <p class="text-sm">Select a node to view connections and attached sparks.</p>
                        </div>
                    </div>
                `;
            }
        },

        initCharts() {
            // Activity Chart
            const ctx1 = document.getElementById('chart-activity');
            if (ctx1) {
                new Chart(ctx1, {
                    type: 'line',
                    data: {
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{
                            label: 'Neurons Fired',
                            data: [12, 19, 3, 5, 2, 3, 10],
                            borderColor: '#3b82f6',
                            tension: 0.4,
                            fill: true,
                            backgroundColor: 'rgba(59, 130, 246, 0.1)'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { display: false },
                            x: { grid: { display: false } }
                        }
                    }
                });
            }

            // Composition Chart
            const ctx2 = document.getElementById('chart-composition');
            if (ctx2) {
                new Chart(ctx2, {
                    type: 'doughnut',
                    data: {
                        labels: ['Images', 'Ideas', 'Knowledge'],
                        datasets: [{
                            data: [
                                app.state.data.images.length,
                                app.state.data.ideas.length,
                                app.state.data.knowledge.length
                            ],
                            backgroundColor: ['#3b82f6', '#f472b6', '#8b5cf6'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        cutout: '70%',
                        plugins: { legend: { position: 'bottom' } }
                    }
                });
            }
        }
    },

    // --- Three.js Background ---
    threeBg: {
        init() {
            const container = document.getElementById('canvas-container');
            if (!container) return;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

            renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(renderer.domElement);

            // Create textures for "0" and "1"
            const createTextTexture = (text) => {
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const context = canvas.getContext('2d');
                context.font = 'bold 48px Inter, sans-serif';
                context.fillStyle = '#3b82f6';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(text, 32, 32);
                const texture = new THREE.CanvasTexture(canvas);
                return texture;
            };

            const texture0 = createTextTexture('0');
            const texture1 = createTextTexture('1');

            // Particle System
            const particlesCount = 200;
            const radius = 4;

            const group = new THREE.Group();
            scene.add(group);

            const objects = [];

            for (let i = 0; i < particlesCount; i++) {
                const isZero = Math.random() > 0.5;
                const material = new THREE.SpriteMaterial({
                    map: isZero ? texture0 : texture1,
                    transparent: true,
                    opacity: 0.6 + Math.random() * 0.4,
                    color: 0x3b82f6
                });

                const sprite = new THREE.Sprite(material);

                // Sphere distribution
                const phi = Math.acos(-1 + (2 * i) / particlesCount);
                const theta = Math.sqrt(particlesCount * Math.PI) * phi;

                sprite.position.setFromSphericalCoords(radius, phi, theta);
                sprite.scale.set(0.3, 0.3, 0.3);

                // Store initial pos for animation
                sprite.userData = {
                    originalPos: sprite.position.clone(),
                    speed: 0.002 + Math.random() * 0.005,
                    wobble: Math.random() * Math.PI * 2
                };

                group.add(sprite);
                objects.push(sprite);
            }

            // Central "Core" Glow
            const coreGeo = new THREE.SphereGeometry(2, 32, 32);
            const coreMat = new THREE.MeshBasicMaterial({
                color: 0x0000ff,
                transparent: true,
                opacity: 0.05,
                wireframe: true
            });
            const core = new THREE.Mesh(coreGeo, coreMat);
            scene.add(core);

            camera.position.z = 8;
            camera.position.x = -2; // Shift slightly left to match description of "left top" origin feel

            // Animation Loop
            let time = 0;

            const animate = () => {
                requestAnimationFrame(animate);
                time += 0.01;

                // Rotate entire group
                group.rotation.y += 0.002;
                group.rotation.z += 0.001;
                core.rotation.y -= 0.005;

                // Pulse particles
                objects.forEach(obj => {
                    obj.userData.wobble += obj.userData.speed;
                    // Gentle float outward and back
                    const scale = 1 + Math.sin(obj.userData.wobble) * 0.1;
                    obj.position.copy(obj.userData.originalPos).multiplyScalar(scale);
                });

                renderer.render(scene, camera);
            };

            animate();

            // Resize handle
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        }
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
