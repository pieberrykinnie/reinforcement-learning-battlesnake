import * as tf from '@tensorflow/tfjs'
import runServer from './server.js'
import { calculateReward } from './model/calculateReward.js'
import { convertGameStateToTensor } from './model/convertGameStateToTensor.js'
import { chooseNextMove } from './features/chooseNextMove.js'
import { trainModel } from './model/trainModel.js'
import { ReplayBuffer } from './model/replayBuffer.js'
import { loadModel } from './model/loadModel.js'
import { saveModel } from './model/saveModel.js'

function info() {
  console.log('INFO')

  return {
    apiversion: '1',
    author: '', // TODO: Your Battlesnake Username
    color: '#888888', // TODO: Choose color
    head: 'default', // TODO: Choose head
    tail: 'default', // TODO: Choose tail
  }
}

// start is called when your Battlesnake begins a game
function start(gameState) {
  console.log('GAME START')
}

let previousStateTensor = null
let previousAction = null

const move = (gameState, model, replayBuffer) => {
  // Prevent a way so it doesn't run into itself
  /* 
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
  */
  // Convert the game state to a tensor
  const currentStateTensor = convertGameStateToTensor(gameState)

  // Predict and choose the next move
  const nextMove = chooseNextMove(model, currentStateTensor)

  // If previousStateTensor is not null, then we have a previous state and can capture the full experience
  if (previousStateTensor && previousAction !== null) {
    const reward = calculateReward(gameState, nextMove) // Calculate the reward based on the gameState
    console.log(reward)
    // Save the experience (S, A, R, S') to the replay buffer
    replayBuffer.push(
      previousStateTensor,
      previousAction,
      reward,
      currentStateTensor,
      false
    )
  }
  // Update previous state and action
  previousStateTensor = currentStateTensor
  previousAction = convertMoveToActionIndex(nextMove) // You need to implement this conversion

  console.log(nextMove)
  // Return the move to the Battlesnake server
  return { move: nextMove }
}

function convertMoveToActionIndex(move) {
  const moveActions = { up: 0, down: 1, left: 2, right: 3 }
  return moveActions[move]
}

function endGameInReplayBuffer(replayBuffer) {
  if (previousStateTensor && previousAction !== null) {
    // Use a reward for the terminal state if applicable
    const terminalReward = -10 // When you lose the game you get a HUGE negative reward

    // Add a terminal experience to the replay buffer with the done signal set to true
    replayBuffer.push(
      previousStateTensor,
      previousAction,
      terminalReward,
      null, // There is no next state since the game is over
      true
    )
  }

  // Reset the previous state and action
  previousStateTensor = null
  previousAction = null
}

const inputShape = 121 // ! This will change
// Define the number of possible actions
const numberOfActions = 4 // 'up', 'down', 'left', 'right'

// end is called when your Battlesnake finishes a game
function end(gameState, model, replayBuffer) {
  console.log('GAME OVER\n')
  endGameInReplayBuffer(replayBuffer)

  const batchSize = 64 // ! Example batch size, adjust as needed
  const gamma = 0.9 // ! Discount factor for future rewards

  // Call trainModel after a game ends to update the model
  trainModel(model, replayBuffer, batchSize, gamma, numberOfActions, inputShape)
    .then(() => {
      console.log('Model trained with end-of-game experience')
      // Save the model after training
      return saveModel(model)
    })
    .catch((err) => {
      console.error('Error during model training:', err)
    })
}

// Define the input shape based on your state representation
// For example, if you use an 11x11 grid, the input shape will be 121 (11 * 11)
// At server startup
loadModel(inputShape, numberOfActions)
  .then((loadedModel) => {
    // Initialize the DQN model
    const model = loadedModel
    // Initialize the replay buffer with a chosen capacity
    const replayBufferSize = 10000 // Adjust based on your memory constraints
    const replayBuffer = new ReplayBuffer(replayBufferSize)
    // Now you can start the server, because the model is loaded
    runServer({
      info: info,
      start: start,
      move: (gameState) => move(gameState, model, replayBuffer),
      end: (gameState) => end(gameState, model, replayBuffer),
    })
  })
  .catch((error) => {
    console.error('Failed to load or create model:', error)
    process.exit(1) // Exit if we cannot load or create a model
  })
