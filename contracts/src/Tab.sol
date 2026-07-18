// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Tab
/// @notice A mutual, tamper-proof debt ledger. Anyone can log a debt, but it
///         only flips to Settled once BOTH the creditor and the debtor have
///         independently confirmed the payment — one side's word alone is
///         never enough to erase what's owed, or to falsely claim payment.
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
        bool creditorConfirmedPaid;
        bool debtorConfirmedPaid;
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
    event PaymentConfirmed(uint256 indexed id, address indexed party);
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
            status: uint8(Status.Pending),
            creditorConfirmedPaid: false,
            debtorConfirmedPaid: false
        });

        debtsByAddress[msg.sender].push(id);
        debtsByAddress[debtor].push(id);

        emit DebtCreated(id, msg.sender, debtor, amount, description);
    }

    /// @notice Confirm the debt has been paid. Requires both the debtor
    ///         ("I paid this") and the creditor ("I received it") to call
    ///         this independently before the debt flips to Settled.
    function settleDebt(uint256 id) external {
        Debt storage debt = debts[id];
        require(msg.sender == debt.creditor || msg.sender == debt.debtor, "not a party");
        require(debt.status == uint8(Status.Pending), "already settled");

        if (msg.sender == debt.creditor) {
            debt.creditorConfirmedPaid = true;
        } else {
            debt.debtorConfirmedPaid = true;
        }
        emit PaymentConfirmed(id, msg.sender);

        if (debt.creditorConfirmedPaid && debt.debtorConfirmedPaid) {
            debt.status = uint8(Status.Settled);
            emit DebtSettled(id);
        }
    }

    /// @notice Cancel a mistaken entry. Only the creditor can do this, and
    ///         only before either side has confirmed payment — once either
    ///         party has started confirming, the record can't be unilaterally
    ///         erased by the creditor.
    function deleteDebt(uint256 id) external {
        Debt storage debt = debts[id];
        require(msg.sender == debt.creditor, "only creditor can delete");
        require(debt.status == uint8(Status.Pending), "can only delete a pending debt");
        require(!debt.creditorConfirmedPaid && !debt.debtorConfirmedPaid, "payment already confirmed");

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
        returns (
            address creditor,
            address debtor,
            uint256 amount,
            string memory description,
            uint8 status,
            bool creditorConfirmedPaid,
            bool debtorConfirmedPaid
        )
    {
        Debt storage debt = debts[id];
        return (
            debt.creditor,
            debt.debtor,
            debt.amount,
            debt.description,
            debt.status,
            debt.creditorConfirmedPaid,
            debt.debtorConfirmedPaid
        );
    }

    function getDebtsFor(address who) external view returns (uint256[] memory) {
        return debtsByAddress[who];
    }
}
