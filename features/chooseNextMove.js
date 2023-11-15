import * as tf from '@tensorflow/tfjs'

function convertActionIndexToMove(actionIndex) {
  const actions = ['up', 'down', 'left', 'right']
  return actions[actionIndex]
}

export const chooseNextMove = (model, currentStateTensor) => {
  // Predict the Q-values for the current state
  const predictedQValues = model.predict(currentStateTensor)

  // Use dataSync to get the Q-values from the tensor
  const qValues = predictedQValues.dataSync()

  // Select the action with the highest Q-value
  const actionIndex = qValues.indexOf(Math.max(...qValues))

  // Convert the action index to an actual move (e.g., 'up', 'down', 'left', 'right')
  const move = convertActionIndexToMove(actionIndex) // This needs to be implemented

  // Dispose of the tensor to free memory
  tf.dispose(predictedQValues)

  return move
}
