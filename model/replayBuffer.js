export class ReplayBuffer {
  constructor(capacity) {
    this.capacity = capacity
    this.buffer = []
    this.position = 0
  }

  push(state, action, reward, nextState, done) {
    if (this.buffer.length < this.capacity) {
      this.buffer.push(null)
    }
    this.buffer[this.position] = { state, action, reward, nextState, done }
    this.position = (this.position + 1) % this.capacity // Replace the oldest experience
  }

  sample(batchSize) {
    const minSize = Math.min(this.buffer.length, batchSize)
    const sampleIndexes = new Set()
    while (sampleIndexes.size < minSize) {
      const index = Math.floor(Math.random() * this.buffer.length)
      sampleIndexes.add(index)
    }
    return Array.from(sampleIndexes).map((i) => this.buffer[i])
  }

  size() {
    return this.buffer.length
  }
}
