import P5 from 'p5';
import {FoodStock} from './Food';
import {Home} from './Home';
import {PheromoneTrail} from './PheromoneTrail';
import config from './config';

export class Ant {
    p5: P5;
    id: number;
    pos: P5.Vector;
    speed: P5.Vector;
    speedMag: number;
    dir: P5.Vector;
    state: 'explore' | 'backtrack';
    age: number;
    quadToHome: PheromoneTrail;
    quadToFood: PheromoneTrail;
    quadRepellent: PheromoneTrail;
    foodStock: FoodStock;
    visionRadius: number;
    layingDelay: number;
    maxAngle: number;
    home: Home;
    barycenter: P5.Vector;

    constructor(p5, quadToHome, quadToFood, quadRepellent, foodStock, home, id) {
        this.p5 = p5;
        this.id = id;
        this.state = 'explore';
        this.age = 0;
        this.visionRadius = 50;
        this.layingDelay = 15;
        // Angle of 10 degrees make then line up quicker
        // Angle of 45 degrees still creates the issue but after a longer time
        this.maxAngle = p5.radians(10);
        this.speedMag = 4;

        this.pos = new P5.Vector();
        this.speed = P5.Vector.random2D();
        this.dir = P5.Vector.random2D();
        this.quadToHome = quadToHome;
        this.quadToFood = quadToFood;
        this.quadRepellent = quadRepellent;
        this.foodStock = foodStock;
        this.home = home;
    }

    hitFood() {
        const colliding = this.foodStock.quad.colliding({
            x: this.pos.x - 5,
            y: this.pos.y - 5,
            width: 10,
            height: 10
        });
        if (colliding.length) {
            const food = colliding[0];
            this.foodStock.remove(food);

            return true;
        }
        return false;
    }

    hitHome() {
        if (this.home.collide(this)) {
            this.home.food++;
            return true;
        }
        return false;
    }

    update() {
        this.age++;

        if (this.state === 'backtrack' && this.hitHome()) {
            this.state = 'explore';
            this.dir.rotate(this.p5.PI);
        } else if (this.state === 'explore' && this.hitFood()) {
            this.state = 'backtrack';
            this.dir.rotate(this.p5.PI);
        }

        const diffHeading = this.move();
        if (this.age % this.layingDelay === 0) {
            this.layPheromone();
        }
        if (config.lay_repellent && Math.abs(diffHeading) >= 150) {
            this.layPheromone('REPELLENT');
        }
    }

    // Depending on the wrap mode either bounce on walls
    // or go though the screen
    // UPDATES EITHER THE POSITION OR THE DIRECTION
    // SHOULD BE CALLED BEFORE APPLYING DIRECTION TO SPEED IN move()
    handleBorders() {
        const LEFT = -this.p5.width / 2;
        const RIGHT = this.p5.width / 2;
        const TOP = -this.p5.height / 2;
        const BOTTOM = this.p5.height / 2;
        if (config.wrap_edges) {
            if (this.pos.x < LEFT) {
                this.pos.x = RIGHT;
            }
            if (this.pos.x > RIGHT) {
                this.pos.x = LEFT;
            }
            if (this.pos.y < TOP) {
                this.pos.y = BOTTOM;
            }
            if (this.pos.y > BOTTOM) {
                this.pos.y = TOP;
            }
        } else {
            const THRESHOLD = 100;
            if (this.pos.x < LEFT + THRESHOLD) {
                const repulsionMag = this.p5.map(
                    this.pos.x,
                    LEFT + THRESHOLD,
                    LEFT,
                    this.dir.mag() * 0.1,
                    this.dir.mag() * 2
                );
                const repulsion = this.p5.createVector(1, 0).setMag(repulsionMag);
                this.dir.add(repulsion);
            }
            if (this.pos.x > RIGHT - THRESHOLD) {
                const repulsionMag = this.p5.map(
                    this.pos.x,
                    RIGHT - THRESHOLD,
                    RIGHT,
                    this.dir.mag() * 0.1,
                    this.dir.mag() * 2
                );
                const repulsion = this.p5.createVector(-1, 0).setMag(repulsionMag);
                this.dir.add(repulsion);
            }
            if (this.pos.y < TOP + THRESHOLD) {
                const repulsionMag = this.p5.map(
                    this.pos.y,
                    TOP + THRESHOLD,
                    TOP,
                    this.dir.mag() * 0.1,
                    this.dir.mag() * 2
                );
                const repulsion = this.p5.createVector(0, 1).setMag(repulsionMag);
                this.dir.add(repulsion);
            }
            if (this.pos.y > BOTTOM - THRESHOLD) {
                const repulsionMag = this.p5.map(
                    this.pos.y,
                    BOTTOM - THRESHOLD,
                    BOTTOM,
                    this.dir.mag() * 0.1,
                    this.dir.mag() * 2
                );
                const repulsion = this.p5.createVector(0, -1).setMag(repulsionMag);
                this.dir.add(repulsion);
            }
        }
    }

    move() {
        if (config.follow_pheromones) {
            let items;
            if (this.state === 'explore') {
                items = [...this.getSeenItems('TO_FOOD'), ...this.getSeenItems('FOOD')];
            } else if (this.state === 'backtrack') {
                items = this.getSeenItems('TO_HOME');
            }

            const barycenter = this.getItemsBarycenter(items);
            this.barycenter = barycenter?.copy();
            if (barycenter) {
                this.dir.setMag(0);
                this.dir = barycenter.sub(this.pos);
            }
        }

        // Add random wiggling
        if (config.random_wiggling_enabled) {
            this.dir.rotate(Math.random() * this.maxAngle - this.maxAngle / 2);
        }

        const prevHeading = this.speed.heading();
        this.handleBorders();
        this.speed.add(this.dir);
        this.speed.setMag(this.speedMag);
        const currentHeading = this.speed.heading();
        const headingDiff = this.p5.degrees(prevHeading - currentHeading);
        this.pos.add(this.speed);
        return headingDiff;
    }

    getSeenItems(type: 'TO_HOME' | 'TO_FOOD' | 'FOOD') {
        let quad;
        if (type === 'TO_FOOD') {
            quad = this.quadToFood.quad;
        } else if (type === 'TO_HOME') {
            quad = this.quadToHome.quad;
        } else {
            quad = this.foodStock.quad;
        }
        const offset = this.speed.copy().normalize();
        const result = quad.colliding({
            x: this.pos.x + offset.x * this.visionRadius - this.visionRadius,
            y: this.pos.y + offset.y * this.visionRadius - this.visionRadius,
            width: this.visionRadius * 2,
            height: this.visionRadius * 2
        });
        return result;
    }

    getItemsBarycenter(items: any[]) {
        if (!items.length) {
            return;
        }
        const barycenter = new P5.Vector();
        items.forEach((p) => {
            const pvec = new P5.Vector();
            pvec.x = p.x;
            pvec.y = p.y;
            barycenter.add(pvec);
        });
        barycenter.div(items.length);
        return barycenter;
    }

    layPheromone(repellent?: 'REPELLENT') {
        let trail = this.quadToFood;
        if (this.state === 'explore') {
            trail = this.quadToHome;
        }
        if (repellent === 'REPELLENT') {
            console.log('REPELLENT');
            trail = this.quadRepellent;
        }
        trail.push({x: this.pos.x, y: this.pos.y});
    }

    draw() {
        let color = 'rgba(116, 169, 247, 0.7)';
        if (this.state === 'backtrack') {
            color = 'rgba(116, 247, 169, 0.7)';
        }

        this.p5.fill(color);
        this.p5.noStroke();
        this.p5.rect(this.pos.x, this.pos.y, 10, 10);

        if (this.id === config.ant_id_to_track) {
            this.drawInfo();
        }
    }

    drawInfo() {
        this.p5.stroke('red');
        this.p5.strokeWeight(2);
        this.p5.noFill();
        this.p5.rect(this.pos.x, this.pos.y, 10, 10);

        // Field of vision
        this.p5.strokeWeight(1);
        this.p5.stroke('rgba(250, 0, 0, 0.4)');
        this.p5.noFill();
        const offset = this.speed.copy().normalize();
        this.p5.rect(
            this.pos.x + offset.x * this.visionRadius,
            this.pos.y + offset.y * this.visionRadius,
            this.visionRadius * 2,
            this.visionRadius * 2
        );

        // Considered pheromones
        this.p5.noStroke();
        this.p5.fill(235, 235, 50);
        let items;
        if (this.state === 'explore') {
            items = [...this.getSeenItems('TO_FOOD'), ...this.getSeenItems('FOOD')];
        } else if (this.state === 'backtrack') {
            items = this.getSeenItems('TO_HOME');
        }
        items.forEach((p) => {
            this.p5.rect(p.x, p.y, p.width, p.height);
        });

        // Speed vector
        this.p5.fill(0, 250, 0);
        this.p5.rect(this.pos.x + this.speed.x * 10, this.pos.y + this.speed.y * 10, 4, 4);

        // Direction vector
        this.p5.stroke(250, 0, 0);
        this.p5.line(
            this.pos.x + this.speed.x * 10,
            this.pos.y + this.speed.y * 10,
            this.dir.x * 10 + this.pos.x + this.speed.x * 10,
            this.dir.y * 10 + this.pos.y + this.speed.y * 10
        );

        // pheromones barycenter
        if (this.barycenter) {
            this.p5.fill(50, 50, 250);
            this.p5.noStroke();
            this.p5.rect(this.barycenter.x, this.barycenter.y, 10, 10);
        }
    }
}
