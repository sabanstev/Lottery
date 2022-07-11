const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lottery", function () {
  let acc1
  let acc2
  let lottery

  beforeEach(async function() {
    [acc1, acc2] = await ethers.getSigners()
    const Lottery = await ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy();
    await lottery.deployed();
  })

  it("Should be deployed", async function () {
    expect(lottery.address).to.be.properAddress
  });

  it("Should have 0 ether by default", async function() {
    const balance = await lottery.currentBalance();
    expect(balance).to.eq(0);
  })

  it("The winner is the one who transferred the money", async function () {  
    const tx = await acc1.sendTransaction({
      value: 1000000, 
      to: lottery.address
    });

    await tx.wait()

    const winer = await lottery.winer();
    console.log(winer);
    console.log(acc1.address);

    expect(winer).to.eq(acc1.address);
  });

  it("Little time", async function () {  
    const tx = await acc1.sendTransaction({
      value: 1000000, 
      to: lottery.address
    });

    await tx.wait()

    await expect(
      lottery
        .connect(acc1)
        .takeTheWinnings()
      ).to.be.revertedWith("Too little time has passed");
  });

  it("Not winer", async function () {  
    const tx = await acc1.sendTransaction({
      value: 1000000, 
      to: lottery.address
    });

    await tx.wait()

    await expect(
      lottery
        .connect(acc2)
        .takeTheWinnings()
      ).to.be.revertedWith("Address not winer");
  });

  it("Collect winnings after an hour", async function () {  
    const tx = await acc1.sendTransaction({
      value: 1000000, 
      to: lottery.address
    });

    await tx.wait()

    await ethers.provider.send("evm_increaseTime", [3600]);
    await ethers.provider.send("evm_mine", []);

    const tx1 = await lottery.connect(acc1).takeTheWinnings();
    await tx1.wait();
  });

});