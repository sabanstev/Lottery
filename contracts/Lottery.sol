// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// Deploy and Verify in Ropsten with address 0x699355d5ad4b3b1bab7327d98504f8691dd9da9a
/// @title Lottery
/// @author Sabantsev Aleksandr @sabantsev92 
/// @notice The last bettor can take the winnings 90% if there is no other bet within an hour
contract Lottery is ReentrancyGuard {
    address public winer;
    uint256 public timestamp;
    uint256 constant TIME_TO_WIN = 1 hours;

    /// @notice Triggered when winnings are withdrawn
    /// @param winner The address of the winner
    /// @param amount The win size
    event Win(address indexed winner, uint amount);
    /// @notice Triggered when the bet was placed
    /// @param player The address of the player who placed the bet
    /// @param amount The bet size
    event Bet(address indexed player, uint amount);

    /// @notice Accepting a bet. The rate must be at least one percent of the available amount
    receive() external payable {
        require(msg.value >= (address(this).balance / 100) && msg.value >= 1, "Too little money");
        timestamp = block.timestamp;
        winer = msg.sender;
        emit Bet(msg.sender, msg.value);
    }

    /// @notice You can take the winnings if you win
    function takeTheWinnings() external nonReentrant() {
        require(msg.sender == winer, "Address not winer");
        require(block.timestamp >= timestamp + TIME_TO_WIN, "Too little time has passed");
        bool check = payable(msg.sender).send((address(this).balance * 9) / 10);
        require(check, "Error");
        winer = address(0x0);
        emit Win(msg.sender, (address(this).balance * 9) / 10);
    }

    /// @notice Shows how much money is currently on the contract
    /// @return Returns how much money is currently on the contract
    function currentBalance() public view returns(uint) {
        return address(this).balance;
    }

}