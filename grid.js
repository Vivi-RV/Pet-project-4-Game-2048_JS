import { Cell } from "./cell.js";

const GRID_SIZE = 4;
const CELLS_COUNT = GRID_SIZE * GRID_SIZE;

export class Grid {
  constructor(gridElement) {
    this.cells = [];
    for (let i = 0; i < CELLS_COUNT; i++) {
      this.cells.push(
        new Cell(gridElement, i % GRID_SIZE, Math.floor(i / GRID_SIZE))
      );
    }

    this.cellsGroupedByColumn = this.groupCellsByColumn();
    this.cellsGroupedByReversedColumn = this.cellsGroupedByColumn.map(column => [...column].reverse());
    this.cellsGroupedByRow = this.groupCellsByRow();
    this.cellsGroupedByReversedRow = this.cellsGroupedByRow.map(row => [...row].reverse());
  }

  getRandomEmptyCell() {
    const emptyCells = this.cells.filter(cell => cell.isEmpty());
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }

  groupCellsByColumn() {
    return this.cells.reduce((gropedCells, cell) => {
      gropedCells[cell.x] = gropedCells[cell.x] || [];
      gropedCells[cell.x][cell.y] = cell;
      return gropedCells;
    }, []);
  }

  groupCellsByRow() {
    return this.cells.reduce((gropedCells, cell) => {
      gropedCells[cell.y] = gropedCells[cell.y] || [];
      gropedCells[cell.y][cell.x] = cell;
      return gropedCells;
    }, []);
  }
}