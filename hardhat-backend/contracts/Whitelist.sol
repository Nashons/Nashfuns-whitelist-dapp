// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Whitelist {
    //max No of whitelisted address allowed
    uint8 public maxWhitelistedAddresses;

    //create a mapping of whitelistedaddresses
    //if an addrss is whitelisted, we would set it to true, it is false by default for other addresses
    mapping(address => bool) public whitelistedAddresses;

    //numAddressesWhitelisted would be used to keep track of how many addresses have been whitelisted
    uint8 public numAddressesWhitelisted;

    //constructor used to set the Max No of whitelisted Addresses, user will put the value at the time of deployment
    constructor(uint8 _maxWhitelistedAddresses) {
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    /**
    addAddressToWhitelist - This function adds the address of the sender to the whitelist
     */

     function addAddressToWhitelist() public {
        //check if the user has already been whitelisted
        require(!whitelistedAddresses[msg.sender], "Sender has already been whitelisted");

        //check if the numAddressesWhitelisted < maxWhiteListedAddress
        require(numAddressesWhitelisted < maxWhitelistedAddresses, "More addresses can't be added, limit reached");

        //Add the address which called the function to the whitelistedAddress mapping
        whitelistedAddresses[msg.sender] = true;

        //increase the number of whitelisted addresses
        numAddressesWhitelisted += 1;
     }
}