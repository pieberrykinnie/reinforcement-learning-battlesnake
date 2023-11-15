export const isGameOver = (gameState) => {
  // Your snake's ID
  const yourId = gameState.you.id

  // Check if your snake's ID is not in the list of snakes, indicating it has been eliminated
  const isDead = !gameState.board.snakes.some((snake) => snake.id === yourId)

  // Additionally, check if your snake's health is zero
  const isStarved = gameState.you.health === 0

  // The game is over for your snake if it is dead or starved
  return isDead || isStarved
}
/**
 * !Check if this works 
*/