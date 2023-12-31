require("dotenv").config();

const HDWalletProvider = require("@truffle/hdwallet-provider");
const { Web3 } = require("web3"); // Use curly braces around Web3
const compile = require("./compile");

const provider = new HDWalletProvider({
  mnemonic: process.env.MNEMONIC,
  providerOrUrl: process.env.INFURA_API_URL, // Update to INFURA_API_URL
});

const web3 = new Web3(provider);

const deploy = async () => {
  try {
    // Get a list of all accounts
    const accounts = await web3.eth.getAccounts();

    console.log("Attempting to deploy from account " + accounts[0]);

    // Use one of those accounts to deploy
    const result = await new web3.eth.Contract(compile.Lottery.abi)
      .deploy({
        data: "0x" + compile.Lottery.evm.bytecode.object, // Add '0x' prefix
      })
      .send({ from: accounts[0], gas: "1000000" });

    console.log(`Contract deployed to ${result.options.address}`);
  } catch (error) {
    console.error("Error deploying contract:", error.message);
  }
};

deploy();
