// import "babel-polyfill";

const StarNotary = artifacts.require("StarNotary.sol");

let accounts;
let owner;

contract("StarNotary", async (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it("Can create a star", async () => {
  let tokenId = 1;
  let instance = await StarNotary.deployed();
  await instance.createStar("Gita", tokenId, { from: accounts[0] });
  let star = await instance.tokenIdToStarInfo.call(tokenId);
  assert.equal(star, "Gita");
});

it("Lets user 1 put their star for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 2;
  let starPrice = web3.utils.toWei("0.01", "ether");
  await instance.createStar("Gita", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let starSale = await instance.starsForSale.call(starId);
  assert.equal(starSale, starPrice);
});

it("Let's user1 get the funds after the sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei("0.01", "ether");
  let balance = web3.utils.toWei("0.05", "ether");
  // user1 creates a star and puts it for sale
  await instance.createStar("Gita", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it("Lets user2 buy a star if it is put up for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei("0.01", "ether");
  let balance = web3.utils.toWei("0.05", "ether");
  await instance.createStar("Gita", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance });
  let newOwner = await instance.ownerOf.call(starId);
  assert.equal(newOwner, user2);
});

it("Lets user2 buy a star and decreases his balance", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei("0.01", "ether");
  let balance = web3.utils.toWei("0.05", "ether");
  await instance.createStar("Gita", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser2AfterTransaction = await web3.eth.getBalance(user2);
  let value =
    Number(balanceOfUser2BeforeTransaction) -
    Number(balanceOfUser2AfterTransaction);
  assert(value >= starPrice);
});
