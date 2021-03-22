import P5 from 'p5';

interface Path {
    cell: Cell;
    open: boolean;
}

interface Paths {
    top: Path;
    right: Path;
    bottom: Path;
    left: Path;
}

export type Dir = 'top' | 'left' | 'right' | 'bottom';

export class Cell {
    p5: P5;
    pos: P5.Vector;
    paths: Paths;
    food: number;
    startingCell: boolean;
    pheromones: number;
    MAX_PHEROMONES: number;
    MAX_FOOD: number;

    constructor(p5, i, j) {
        this.p5 = p5;
        this.pos = this.p5.createVector(i, j);
        this.food = 0;
        this.paths = {
            top: null,
            right: null,
            bottom: null,
            left: null
        };
        this.startingCell = false;
        this.pheromones = 0;
        this.MAX_PHEROMONES = 10;
        this.MAX_FOOD = 10;
    }
    evaporatePheromones() {
        this.pheromones *= 0.99;
    }

    addPheromones() {
        // console.log({pheromones: this.pheromones, max: this.MAX_PHEROMONES});
        if (this.pheromones < this.MAX_PHEROMONES) {
            this.pheromones += 1;
        }
    }

    toString() {
        return `${this.pos.x}-${this.pos.y}`;
    }

    possibleWays(): Cell[] {
        const possibleWays: Cell[] = [];
        if (this.paths.top?.open) {
            possibleWays.push(this.paths.top.cell);
        }
        if (this.paths.right?.open) {
            possibleWays.push(this.paths.right.cell);
        }
        if (this.paths.bottom?.open) {
            possibleWays.push(this.paths.bottom.cell);
        }
        if (this.paths.left?.open) {
            possibleWays.push(this.paths.left.cell);
        }

        return possibleWays;
    }

    draw(scale: number, color: [number, number, number]) {
        this.p5.noStroke();
        this.p5.push();
        this.p5.translate(this.pos.x * scale, this.pos.y * scale);

        this.p5.fill(color);
        this.p5.square(0, 0, scale);

        this.p5.noFill();
        this.p5.stroke(0);
        this.p5.strokeWeight(2);
        if (this.paths.top?.open === false) {
            this.p5.line(0, 0, scale, 0);
        }
        if (this.paths.right?.open === false) {
            this.p5.line(scale, 0, scale, scale);
        }
        if (this.paths.bottom?.open === false) {
            this.p5.line(0, scale, scale, scale);
        }
        if (this.paths.left?.open === false) {
            this.p5.line(0, 0, 0, scale);
        }

        /*
         * if (this.pheromones - 1 > 0) {
         *     this.p5.strokeWeight(1);
         *     const pheromonesText = (this.pheromones - 1).toFixed(1);
         *     this.p5.text(pheromonesText, 2, this.p5.textSize());
         * }
         */

        /*
         * if (this.food > 0) {
         *     this.p5.strokeWeight(1);
         *     const foodText = this.food.toString();
         *     this.p5.text(foodText, scale - this.p5.textWidth(foodText), scale - this.p5.textSize());
         * }
         */
        this.p5.pop();
    }
}
