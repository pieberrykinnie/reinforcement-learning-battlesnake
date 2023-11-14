// move is called on every turn and returns your next move
// Valid moves are "up", "down", "left", or "right"
// See https://docs.battlesnake.com/api/example-move for available data
import { relativeFood } from './relativeFood.js'
import { calculateReward } from '../model/calculateReward.js'
import { convertGameStateToTensor } from '../model/convertGameStateToTensor.js'
import { createDQN } from '../model/createDQN.js';

function move(gameState) {
  let isMoveSafe = {
    up: true,
    down: true,
    left: true,
    right: true,
  }

  // We've included code to prevent your Battlesnake from moving backwards
  const myHead = gameState.you.body[0]
  const myNeck = gameState.you.body[1]

  if (myNeck.x < myHead.x) {
    // Neck is left of head, don't move left
    isMoveSafe.left = false
  } else if (myNeck.x > myHead.x) {
    // Neck is right of head, don't move right
    isMoveSafe.right = false
  } else if (myNeck.y < myHead.y) {
    // Neck is below head, don't move down
    isMoveSafe.down = false
  } else if (myNeck.y > myHead.y) {
    // Neck is above head, don't move up
    isMoveSafe.up = false
  }

  // TODO: Step 1 - Prevent your Battlesnake from moving out of bounds
  // boardWidth = gameState.board.width;
  // boardHeight = gameState.board.height;

  // TODO: Step 2 - Prevent your Battlesnake from colliding with itself
  // myBody = gameState.you.body;

  // TODO: Step 3 - Prevent your Battlesnake from colliding with other Battlesnakes
  // opponents = gameState.board.snakes;

  // Are there any safe moves left?
  const safeMoves = Object.keys(isMoveSafe).filter((key) => isMoveSafe[key])
  if (safeMoves.length == 0) {
    console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`)
    return { move: 'down' }
  }

  // Choose a random move from the safe moves
  const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)]

  //console.log(calculateReward(gameState, nextMove))
  convertGameStateToTensor(gameState);

  // TODO: Step 4 - Move towards food instead of random, to regain health and survive longer
  // food = gameState.board.food;

  console.log(`MOVE ${gameState.turn}: ${nextMove}`)
  return { move: nextMove }
}

export { move }
