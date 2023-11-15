import path from 'path'
import * as tf from '@tensorflow/tfjs-node' 
import { fileURLToPath, pathToFileURL } from 'url'
import { createDQN } from './createDQN.js'

export const loadModel = async (inputShape, numberOfActions) => {
  const dirname = path.dirname(fileURLToPath(import.meta.url))
  const modelFilePath = path.join(dirname, '..', 'saved_model', 'model.json')
  const modelFileURL = pathToFileURL(modelFilePath).href
  try {
    const model = await tf.loadLayersModel(modelFileURL)
    console.log(`Model loaded from ${modelFileURL}`)
    return model
  } catch (error) {
    console.error('Failed to load or create model:', error)
    // Here you can decide whether to create a new model or throw an error
    // For example, to create a new model if one doesn't exist:
    return createDQN(inputShape, numberOfActions)
  }
}
