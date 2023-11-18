import * as tf from '@tensorflow/tfjs-node'

export function createDQN(inputShape, numActions) {
  const model = tf.sequential()

  model.add(
    tf.layers.dense({ units: 64, activation: 'relu', inputShape: [inputShape] })
  )
  model.add(tf.layers.dense({ units: 64, activation: 'relu' }))
  model.add(tf.layers.dense({ units: numActions, activation: 'linear' }))

  model.compile({
    optimizer: tf.train.adam(),
    loss: 'meanSquaredError',
  })

  return model
}
