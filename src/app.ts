import P5 from 'p5';
import 'p5/lib/addons/p5.dom';
import './styles.scss';

import {Ant} from './Ant';
import {PheromoneTrail} from './PheromoneTrail';

const Quadtree = require('quadtree-lib');

const sketch = (p5: P5) => {
    let D = 800;
    let nbAnts = 100;
    let ants = [];

    const quadToHome = new PheromoneTrail(p5, D, 'TO_HOME');
    const quadToFood = new PheromoneTrail(p5, D, 'TO_FOOD');
    const food = p5.createVector(150, 150);
    const home = p5.createVector(0, 0);

    // The sketch setup method
    p5.setup = () => {
        // Creating and positioning the canvas
        const canvas = p5.createCanvas(800, 800);
        canvas.parent('app');

        for (let i = 0; i < nbAnts; i++) {
            ants.push(new Ant(p5, quadToHome, quadToFood, i));
        }
    };

    // The sketch draw method
    p5.draw = () => {
        p5.background(0, 0, 0);
        const fpsText = `${p5.frameRate().toFixed(0)} fps`;
        p5.stroke('white');
        p5.fill('white');
        p5.text(fpsText, 10, 10);
        p5.translate(p5.width / 2, p5.height / 2);

        quadToHome.update();
        quadToHome.draw();

        quadToFood.update();
        quadToFood.draw();

        for (let i = 0; i < nbAnts; i++) {
            ants[i].update();
            ants[i].draw();
        }

        p5.noFill();
        p5.stroke('green');
        p5.circle(food.x, food.y, 50);
        p5.stroke('blue');
        p5.circle(home.x, home.y, 50);

        for (let i = 0; i < 20; i++) {
            quadToHome.quad.push(
                {
                    x: Math.random() * 50 - 25,
                    y: Math.random() * 50 - 25,
                    ttl: 100
                },
                true
            );
        }
    };

    p5.mousePressed = () => {
        addPheromone();
        // p5.noLoop();
    };

    const addPheromone = () => {
        quadToFood.push({
            x: p5.mouseX - p5.width / 2,
            y: p5.mouseY - p5.height / 2
        });
    };
};

new P5(sketch);
