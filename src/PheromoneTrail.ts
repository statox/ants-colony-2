import P5 from 'p5';
const Quadtree = require('quadtree-lib');

export class PheromoneTrail {
    p5: P5;
    quad: Quadtree<any>;
    TTL: number;
    type: 'TO_HOME' | 'TO_FOOD';

    constructor(p5: P5, D: number, type: 'TO_HOME' | 'TO_FOOD') {
        this.p5 = p5;
        this.TTL = 400;
        if (type === 'TO_FOOD') {
            this.TTL = 400;
        }
        this.quad = new Quadtree({
            width: D,
            height: D,
            maxElements: 10
        });
        this.type = type;
    }

    update() {
        const toBeRemoved = [];
        const search = this.quad.each((p) => {
            if (p.ttl > 0) {
                p.ttl--;
            } else {
                toBeRemoved.push(p);
            }
        });
        toBeRemoved.forEach((p) => this.quad.remove(p));
    }

    push(point: {x: number; y: number}) {
        this.quad.push(
            {
                x: point.x,
                y: point.y,
                ttl: this.TTL
            },
            true
        );
    }

    draw() {
        this.p5.noStroke();
        this.quad.each((p) => {
            // this.p5.fill(0, this.p5.map(p.ttl, 100, 0, 250, 50), 0);
            const alpha = this.p5.map(p.ttl, this.TTL, 0, 1, 0);
            if (this.type === 'TO_FOOD') {
                this.p5.fill(`rgba(20, 200, 20, ${alpha})`);
            } else {
                this.p5.fill(`rgba(20, 20, 200, ${alpha})`);
            }
            this.p5.circle(p._x, p._y, 3);
        });
    }
}
