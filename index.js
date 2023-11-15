import * as tf from '@tensorflow/tfjs'
import runServer from './server.js'
import { calculateReward } from './model/calculateReward.js'
import { convertGameStateToTensor } from './model/convertGameStateToTensor.js'
import { chooseNextMove } from './features/chooseNextMove.js'
import { createDQN } from './model/createDQN.js'
import { trainModel } from './model/trainModel.js'
import { isGameOver } from './features/isGameOver.js'
import { ReplayBuffer } from './model/replayBuffer.js'

// Define the input shape based on your state representation
// For example, if you use an 11x11 grid, the input shape will be 121 (11 * 11)
const inputShape = 121 // ! This will change
// Define the number of possible actions
const numberOfActions = 4 // 'up', 'down', 'left', 'right'
// Initialize the DQN model
const model = createDQN(inputShape, numberOfActions)
// Initialize the replay buffer with a chosen capacity
const replayBufferSize = 10000 // Adjust based on your memory constraints
const replayBuffer = new ReplayBuffer(replayBufferSize)

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

const move = (gameState) => {
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

  console.log({ move: nextMove })
  // Return the move to the Battlesnake server
  return { move: nextMove }
}

function convertMoveToActionIndex(move) {
  const moveActions = { up: 0, down: 1, left: 2, right: 3 }
  return moveActions[move]
}

function endGameInReplayBuffer() {
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

// end is called when your Battlesnake finishes a game
function end(gameState) {
  console.log('GAME OVER\n')
  endGameInReplayBuffer()

  const batchSize = 64 // ! Example batch size, adjust as needed
  const gamma = 0.9 // ! Discount factor for future rewards

  // Call trainModel after a game ends to update the model
  trainModel(model, replayBuffer, batchSize, gamma, numberOfActions)
    .then(() => {
      console.log('Model trained with end-of-game experience')
    })
    .catch((err) => {
      console.error('Error during model training:', err)
    })
}

runServer({
  info: info,
  start: start,
  move: move,
  end: end,
})
