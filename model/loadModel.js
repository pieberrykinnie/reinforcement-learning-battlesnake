import * as tf from '@tensorflow/tfjs-node'
import path from 'path'
import { fileURLToPath } from 'url'
import { createDQN } from './createDQN.js'

export const loadModel = async (inputShape, numberOfActions) => {
  const dirname = path.dirname(fileURLToPath(import.meta.url))
  const modelFilePath = path.join(dirname, '..', 'saved_model', 'model.json')
  
  try {
    const model = await tf.loadLayersModel(`file://${modelFilePath}`)
    console.log(`Model loaded from file://${modelFilePath}`)
    model.compile({
      optimizer: tf.train.adam(),
      loss: 'meanSquaredError',
    })
    return model
  } catch (error) {
    console.error('Failed to load model:', error)
    // Create a new model if one doesn't exist
    return createDQN(inputShape, numberOfActions)
  }
}
