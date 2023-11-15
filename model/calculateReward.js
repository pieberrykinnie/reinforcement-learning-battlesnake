const isCollision = (gameState, nextMove) => {
  // Calculate the next head position based on the current head position and the next move
  const head = gameState.you.head
  let nextHeadPosition = { x: head.x, y: head.y }

  switch (nextMove) {
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

  // Check for wall collisions
  if (
    nextHeadPosition.x < 0 ||
    nextHeadPosition.x >= gameState.board.width ||
    nextHeadPosition.y < 0 ||
    nextHeadPosition.y >= gameState.board.height
  ) {
    return true // Collision with wall
  }

  // Check for collisions with itself
  for (const segment of gameState.you.body) {
    if (segment.x === nextHeadPosition.x && segment.y === nextHeadPosition.y) {
      return true // Collision with itself
    }
  }

  // Check for collisions with other snakes
  for (const snake of gameState.board.snakes) {
    for (const segment of snake.body) {
      if (
        segment.x === nextHeadPosition.x &&
        segment.y === nextHeadPosition.y
      ) {
        return true // Collision with other snake
      }
    }
  }

  return false // No collision
}

const isEatingFood = (gameState, nextMove) => {
  // Calculate the next head position based on the current head position and the next move
  const head = gameState.you.head
  let nextHeadPosition = { x: head.x, y: head.y }

  switch (nextMove) {
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

  // Check if the next head position is on a food item
  for (const foodItem of gameState.board.food) {
    if (
      foodItem.x === nextHeadPosition.x &&
      foodItem.y === nextHeadPosition.y
    ) {
      return true // The next move results in eating food
    }
  }

  return false // The next move does not result in eating food
}

const calculateReward = (gameState, move) => {
  // Check if the move results in hitting walls, own body, other snakes
  if (isCollision(gameState, move)) {
    return -2.0
  }

  // Check if the move results in eating food
  if (isEatingFood(gameState, move)) {
    return 1.0
  }

  // Small reward for surviving
  return 0.1
}
  
export { calculateReward }
