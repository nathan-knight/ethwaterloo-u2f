pragma solidity ^0.4.2;

import "./ECMath.sol";

contract SimpleStorage {
    address owner;
    byte[256] keyHandle;
    uint256 qx;
    uint256 qy;


    string appId = "https://localhost:3000";

    event LogConfiguring();
    event LogSetCurveParams(uint256 qx, uint256 qy);
    event LogEValue(uint256 e);
    event LogSendingMoney(uint256 amount);
    event LogPublicKeyAndHandler(uint256 qx, uint256 qy, byte[256] keyHandle);

    function SimpleStorage() {
        owner = msg.sender;
    }

    function configure(uint256 qx_, uint256 qy_, byte[256] keyHandle_) external {
        require(msg.sender == owner);
        LogConfiguring();
        // require(msg.sender == owner);
        LogSetCurveParams(qx_, qy_);
        qx = qx_;
        qy = qy_;
        LogSetCurveParams(qx, qy);
        keyHandle = keyHandle_;
    }

    function sendMoney(address recipient, uint256 amount, uint32 counter, uint256 rr, uint256 ss, uint256 clientDataHash) external returns(bool) {
        require(msg.sender == owner);
        LogSendingMoney(amount);
        LogPublicKeyAndHandler(qx, qy, keyHandle);
        bytes32 appIdHash = sha256(appId);
        // Challenge must be validated against the recipient, amount, nonce.
        uint256 e = uint256(sha256(appIdHash, /* user presence byte */ uint8(1), counter, clientDataHash));
        LogEValue(e);
        require(ECMath.ecdsaverify(qx, qy, e, rr, ss));

        require(this.balance >= amount);

        recipient.transfer(amount);

        return true;
    }

    function getBalance() external constant returns(uint256) {
        return this.balance;
    }

    function () payable {}
}
