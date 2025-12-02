// ============================================
// Golden Particles Effect
// ============================================

(function() {
    'use strict';

    let scene, camera, renderer, particles, goldenWaves;
    let animationId;

    function initParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas || typeof THREE === 'undefined') return;

        // Scene
        scene = new THREE.Scene();

        // Camera - positioned to see particles better
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 25);
        camera.lookAt(0, 0, 0);

        // Renderer
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });

        // Ensure canvas has proper size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        console.log('Renderer initialized, canvas size:', canvas.width, 'x', canvas.height);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xFFD700, 1, 100);
        pointLight1.position.set(10, 10, 10);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xD4AF37, 0.5, 100);
        pointLight2.position.set(-10, -10, -10);
        scene.add(pointLight2);

        // Create golden waves first (background)
        createGoldenWaves();

        // Create particles (foreground)
        createParticleField();

        // Handle resize
        window.addEventListener('resize', onWindowResize);

        // Start animation
        animate();
    }

    function createStarTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        // Clear canvas with transparent background
        ctx.clearRect(0, 0, 32, 32);

        const centerX = 16;
        const centerY = 16;

        // Draw spherical circle with 3D appearance
        ctx.save();
        ctx.translate(centerX, centerY);

        // Outer glow (subtle)
        const outerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 16);
        outerGradient.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
        outerGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.2)');
        outerGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Main sphere with 3D gradient effect
        const sphereGradient = ctx.createRadialGradient(-4, -4, 0, 0, 0, 10);
        sphereGradient.addColorStop(0, 'rgba(255, 255, 200, 1)'); // Bright highlight
        sphereGradient.addColorStop(0.3, 'rgba(255, 215, 0, 0.9)'); // Golden
        sphereGradient.addColorStop(0.7, 'rgba(255, 200, 0, 0.8)'); // Darker gold
        sphereGradient.addColorStop(1, 'rgba(255, 180, 0, 0.6)'); // Edge
        ctx.fillStyle = sphereGradient;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        // Add small highlight for 3D effect
        const highlightGradient = ctx.createRadialGradient(-3, -3, 0, -3, -3, 4);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(-3, -3, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    function createParticleField() {
        const count = 3000; // More particles
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Distribute particles in a sphere around origin
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 8 + Math.random() * 25; // Visible range

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            // Bright golden colors (RGB 0-1) - make them brighter
            colors[i * 3] = 1.0; // Red
            colors[i * 3 + 1] = 0.9 + Math.random() * 0.1; // Green (brighter gold)
            colors[i * 3 + 2] = 0.1 + Math.random() * 0.3; // Blue (more visible)
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create a simple star texture using canvas
        const starTexture = createStarTexture();

        // Use PointsMaterial with spherical texture - very small
        const material = new THREE.PointsMaterial({
            size: 0.8, // Very small size
            map: starTexture,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        console.log('Particles created:', particles.geometry.attributes.position.count, 'particles');
        console.log('Particle material:', material);
        console.log('Particle size:', material.size);
        console.log('Scene children:', scene.children.length);

        // Test render immediately
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
            console.log('Test render completed');
        }
    }

    function createGoldenWaves() {
        // Create multiple torus rings for a more dynamic effect
        goldenWaves = new THREE.Group();

        for (let i = 0; i < 3; i++) {
            const radius = 12 + i * 2;
            const tube = 0.2 - i * 0.05;
            const geometry = new THREE.TorusGeometry(radius, tube, 16, 100);
            const material = new THREE.MeshStandardMaterial({
                color: 0xD4AF37,
                emissive: 0xFFD700,
                emissiveIntensity: 0.3 - i * 0.1,
                metalness: 0.8,
                roughness: 0.2,
                transparent: true,
                opacity: 0.2 - i * 0.05
            });

            const ring = new THREE.Mesh(geometry, material);
            ring.position.z = -10 - i * 2;
            goldenWaves.add(ring);
        }

        scene.add(goldenWaves);
    }

    function animate() {
        animationId = requestAnimationFrame(animate);

        const time = Date.now() * 0.001;

        if (particles) {
            particles.rotation.y = time * 0.05;
            particles.rotation.x = Math.sin(time * 0.1) * 0.1;
        }

        if (goldenWaves && goldenWaves.children) {
            goldenWaves.rotation.z = time * 0.1;
            goldenWaves.rotation.y = time * 0.05;
            goldenWaves.position.y = Math.sin(time * 0.5) * 0.5;

            // Animate each ring individually
            goldenWaves.children.forEach((ring, index) => {
                ring.rotation.x = time * (0.05 + index * 0.02);
                ring.rotation.z = time * (0.1 + index * 0.03);
                const scale = 1.0 + Math.sin(time * 0.3 + index) * 0.1;
                ring.scale.set(scale, scale, scale);
            });
        }

        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        } else {
            console.warn('Renderer, scene, or camera missing');
        }
    }

    function onWindowResize() {
        if (camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    // Initialize when DOM is ready and Three.js is loaded
    function waitForThreeJS() {
        if (typeof THREE === 'undefined') {
            console.log('Waiting for Three.js...');
            setTimeout(waitForThreeJS, 100);
            return;
        }

        console.log('Three.js loaded, initializing particles...');

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(initParticles, 200);
            });
        } else {
            setTimeout(initParticles, 200);
        }
    }

    waitForThreeJS();

    // Cleanup
    window.addEventListener('beforeunload', function() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        if (renderer) {
            renderer.dispose();
        }
    });
})();

