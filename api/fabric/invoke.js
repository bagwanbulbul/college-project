/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function invokeChaincode(userName, channelName, chaincodeName, functionName, args) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname,'..','..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(userName);
        if (!identity) {
            console.log(`An identity for the user ${userName} does not exist in the wallet`);
            return {success: false, message: `An identity for the user ${userName} does not exist in the wallet. Please register the user before proceeding`};
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: userName, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(chaincodeName);

        // Submit the specified transaction.
        var result = await contract.submitTransaction(functionName, ...args);
        console.log('Transaction has been submitted successfully, ', result);

        // Disconnect from the gateway.
        await gateway.disconnect();
        
        return {success: true, message: "Transaction has been submitted successfully", chaincodeResponse: `${result.toString()}`}

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return {success: false, message: `Failed to submit transaction: ${error}`}
    }
}

exports.invokeChaincode = invokeChaincode
