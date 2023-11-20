function getNextHeadPosition(head, move) {
  let nextHeadPosition = { x: head.x, y: head.y }
  switch (move) {
    case 'up':
      nextHeadPosition.y += 1
      break
    case 'down':
      nextHeadPosition.y -= 1
      break
    case 'left':
      nextHeadPosition.x -= 1
      break
    case 'right':
      nextHeadPosition.x += 1
      break
  }
  return nextHeadPosition
}

function isNearBorder(gameState, move) {
  const head = gameState.you.head
  const boardWidth = gameState.board.width
  const boardHeight = gameState.board.height
  // Define border proximity (1 means directly adjacent to the border)
  const borderProximity = 1
  let nextHeadPosition = getNextHeadPosition(head, move)

  return (
    nextHeadPosition.x < borderProximity ||
    nextHeadPosition.x >= boardWidth - borderProximity ||
    nextHeadPosition.y < borderProximity ||
    nextHeadPosition.y >= boardHeight - borderProximity
  )
}
function isEatingFood(gameState, move) {
  const head = gameState.you.head
  let nextHeadPosition = getNextHeadPosition(head, move)

  // Check if the next head position is on a food item
  return gameState.board.food.some(
    (food) => food.x === nextHeadPosition.x && food.y === nextHeadPosition.y
  )
}

function convertActionIndexToMove(index) {
  const moveActions = ['up', 'right', 'down', 'left']
  return moveActions[index]
}

function calculateReward(gameState, move) {
  move = convertActionIndexToMove(move)
  if (isEatingFood(gameState, move)) {
    return 10
  }
  if (isNearBorder(gameState, move)) {
    return -1
  }
  return 0.1 // Small reward for surviving
}

export { calculateReward }
