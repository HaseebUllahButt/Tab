// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Tab
/// @notice A mutual debt ledger where settlement is a real, trustless MON
///         transfer: the debtor pays the creditor directly through the
///         contract, and that transfer itself is what marks the debt
///         Settled — there's no separate "I confirm I got paid" step,
///         because the chain already proves the money moved.
contract Tab {
    enum Status {
        Pending,
        Settled
    }

    struct Debt {
        address creditor;
        address debtor;
        uint256 amount;
        string description;
        uint8 status;
    }

    uint256 private nextId;
    mapping(uint256 => Debt) private debts;
    mapping(address => uint256[]) private debtsByAddress;

    event DebtCreated(
        uint256 indexed id,
        address indexed creditor,
        address indexed debtor,
        uint256 amount,
        string description
    );
    event DebtSettled(uint256 indexed id);
    event DebtDeleted(uint256 indexed id, address indexed creditor);

    function createDebt(address debtor, uint256 amount, string calldata description)
        external
        returns (uint256 id)
    {
        require(debtor != msg.sender, "creditor cannot be debtor");
        require(debtor != address(0), "invalid debtor");
        require(amount != 0, "amount must be positive");

        id = nextId++;
        debts[id] = Debt({
            creditor: msg.sender,
            debtor: debtor,
            amount: amount,
            description: description,
            status: uint8(Status.Pending)
        });

        debtsByAddress[msg.sender].push(id);
        debtsByAddress[debtor].push(id);

        emit DebtCreated(id, msg.sender, debtor, amount, description);
    }

    /// @notice Pay off a debt. Only the debtor can call this, and must send
    ///         exactly the owed amount in MON — the contract forwards it
    ///         straight to the creditor in the same transaction. The debt
    ///         flips to Settled immediately; there's nothing left for the
    ///         creditor to separately confirm, since they just received the
    ///         funds on-chain.
    function payDebt(uint256 id) external payable {
        Debt storage debt = debts[id];
        require(msg.sender == debt.debtor, "only debtor can pay");
        require(debt.status == uint8(Status.Pending), "already settled");
        require(msg.value == debt.amount, "must send exact amount owed");

        // Effects before interaction: the debt is Settled before the
        // external transfer, so the creditor can't reenter payDebt (or
        // anything else) mid-call and observe a still-Pending debt.
        debt.status = uint8(Status.Settled);
        emit DebtSettled(id);

        (bool ok,) = payable(debt.creditor).call{value: msg.value}("");
        require(ok, "transfer to creditor failed");
    }

    /// @notice Cancel a mistaken entry. Only the creditor can do this, and
    ///         only before it's been paid — once paid, the transfer already
    ///         happened and the record can't be unilaterally erased.
    function deleteDebt(uint256 id) external {
        Debt storage debt = debts[id];
        require(msg.sender == debt.creditor, "only creditor can delete");
        require(debt.status == uint8(Status.Pending), "can only delete a pending debt");

        address debtor = debt.debtor;
        delete debts[id];
        _removeId(msg.sender, id);
        _removeId(debtor, id);

        emit DebtDeleted(id, msg.sender);
    }

    function _removeId(address who, uint256 id) private {
        uint256[] storage ids = debtsByAddress[who];
        uint256 len = ids.length;
        for (uint256 i = 0; i < len; i++) {
            if (ids[i] == id) {
                ids[i] = ids[len - 1];
                ids.pop();
                break;
            }
        }
    }

    function getDebt(uint256 id)
        external
        view
        returns (address creditor, address debtor, uint256 amount, string memory description, uint8 status)
    {
        Debt storage debt = debts[id];
        return (debt.creditor, debt.debtor, debt.amount, debt.description, debt.status);
    }

    function getDebtsFor(address who) external view returns (uint256[] memory) {
        return debtsByAddress[who];
    }
}
