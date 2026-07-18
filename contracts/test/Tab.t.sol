// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Tab} from "../src/Tab.sol";

contract TabTest is Test {
    Tab tab;

    address creditor = makeAddr("creditor");
    address debtor = makeAddr("debtor");
    address stranger = makeAddr("stranger");

    uint256 constant AMOUNT = 1 ether;

    function setUp() public {
        tab = new Tab();
        vm.deal(debtor, 10 ether);
        vm.deal(stranger, 10 ether);
    }

    function _createDebt() internal returns (uint256 id) {
        vm.prank(creditor);
        id = tab.createDebt(debtor, AMOUNT, "pizza");
    }

    function test_HappyPath_CreateAndPay() public {
        uint256 id = _createDebt();

        (address c, address d, uint256 amount, string memory description, uint8 status) = tab.getDebt(id);
        assertEq(c, creditor);
        assertEq(d, debtor);
        assertEq(amount, AMOUNT);
        assertEq(description, "pizza");
        assertEq(status, uint8(Tab.Status.Pending));

        uint256 creditorBalanceBefore = creditor.balance;

        vm.prank(debtor);
        tab.payDebt{value: AMOUNT}(id);

        (,,,, status) = tab.getDebt(id);
        assertEq(status, uint8(Tab.Status.Settled));
        assertEq(creditor.balance, creditorBalanceBefore + AMOUNT);
    }

    function test_OnlyDebtorCanPay() public {
        uint256 id = _createDebt();

        vm.prank(stranger);
        vm.expectRevert("only debtor can pay");
        tab.payDebt{value: AMOUNT}(id);

        vm.prank(creditor);
        vm.deal(creditor, AMOUNT);
        vm.expectRevert("only debtor can pay");
        tab.payDebt{value: AMOUNT}(id);
    }

    function test_MustSendExactAmount() public {
        uint256 id = _createDebt();

        vm.prank(debtor);
        vm.expectRevert("must send exact amount owed");
        tab.payDebt{value: AMOUNT - 1}(id);

        vm.prank(debtor);
        vm.expectRevert("must send exact amount owed");
        tab.payDebt{value: AMOUNT + 1}(id);
    }

    function test_CannotPayTwice() public {
        uint256 id = _createDebt();

        vm.prank(debtor);
        tab.payDebt{value: AMOUNT}(id);

        vm.prank(debtor);
        vm.expectRevert("already settled");
        tab.payDebt{value: AMOUNT}(id);
    }

    function test_CannotCreateDebtAgainstSelf() public {
        vm.prank(creditor);
        vm.expectRevert("creditor cannot be debtor");
        tab.createDebt(creditor, AMOUNT, "self");
    }

    function test_CannotCreateDebtWithZeroDebtor() public {
        vm.prank(creditor);
        vm.expectRevert("invalid debtor");
        tab.createDebt(address(0), AMOUNT, "ghost");
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

        (address c,,,,) = tab.getDebt(id);
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

    function test_CannotDeleteOncePaid() public {
        uint256 id = _createDebt();

        vm.prank(debtor);
        tab.payDebt{value: AMOUNT}(id);

        vm.prank(creditor);
        vm.expectRevert("can only delete a pending debt");
        tab.deleteDebt(id);
    }

    function test_DeleteOnlyRemovesTargetDebtFromLists() public {
        uint256 id0 = _createDebt();
        vm.prank(creditor);
        uint256 id1 = tab.createDebt(debtor, AMOUNT, "coffee");

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
        uint256 id1 = tab.createDebt(debtor, AMOUNT, "coffee");

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
