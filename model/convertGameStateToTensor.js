import * as tf from '@tensorflow/tfjs-node'

const EMPTY = 0,
  FOOD = 1,
  SNAKE = 2,
  OTHER_SNAKE = 3,
  SNAKE_HEAD = 4
const DIRECTIONS = {
  UP: [1, 0, 0, 0],
  RIGHT: [0, 1, 0, 0],
  DOWN: [0, 0, 1, 0],
  LEFT: [0, 0, 0, 1],
  UNKNOWN: [0, 0, 0, 0], // Added for unknown direction
}

const printGameState = (gameState) => {
  const { width: boardWidth, height: boardHeight } = gameState.board
  let boardMatrix = Array.from({ length: boardHeight }, () =>
    new Array(boardWidth).fill(EMPTY)
  )

  // Fill in the board matrix with the game state
  gameState.board.food.forEach((food) => (boardMatrix[food.y][food.x] = FOOD))
  gameState.you.body.forEach((segment, index) => {
    boardMatrix[segment.y][segment.x] = index === 0 ? SNAKE_HEAD : SNAKE
  })
  gameState.board.snakes.forEach((snake) => {
    if (snake.id !== gameState.you.id) {
      snake.body.forEach(
        (segment) => (boardMatrix[segment.y][segment.x] = OTHER_SNAKE)
      )
    }
  })

  // Determine the direction
  const direction =
    gameState.you.body.length > 1
      ? getDirectionVector(gameState.you.body[0], gameState.you.body[1])
      : DIRECTIONS.UNKNOWN

  // Print the board matrix, flipped vertically
  console.log('Board State:')
  boardMatrix.reverse().forEach((row) => {
    console.log(
      row
        .map((cell) => {
          switch (cell) {
            case EMPTY:
              return '·'
            case FOOD:
              return 'F'
            case SNAKE:
              return 'S'
            case OTHER_SNAKE:
              return 'O'
            case SNAKE_HEAD:
              return 'H'
            default:
              return '?'
          }
        })
        .join(' ')
    )
  })

  // Print the direction
  console.log(
    'Direction:',
    Object.keys(DIRECTIONS).find((key) => DIRECTIONS[key] === direction) ||
      'UNKNOWN'
  )
}

// Use this function to print the game state in a readable format

const getDirectionVector = (head, neck) => {
  if (!head || !neck || (head.x === neck.x && head.y === neck.y)) {
    return DIRECTIONS.UNKNOWN // Default to unknown direction
  }

  if (head.y > neck.y) return DIRECTIONS.UP
  if (head.y < neck.y) return DIRECTIONS.DOWN
  if (head.x > neck.x) return DIRECTIONS.RIGHT
  if (head.x < neck.x) return DIRECTIONS.LEFT
}

const convertGameStateToTensor = (gameState) => {
  const { width: boardWidth, height: boardHeight } = gameState.board

  let boardMatrix = Array.from({ length: boardHeight }, () =>
    new Array(boardWidth).fill(EMPTY)
  )

  gameState.board.food.forEach((food) => (boardMatrix[food.y][food.x] = FOOD))

  gameState.you.body.forEach((segment, index) => {
    boardMatrix[segment.y][segment.x] = index === 0 ? SNAKE_HEAD : SNAKE
  })

  gameState.board.snakes.forEach((snake) => {
    if (snake.id !== gameState.you.id) {
      snake.body.forEach(
        (segment) => (boardMatrix[segment.y][segment.x] = OTHER_SNAKE)
      )
    }
  })

  const direction =
    gameState.you.body.length > 1
      ? getDirectionVector(gameState.you.body[0], gameState.you.body[1])
      : DIRECTIONS.UNKNOWN // Use UNKNOWN if the snake has only one segment

  const stateRepresentation = [...boardMatrix.flat(), ...direction]

  // Print the state representation array before converting to a tensor
  printGameState(gameState)
  return tf.tensor(stateRepresentation, [1, stateRepresentation.length])
}

export { convertGameStateToTensor }
