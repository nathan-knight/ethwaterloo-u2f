pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/SimpleStorage.sol";

contract TestSimpleStorage {

  function testECDSA() {
    uint256 qx = 0x1E38E7239650146093E0929763BCF7DCB817E527A229414C61473E586A48B2BC;
    uint256 qy = 0x8623F069AEC3A499A34F6CBAD6BAC2D44E7EA5B2952B4EEBCD761DF50FEEF4C1;
    uint256 r = 0xf1e5cf676765742cd2e650aced4ad95a5534f104a54cc84f4b644b054124c3c9;
    uint256 s = 0xeed35622cd58550fb304d1c22f6190a72712c926381efa9896aea104125306bc;
    uint256 e = 0x413853971ab5bdc8e90977dc6852fa23685314c64a22de6aa99e4f2e87f86895;
    require(ECMath.ecdsaverify(qx, qy, e, r, s));
  }

  function testSend() {
    SimpleStorage simpleStorage = SimpleStorage(DeployedAddresses.SimpleStorage());
    byte[256] memory keyHandle;
    uint256 qx = 0x1E38E7239650146093E0929763BCF7DCB817E527A229414C61473E586A48B2BC;
    uint256 qy = 0x8623F069AEC3A499A34F6CBAD6BAC2D44E7EA5B2952B4EEBCD761DF50FEEF4C1;
    uint256 r = 0xf1e5cf676765742cd2e650aced4ad95a5534f104a54cc84f4b644b054124c3c9;
    uint256 s = 0xeed35622cd58550fb304d1c22f6190a72712c926381efa9896aea104125306bc;
    // sha256(8BE7C631CA29D5B3A1AC8AAB420C3C69905BAC094D084205D04F726C6B465E39
    //  01
    //  00000032
    //  5487B527A796B308407610B148A81AF2E7A4D51494F739124AD0EC12B53E5324)
    uint256 e = 0x413853971ab5bdc8e90977dc6852fa23685314c64a22de6aa99e4f2e87f86895;
    uint256 clientDataHash = 0x5487B527A796B308407610B148A81AF2E7A4D51494F739124AD0EC12B53E5324;
    simpleStorage.configure(bytes32(qx), bytes32(qy), keyHandle);
    require(simpleStorage.sendMoney(0x0000000000000000, 1, 0x00000032, bytes32(r), bytes32(s), bytes32(clientDataHash)));
  }
}
