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
                this.cell.food--;
            }
        } else if (this.state === 'backtrack') {
            this.backtrack();
        }
    }

    backtrack() {
        this.cell = this.path.pop();
        this.cell.addPheromones();
    }

    explore() {
        const possibleWays = this.cell.possibleWays();
        const unvisited = new Set<Cell>();

        possibleWays.sort((a, b) => {
            const visitedA = this.visitedCells.has(a);
            const visitedB = this.visitedCells.has(b);
            if (!visitedA && !visitedB) {
                unvisited.add(a);
                unvisited.add(b);
                return 0;
            }
            if (visitedA && !visitedB) {
                unvisited.add(b);
                return 1;
            }
            if (!visitedA && visitedB) {
                unvisited.add(a);
                return -1;
            }
            return this.visitedCells.get(a) - this.visitedCells.get(b);
        });

        let nextCell;
        if (unvisited.size) {
            const cells = Array.from(unvisited);
            nextCell = cells[Math.ceil(Math.random() * cells.length - 1)];
        } else {
            nextCell = possibleWays[0];
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
