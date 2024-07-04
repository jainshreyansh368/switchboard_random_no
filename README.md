# Anchor Solana Smart Contract for Random Number Generation

This repository hosts a Solana smart contract developed with the Anchor framework. The contract integrates with the Switchboard "on-demand" service to generate random numbers. Below are detailed instructions for setting up the project environment, building the contract, deploying it, and running tests.

## Prerequisites

Ensure you have the following tools installed before proceeding:

- [Node.js](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/tools/install)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor](https://project-serum.github.io/anchor/getting-started/installation.html)

## Project Setup

### Clone the Repository

Clone this repository to your local machine and change into the project directory:

```bash
git clone https://github.com/your-repository-url.git
cd your-repository-name
```

### Install Dependencies

```bash
yarn install
```
### Configure Solana CLI
Set the Solana CLI to use the devnet cluster:

```bash
solana config set --url devnet
```
### Building the Contract
Build the smart contract using Anchor:

```bash
anchor build
```
Note: Ensure your wallet is configured properly as it's required for deployment transaction fees.

### Deploying the Contract
Deploy your contract to the Solana devnet with the following command:

```bash
anchor deploy
```
This will compile and deploy the contract to the network, outputting the program ID. Keep the program ID noted for future interactions with your deployed contract.

## Running Tests
Execute the included tests with:

```bash
anchor test --skip-deploy
```
The tests are located in tests/switchboard_random_no.ts. These tests interact with our contract to generate and retrieve a random number using the Switchboard "on-demand" service. The random number is printed from the transaction logs of our smart contract.

Important Notes
Running tests will call the smart contract on devnet, which may incur transaction fees.
The output includes transaction logs showcasing the generation and retrieval of the random number.
Thank you for using or contributing to this project!