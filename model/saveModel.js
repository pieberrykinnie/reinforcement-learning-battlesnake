import fs from 'fs'
import path from 'path'

export const saveModel = async (model) => {
  const modelDirPath = path.resolve('saved_model')

  // Ensure the directory exists
  if (!fs.existsSync(modelDirPath)) {
    fs.mkdirSync(modelDirPath, { recursive: true })
  }

  // Save the model using the constructed file path
  try {
    // Use the file:// protocol followed by the absolute path to the model file
    await model.save(`file://${modelDirPath}`)
    console.log(`Model saved to file://${modelDirPath}`)
  } catch (error) {
    console.error('Error saving the model:', error)
  }
}
