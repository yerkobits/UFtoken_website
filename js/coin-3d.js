// ============================================
// 3D Coin Model
// ============================================

(function() {
    'use strict';

    let scene, camera, renderer, coinGroup;
    let animationId;

    function initCoin() {
        const canvas = document.getElementById('coin-canvas');
        if (!canvas || typeof THREE === 'undefined') return;

        // Scene
        scene = new THREE.Scene();

        // Camera
        const width = canvas.offsetWidth || 400;
        const height = canvas.offsetHeight || 400;
        camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.set(0, 2, 8);

        // Renderer
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const spotLight1 = new THREE.SpotLight(0xFFD700, 1);
        spotLight1.position.set(10, 10, 10);
        spotLight1.angle = 0.3;
        scene.add(spotLight1);

        const spotLight2 = new THREE.SpotLight(0xD4AF37, 0.5);
        spotLight2.position.set(-10, -10, -5);
        spotLight2.angle = 0.3;
        scene.add(spotLight2);

        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(0, 0, 5);
        scene.add(pointLight);

        // Create coin
        createCoin();

        // Handle resize
        window.addEventListener('resize', onWindowResize);

        // Start animation
        animate();
    }

    function createCoin() {
        coinGroup = new THREE.Group();

        const radius = 2;
        const thickness = 0.3;
        const segments = 64;

        // Main coin body
        const coinGeometry = new THREE.CylinderGeometry(radius, radius, thickness, segments);
        const coinMaterial = new THREE.MeshStandardMaterial({
            color: 0xD4AF37,
            metalness: 0.9,
            roughness: 0.1,
            envMapIntensity: 1
        });
        const coinMesh = new THREE.Mesh(coinGeometry, coinMaterial);
        coinMesh.castShadow = true;
        coinMesh.receiveShadow = true;
        coinGroup.add(coinMesh);

        // Edge of the coin
        const edgeGeometry = new THREE.CylinderGeometry(radius, radius, thickness, segments, 1, true);
        const edgeMaterial = new THREE.MeshStandardMaterial({
            color: 0xB8941E,
            metalness: 0.9,
            roughness: 0.3
        });
        const edgeMesh = new THREE.Mesh(edgeGeometry, edgeMaterial);
        coinGroup.add(edgeMesh);

        // Embossed "UF" on front
        createTextMesh('front', thickness);

        // Embossed "UF" on back
        createTextMesh('back', thickness);

        // Decorative ring on the edge
        const ringGeometry = new THREE.TorusGeometry(radius, 0.05, 16, 100);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            metalness: 1,
            roughness: 0.1,
            emissive: 0xFFD700,
            emissiveIntensity: 0.3
        });
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        coinGroup.add(ringMesh);

        scene.add(coinGroup);
    }

    function createTextMesh(side, thickness) {
        const yPosition = side === 'front' ? thickness / 2 + 0.1 : -(thickness / 2 + 0.1);
        const rotation = side === 'front' ? [Math.PI / 2, 0, 0] : [-Math.PI / 2, 0, Math.PI];

        const textGroup = new THREE.Group();
        textGroup.position.set(0, yPosition, 0);
        textGroup.rotation.set(rotation[0], rotation[1], rotation[2]);

        // Create "U"
        const uGroup = new THREE.Group();
        uGroup.position.set(-0.6, 0, 0);

        // U shape - torus for the curve
        const uTorus = new THREE.Mesh(
            new THREE.TorusGeometry(0.4, 0.15, 16, 32, Math.PI),
            new THREE.MeshStandardMaterial({
                color: 0x1a1a0a,
                metalness: 0.3,
                roughness: 0.7
            })
        );
        uGroup.add(uTorus);

        // U shape - left vertical
        const uLeft = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.6, 0.2),
            new THREE.MeshStandardMaterial({
                color: 0x1a1a0a,
                metalness: 0.3,
                roughness: 0.7
            })
        );
        uLeft.position.set(-1.0, -0.2, 0);
        uGroup.add(uLeft);

        // U shape - right vertical
        const uRight = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.6, 0.2),
            new THREE.MeshStandardMaterial({
                color: 0x1a1a0a,
                metalness: 0.3,
                roughness: 0.7
            })
        );
        uRight.position.set(-0.6, -0.2, 0);
        uGroup.add(uRight);

        textGroup.add(uGroup);

        // Create "F"
        const fGroup = new THREE.Group();
        fGroup.position.set(0.8, 0, 0);

        // F shape - vertical line
        const fVertical = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 1.2, 0.2),
            new THREE.MeshStandardMaterial({
                color: 0x1a1a0a,
                metalness: 0.3,
                roughness: 0.7
            })
        );
        fGroup.add(fVertical);

        // F shape - top horizontal
        const fTop = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.25, 0.2),
            new THREE.MeshStandardMaterial({
                color: 0x1a1a0a,
                metalness: 0.3,
                roughness: 0.7
            })
        );
        fTop.position.set(1.1, 0.45, 0);
        fGroup.add(fTop);

        // F shape - middle horizontal
        const fMiddle = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.25, 0.2),
            new THREE.MeshStandardMaterial({
                color: 0x1a1a0a,
                metalness: 0.3,
                roughness: 0.7
            })
        );
        fMiddle.position.set(1.0, 0, 0);
        fGroup.add(fMiddle);

        textGroup.add(fGroup);

        coinGroup.add(textGroup);
    }

    function animate() {
        animationId = requestAnimationFrame(animate);

        if (coinGroup) {
            const time = Date.now() * 0.001;
            coinGroup.rotation.y = time * 0.5;
        }

        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    function onWindowResize() {
        const canvas = document.getElementById('coin-canvas');
        if (!canvas) return;

        const width = canvas.offsetWidth || 400;
        const height = canvas.offsetHeight || 400;

        if (camera && renderer) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initCoin, 100);
        });
    } else {
        setTimeout(initCoin, 100);
    }

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

