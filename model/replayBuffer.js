// replayBuffer.js
class ReplayBuffer {
  constructor(capacity) {
      this.capacity = capacity;
      this.buffer = [];
      this.position = 0;
  }

  push(state, action, reward, nextState, done) {
      if (this.buffer.length < this.capacity) {
          this.buffer.push(null);
      }
      this.buffer[this.position] = { state, action, reward, nextState, done };
      this.position = (this.position + 1) % this.capacity;
  }

  sample(batchSize) {
      let batch = [];
      for (let i = 0; i < batchSize; i++) {
          batch.push(this.buffer[Math.floor(Math.random() * this.buffer.length)]);
      }
      return batch;
  }

  size() {
      return this.buffer.length;
  }
}

module.exports = ReplayBuffer;
