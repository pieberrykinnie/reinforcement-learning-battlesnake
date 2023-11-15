import * as tf from '@tensorflow/tfjs-node' // Ensure you are using tfjs-node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export const saveModel = async (model) => {
  // Define the directory where the model will be saved
  const modelDirPath = path.resolve('saved_model')

  // Ensure the directory exists
  if (!fs.existsSync(modelDirPath)) {
    fs.mkdirSync(modelDirPath, { recursive: true })
  }

  // Define the full file path for the model
  const modelFilePath = `file://${modelDirPath}/model.json` // Correctly formatted file URL

  // Save the model using the constructed file path
  try {
    await model.save(modelFilePath)
    console.log(`Model saved to ${modelFilePath}`)
  } catch (error) {
    console.error('Error saving the model:', error)
  }
}
