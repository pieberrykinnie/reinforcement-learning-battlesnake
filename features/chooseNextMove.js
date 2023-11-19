import * as tf from '@tensorflow/tfjs-node'

function convertActionIndexToMove(actionIndex) {
  const actions = ['up', 'right', 'down', 'left']
  return actions[actionIndex]
}

function getNextHeadPosition(head, move) {
  let nextHeadPosition = { x: head.x, y: head.y }

  switch (move) {
    case 'up':
      nextHeadPosition.y += 1 // Increasing Y moves the snake up
      break
    case 'down':
      nextHeadPosition.y -= 1 // Decreasing Y moves the snake down
      break
    case 'left':
      nextHeadPosition.x -= 1 // Decreasing X moves the snake left
      break
    case 'right':
      nextHeadPosition.x += 1 // Increasing X moves the snake right
      break
  }
  return nextHeadPosition
}

function isCollision(gameState, move) {
  const head = gameState.you.head
  const nextHeadPosition = getNextHeadPosition(head, move)

  // Check for wall collisions
  if (
    nextHeadPosition.x < 0 ||
    nextHeadPosition.y < 0 ||
    nextHeadPosition.x >= gameState.board.width ||
    nextHeadPosition.y >= gameState.board.height
  ) {
    return true // Collision with the wall
  }

  // Check for collisions with self and other snakes
  return gameState.board.snakes.some((snake) =>
    snake.body.some(
      (segment) =>
        segment.x === nextHeadPosition.x && segment.y === nextHeadPosition.y
    )
  )
}

export const chooseNextMove = (model, currentStateTensor, gameState) => {
  const predictedQValues = model.predict(currentStateTensor)
  const qValues = predictedQValues.dataSync()

  // Make sure qValues are numbers
  if (qValues.some((value) => typeof value !== 'number' || isNaN(value))) {
    console.error('Invalid Q values:', qValues)
    return 'up' // Default move in case of error
  }

  const actions = ['up', 'right', 'down', 'left']

  // Generate a list of indices for safe moves
  const safeMoves = actions
    .map((move, index) => ({ move, index }))
    .filter(({ move }) => !isCollision(gameState, move))
    .map(({ index }) => index)

  // Rank the actions based on their Q-values
  let rankedActions = []
  for (let i = 0; i < safeMoves.length; i++) {
    for (let j = 0; j < qValues.length; j++) {
      if (safeMoves[i] === j) {
        rankedActions[i] = {
          value: qValues[safeMoves[i]],
          action: safeMoves[i],
        }
      }
    }
  }

  rankedActions = rankedActions.sort((a, b) => b.value - a.value)

  tf.dispose(predictedQValues)

  let move
  // If there is no safe moves just pick the highest Q-value action
  if (rankedActions.length === 0) {
    move = qValues.indexOf(Math.max(...qValues))
    return convertActionIndexToMove(move)
  }

  move = rankedActions[0].action
  return convertActionIndexToMove(move)
}
