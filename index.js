import runServer from './server.js'
import { calculateReward } from './model/calculateReward.js'
import { convertGameStateToTensor } from './model/convertGameStateToTensor.js'
import { chooseNextMove } from './features/chooseNextMove.js'
import { trainModel } from './model/trainModel.js'
import { ReplayBuffer } from './model/replayBuffer.js'
import { loadModel } from './model/loadModel.js'
import { saveModel } from './model/saveModel.js'

let counter = 1

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
  console.log(`GAME START round ${counter}`)
}

let previousStateTensor = null
let previousState = null // Add a variable to store the previous game state
let previousAction = null

const move = (gameState, model, replayBuffer) => {
  // Convert the current game state to a tensor
  const currentStateTensor = convertGameStateToTensor(gameState)

  // Predict and choose the next move
  const nextMove = chooseNextMove(model, currentStateTensor)

  // If we have a previous state, calculate the reward based on the outcome of the previous action
  if (
    previousStateTensor &&
    previousAction !== null &&
    previousState !== null
  ) {
    // Calculate the reward using the previous game state and the action that was taken
    const reward = calculateReward(previousState, previousAction)

    // Save the experience (S, A, R, S') to the replay buffer
    replayBuffer.push(
      previousStateTensor,
      previousAction,
      reward,
      currentStateTensor,
      false // Assuming we have not yet determined whether the state is terminal
    )
  }

  // Update previous state and action with the current information
  previousStateTensor = currentStateTensor
  previousState = { ...gameState } // Update the previous state with the current game state
  previousAction = convertMoveToActionIndex(nextMove)

  // Log the chosen move
  console.log(`MOVE: ${nextMove}`)

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
    const terminalReward = calculateReward(previousState, previousAction) // When you lose the game you get a HUGE negative reward

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
  previousState = null
}

const inputShape = 121 // ! This will change
// Define the number of possible actions
const numberOfActions = 4 // 'up', 'down', 'left', 'right'

// end is called when your Battlesnake finishes a game
function end(gameState, model, replayBuffer) {
  console.log('GAME OVER\n')
  counter++
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
