import P5 from 'p5';
import {Ant} from './Ant';

export class Home {
    p5: P5;
    food: number;
    pos: P5.Vector;
    radius: number;

    constructor(p5: P5) {
        this.p5 = p5;
        this.food = 0;
        this.pos = new P5.Vector();
        this.radius = 50;
    }

    collide(ant: Ant) {
        const dsquared =
            (this.pos.x - ant.pos.x) * (this.pos.x - ant.pos.x) + (this.pos.y - ant.pos.y) * (this.pos.y - ant.pos.y);
        return dsquared <= this.radius * this.radius;
    }

    draw() {
        this.p5.stroke('blue');
        this.p5.noFill();
        this.p5.fill('rgba(150, 150, 200, 0.6)');
        this.p5.circle(0, 0, this.radius * 2);
        this.p5.fill('white');
        const text = this.food.toString();
        const saveSize = this.p5.textSize();
        this.p5.textSize(25);
        const textWidth = this.p5.textWidth(text);
        this.p5.text(text, this.pos.x - textWidth / 2, this.pos.y);
        this.p5.textSize(saveSize);
    }
}
