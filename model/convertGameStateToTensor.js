import * as tf from '@tensorflow/tfjs-node' 

function visualizeBoardOnConsole(boardMatrix) {
  console.log('Game Board:')
  // Reverse the rows for printing to match visual representation
  // This assumes that the first row of boardMatrix corresponds to the bottom row of the visual representation
  const reversedMatrix = boardMatrix.slice().reverse()
  reversedMatrix.forEach((row) => {
    // Print each cell, padding single-digit numbers with a space for alignment
    console.log(row.map((cell) => cell.toString().padEnd(2, ' ')).join(' '))
  })
}

function convertGameStateToTensor(gameState) {
  const boardWidth = gameState.board.width
  const boardHeight = gameState.board.height

  // Initialize a 2D array filled with zeros
  let boardMatrix = Array.from(Array(boardHeight), () =>
    new Array(boardWidth).fill(0)
  )

  // Mark food on the board (let's say with a value of 1)
  gameState.board.food.forEach((food) => {
    boardMatrix[food.y][food.x] = 1
  })

  // Mark your snake's body on the board (let's say with a value of 2)
  gameState.you.body.forEach((segment) => {
    boardMatrix[segment.y][segment.x] = 2
  })

  // Optionally, mark other snakes' bodies (let's say with a value of 3)
  gameState.board.snakes.forEach((snake) => {
    snake.body.forEach((segment) => {
      // Check if this segment is not part of your snake
      if (gameState.you.id !== snake.id) {
        boardMatrix[segment.y][segment.x] = 3
      }
    })
  })

  // Flatten the 2D array into a 1D array
  let flattenedBoard = boardMatrix.flat()

  // * Additional: Visualize the board in console
  // visualizeBoardOnConsole(boardMatrix)

  // Convert the 1D array into a TensorFlow.js tensor
  // Assuming TensorFlow.js (tf) is already imported and available
  return tf.tensor(flattenedBoard, [1, boardWidth * boardHeight])
}

export { convertGameStateToTensor }
