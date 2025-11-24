import * as THREE from 'three';
import { setupScene } from './scene.js';
import { Attractor } from './attractor.js';
import { setupUI } from './ui.js';
import { DEFAULT_PARAMS } from './math.js';

const app = document.querySelector('#app');
const { scene, camera, renderer, composer, controls } = setupScene(app);

// State
const params = { ...DEFAULT_PARAMS };

// Attractor
const attractor = new Attractor(scene, params);

// UI Callbacks
const onUpdate = () => {
    attractor.update();
};

const onReset = () => {
    Object.assign(params, DEFAULT_PARAMS);
    // Update GUI controllers manually if needed, or just let them sync if we iterate
    // lil-gui doesn't auto-sync unless we listen() or updateDisplay()
    // We'll handle this by iterating controllers in the UI setup if we had access, 
    // but simpler is to just update the attractor.
    // To update GUI, we need the gui instance.
    gui.controllersRecursive().forEach(c => c.updateDisplay());
    attractor.update();
};

const onRandomize = () => {
    params.a = 0.7 + Math.random() * 0.5;
    params.b = 0.5 + Math.random() * 0.4;
    params.c = 0.3 + Math.random() * 0.6;
    params.d = 2.5 + Math.random() * 2.0;
    params.e = 0.1 + Math.random() * 0.3;
    params.f = 0.05 + Math.random() * 0.2;

    gui.controllersRecursive().forEach(c => c.updateDisplay());
    attractor.update();
};

// UI
const gui = setupUI(params, onUpdate, onReset, onRandomize, attractor);

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const dt = clock.getDelta();

    controls.update();
    attractor.animate(dt);

    // renderer.render(scene, camera);
    composer.render();
}

animate();
