import * as tf from '@tensorflow/tfjs'

export const createDQN = (inputShape, numActions) => {
  const model = tf.sequential()

  // Example: Two hidden layers
  model.add(
    tf.layers.dense({ units: 64, activation: 'relu', inputShape: [inputShape] })
  )
  model.add(tf.layers.dense({ units: 64, activation: 'relu' }))

  // Output layer
  model.add(tf.layers.dense({ units: numActions, activation: 'linear' }))

  // Compile model
  model.compile({
    optimizer: tf.train.adam(),
    loss: 'meanSquaredError',
  })

  return model
}
