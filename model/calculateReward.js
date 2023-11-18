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

function isCollision(gameState, move) {
  const head = gameState.you.head
  let nextHeadPosition = getNextHeadPosition(head, move)

  // Check for wall collisions
  if (
    nextHeadPosition.x < 0 ||
    nextHeadPosition.x >= gameState.board.width ||
    nextHeadPosition.y < 0 ||
    nextHeadPosition.y >= gameState.board.height
  ) {
    return true // Collision with wall
  }

  // Check for collisions with itself and other snakes
  for (const snake of gameState.board.snakes) {
    for (const segment of snake.body) {
      if (
        segment.x === nextHeadPosition.x &&
        segment.y === nextHeadPosition.y
      ) {
        return true // Collision with itself or other snake
      }
    }
  }

  return false // No collision
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
  const moveActions = ['up', 'down', 'left', 'right']
  return moveActions[index]
}

function calculateReward(gameState, move) {
  move = convertActionIndexToMove(move)
  if (isCollision(gameState, move)) {
    return -3
  }
  if (isEatingFood(gameState, move)) {
    return 1
  }
  return 0.1 // Small reward for surviving
}

export { calculateReward }
