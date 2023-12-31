const assert = require("assert");
const ganache = require("ganache-cli");
const { Web3 } = require("web3");

const compile = require("../compile");

const web3 = new Web3(ganache.provider());

let accounts;
let lottery;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(compile.Lottery.abi)
    .deploy({
      data: compile.Lottery.evm.bytecode.object,
    })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("allows one account to enter", async () => {
    await lottery.methods
      .addPlayer("0x27Aca650D392216294662165D291eBF9DD9619EB")
      .send({ from: accounts[0], value: web3.utils.toWei("0.02", "ether") });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it("allows multiples accounts to enter", async () => {
    await lottery.methods
      .addPlayer("0x27Aca650D392216294662165D291eBF9DD9619EB")
      .send({ from: accounts[0], value: web3.utils.toWei("0.02", "ether") });

    await lottery.methods
      .addPlayer("0x27Aca650D392216294662165D291eBF9DD9619EB")
      .send({ from: accounts[1], value: web3.utils.toWei("0.02", "ether") });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(2, players.length);
  });

  it("requires a minimum amount of ether to enter", async () => {
    try {
      await lottery.methods
        .addPlayer("0x27Aca650D392216294662165D291eBF9DD9619EB")
        .send({ from: accounts[0], value: 0 });

      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("only manager can call pick winner", async () => {
    try {
      await lottery.methods.pickWinner().send({ from: accounts[1], value: 0 });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("sends money to the winner and reset the players array", async () => {
    await lottery.methods
      .addPlayer("0x27Aca650D392216294662165D291eBF9DD9619EB")
      .send({ from: accounts[0], value: web3.utils.toWei("2", "ether") });

    const initialBalance = await web3.eth.getBalance(accounts[0]);

    await lottery.methods.pickWinner().send({ from: accounts[0] });

    const finalBalance = await web3.eth.getBalance(accounts[0]);

    const difference = finalBalance - initialBalance;

    assert(difference > web3.utils.toWei("1.8", "ether"));
  });
});
