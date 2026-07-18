// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Tab} from "../src/Tab.sol";

contract TabTest is Test {
    Tab tab;

    address creditor = makeAddr("creditor");
    address debtor = makeAddr("debtor");
    address stranger = makeAddr("stranger");

    function setUp() public {
        tab = new Tab();
    }

    function _createDebt() internal returns (uint256 id) {
        vm.prank(creditor);
        id = tab.createDebt(debtor, 100, "pizza");
    }

    function test_HappyPath_CreateAndSettle() public {
        uint256 id = _createDebt();

        (
            address c,
            address d,
            uint256 amount,
            string memory description,
            uint8 status,
            bool cPaid,
            bool dPaid
        ) = tab.getDebt(id);

        assertEq(c, creditor);
        assertEq(d, debtor);
        assertEq(amount, 100);
        assertEq(description, "pizza");
        assertEq(status, uint8(Tab.Status.Pending));
        assertFalse(cPaid);
        assertFalse(dPaid);

        vm.prank(debtor);
        tab.settleDebt(id);
        (,,,, status,,) = tab.getDebt(id);
        assertEq(status, uint8(Tab.Status.Pending));

        vm.prank(creditor);
        tab.settleDebt(id);
        (,,,, status,,) = tab.getDebt(id);
        assertEq(status, uint8(Tab.Status.Settled));
    }

    function test_OnlyNamedPartiesCanSettle() public {
        uint256 id = _createDebt();

        vm.prank(stranger);
        vm.expectRevert("not a party");
        tab.settleDebt(id);
    }

    function test_CannotSettleUntilBothConfirm() public {
        uint256 id = _createDebt();

        vm.prank(debtor);
        tab.settleDebt(id);
        (,,,, uint8 status,, bool dPaid) = tab.getDebt(id);
        assertEq(status, uint8(Tab.Status.Pending));
        assertTrue(dPaid);

        vm.prank(creditor);
        tab.settleDebt(id);
        (,,,, status,,) = tab.getDebt(id);
        assertEq(status, uint8(Tab.Status.Settled));
    }

    function test_CannotSettleTwiceOnceSettled() public {
        uint256 id = _createDebt();

        vm.prank(debtor);
        tab.settleDebt(id);
        vm.prank(creditor);
        tab.settleDebt(id);

        vm.prank(debtor);
        vm.expectRevert("already settled");
        tab.settleDebt(id);
    }

    function test_CannotCreateDebtAgainstSelf() public {
        vm.prank(creditor);
        vm.expectRevert("creditor cannot be debtor");
        tab.createDebt(creditor, 100, "self");
    }

    function test_CannotCreateDebtWithZeroDebtor() public {
        vm.prank(creditor);
        vm.expectRevert("invalid debtor");
        tab.createDebt(address(0), 100, "ghost");
    }

    function test_CannotCreateDebtWithZeroAmount() public {
        vm.prank(creditor);
        vm.expectRevert("amount must be positive");
        tab.createDebt(debtor, 0, "free");
    }

    function test_CreditorCanDeletePendingDebt() public {
        uint256 id = _createDebt();

        vm.prank(creditor);
        tab.deleteDebt(id);

        (address c,,,,,,) = tab.getDebt(id);
        assertEq(c, address(0));

        assertEq(tab.getDebtsFor(creditor).length, 0);
        assertEq(tab.getDebtsFor(debtor).length, 0);
    }

    function test_OnlyCreditorCanDelete() public {
        uint256 id = _createDebt();

        vm.prank(debtor);
        vm.expectRevert("only creditor can delete");
        tab.deleteDebt(id);

        vm.prank(stranger);
        vm.expectRevert("only creditor can delete");
        tab.deleteDebt(id);
    }

    function test_CannotDeleteOnceEitherPartyConfirmedPayment() public {
        uint256 id = _createDebt();

        vm.prank(debtor);
        tab.settleDebt(id);

        vm.prank(creditor);
        vm.expectRevert("payment already confirmed");
        tab.deleteDebt(id);
    }

    function test_DeleteOnlyRemovesTargetDebtFromLists() public {
        uint256 id0 = _createDebt();
        vm.prank(creditor);
        uint256 id1 = tab.createDebt(debtor, 50, "coffee");

        vm.prank(creditor);
        tab.deleteDebt(id0);

        uint256[] memory creditorDebts = tab.getDebtsFor(creditor);
        uint256[] memory debtorDebts = tab.getDebtsFor(debtor);

        assertEq(creditorDebts.length, 1);
        assertEq(creditorDebts[0], id1);
        assertEq(debtorDebts.length, 1);
        assertEq(debtorDebts[0], id1);
    }

    function test_GetDebtsForReturnsIdsForBothParties() public {
        uint256 id0 = _createDebt();

        vm.prank(creditor);
        uint256 id1 = tab.createDebt(debtor, 50, "coffee");

        uint256[] memory creditorDebts = tab.getDebtsFor(creditor);
        uint256[] memory debtorDebts = tab.getDebtsFor(debtor);

        assertEq(creditorDebts.length, 2);
        assertEq(creditorDebts[0], id0);
        assertEq(creditorDebts[1], id1);

        assertEq(debtorDebts.length, 2);
        assertEq(debtorDebts[0], id0);
        assertEq(debtorDebts[1], id1);

        assertEq(tab.getDebtsFor(stranger).length, 0);
    }
}
