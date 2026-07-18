// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {Tab} from "../src/Tab.sol";

contract Deploy is Script {
    function run() external returns (Tab tab) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);
        tab = new Tab();
        vm.stopBroadcast();
    }
}
