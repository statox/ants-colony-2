import P5 from 'p5';
import {Cell, Dir} from './Cell';

export class Ant {
    p5: P5;
    cell: Cell;

    constructor(p5, cell) {
        this.p5 = p5;
        this.cell = cell;
    }

    randomWalk() {
        const possibleWays = this.cell.possibleWays();
        const way = possibleWays[Math.ceil(Math.random() * possibleWays.length - 1)];
        this.cell = way;
    }

    draw(scale) {
        const pos = this.cell.pos;
        this.p5.push();
        this.p5.translate(pos.x * scale + scale / 2, pos.y * scale + scale / 2);

        this.p5.fill(50, 50, 150);
        this.p5.circle(0, 0, 10);
    }
}
