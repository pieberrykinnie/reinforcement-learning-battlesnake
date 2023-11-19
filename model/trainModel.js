import * as tf from '@tensorflow/tfjs-node'

export const trainModel = async (
  model,
  replayBuffer,
  batchSize,
  gamma,
  numberOfActions,
  inputShape
) => {
  // Check if the buffer is large enough for a training batch
  if (replayBuffer.size() < batchSize) {
    console.log(
      `Not enough experiences in buffer to train. Size ${replayBuffer.size()}`
    )
    return // Not enough experiences to train on yet
  }

  // Sample a batch of experiences from the buffer
  const batch = replayBuffer.sample(batchSize)

  // Prepare the inputs and targets for training
  const inputs = []
  const targets = []

  for (const experience of batch) {
    const { state, action, reward, nextState, done } = experience
    if (state.size !== inputShape || (nextState && nextState.size !== inputShape)) {
      console.error('State or nextState does not have the correct number of elements.');
      return;
    }
    // Predict Q-values for the current state
    const currentQs = model.predict(state).dataSync()

    // Predict Q-values for the next state and select the maximum
    const nextQs = done
      ? Array(numberOfActions).fill(0)
      : model.predict(nextState).dataSync()
    const maxNextQ = Math.max(...nextQs)

    // Update the Q-value for the action taken with the reward and discounted next max Q-value
    currentQs[action] = reward + gamma * maxNextQ

    // Add to training inputs and targets
    inputs.push(state.flatten().arraySync()) // Flatten the tensor to 1D array
    targets.push(currentQs)
  }

  // Convert the arrays of inputs and targets into tensors
  const inputTensor = tf.tensor2d(inputs, [batchSize, inputShape])
  const targetTensor = tf.tensor2d(targets, [batchSize, numberOfActions])

  // Perform a training step
  await model.fit(inputTensor, targetTensor, { epochs: 1 })

  // Dispose tensors to free memory
  inputTensor.dispose()
  targetTensor.dispose()
  console.log('Model trained successfully')
}
