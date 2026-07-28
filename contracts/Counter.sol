// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Counter {
    uint256 private _count;

    event CountChanged(uint256 newCount, address indexed changedBy);

    function count() public view returns (uint256) {
        return _count;
    }

    function increment() public {
        _count += 1;
        emit CountChanged(_count, msg.sender);
    }

    function decrement() public {
        require(_count > 0, "Counter: underflow");
        _count -= 1;
        emit CountChanged(_count, msg.sender);
    }

    function reset() public {
        _count = 0;
        emit CountChanged(_count, msg.sender);
    }
}