# kEth
Universal 2nd factor authentication on the Ethereum blockchain (pronounced "Keith")

kEth implements support for registering a FIDO U2F key with a smart contract and requiring an elliptic curve signature from the device to authorize transactions. This can be easily extended to secure multisig, governance contracts, etc. FIDO U2F is a standard protocol with devices manufactured by number of companies, supporting USB A, C, NFC, and Bluetooth. The JavaScript API is built into Chrome, Opera, and is coming soon to Firefox.


Future updates will need to make the contract more reusable by migrating it out of its current "wallet" contract.
