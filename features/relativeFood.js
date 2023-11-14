function relativeFood(snakeHead, foodItems) {
  // This function calculates the relative position of food items to the snake's head
  return foodItems.map((food) => {
    return {
      x: food.x - snakeHead.x,
      y: food.y - snakeHead.y,
    }
  })
}

export { relativeFood }
