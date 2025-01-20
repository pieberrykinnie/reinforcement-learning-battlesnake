# Reinforcement Learning Battlesnake

[![Fly Deploy](https://github.com/pieberrykinnie/reinforcement-learning-battlesnake/actions/workflows/fly-deploy.yml/badge.svg)](https://github.com/pieberrykinnie/reinforcement-learning-battlesnake/actions/workflows/fly-deploy.yml)

A Battlesnake implementation using Deep Q-Networks (DQN) for reinforcement learning, enhanced with strategic heuristics. Created for the University of Manitoba .devClub Battlesnake Tournament 2023.

## Overview

This project implements a [Battlesnake](https://play.battlesnake.com) using a combination of reinforcement learning and strategic algorithms. The snake learns from its gameplay experiences while using helper algorithms to make informed decisions about food collection, collision avoidance, and board positioning.

### Core Features

- Deep Q-Network implementation using TensorFlow.js
- Experience replay for stable learning
- Automated model weight updates
- Strategic helper algorithms:
  - Collision prediction
  - Food prioritization
  - Edge avoidance
- Continuous training capability

## Technical Architecture

### Model Structure

- Input Layer: 125 neurons (11x11 board state + direction vector)
- Hidden Layers: 2 layers of 64 neurons each with ReLU activation
- Output Layer: 4 neurons (up, right, down, left) with linear activation

### Key Components

- [`model/calculateReward.js`](model/calculateReward.js): Reward computation (+10 for food, -1 near borders)
- [`model/convertGameStateToTensor.js`](model/convertGameStateToTensor.js): Game state to tensor conversion
- [`model/createDQN.js`](model/createDQN.js): Neural network architecture
- [`model/loadModel.js`](model/loadModel.js): Model loading and initialization
- [`model/replayBuffer.js`](model/replayBuffer.js): Experience replay implementation
- [`model/saveModel.js`](model/saveModel.js): Model persistence
- [`model/trainModel.js`](model/trainModel.js): Q-learning training loop

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm package manager

### Installation

1. Clone the repository:

```sh
git clone https://github.com/pieberrykinnie/reinforcement-learning-battlesnake.git
cd reinforcement-learning-battlesnake
```

1. Install dependencies:

```sh
npm install
```

1. Start the server:

```sh
npm start
```

The snake will be available at `http://localhost:3000`.

### Running Locally

Use the Battlesnake CLI to test locally:

```sh
battlesnake play -W 11 -H 11 --name YourSnakeName --url http://localhost:3000 -g solo -v
```

## Deployment

This project is configured for deployment on [Fly.io](https://fly.io). The GitHub Actions workflow automatically deploys changes to the main branch.

## Contributors

- Peter Vu - Project Lead & Algorithm Implementation
- Miah Tayen - TensorFlow Implementation Lead

## Acknowledgments

- University of Manitoba .devClub for organizing the Battlesnake tournament
- [Battlesnake](https://play.battlesnake.com) for providing the game platform

## Project Status

The snake achieved second place in the Beginners' Bracket of .devClub's Battlesnake Tournament 2023. Development continues with focus on improving the learning algorithm and CI/CD pipepline.
