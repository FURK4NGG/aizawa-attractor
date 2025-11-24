import * as THREE from 'three';
import { computeAizawa } from './math.js';

export class Attractor {
    constructor(scene, params) {
        this.scene = scene;
        this.params = params;
        this.points = [];
        this.steps = 50000;
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.LineBasicMaterial({
            vertexColors: true,
            linewidth: 2, // Note: linewidth only works in WebGL2 or some browsers
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
        });

        this.line = new THREE.Line(this.geometry, this.material);
        this.scene.add(this.line);

        // Animation Sphere
        const sphereGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.sphere = new THREE.Mesh(sphereGeo, sphereMat);
        this.scene.add(this.sphere);

        // Trail
        this.trailSize = 200;
        this.trailGeometry = new THREE.BufferGeometry();
        this.trailMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
        });
        this.trailLine = new THREE.Line(this.trailGeometry, this.trailMaterial);
        this.scene.add(this.trailLine);

        this.animationProgress = 0;
        this.speed = 1;
        this.isPlaying = true;

        this.update();
    }

    update() {
        // 1. Compute points
        const positions = computeAizawa(this.params, { x: 0.1, y: 0, z: 0 }, this.steps);
        this.points = positions; // Keep raw data for animation

        // 2. Update Geometry
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // 3. Update Colors
        const colors = new Float32Array(this.steps * 3);
        const color1 = new THREE.Color(0x00008b); // Deep Blue
        const color2 = new THREE.Color(0x00ffff); // Cyan
        const color3 = new THREE.Color(0xff00ff); // Magenta

        for (let i = 0; i < this.steps; i++) {
            const t = i / this.steps;
            let c = new THREE.Color();
            if (t < 0.5) {
                c.lerpColors(color1, color2, t * 2);
            } else {
                c.lerpColors(color2, color3, (t - 0.5) * 2);
            }
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Center the geometry
        this.geometry.computeBoundingSphere();
        const center = this.geometry.boundingSphere.center;
        // We can't easily "center" the geometry without modifying positions, 
        // but we can move the mesh.
        this.line.position.set(-center.x, -center.y, -center.z);

        // Also move the sphere/trail container or offset them
        this.centerOffset = center;
    }

    animate(dt) {
        if (!this.isPlaying) return;

        // Move along the curve
        // We have 50000 points.
        // Speed determines how many points we advance per second?
        // Let's say speed 1 = 1000 points per second.

        const pointsPerSec = 1000 * this.speed;
        this.animationProgress += pointsPerSec * dt;

        if (this.animationProgress >= this.steps) {
            this.animationProgress = 0;
        }

        const idx = Math.floor(this.animationProgress);
        const nextIdx = (idx + 1) % this.steps;
        const subT = this.animationProgress - idx;

        // Interpolate position
        const x = this.points[idx * 3] * (1 - subT) + this.points[nextIdx * 3] * subT;
        const y = this.points[idx * 3 + 1] * (1 - subT) + this.points[nextIdx * 3 + 1] * subT;
        const z = this.points[idx * 3 + 2] * (1 - subT) + this.points[nextIdx * 3 + 2] * subT;

        // Apply offset
        if (this.centerOffset) {
            this.sphere.position.set(x - this.centerOffset.x, y - this.centerOffset.y, z - this.centerOffset.z);
        } else {
            this.sphere.position.set(x, y, z);
        }

        // Update Trail
        // We can just take the last N points from the current index
        const trailPositions = new Float32Array(this.trailSize * 3);
        for (let i = 0; i < this.trailSize; i++) {
            let trailIdx = idx - i;
            if (trailIdx < 0) trailIdx += this.steps;

            trailPositions[i * 3] = this.points[trailIdx * 3];
            trailPositions[i * 3 + 1] = this.points[trailIdx * 3 + 1];
            trailPositions[i * 3 + 2] = this.points[trailIdx * 3 + 2];
        }
        this.trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
        this.trailLine.position.copy(this.line.position);
    }

    setSpeed(s) {
        this.speed = s;
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
    }

    toggleFullMode(visible) {
        this.line.visible = visible;
    }
}
