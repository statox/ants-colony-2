import P5 from 'p5';

import {Cell, Dir} from './Cell';
import {Ant} from './Ant';

function randomDir(): Dir {
    const dirs: Dir[] = ['top', 'left', 'bottom', 'right'];
    return dirs[Math.ceil(Math.random() * 4)];
}

export class Board {
    p5: P5;
    cells: Cell[][];
    D: number;
    ant: Ant;
    ants: Ant[];
    nbAnts: number;

    constructor(p5: P5, D: number, nbAnts: number) {
        this.p5 = p5;
        this.D = D;
        this.nbAnts = nbAnts;
        this.cells = [];

        for (let j = 0; j < this.D; j++) {
            this.cells.push([]);
            for (let i = 0; i < this.D; i++) {
                this.cells[j].push(new Cell(this.p5, i, j));
            }
        }

        for (let j = 0; j < this.D; j++) {
            for (let i = 0; i < this.D; i++) {
                if (j > 0) {
                    this.cells[j][i].paths.top = {
                        cell: this.cells[j - 1][i],
                        open: false
                    };
                }
                if (i < this.D - 1) {
                    this.cells[j][i].paths.right = {
                        cell: this.cells[j][i + 1],
                        open: false
                    };
                }
                if (j < this.D - 1) {
                    this.cells[j][i].paths.bottom = {
                        cell: this.cells[j + 1][i],
                        open: false
                    };
                }
                if (i > 0) {
                    this.cells[j][i].paths.left = {
                        cell: this.cells[j][i - 1],
                        open: false
                    };
                }
            }
        }

        this.ants = [];
        for (let i = 0; i < this.nbAnts; i++) {
            this.ants.push(new Ant(this.p5, this.cells[this.D * 0.8][this.D / 2], i));
        }
    }

    update() {
        for (const ant of this.ants) {
            ant.update();
        }

        for (let j = 0; j < this.D; j++) {
            for (let i = 0; i < this.D; i++) {
                this.cells[j][i].evaporatePheromones();
            }
        }
    }

    straightAndLongPathsAndFoodSource() {
        this.cells[this.D * 0.8][this.D / 2].startingCell = true;
        this.cells[this.D * 0.8][0].food = this.cells[this.D * 0.8][0].MAX_FOOD;

        for (let i = Math.ceil(this.D / 2); i < this.D - 1; i++) {
            this.makeWay(this.cells[this.D * 0.8][i], 'right');
        }

        for (let i = 0; i < this.D; i++) {
            this.makeWay(this.cells[this.D - 1][i], 'right');
            this.makeWay(this.cells[0][i], 'right');
            this.makeWay(this.cells[i][this.D - 1], 'top');
            this.makeWay(this.cells[i][0], 'top');
            this.makeWay(this.cells[i][this.D / 2], 'top');
        }
    }

    setFoodSource() {
        let randJ = Math.ceil(this.D / 2);
        let randI = Math.ceil(this.D / 2);
        while (randJ === Math.ceil(this.D / 2) && randI === Math.ceil(this.D / 2)) {
            randJ = Math.ceil(Math.random() * this.cells.length - 1);
            randI = Math.ceil(Math.random() * this.cells[0].length - 1);
        }

        this.cells[randJ][randI].food = this.cells[randJ][randI].MAX_FOOD;
    }

    makeRandomOpenings() {
        for (let _ = 0; _ < 50; _++) {
            const randJ = Math.ceil(Math.random() * this.cells.length - 1);
            const randI = Math.ceil(Math.random() * this.cells[0].length - 1);

            this.makeWay(this.cells[randJ][randI], randomDir());
        }
    }

    randomWalkMaze() {
        const visited: Set<Cell> = new Set();
        const stack: Cell[] = [this.cells[this.D / 2][this.D / 2]];
        const dirs: Dir[] = ['top', 'left', 'bottom', 'right'];

        while (stack.length) {
            const possibleWays = [];
            const currentCell = stack[stack.length - 1];

            visited.add(currentCell);

            for (const dir of dirs) {
                if (currentCell.paths[dir] && !visited.has(currentCell.paths[dir].cell)) {
                    possibleWays.push(dir);
                }
            }

            if (!possibleWays.length) {
                stack.pop();
                continue;
            }

            const way = possibleWays[Math.ceil(Math.random() * possibleWays.length - 1)];
            const nextCell = currentCell.paths[way].cell;
            this.makeWay(currentCell, way);
            stack.push(nextCell);
        }

        this.cells[this.D / 2][this.D / 2].startingCell = true;
        this.makeWay(this.cells[this.D / 2][this.D / 2], 'top');
        this.makeWay(this.cells[this.D / 2][this.D / 2], 'right');
        this.makeWay(this.cells[this.D / 2][this.D / 2], 'bottom');
        this.makeWay(this.cells[this.D / 2][this.D / 2], 'left');
    }

    makeWay(cell: Cell, d: Dir) {
        if (d === 'top' && cell.paths.top) {
            cell.paths.top.open = true;
            cell.paths.top.cell.paths.bottom.open = true;
        }
        if (d === 'bottom' && cell.paths.bottom) {
            cell.paths.bottom.open = true;
            cell.paths.bottom.cell.paths.top.open = true;
        }
        if (d === 'right' && cell.paths.right) {
            cell.paths.right.open = true;
            cell.paths.right.cell.paths.left.open = true;
        }
        if (d === 'left' && cell.paths.left) {
            cell.paths.left.open = true;
            cell.paths.left.cell.paths.right.open = true;
        }
    }

    draw() {
        const scale = this.p5.width / this.D;
        const red: [number, number, number] = [125, 0, 0];
        const white: [number, number, number] = [250, 250, 250];

        for (let j = 0; j < this.D; j++) {
            for (let i = 0; i < this.D; i++) {
                const cell = this.cells[j][i];
                let color;
                if (cell.startingCell) {
                    color = red;
                } else if (cell.food > 0) {
                    const diff = (250 / cell.MAX_FOOD) * cell.food;
                    color = [250 - diff, 250, 250 - diff];
                } else if (cell.pheromones) {
                    color = [250, 250, 250];
                    color[1] -= (250 / cell.MAX_PHEROMONES) * cell.pheromones;
                } else {
                    color = white;
                }
                cell.draw(scale, color);
            }
        }

        for (const ant of this.ants) {
            ant.draw(scale);
        }
    }
}
