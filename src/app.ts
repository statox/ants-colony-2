import P5 from 'p5';
import 'p5/lib/addons/p5.dom';
import './styles.scss';

import {Board} from './Board';
import {Ant} from './Ant';

const sketch = (p5: P5) => {
    let D = 800;
    let cellsD = 10;
    let nbAnts = 2;

    let board: Board;

    // The sketch setup method
    p5.setup = () => {
        // Creating and positioning the canvas
        const canvas = p5.createCanvas(800, 800);
        canvas.parent('app');

        board = new Board(p5, cellsD, nbAnts);
        board.randomWalkMaze();
        board.makeRandomOpenings();
        board.setFoodSource();
    };

    // The sketch draw method
    p5.draw = () => {
        const scale = p5.width / cellsD;

        p5.background(120, 50, 50);
        board.update();
        board.draw();

        const fpsText = `${p5.frameRate()} fps`;
        p5.text(fpsText, 10, 10);
    };
};

new P5(sketch);
