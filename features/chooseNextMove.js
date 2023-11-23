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

// Start of Peter's code
// Check if:
// - The corner right next to our snake's head has an enemy snake's head
// - The two squares directly in front of our snake has an enemy snake's head
function checkCornersForSnakes(gameState) {
  const head = gameState.you.head;
  // Filter out our own snake before comparing locations
  const snakeLocations = gameState.board.snakes.filter(
    function(x) {
      return x.id != gameState.you.id;
    }
  )

  let possibleBumpMoves = [];

  let enemySnake;
  let enemySnakeHead;
  
  // Run a loop to check every possible non-ours snake in the board
  for (let i = 0; i < snakeLocations.length; i++) {
    enemySnake = snakeLocations[i].body;

    // Check instead for all enemy snake's body parts for the first case
    // for (let j = 0; j < enemySnake.length; j++) {
    //   if (enemySnake.length >= gameState.you.body.length) {
    //     if (((enemySnake[j].y - head.y === 1 && Math.abs(enemySnake[j].x - head.x) === 1)
    //     || (enemySnake[0].y - head.y === 2 && enemySnake[0].x === head.x)) && !unsafeMoves.includes(0)) {
    //       unsafeMoves.push(0);
    //     }
    //     if (((enemySnake[j].x - head.x === 1 && Math.abs(enemySnake[j].y - head.y) === 1)
    //     || (enemySnake[0].x - head.x === 2 && enemySnake[0].y === head.y)) && !unsafeMoves.includes(1)) {
    //       unsafeMoves.push(1);
    //     }
    //     if (((enemySnake[j].y - head.y === -1 && Math.abs(enemySnake[j].x - head.x) === 1)
    //     || (enemySnake[0].y - head.y === -2 && enemySnake[0].x === head.x)) && !unsafeMoves.includes(2)) {
    //       unsafeMoves.push(2);
    //     }
    //     if (((enemySnake[j].x - head.x === -1 && Math.abs(enemySnake[j].y - head.y) === 1)
    //     || (enemySnake[0].x - head.x === -2 && enemySnake[0].y === head.y)) && !unsafeMoves.includes(3)) {
    //       unsafeMoves.push(3);
    //     }
    //   }
    // }

    enemySnakeHead = snakeLocations[i].head;
    // Only check for bumps if the enemy snake in question is longer or equal to ours
    if (enemySnake.length >= gameState.you.body.length) {
      if (((enemySnakeHead.y - head.y === 1 && Math.abs(enemySnakeHead.x - head.x) === 1)
      || (enemySnakeHead.y - head.y === 2 && enemySnakeHead.x === head.x)) && !possibleBumpMoves.includes(0)) {
        possibleBumpMoves.push(0);
      }
      if (((enemySnakeHead.x - head.x === 1 && Math.abs(enemySnakeHead.y - head.y) === 1)
      || (enemySnakeHead.x - head.x === 2 && enemySnakeHead.y === head.y)) && !possibleBumpMoves.includes(1)) {
        possibleBumpMoves.push(1);
      }
      if (((enemySnakeHead.y - head.y === -1 && Math.abs(enemySnakeHead.x - head.x) === 1)
      || (enemySnakeHead.y - head.y === -2 && enemySnakeHead.x === head.x)) && !possibleBumpMoves.includes(2)) {
        possibleBumpMoves.push(2);
      }
      if (((enemySnakeHead.x - head.x === -1 && Math.abs(enemySnakeHead.y - head.y) === 1)
      || (enemySnakeHead.x - head.x === -2 && enemySnakeHead.y === head.y)) && !possibleBumpMoves.includes(3)) {
        possibleBumpMoves.push(3);
      }
    }
  }

  return possibleBumpMoves;
}

// Look at all the food on the table and save the location of the nearest food to snake's head
function lookForFood(gameState) {
  const head = gameState.you.head;
  const foodLocations = gameState.board.food;

  // Default values so the function doesn't break if there is no food on the board
  let distanceNearestFoodX = 100;
  let distanceNearestFoodY = 100;
  let nearestFood = { x: 0, y: 0 };

  for (let i = 0; i < foodLocations.length; i++) {
    if (Math.abs(head.x - foodLocations[i].x) + Math.abs(head.y - foodLocations[i].y) < distanceNearestFoodX + distanceNearestFoodY) {

      distanceNearestFoodX = Math.abs(head.x - foodLocations[i].x);
      distanceNearestFoodY = Math.abs(head.y - foodLocations[i].y);

      nearestFood = foodLocations[i];
    }
  }

  return nearestFood;
}

// Pick a single move to prioritize and add the q-values of such move by a certain amount depending
// on the snake's health and how far it is from the given food in the previous function
function goForFood(nearestFood, gameState) {
  const head = gameState.you.head;
  const foodPriorityMultiplier = 700; // Modify this to determine how much the snake prioritizes food

  // Default value
  // Would be slightly better if it were a list of possible moves and multipliers added to them instead;
  // but a hassle to make work
  let priority = {move: 4, multiplier: 0.01};

  let distanceToFoodX = nearestFood.x - head.x;
  let distanceToFoodY = nearestFood.y - head.y;

  if (Math.abs(distanceToFoodX) < Math.abs(distanceToFoodY)) {
    if (distanceToFoodX < 0) {
      priority.move = 3;
      priority.multiplier = foodPriorityMultiplier / gameState.you.health / Math.abs(distanceToFoodX);
    }
    else if (distanceToFoodX > 0) {
      priority.move = 1;
      priority.multiplier = foodPriorityMultiplier / gameState.you.health / distanceToFoodX;
    }
    else {
      if (distanceToFoodY < 0) {
        priority.move = 2;
        priority.multiplier = foodPriorityMultiplier / gameState.you.health / Math.abs(distanceToFoodY);
      }
      else if (distanceToFoodY > 0) {
        priority.move = 0;
        priority.multiplier = foodPriorityMultiplier / gameState.you.health / distanceToFoodY;
      }
    }
  } else {
    if (distanceToFoodY < 0) {
      priority.move = 2;
      priority.multiplier = foodPriorityMultiplier / gameState.you.health / Math.abs(distanceToFoodY);
    }
    else if (distanceToFoodY > 0) {
      priority.move = 0;
      priority.multiplier = foodPriorityMultiplier / gameState.you.health / distanceToFoodY;
    }
    else {
      if (distanceToFoodX < 0) {
        priority.move = 3;
        priority.multiplier = foodPriorityMultiplier / gameState.you.health / Math.abs(distanceToFoodX);
      }
      else if (distanceToFoodX > 0) {
        priority.move = 1;
        priority.multiplier = foodPriorityMultiplier / gameState.you.health / distanceToFoodX;
      }
    }
  }

  return priority;
}

// Function so the snake is demotivated from going to and staying on the edges so as not to get trapped
function avoidEdges(gameState) {
  const head = gameState.you.head;

  let unsafeMoves = [];

  if (head.y + 1 >= gameState.board.height - 1 || head.x == 0 || head.x == gameState.board.width - 1) {
    unsafeMoves.push(0);
  }
  if (head.x + 1 >= gameState.board.width - 1 || head.y == 0 || head.y == gameState.board.height - 1) {
    unsafeMoves.push(1);
  }
  if (head.y - 1 <= 0 || head.x == 0 || head.x == gameState.board.width - 1) {
    unsafeMoves.push(2);
  }
  if (head.x - 1 <= 0 || head.y == 0 || head.y == gameState.board.height - 1) {
    unsafeMoves.push(3);
  }

  return unsafeMoves;
}
// End of Peter's code

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
  
  // Start of Peter's code
  let moveForFood = goForFood(lookForFood(gameState), gameState);
  // console.log("preferred move " + moveForFood.move)
  for (let i = 0; i < rankedActions.length; i++) {
    if (rankedActions[i].action === moveForFood.move) {
      rankedActions[i].value += moveForFood.multiplier;
    }
  }

  const bumpDemotivator = 15; // Adjust to change how much the snake wants to avoid possible bumps
  let possibleBumps = checkCornersForSnakes(gameState);
  // console.log("unpreferred moves " + possibleBumps)
  for (let i = 0; i < rankedActions.length; i++) {
    if (possibleBumps.includes(rankedActions[i].action)) {
      rankedActions[i].value -= bumpDemotivator;
    }
  }

  const wallDemotivator = 3; // Adjust to change how much the snake wants to avoid being on the edges
  let movesToWall = avoidEdges(gameState);
  // console.log("unsure moves " + movesToWall)
  for (let i = 0; i < rankedActions.length; i++) {
    if (movesToWall.includes(rankedActions[i].action)) {
      rankedActions[i].value -= wallDemotivator;
    }
  }

  // for (let i = 0; i < rankedActions.length; i++) {
  //   console.log("action " + rankedActions[i].action + " value " + rankedActions[i].value)
  // }
  // End of Peter's code

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
