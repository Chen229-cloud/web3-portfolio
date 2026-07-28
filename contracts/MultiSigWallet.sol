// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract MultiSigWallet {
    address[] public owners;
    uint256 public required;
    uint256 public transactionCount;

    mapping(address => bool) public isOwner;
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;

    struct Transaction {
        address destination;
        uint256 value;
        bytes data;
        bool executed;
    }

    event Deposit(address indexed sender, uint256 value);
    event Submission(uint256 indexed txId);
    event Confirmation(address indexed sender, uint256 indexed txId);
    event Revocation(address indexed sender, uint256 indexed txId);
    event Execution(uint256 indexed txId);
    event ExecutionFailure(uint256 indexed txId);

    modifier onlyWallet() {
        require(msg.sender == address(this), "Only wallet");
        _;
    }

    modifier ownerExists(address owner) {
        require(isOwner[owner], "Not an owner");
        _;
    }

    modifier txExists(uint256 txId) {
        require(txId < transactionCount, "Tx does not exist");
        _;
    }

    modifier notExecuted(uint256 txId) {
        require(!transactions[txId].executed, "Tx already executed");
        _;
    }

    modifier notConfirmed(uint256 txId, address owner) {
        require(!confirmations[txId][owner], "Tx already confirmed");
        _;
    }

    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length > 0, "Need owners");
        require(_required > 0 && _required <= _owners.length, "Invalid required");

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Duplicate owner");
            isOwner[owner] = true;
            owners.push(owner);
        }
        required = _required;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function submitTransaction(address destination, uint256 value, bytes memory data)
        public ownerExists(msg.sender) returns (uint256)
    {
        uint256 txId = transactionCount;
        transactions[txId] = Transaction({
            destination: destination,
            value: value,
            data: data,
            executed: false
        });
        transactionCount++;
        emit Submission(txId);
        return txId;
    }

    function confirmTransaction(uint256 txId)
        public ownerExists(msg.sender) txExists(txId) notExecuted(txId) notConfirmed(txId, msg.sender)
    {
        confirmations[txId][msg.sender] = true;
        emit Confirmation(msg.sender, txId);
        if (isConfirmed(txId)) {
            executeTransaction(txId);
        }
    }

    function revokeConfirmation(uint256 txId)
        public ownerExists(msg.sender) txExists(txId) notExecuted(txId)
    {
        require(confirmations[txId][msg.sender], "Tx not confirmed");
        confirmations[txId][msg.sender] = false;
        emit Revocation(msg.sender, txId);
    }

    function executeTransaction(uint256 txId)
        public ownerExists(msg.sender) txExists(txId) notExecuted(txId)
    {
        require(isConfirmed(txId), "Not enough confirmations");

        Transaction storage txn = transactions[txId];
        txn.executed = true;

        (bool success, ) = txn.destination.call{value: txn.value}(txn.data);
        if (success) {
            emit Execution(txId);
        } else {
            emit ExecutionFailure(txId);
            txn.executed = false;
        }
    }

    function isConfirmed(uint256 txId) public view txExists(txId) returns (bool) {
        uint256 count = 0;
        for (uint256 i = 0; i < owners.length; i++) {
            if (confirmations[txId][owners[i]]) {
                count++;
            }
            if (count == required) {
                return true;
            }
        }
        return false;
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getConfirmations(uint256 txId) public view txExists(txId) returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < owners.length; i++) {
            if (confirmations[txId][owners[i]]) {
                count++;
            }
        }
        address[] memory result = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < owners.length; i++) {
            if (confirmations[txId][owners[i]]) {
                result[idx] = owners[i];
                idx++;
            }
        }
        return result;
    }
}