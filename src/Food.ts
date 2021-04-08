import P5 from 'p5';
const Quadtree = require('quadtree-lib');

export class FoodStock {
    p5: P5;
    quad: Quadtree<any>;
    size: number;

    constructor(p5: P5, D: number) {
        this.p5 = p5;
        this.size = 8;
        this.quad = new Quadtree({
            width: D,
            height: D,
            maxElements: 10
        });
    }

    remove(item) {
        this.quad.remove(item);
    }

    generateRandomFoodSpot() {
        const pos = P5.Vector.random2D();
        pos.setMag((this.p5.width / 2) * this.p5.map(Math.random(), 0, 1, 0.3, 1));

        let radius = 20;
        let amount = 100;
        for (let i = 0; i < amount; i++) {
            const diff = P5.Vector.random2D().setMag(Math.random() * radius);
            diff.add(pos);
            this.push({x: diff.x, y: diff.y});
        }
    }

    generateFoodCircle(radius: number) {
        let pos = new P5.Vector();
        pos.x = radius;
        for (let i = 0; i < 360; i++) {
            pos.rotate(this.p5.radians(1));
            this.push({x: pos.x, y: pos.y});
        }
    }

    generateFoodSquare(border: number) {
        for (let x = -border; x < border; x += 15) {
            this.push({x: x, y: -border});
            this.push({x: x, y: border});
            this.push({x: -border, y: x});
            this.push({x: border, y: x});
        }
    }

    push(point: {x: number; y: number}) {
        this.quad.push(
            {
                x: point.x,
                y: point.y,
                height: this.size,
                width: this.size
            },
            true
        );
    }

    draw() {
        this.p5.noStroke();
        this.quad.each((p) => {
            this.p5.fill(17, 100, 12);
            this.p5.rect(p.x, p.y, p.width, p.height);
        });
    }
}
