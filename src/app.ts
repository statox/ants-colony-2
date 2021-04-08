import P5 from 'p5';
import 'p5/lib/addons/p5.dom';
import './styles.scss';

import {Ant} from './Ant';
import {PheromoneTrail} from './PheromoneTrail';
import {FoodStock} from './Food';
import {Home} from './Home';

const Quadtree = require('quadtree-lib');

const sketch = (p5: P5) => {
    let D = 800;
    let nbAnts = 50;
    let ants = [];
    let frameRateHistory = new Array(10).fill(0);

    const quadToHome = new PheromoneTrail(p5, D, 'TO_HOME');
    const quadToFood = new PheromoneTrail(p5, D, 'TO_FOOD');
    const foodStock = new FoodStock(p5, D);
    const home = new Home(p5);

    // The sketch setup method
    p5.setup = () => {
        // Creating and positioning the canvas
        const canvas = p5.createCanvas(D, D);
        canvas.parent('app');
        p5.rectMode(p5.CENTER);

        for (let i = 0; i < nbAnts; i++) {
            ants.push(new Ant(p5, quadToHome, quadToFood, foodStock, home, i));
        }

        for (let i = 0; i < 10; i++) {
            foodStock.generateRandomFoodSpot();
        }
        // foodStock.generateFoodCircle();
        /*
         * foodStock.generateFoodSquare(300);
         * foodStock.generateFoodSquare(310);
         * foodStock.generateFoodSquare(320);
         */
    };

    // The sketch draw method
    p5.draw = () => {
        p5.background(0, 0, 0);
        // const fpsText = `${p5.frameRate().toFixed(0)} fps`;
        const fpsText = `${getFrameRate()} fps`;
        p5.stroke('white');
        p5.fill('white');
        p5.text(fpsText, 10, 10);
        p5.translate(p5.width / 2, p5.height / 2);

        home.draw();

        quadToHome.update();
        quadToHome.draw();

        quadToFood.update();
        quadToFood.draw();

        foodStock.draw();

        for (let i = 0; i < ants.length; i++) {
            ants[i].update();
            ants[i].draw();
        }

        if (Math.random() < 0.3) {
            quadToHome.push({
                x: Math.random() * 50 - 25,
                y: Math.random() * 50 - 25
            });
        }
    };

    p5.mousePressed = () => {
        // addAnt();
        addPheromone(p5.mouseX - p5.width / 2, p5.mouseY - p5.height / 2);
        // p5.noLoop();
    };

    const addAnt = () => {
        ants.push(new Ant(p5, quadToHome, quadToFood, foodStock, home, ants.length));
    };

    const getFrameRate = () => {
        frameRateHistory.shift();
        frameRateHistory.push(p5.frameRate());
        let total = frameRateHistory.reduce((a, b) => a + b) / frameRateHistory.length;
        return total.toFixed(0);
    };

    const addPheromone = (x: number, y: number) => {
        let quad: PheromoneTrail | FoodStock = quadToFood;
        if (p5.keyIsDown(p5.SHIFT)) {
            quad = foodStock;
        }
        if (p5.keyIsDown(p5.CONTROL)) {
            quad = quadToHome;
        }
        quad.push({x, y});
    };
};

new P5(sketch);
