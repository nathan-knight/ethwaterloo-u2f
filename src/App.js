import './App.css'
import './css/open-sans.css'
import './css/oswald.css'
import './css/pure-min.css'

import { Button, Snackbar, TextField } from 'material-ui';
import API from 'u2f-api'
import React, { Component } from 'react'
import BigNumber from 'bignumber.js'

import crypto from 'crypto';

import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import getWeb3 from './utils/getWeb3'

import asnLen from './utils/asn.js'

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            storageValue: 0,
            web3: null,
            publicKey: 'BMhAo0KdeHnMwjrdUdfgNM8N5SlcIaPIQ01Dh7xDb_4lF_h1NpYq65GwUGAJ7nQBAwAwUV226ORPHrZPw4XJxMQ',
            keyHandle: 'mOMLmiFdj-GJaBemL8FGKZcHj0l2jLl7ZyzjNbw_RzqvXXhpnOl96iTZTfrpbwlvtijvLsxfLIpjwrl020Od-w', //'mOMLmiFdj+GJaBemL8FGKZcHj0l2jLl7ZyzjNbw/RzqvXXhpnOl96iTZTfrpbwlvtijvLsxfLIpjwrl020Od+w=='
            contract: null,

            accountAddress: null,
            accountTotal: 0,
            isRegistered: false,
            accountReceiver: '',
            amountTransfer: 0,
            messageByteCode: '',
            successMessage: false
        };
        this.configureContract.bind(this);
    }

    componentWillMount() {
        // Get network provider and web3 instance.
        // See utils/getWeb3 for more info.
        API.isSupported().then(function(result) {
            console.log("isSupported?: " + result);
        });
        getWeb3
            .then(results => {
                this.setState({
                    web3: results.web3
                });

                // Instantiate contract once web3 provided.
                this.instantiateContract();
            })
            .catch(() => {
                console.log('Error finding web3.')
            });
    }

    instantiateContract() {

        const contract = require('truffle-contract');
        const simpleStorage = contract(SimpleStorageContract);
        simpleStorage.setProvider(this.state.web3.currentProvider);

        this.setState({ contract: simpleStorage });
        this.updateBalance();
        /*// Declaring this for later so we can chain functions on SimpleStorage.
        var simpleStorageInstance;

        // Get accounts.
        this.state.web3.eth.getAccounts((error, accounts) => {
            simpleStorage.deployed().then((instance) => {
                simpleStorageInstance = instance;

                // Stores a given value, 5 by default.
                return simpleStorageInstance.configure()
            }).then((result) => {
                // Get the value from the contract to prove it worked.
                return simpleStorageInstance.get.call(accounts[0])
            }).then((result) => {
                // Update state with the result.
                return this.setState({ storageValue: result.c[0] })
            })
        })*/
    }

    updateBalance() {
        this.state.web3.eth.getAccounts((error, accounts) => {
            let instance;
            this.state.contract.deployed().then((inst) => {
                instance = inst;
                return inst.getBalance.call();
            }).then((result) => {
                let etherCount = result.dividedBy(new BigNumber('1e+18')).toString();
                console.log("Eth address of contract: " + instance.address);
                console.log("Eth Balance: " + etherCount);
                this.setState({accountTotal: etherCount })
            });
        });
    }

    configureContract(publicKey, keyHandle) {
        let keyHandleArray = [];

        for(let i = 0; i < keyHandle.length; i++) {
            keyHandleArray.push(keyHandle[i]);
        }


        let contractInstance;
        this.state.web3.eth.getAccounts((error, accounts) => {
            this.state.contract.deployed().then((instance) => {
                contractInstance = instance;
                let web3 = this.state.web3;
                var qx = web3.toBigNumber('0x' + publicKey.toString('hex', 1, 33));
                var qy = web3.toBigNumber('0x' + publicKey.toString('hex', 33, 65));
                return instance.configure(qx, qy, keyHandleArray, {from: accounts[0]});
            }).then((result) => {
                console.log(result);
                this.setState({isRegistered: true})
                /*console.log("qx: " + result.logs[1].args.qx.toString());
                console.log("qy: " + result.logs[1].args.qy.toString());*/
            }).catch((error) => {
                console.log(error.message);
            });
        });
    }

    sendMoney(challenge, counter, signature, clientDataHash, address = '0x5D7141a0Bdfb1407e404d7f368027ca9201BD144') {
        let challengeArray = [];
        for(let i = 0; i < 32; i++) challengeArray.push(challenge[i]);
        let rLen = signature[3];
        let sLen = signature[rLen + 3 + 2];
        //for(let i = rLen === 32 ? 4 : 5; i < 4 + rLen; i++) rr.push(signature[i]);
        let rr = this.state.web3.toBigNumber('0x' + signature.toString('hex', rLen === 32 ? 4 : 5, 4 + rLen));
        let ss = this.state.web3.toBigNumber('0x' + signature.toString('hex', sLen === 32 ? 6 + rLen : 7 + rLen, 6 + rLen + sLen));

        //for(let i = sLen === 32 ? 6 + rLen : 7 + rLen; i < 6 + rLen + sLen; i++) ss.push(signature[i]);
        let counterInt = counter.readUInt32BE(0);
        console.log("rLen: " + rLen + ", sLen: " + sLen + ", rr.length: " + rr + ", ss.length: " + ss+ ", Counter: " + counterInt);

        let contractInstance;
        this.state.web3.eth.getAccounts((error, accounts) => {
            this.state.contract.deployed().then((instance) => {
                contractInstance = instance;
                return instance.sendMoney(address.toString(), new BigNumber(this.state.amountTransfer).times(new BigNumber('1e+18')), counterInt, rr, ss, this.state.web3.toBigNumber('0x' + this.buf2hex(clientDataHash)), {from: accounts[0]});
            }).then((result) => {
                console.log(result);
                console.log("qx: " + result.logs[1].args.qx.toString());
                console.log("qy: " + result.logs[1].args.qy.toString());
                this.successfulTransaction();
            }).catch((error) => {
                console.log(error.message);
            });
        });
    }

    hash(data) {
        return crypto.createHash('sha256').update(data).digest();
    }

    buf2hex(buffer) { // buffer is an ArrayBuffer
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    cleanUpBase64(str) {
        return str.replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '');
    }

    successfulTransaction = () => {
        this.updateBalance();
        this.setState({
            successMessage: true,
            accountReceiver: '',
            amountTransfer: 0,
            messageByteCode: '',
        });

        setTimeout(() => this.setState({successMessage: false}), 3000);

    };

    register = () => {
        console.log("Registering");

        let version = "U2F_V2";
        //let challenge = "dGVzdA"; //"test"
        var appId = "https://localhost:3000";

        let challengeBytes = crypto.randomBytes(32);
        let challenge = this.cleanUpBase64(challengeBytes.toString('base64'));
        console.log("Challenge: " + challenge);

        const appObj = this;

        let registrationRequest = {
            appId: appId,
            challenge: challenge,
            version: version
        };

        API.register(registrationRequest, []).then(function(result) {
            //from u2f
            console.log(result);
            let clientData = new Buffer(result.clientData, 'base64');
            // Parse registrationData.
            let data = new Buffer(result.registrationData, 'base64');
            data = data.slice(1); // reserved
            let publicKey = data.slice(0, 65);
            data = data.slice(65);
            let keyHandleLen = data[0];
            data = data.slice(1);
            let keyHandle = data.slice(0, keyHandleLen);
            data = data.slice(keyHandleLen);

            console.log("Decoded response");
            console.log("Uncleaned base64 public key: " + publicKey.toString('base64'));
            let pkB64 = appObj.cleanUpBase64(publicKey.toString('base64'));
            let khB64 = appObj.cleanUpBase64(keyHandle.toString('base64'));
            console.log("Public Key: " + pkB64);
            console.log("Key Handle: " + khB64);
            appObj.state.publicKey = pkB64;
            appObj.state.keyHandle = khB64;
            console.log("Public Key (hex): " + appObj.buf2hex(publicKey));
            console.log("key Handle (hex): " + appObj.buf2hex(keyHandle));
            appObj.configureContract(publicKey, keyHandle.toString('base64'));
        }).catch(function(error) {
            if(error.metaData !== undefined) console.log(error.message + ": " + error.metaData.type);
            else console.log(error.message);
        });
    }

    checkSig() {
        console.log("Checking sig (Verifying U2F)");

        let version = "U2F_V2";
        //let challenge = "dGVzdA"; //"test"
        var appId = "https://localhost:3000";

        let challengeBytes = crypto.randomBytes(32);
        let challenge = this.cleanUpBase64(challengeBytes.toString('base64'));
        console.log("Challenge: " + challenge);


        let signRequest = {
            appId: appId,
            challenge: challenge,
            version: version,
            keyHandle: this.state.keyHandle
        };
        console.log("Key Handle: " + this.state.keyHandle);

        const app = this;

        const publicKey = this.state.publicKey;

        API.sign(signRequest).then((result) => {

            var clientData = new Buffer(result.clientData, 'base64');

            var sigData = new Buffer(result.signatureData, 'base64');
            var userPresenceFlag = sigData.slice(0, 1);
            sigData = sigData.slice(1);
            var counter = sigData.slice(0, 4);
            sigData = sigData.slice(4);
            var signLen = asnLen(sigData);
            var signature = sigData.slice(0, signLen);
            sigData = sigData.slice(signLen);

            console.log("Counter (hex): " + app.buf2hex(counter));
            console.log("Signature (hex): " + app.buf2hex(signature));
            console.log("Challenge (hex): " + app.buf2hex(new Buffer(challenge, "base64")));
            console.log("Challenge: " + challengeBytes);
            if (sigData.length !== 0)
                console.error("parse error");

            var appIdHash = app.hash(appId);
            console.log("Client data (hex): " + app.buf2hex(clientData));
            var clientDataHash = app.hash(clientData);
            console.log("Client data hash (hex): " + app.buf2hex(clientDataHash));

            var signatureBase = Buffer.concat([appIdHash, userPresenceFlag, counter, clientDataHash]);
            console.log("signatureBase: " + signatureBase.toString('hex'));
            console.log("Client Data Hash (hex): " + clientDataHash.toString('hex'));

            var cert = new Buffer(publicKey, 'base64');

            this.sendMoney(challengeBytes, counter, signature, clientDataHash, this.state.accountReceiver);

        }).catch(function(error) {
            console.log(error.message);
        })
    }

    render() {
        return (
            <div className="App">
                <nav className="navbar pure-menu pure-menu-horizontal">
                    <a href="#" className="pure-menu-heading pure-menu-link">kEth</a>
                </nav>

                <main className="container">
                    <div className="pure-g">
                        <div className="pure-u-1-1">
                            {/* <h1>U2F Multisig</h1> */}
                            <br/>
                            <br/>
                            {!this.state.isRegistered?
                              <Button onClick={() => {this.register()}} raised color="primary">
                                Register U2F key
                              </Button>
                            :
                            <div>
                              <p>Account: {this.state.accountAddress}</p>
                              <p>Total: {this.state.accountTotal} eth</p>
                              <div>
                              <TextField
                                id="name"
                                label="Recipient address"
                                // className={classes.textField}
                                value={this.state.accountReceiver}
                                onChange={(event) => this.setState({accountReceiver: event.target.value})}
                                margin="normal"
                              />
                              </div>
                              <div>
                                <TextField
                                  id="number"
                                  label="Number"
                                  value={this.state.amountTransfer}
                                  onChange={(event) => this.setState({amountTransfer: event.target.value})}
                                  type="number"
                                  // className={classes.textField}
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                                  margin="normal"
                                />
                              </div>
                              <div>
                              <TextField
                                id="multiline-flexible"
                                label="Optional byte code"
                                multiline
                                rowsMax="4"
                                rows="4"
                                value={this.state.messageByteCode}
                                onChange={(event) => {
                                  this.setState({messageByteCode: event.target.value})}}
                                // className={classes.textField}
                                margin="normal"
                              />
                              </div>
                            <Button onClick={() => {this.checkSig()}} raised color="primary">
                              Sign Transaction
                            </Button>
                          </div>}
                          <Snackbar
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            open={this.state.successMessage}
                            // onRequestClose={this.handleRequestClose}
                            SnackbarContentProps={{
                              'aria-describedby': 'message-id',
                            }}
                            message={<span id="message-id">Successful transaction!</span>}
                          />
                        </div>
                    </div>
                </main>
            </div>
        );
    }
}

export default App
