// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Lottery {
    address public manager;
    address payable[] public players;

    constructor() {
        manager = msg.sender;
    }

     function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp, players)));
    }

    function addPlayer(address payable newPlayer) public payable {
        require(msg.value >= 0.01 ether, "Insufficient fund");
        players.push(newPlayer);
    }

    function pickWinner() public restricted {
        require(players.length > 0, "No players to pick a winner");
        

        uint index = random() % players.length;
        address payable winner = players[index];
        winner.transfer(address(this).balance);
        
        // Optionally, reset the players array after picking a winner
        players = new address payable[](0);
    }

    modifier restricted() {
        require(msg.sender == manager, "You are not the manager of the contract");
        _;
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }
}
