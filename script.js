import { Grid } from "./grid.js";
import { Tile } from "./tile.js";
import { Device } from "./device.js";

const gameBord = document.getElementById("game-board");
const endScreen = document.querySelector(".banner");
const body = document.body;

const device = new Device();
const grid = new Grid(gameBord);
grid.getRandomEmptyCell().linkTile(new Tile(gameBord));
grid.getRandomEmptyCell().linkTile(new Tile(gameBord));

if (device.isMobile.any()) {
  body.classList.add("_toch");
  setupTouchEvents(); // Додана функція для обробки свайпів
} else {
  setupInputOnce();
}

function setupTouchEvents() {
  let touchStartX = 0;
  let touchStartY = 0;

  gameBord.addEventListener("touchstart", handleTouchStart, false);
  gameBord.addEventListener("touchmove", handleTouchMove, false);

  function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }

  function handleTouchMove(event) {
    if (event.touches.length > 0) {
      const touchEndX = event.touches[0].clientX;
      const touchEndY = event.touches[0].clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          // Swipe right
          if (canMoveRight()) {
            moveRight();
          }
        } else {
          // Swipe left
          if (canMoveLeft()) {
            moveLeft();
          }
        }
      } else {
        if (deltaY > 0) {
          // Swipe down
          if (canMoveDown()) {
            moveDown();
          }
        } else {
          // Swipe up
          if (canMoveUP()) {
            moveUp();
          }
        }
      }

      touchStartX = 0;
      touchStartY = 0;
    }
  }
}

////////////////////////////////////////////
function setupInputOnce() {
  window.addEventListener("keydown", handleInput, { once: true });
}

async function handleInput(event) {
  switch (event.key) {
    case "ArrowUp":
      if (!canMoveUP()) {
        setupInputOnce();
        return;
      }
      await moveUp();
      break;
    case "ArrowDown":
      if (!canMoveDown()) {
        setupInputOnce();
        return;
      }
      await moveDown();
      break;
    case "ArrowLeft":
      if (!canMoveLeft()) {
        setupInputOnce();
        return;
      }
      await moveLeft();
      break;
    case "ArrowRight":
      if (!canMoveRight()) {
        setupInputOnce();
        return;
      }
      await moveRight();
      break;
    default:
      setupInputOnce();
      return;
  }

  const newTile = new Tile(gameBord);
  grid.getRandomEmptyCell().linkTile(newTile);

  if (!canMoveUP() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    await newTile.waitForAnimationEnd();
    endScreen.classList.toggle("_active");
    addEventListener("click", () => {
      location.reload();
    });
    return;
  }

  setupInputOnce();
}

async function moveUp() {
  await slideTiles(grid.cellsGroupedByColumn);
}

async function moveDown() {
  await slideTiles(grid.cellsGroupedByReversedColumn);
}

async function moveLeft() {
  await slideTiles(grid.cellsGroupedByRow);
}
async function moveRight() {
  await slideTiles(grid.cellsGroupedByReversedRow);
}

async function slideTiles(groupedCells) {
  const promises = [];

  groupedCells.forEach(group => slideTileGroup(group, promises));

  await Promise.all(promises);

  grid.cells.forEach(cell => {
    cell.hasTileForMerge() && cell.mergeTiles();
  });
}

function slideTileGroup(group, promise) {
  for (let i = 1; i < group.length; i++) {
    if (group[i].isEmpty()) {
      continue;
    }

    const cellWithTile = group[i];

    let targetCell;
    let j = i - 1;
    while (j >= 0 && group[j].canAccept(cellWithTile.linkedTile)) {
      targetCell = group[j];
      j--;
    }

    if (!targetCell) {
      continue;
    }

    promise.push(cellWithTile.linkedTile.waitForTransitionEnd());

    if (targetCell.isEmpty()) {
      targetCell.linkTile(cellWithTile.linkedTile);
    } else {
      targetCell.linkTileForMerge(cellWithTile.linkedTile);
    }

    cellWithTile.unlinkTile();

  }
}

function canMoveUP() {
  return canMove(grid.cellsGroupedByColumn);
}
function canMoveDown() {
  return canMove(grid.cellsGroupedByReversedColumn);
}
function canMoveLeft() {
  return canMove(grid.cellsGroupedByRow);
}
function canMoveRight() {
  return canMove(grid.cellsGroupedByReversedRow);
}

function canMove(groupedCells) {
  return groupedCells.some(group => canMoveInGroup(group));
}

function canMoveInGroup(group) {
  return group.some((cell, index) => {
    if (index === 0) {
      return false;
    }
    if (cell.isEmpty()) {
      return false;
    }

    const targetCell = group[index - 1];
    return targetCell.canAccept(cell.linkedTile);
  })
}