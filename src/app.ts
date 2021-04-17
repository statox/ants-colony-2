import P5 from 'p5';
import 'p5/lib/addons/p5.dom';
import './styles.scss';

import {Ant} from './Ant';
import {PheromoneTrail} from './PheromoneTrail';
import {FoodStock} from './Food';
import {Home} from './Home';
import config from './config';

const Quadtree = require('quadtree-lib');

const sketch = (p5: P5) => {
    let D = 800;
    let nbAnts = config.nb_ants;
    let ants = [];
    let frameRateHistory = new Array(10).fill(0);
    let lastDrop;

    const quadToHome = new PheromoneTrail(p5, D, 'TO_HOME');
    const quadToFood = new PheromoneTrail(p5, D, 'TO_FOOD');
    const quadRepellent = new PheromoneTrail(p5, D, 'REPELLENT');
    const foodStock = new FoodStock(p5, D);
    const home = new Home(p5);

    // The sketch setup method
    p5.setup = () => {
        // Creating and positioning the canvas
        const canvas = p5.createCanvas(D, D);
        canvas.parent('app');

        p5.rectMode(p5.CENTER);

        for (let i = 0; i < nbAnts; i++) {
            ants.push(new Ant(p5, quadToHome, quadToFood, quadRepellent, foodStock, home, i));
        }

        /*
         * for (let i = 0; i < 2; i++) {
         *     foodStock.generateFoodSpot();
         * }
         */
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
        const fpsText = `${getFrameRate()} fps`;
        p5.stroke('white');
        p5.fill('white');
        p5.text(fpsText, 10, 10);
        p5.translate(p5.width / 2, p5.height / 2);

        home.draw();

        if (config.generate_food) {
            foodStock.update();
            foodStock.draw();
        }

        quadToHome.update();
        quadToHome.draw();

        quadToFood.update();
        quadToFood.draw();

        quadRepellent.update();
        quadRepellent.draw();

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

        if (p5.keyIsDown(p5.SHIFT)) {
            if (!lastDrop || p5.millis() > lastDrop + 50) {
                addPheromone('TO_FOOD');
                lastDrop = p5.millis();
            }
        }
        if (p5.keyIsDown(p5.CONTROL)) {
            if (!lastDrop || p5.millis() > lastDrop + 50) {
                addPheromone('TO_HOME');
                lastDrop = p5.millis();
            }
        }
    };

    p5.mousePressed = (event) => {
        if (p5.mouseButton === p5.LEFT) {
            addFood();
        }
        if (p5.mouseButton === p5.RIGHT) {
            removeFood();
        }
        // addAnt();
        // p5.noLoop();
    };

    const addFood = () => {
        const pos = new P5.Vector();
        pos.x = p5.mouseX - p5.width / 2;
        pos.y = p5.mouseY - p5.height / 2;
        foodStock.generateFoodSpot(pos);
    };

    const removeFood = () => {
        const pos = new P5.Vector();
        pos.x = p5.mouseX - p5.width / 2;
        pos.y = p5.mouseY - p5.height / 2;
        const result = foodStock.quad.colliding({
            x: pos.x,
            y: pos.y,
            width: 100,
            height: 100
        });
        result.forEach((f) => foodStock.remove(f));
    };

    const addAnt = () => {
        ants.push(new Ant(p5, quadToHome, quadToFood, quadRepellent, foodStock, home, ants.length));
    };

    const getFrameRate = () => {
        frameRateHistory.shift();
        frameRateHistory.push(p5.frameRate());
        let total = frameRateHistory.reduce((a, b) => a + b) / frameRateHistory.length;
        return total.toFixed(0);
    };

    const addPheromone = (type: 'TO_FOOD' | 'TO_HOME') => {
        let quad: PheromoneTrail = quadToFood;
        if (type === 'TO_HOME') {
            quad = quadToHome;
        }
        const x = p5.mouseX - p5.width / 2;
        const y = p5.mouseY - p5.height / 2;
        quad.push({x, y});
    };

    /*
     * const addPheromone = (x: number, y: number) => {
     *     let quad: PheromoneTrail | FoodStock = quadToFood;
     *     const isShiftDown = p5.keyIsDown(p5.SHIFT);
     *     const isCtrlDown = p5.keyIsDown(p5.CONTROL);
     *     if (!isShiftDown && !isCtrlDown) {
     *         addFood();
     *         return;
     *     }
     *     if (isShiftDown && !isCtrlDown) {
     *         quad = quadToHome;
     *     }
     *     if (!isShiftDown && isCtrlDown) {
     *         quad = quadToFood;
     *     }
     *     quad.push({x, y});
     * };
     */
};

new P5(sketch);
