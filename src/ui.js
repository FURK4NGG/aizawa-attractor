import GUI from 'lil-gui';
import { DEFAULT_PARAMS } from './math.js';

export function setupUI(params, onUpdate, onReset, onRandomize, attractor) {
    const gui = new GUI({ title: 'Aizawa Parameters' });

    const paramFolder = gui.addFolder('Parameters');
    paramFolder.add(params, 'a', 0, 2).onChange(onUpdate);
    paramFolder.add(params, 'b', 0, 2).onChange(onUpdate);
    paramFolder.add(params, 'c', 0, 2).onChange(onUpdate);
    paramFolder.add(params, 'd', 0, 5).onChange(onUpdate);
    paramFolder.add(params, 'e', 0, 1).onChange(onUpdate);
    paramFolder.add(params, 'f', 0, 1).onChange(onUpdate);

    const actionFolder = gui.addFolder('Actions');
    actionFolder.add({ Randomize: onRandomize }, 'Randomize');
    actionFolder.add({ Reset: onReset }, 'Reset');

    const viewFolder = gui.addFolder('View & Animation');
    const viewState = {
        'Full Curve': true,
        'Play Animation': true,
        'Speed': 1
    };

    viewFolder.add(viewState, 'Full Curve').onChange((v) => {
        attractor.toggleFullMode(v);
    });

    viewFolder.add(viewState, 'Play Animation').onChange((v) => {
        attractor.togglePlay();
    });

    viewFolder.add(viewState, 'Speed', 0.1, 5).onChange((v) => {
        attractor.setSpeed(v);
    });

    return gui;
}
