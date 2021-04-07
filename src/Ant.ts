import P5 from 'p5';
import {PheromoneTrail} from './PheromoneTrail';

export class Ant {
    p5: P5;
    id: number;
    pos: P5.Vector;
    speed: P5.Vector;
    dir: P5.Vector;
    state: 'explore' | 'backtrack';
    age: number;
    quadToHome: PheromoneTrail;
    quadToFood: PheromoneTrail;
    visionRadius: number;
    layingDelayFood: number;
    layingDelayHome: number;
    driftLimitHome: number;
    driftLimitFood: number;
    maxAngle: number;
    maxSpeed: number;

    constructor(p5, quadToHome, quadToFood, id) {
        this.p5 = p5;
        this.id = id;
        this.state = 'explore';
        this.age = 0;
        this.visionRadius = 150;
        this.layingDelayFood = 20;
        this.layingDelayHome = 50;
        this.driftLimitHome = 0.5;
        this.driftLimitFood = 0.1;
        this.maxAngle = p5.PI / 2;
        this.maxSpeed = 0.5;

        this.pos = new P5.Vector();
        this.speed = P5.Vector.random2D();
        this.dir = P5.Vector.random2D();
        this.quadToHome = quadToHome;
        this.quadToFood = quadToFood;
    }

    hitFood() {
        const dsquared = (this.pos.x - 150) * (this.pos.x - 150) + (this.pos.y - 150) * (this.pos.y - 150);
        return dsquared <= 50 * 50;
    }
    hitHome() {
        return this.pos.mag() <= 50;
    }

    update() {
        this.age++;
        // if (this.age % 200 === 0) {
        // this.state = this.state === 'backtrack' ? 'explore' : 'backtrack';
        // }

        if (this.hitHome() && this.state === 'backtrack') {
            this.state = 'explore';
        } else if (this.hitFood() && this.state === 'explore') {
            this.state = 'backtrack';
        }

        if (this.state === 'explore') {
            this.explore();
        } else if (this.state === 'backtrack') {
            this.backtrack();
        }

        /*
         * Handle the borders by turning to the opposite wall and
         * randomly turn more between -PI/2 and PI/2
         */
        let border = false;
        if (this.pos.x < -this.p5.width / 2) {
            this.speed.x = 1;
            this.speed.y = 0;
            border = true;
        } else if (this.pos.x > this.p5.width / 2) {
            this.speed.x = -1;
            this.speed.y = 0;
            border = true;
        } else if (this.pos.y < -this.p5.height / 2) {
            this.speed.x = 0;
            this.speed.y = 1;
            border = true;
        } else if (this.pos.y > this.p5.height / 2) {
            this.speed.x = 0;
            this.speed.y = -1;
            border = true;
        }
        if (border) {
            const angle = Math.random() * this.p5.PI - this.p5.HALF_PI;
            this.speed.rotate(angle);
            this.speed.setMag(1);
        }

        this.speed.limit(this.maxSpeed);
    }

    backtrack() {
        const drift = new P5.Vector();
        this.getSurroundingPheromones('TO_HOME').forEach((p) => {
            const pvec = new P5.Vector();
            pvec.x = p.x;
            pvec.y = p.y;
            drift.add(P5.Vector.sub(pvec, this.pos));
        });
        drift.limit(this.driftLimitHome);

        // this.dir = P5.Vector.random2D();
        this.dir.rotate(Math.random() * this.maxAngle - this.maxAngle / 2);
        this.dir.add(drift);
        this.speed.add(this.dir);
        this.pos.add(this.speed);
        if (this.age % this.layingDelayFood === 0) {
            this.layPheromone('TO_FOOD');
        }
    }

    explore() {
        const drift = new P5.Vector();
        this.getSurroundingPheromones('TO_FOOD').forEach((p) => {
            const pvec = new P5.Vector();
            pvec.x = p.x;
            pvec.y = p.y;
            drift.add(P5.Vector.sub(pvec, this.pos));
        });
        drift.limit(this.driftLimitFood);

        // this.dir = P5.Vector.random2D();
        this.dir.rotate(Math.random() * this.maxAngle - this.maxAngle / 2);
        this.dir.add(drift);
        this.speed.add(this.dir);
        this.pos.add(this.speed);
        if (this.age % this.layingDelayHome === 0) {
            this.layPheromone('TO_HOME');
        }
    }

    layPheromone(type: 'TO_HOME' | 'TO_FOOD') {
        let trail = this.quadToFood;
        if (type === 'TO_HOME') {
            trail = this.quadToHome;
        }
        trail.push({x: this.pos.x, y: this.pos.y});
    }

    getSurroundingPheromones(type: 'TO_HOME' | 'TO_FOOD'): any[] {
        let trail = this.quadToFood;
        if (type === 'TO_HOME') {
            trail = this.quadToHome;
        }

        const SIZE = this.visionRadius;
        const colliding = trail.quad.colliding(
            {
                x: this.pos.x,
                y: this.pos.y
            },
            function (e1, e2) {
                const dsquared = (e2.x - e1.x) * (e2.x - e1.x) + (e2.y - e1.y) * (e2.y - e1.y);
                return dsquared <= SIZE * SIZE;
            }
        );
        return colliding;
    }

    draw() {
        let color = 'rgba(50, 50, 150, 0.5)';
        if (this.state === 'backtrack') {
            color = 'rgba(50, 150, 50, 0.5)';
        }

        this.p5.fill(color);
        this.p5.noStroke();
        this.p5.circle(this.pos.x, this.pos.y, 10);

        if (this.id === 0) {
            // Circle around the ant to recognise it
            this.p5.noFill();
            this.p5.stroke('red');
            this.p5.strokeWeight(2);
            this.p5.circle(this.pos.x, this.pos.y, 10);

            // Vision radius circle
            this.p5.strokeWeight(1);
            this.p5.stroke('rgba(250, 0, 0, 0.4)');
            this.p5.noFill();
            this.p5.circle(this.pos.x, this.pos.y, this.visionRadius * 2);

            // Considered pheromones
            this.p5.noStroke();
            this.p5.fill('red');
            const target = this.state === 'explore' ? 'TO_FOOD' : 'TO_HOME';
            this.getSurroundingPheromones(target).forEach((p) => {
                this.p5.circle(p.x, p.y, 3);
            });
        }
    }
}
