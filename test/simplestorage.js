var SimpleStorage = artifacts.require("./SimpleStorage.sol");

contract('SimpleStorage', function(accounts) {

  it("test", function() {
    return SimpleStorage.deployed().then(function(instance) {
      simpleStorageInstance = instance;
      var qx = [102, 154, 53, 254, 0, 133, 10, 102, 203, 120, 185, 251, 222, 183, 143, 224, 7, 204, 161, 99, 177, 112, 44, 29, 121, 2, 123, 247, 133, 91, 143, 242];
      var qy = [10, 215, 73, 47, 231, 215, 66, 169, 95, 240, 72, 160, 106, 115, 200, 181, 179, 33, 66, 82, 221, 194, 201, 120, 179, 0, 204, 224, 234, 226, 151, 152];
      return simpleStorageInstance.get(web3.toBigNumber('0xfc9e0eefe9f3a5101b7c025b217c03c95dbf9bb4f2d1d46db238e305af104103'), {from: accounts[0]});
    })
  });

});
