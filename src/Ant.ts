import P5 from 'p5';
import {Cell, Dir} from './Cell';

export class Ant {
    p5: P5;
    id: number;
    cell: Cell;
    age: number;
    visitedCells: Map<Cell, number>;
    state: 'explore' | 'backtrack';
    path: Cell[];

    constructor(p5, cell, id) {
        this.p5 = p5;
        this.cell = cell;
        this.id = id;
        this.age = 0;
        this.visitedCells = new Map<Cell, number>();
        this.visitedCells.set(this.cell, 0);
        this.state = 'explore';
        this.path = [];
    }

    randomWalk() {
        const possibleWays = this.cell.possibleWays();
        const way = possibleWays[Math.ceil(Math.random() * possibleWays.length - 1)];
        this.cell = way;
    }

    reset() {
        this.visitedCells = new Map<Cell, number>();
        this.visitedCells.set(this.cell, 0);
        this.state = 'explore';
        this.path = [this.cell];
    }

    update() {
        // console.log({id: this.id, state: this.state, path: this.path.length, cell: this.cell});
        if (this.cell.startingCell) {
            this.reset();
        }

        if (this.state === 'explore') {
            this.explore();
            if (this.cell.food > 0) {
                this.state = 'backtrack';
                // this.cell.food--;
            }
        } else if (this.state === 'backtrack') {
            this.backtrack();
        }
    }

    backtrack() {
        this.cell = this.path.pop();
        this.cell.addPheromones();
    }

    cellProbability(cell) {
        let p = 1;
        if (cell.pheromones >= 1) {
            p *= cell.pheromones;
        }
        p *= this.visitedCells.has(cell) ? 1 : 2;
        return p;
    }

    explore() {
        // Choose the destination cell based on its desirability (target or not) and its
        // amount of pheromones
        const possibleWays = this.cell.possibleWays();
        let totalScore = 0;
        let cumulatedScores = [];
        for (let i = 0; i < possibleWays.length; i++) {
            const cell = possibleWays[i];
            totalScore += this.cellProbability(cell);
            cumulatedScores.push(totalScore);
        }

        const selectedScore = Math.random() * totalScore;

        let nextCell;
        for (let i = 0; i < possibleWays.length; i++) {
            if (selectedScore <= cumulatedScores[i]) {
                nextCell = possibleWays[i];
                break;
            }
        }

        this.age++;
        this.visitedCells.set(nextCell, this.age);
        this.cell = nextCell;
        this.path.push(this.cell);
    }

    draw(scale) {
        if (!this.cell) {
            return;
        }
        const pos = this.cell.pos;
        let color = [50, 50, 150];
        if (this.state === 'backtrack') {
            color = [50, 150, 50];
        }
        this.p5.push();
        this.p5.translate(pos.x * scale + scale / 2, pos.y * scale + scale / 2);

        this.p5.noStroke();
        this.p5.fill(color);
        this.p5.circle(0, 0, 10);
        this.p5.pop();
    }
}
