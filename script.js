// BYTES 3D Gaming Controller Scene
class Bytes3DScene {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.canvas = document.getElementById('webgl-canvas');
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controller = null;
        this.particles = null;
        this.lights = [];
        
        this.mouse = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.createLights();
        this.createController();
        this.createParticles();
        this.createFloatingElements();
        this.setupEvents();
        this.animate();
    }
    
    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 8);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }
    
    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(5, 5, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.scene.add(mainLight);
        
        // Accent light (green)
        const accentLight = new THREE.PointLight(0x00ff88, 0.8, 10);
        accentLight.position.set(-3, 2, 3);
        this.scene.add(accentLight);
        
        // Rim light (blue)
        const rimLight = new THREE.SpotLight(0x0088ff, 0.6);
        rimLight.position.set(0, 5, -5);
        rimLight.lookAt(0, 0, 0);
        this.scene.add(rimLight);
        
        // Fill light
        const fillLight = new THREE.PointLight(0xff6600, 0.3, 8);
        fillLight.position.set(3, -2, 2);
        this.scene.add(fillLight);
    }
    
    createController() {
        this.controller = new THREE.Group();
        
        // Materials
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.4,
            metalness: 0.6,
        });
        
        const gripMaterial = new THREE.MeshStandardMaterial({
            color: 0x0f0f0f,
            roughness: 0.8,
            metalness: 0.2,
        });
        
        const accentMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.3,
            roughness: 0.2,
            metalness: 0.8,
        });
        
        const buttonMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.3,
            metalness: 0.7,
        });
        
        // Main body - Left side
        const leftBody = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 1.4, 0.8),
            bodyMaterial
        );
        leftBody.position.set(-1.4, 0, 0);
        leftBody.castShadow = true;
        leftBody.receiveShadow = true;
        this.controller.add(leftBody);
        
        // Main body - Right side
        const rightBody = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 1.4, 0.8),
            bodyMaterial
        );
        rightBody.position.set(1.4, 0, 0);
        rightBody.castShadow = true;
        rightBody.receiveShadow = true;
        this.controller.add(rightBody);
        
        // Center bridge
        const centerBridge = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.6, 0.7),
            bodyMaterial
        );
        centerBridge.position.set(0, 0.2, 0);
        this.controller.add(centerBridge);
        
        // Left grip
        const leftGrip = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.7, 2.5, 16),
            gripMaterial
        );
        leftGrip.rotation.z = Math.PI / 6;
        leftGrip.position.set(-2.2, -1.2, 0.3);
        leftGrip.castShadow = true;
        this.controller.add(leftGrip);
        
        // Right grip
        const rightGrip = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.7, 2.5, 16),
            gripMaterial
        );
        rightGrip.rotation.z = -Math.PI / 6;
        rightGrip.position.set(2.2, -1.2, 0.3);
        rightGrip.castShadow = true;
        this.controller.add(rightGrip);
        
        // D-Pad
        const dpadGroup = new THREE.Group();
        dpadGroup.position.set(-2, 0.2, 0.45);
        
        const dpadVertical = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 1.2, 0.15),
            buttonMaterial
        );
        const dpadHorizontal = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.4, 0.15),
            buttonMaterial
        );
        dpadGroup.add(dpadVertical);
        dpadGroup.add(dpadHorizontal);
        this.controller.add(dpadGroup);
        
        // Action buttons
        const buttonPositions = [
            { x: 2.4, y: 0.5 },   // Y
            { x: 2.8, y: 0.2 },   // B
            { x: 2.0, y: 0.2 },   // X
            { x: 2.4, y: -0.1 }   // A
        ];
        
        buttonPositions.forEach((pos, i) => {
            const button = new THREE.Mesh(
                new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16),
                accentMaterial
            );
            button.rotation.x = Math.PI / 2;
            button.position.set(pos.x, pos.y, 0.45);
            this.controller.add(button);
        });
        
        // Analog sticks
        const leftStick = this.createAnalogStick();
        leftStick.position.set(-1.2, -0.3, 0.5);
        this.controller.add(leftStick);
        
        const rightStick = this.createAnalogStick();
        rightStick.position.set(1.2, -0.5, 0.5);
        this.controller.add(rightStick);
        
        // Shoulder buttons
        const leftShoulder = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.3, 0.6),
            bodyMaterial
        );
        leftShoulder.position.set(-1.4, 0.8, -0.2);
        this.controller.add(leftShoulder);
        
        const rightShoulder = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.3, 0.6),
            bodyMaterial
        );
        rightShoulder.position.set(1.4, 0.8, -0.2);
        this.controller.add(rightShoulder);
        
        // Triggers
        const leftTrigger = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.4, 0.4),
            accentMaterial
        );
        leftTrigger.position.set(-1.4, 0.5, -0.6);
        this.controller.add(leftTrigger);
        
        const rightTrigger = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.4, 0.4),
            accentMaterial
        );
        rightTrigger.position.set(1.4, 0.5, -0.6);
        this.controller.add(rightTrigger);
        
        // Home button
        const homeButton = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 0.08, 16),
            new THREE.MeshStandardMaterial({
                color: 0x00ff88,
                emissive: 0x00ff88,
                emissiveIntensity: 0.5
            })
        );
        homeButton.rotation.x = Math.PI / 2;
        homeButton.position.set(0, -0.2, 0.4);
        this.controller.add(homeButton);
        
        // Add subtle floating animation
        this.controller.userData = {
            floatOffset: 0,
            floatSpeed: 0.001,
            rotateSpeed: 0.0005
        };
        
        this.scene.add(this.controller);
    }
    
    createAnalogStick() {
        const group = new THREE.Group();
        
        // Base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.4, 0.2, 16),
            new THREE.MeshStandardMaterial({
                color: 0x222222,
                roughness: 0.5,
                metalness: 0.5
            })
        );
        base.rotation.x = Math.PI / 2;
        group.add(base);
        
        // Stick
        const stick = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 0.4, 16),
            new THREE.MeshStandardMaterial({
                color: 0x333333,
                roughness: 0.6
            })
        );
        stick.rotation.x = Math.PI / 2;
        stick.position.z = 0.3;
        group.add(stick);
        
        // Top
        const top = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.25, 0.1, 16),
            new THREE.MeshStandardMaterial({
                color: 0x444444,
                roughness: 0.4,
                metalness: 0.3
            })
        );
        top.rotation.x = Math.PI / 2;
        top.position.z = 0.5;
        group.add(top);
        
        return group;
    }
    
    createParticles() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 15;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
            
            velocities.push({
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            });
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x00ff88,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.particles.userData = { velocities };
        this.scene.add(this.particles);
    }
    
    createFloatingElements() {
        // Create floating geometric shapes around the controller
        const shapes = [];
        const geometries = [
            new THREE.OctahedronGeometry(0.2),
            new THREE.TetrahedronGeometry(0.15),
            new THREE.IcosahedronGeometry(0.1)
        ];
        
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.8,
            wireframe: true
        });
        
        for (let i = 0; i < 8; i++) {
            const mesh = new THREE.Mesh(
                geometries[i % geometries.length],
                material
            );
            
            const angle = (i / 8) * Math.PI * 2;
            const radius = 4 + Math.random() * 2;
            
            mesh.position.set(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 4,
                Math.sin(angle) * radius - 2
            );
            
            mesh.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02
                },
                floatSpeed: Math.random() * 0.001 + 0.0005,
                floatOffset: Math.random() * Math.PI * 2,
                originalY: mesh.position.y
            };
            
            shapes.push(mesh);
            this.scene.add(mesh);
        }
        
        this.floatingShapes = shapes;
    }
    
    setupEvents() {
        // Mouse move for parallax
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
        
        // Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
        
        // Touch events for mobile
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = Date.now();
        
        // Animate controller
        if (this.controller) {
            // Floating motion
            this.controller.position.y = Math.sin(time * 0.001) * 0.2;
            
            // Mouse follow with smooth interpolation
            this.targetRotation.x = this.mouse.y * 0.3;
            this.targetRotation.y = this.mouse.x * 0.5;
            
            this.controller.rotation.x += (this.targetRotation.x - this.controller.rotation.x) * 0.05;
            this.controller.rotation.y += (this.targetRotation.y - this.controller.rotation.y) * 0.05;
            
            // Subtle idle rotation
            this.controller.rotation.z = Math.sin(time * 0.0005) * 0.05;
        }
        
        // Animate particles
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            const velocities = this.particles.userData.velocities;
            
            for (let i = 0; i < velocities.length; i++) {
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;
                
                // Wrap around
                if (positions[i * 3] > 7.5) positions[i * 3] = -7.5;
                if (positions[i * 3] < -7.5) positions[i * 3] = 7.5;
                if (positions[i * 3 + 1] > 7.5) positions[i * 3 + 1] = -7.5;
                if (positions[i * 3 + 1] < -7.5) positions[i * 3 + 1] = 7.5;
            }
            
            this.particles.geometry.attributes.position.needsUpdate = true;
            this.particles.rotation.y += 0.0002;
        }
        
        // Animate floating shapes
        if (this.floatingShapes) {
            this.floatingShapes.forEach((shape, i) => {
                shape.rotation.x += shape.userData.rotationSpeed.x;
                shape.rotation.y += shape.userData.rotationSpeed.y;
                shape.position.y = shape.userData.originalY + 
                    Math.sin(time * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.5;
            });
        }
        
        // Camera subtle movement
        this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * 0.02;
        this.camera.position.y += (this.mouse.y * 0.5 - this.camera.position.y) * 0.02;
        this.camera.lookAt(0, 0, 0);
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Bytes3DScene();
});
