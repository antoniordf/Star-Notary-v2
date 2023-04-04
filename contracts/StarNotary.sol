// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {
    struct Star {
        string name;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {}

    function createStar(string memory _name, uint256 _tokenId) public {
        Star memory new_star = Star(_name);

        tokenIdToStarInfo[_tokenId] = new_star;

        _mint(msg.sender, _tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    // Function that allows you to convert an address into a payable address
    // function makePayable(address x) internal pure returns (address payable) {
    //     return payable(x);
    // }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");

        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value >= starCost, "You must pay at least offer price");

        _transfer(ownerAddress, msg.sender, _tokenId);
        address payable ownerAddressPayable = payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if (msg.value > starCost) {
            payable(msg.sender).transfer(msg.value - starCost);
        }
    }
}
