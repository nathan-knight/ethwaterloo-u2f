var ECMath = artifacts.require("./ECMath.sol");
var SimpleStorage = artifacts.require("./SimpleStorage.sol");

module.exports = function(deployer) {
  deployer.deploy(ECMath);
  deployer.link(ECMath, SimpleStorage);
  deployer.deploy(SimpleStorage);
};
