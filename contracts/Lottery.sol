// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Lottery {
    address public manager;
    address[] public players;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > .01 ether);
        players.push(msg.sender);
    }

     function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp, players)));
    }

}