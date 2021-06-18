
const crypto = require('crypto');
const { CryptoFactory, createContext } = require('sawtooth-sdk/signing')
const protobuf = require('sawtooth-sdk/protobuf')
const http = require('http');
const fs = require('fs')
const fetch = require('node-fetch');
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1')
const { TextEncoder, TextDecoder } = require('text-encoding/lib/encoding')

var encoder = new TextEncoder('utf8');
var decoder = new TextDecoder('utf8')

/**
 * @title hash
 * @notice function to hash a data
 * @param {*} data is the input given for hashing 
 */
function hash(data) {
  return crypto.createHash('sha512').update(data).digest('hex');
}

/**
 * @title EventAddress
 * @notice function to generate the address in which event details is stored,when 
 * Date is given as input parameter 
 * @dev Here the address is created based on Transaction Family "Event_Managment_App"  
 * @dev The addressing scheme is " FamilyName + Date of event" 
 * @param {*} date is the Date on which event is booked
 */
function EventAddress(date) {
  let nameHash = hash("Agrosight")
  let dateHash = hash(date)
  return nameHash.slice(0, 6) + dateHash.slice(0, 64)
}

/**
 * @title createTransaction
 * @notice Function to create a batch with One transaction
 * @dev The batch has only one transaction
 * @param {*} familyName Transaction Family Name
 * @param {*} inputAddressList List of Input Addresses
 * @param {*} outputAddressList List of Output Addresses
 * @param {*} Privkey User Private Key 
 * @param {*} payload Payload
 * @param {*} familyVersion Version Of Transaction Family
 */
function createTransaction(familyName, inputAddressList, outputAddressList, Privkey, payload, familyVersion = '1.0') {
  const privateKeyHex = Privkey
  const context = createContext('secp256k1');
  const secp256k1pk = Secp256k1PrivateKey.fromHex(privateKeyHex.trim());
  signer = new CryptoFactory(context).newSigner(secp256k1pk);
  /**
   * Encoding The payload
   */
  const payloadBytes = encoder.encode(payload)
  /**
   * Creating Transaction header
   */
  const transactionHeaderBytes = protobuf.TransactionHeader.encode({
    familyName: familyName,
    familyVersion: familyVersion,
    inputs: inputAddressList,
    outputs: outputAddressList,
    signerPublicKey: signer.getPublicKey().asHex(),
    nonce: "" + Math.random(),
    batcherPublicKey: signer.getPublicKey().asHex(),
    dependencies: [],
    payloadSha512: hash(payloadBytes),
  }).finish();
  /**
   * Creating Transaction
   */
  const transaction = protobuf.Transaction.create({
    header: transactionHeaderBytes,
    headerSignature: signer.sign(transactionHeaderBytes),
    payload: payloadBytes
  });
  const transactions = [transaction];
  /**
   * Creating Batch header
   */
  const batchHeaderBytes = protobuf.BatchHeader.encode({
    signerPublicKey: signer.getPublicKey().asHex(),
    transactionIds: transactions.map((txn) => txn.headerSignature),
  }).finish();
  const batchSignature = signer.sign(batchHeaderBytes);
  /**
   * Creating Batch
   */
  const batch = protobuf.Batch.create({
    header: batchHeaderBytes,
    headerSignature: batchSignature,
    transactions: transactions,
  });
  /**
   * Creating Batchlist
   */
  const batchListBytes = protobuf.BatchList.encode({
    batches: [batch]
  }).finish();
  /**
   * Sending encoded batchlist to the validator through restapi
   */
  sendTransaction(batchListBytes);
}

/**
 * @title sendTransaction
 * @notice function to submit the batchListBytes to validator through rest-api port 8008
 * @param {*} batchListBytes Encoded batchlist containg the transactions
 */
async function sendTransaction(batchListBytes) {
  let resp = await fetch('http://rest-api:8008/batches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: batchListBytes
  })
  console.log("response", resp);
}

/**
 * Transaction Family names 
 */
FAMILY_NAME = 'Agrosight'


/**
 * Class  
 */
class UserClient {

  /**
   * @title addRegistration
   * @dev Function to register the details of the Registration of vehicle
   * @param {*} registration Identification string
   * @param {*} data1 Private Key Of the User
   * @param {*} data2 Name of the Event
   * @param {*} data3 Date
   * @param {*} data4 Location
   * @param {*} data5 Info
   */
  async addRegistration(registration, data1, data2, data3, data4, data5, data6, data7, data8, data9) {
    let address = EventAddress(data2)
    let action = "Add Registration"
    let payload = [action, registration, data2, data3, data4, data5,data6, data7, data8, data9].join(',')
    let eventExistAddress = 'http://rest-api:8008/state/' + address;
    let eventCheck = await fetch(eventExistAddress);
    console.log(eventCheck, "event check ")
    let eventCheckJSON = await eventCheck.json();
    console.log(eventCheckJSON.data, "event check json data");
    let registrationFlag = 0;
    if (eventCheckJSON.data == "" || eventCheckJSON.data == null) {
      console.log(eventCheckJSON, "event check json");
      registrationFlag = 1;
      await createTransaction(FAMILY_NAME, [address], [address], data1, payload)
    }
    else {
      console.log('Registration Already  Exist in this Date:')
    }
    return registrationFlag
  }
  
  /**
   * @title deleteData
   * @dev Function to delete the details of the event
   * @param {*} deleteState Identification String
   * @param {*} data1 User Private Key
   * @param {*} data2 Date of event
   */
  async deleteData(deleteState, data1, data2) {
    let action = "Delete State"
    let address = EventAddress(data2)
    let payload = [action, deleteState, data2].join(',')
    let eventExistAddress = 'http://rest-api:8008/state/' + address;
    let eventCheck = await fetch(eventExistAddress);
    console.log(eventCheck, "event check ")
    let eventCheckJSON = await eventCheck.json();
    console.log(eventCheckJSON.data, "event check json data");
    let deleteFlag = 0;
    if (eventCheckJSON.data != "" || eventCheckJSON.data != null) {
      console.log(eventCheckJSON, "event check json");
      deleteFlag = 1;
      await createTransaction(FAMILY_NAME, [address], [address], data1, payload)
    }
    else {
      console.log('Event Does Not Exist in this Date:')
    }
    return deleteFlag
  }

  /**
   * @title result
   * @dev Function to view the details of the vehicle 
   * @param {*} data1 Date of Event
   */
  async result(data1) {
    console.log("result...date " + data1);
    let address = EventAddress(data1)
    console.log("result (address) from UserClient " + address);
    if (data1 != " " || data1 != null) {
      console.log("Going to fetch Data From Address ");
      var geturl = 'http://rest-api:8008/state/' + address
      console.log("Getting from: " + geturl);
      let response = await fetch(geturl, {
        method: 'GET',
      })
      console.log(response);
      let responseJson = await response.json();
      console.log(responseJson);
      var data = responseJson.data;
      console.log(data + " data obtained from State Address");
      if (data == undefined) {
        console.log("Data Obtained is Undefined");
        var newdata1 = 1;
        return newdata1
      }
       else {
        var newdata = Buffer.from(data, 'base64').toString();
        console.log("Data Obtained from state successfully and is " + newdata);
        var newdatas = newdata.split(',');
        return newdatas;
      }
    }
    else {
      console.log('Enter valid Date')
    }
  }


  /**
   * @title transactionReceipt
   * @dev Function to Display the Transaction Receipt Data when Transaction ID is given
   * @param {*} data1 Transaction Id
   */
  async transactionReceipt(data1) {
    console.log("transactionID from UserClient" + data1);
    if (data1 != " " || data1 != null) {
      var getTransactionReceipt = 'http://rest-api:8008/receipts?id=' + data1
      console.log("Getting from: " + getTransactionReceipt);
      let response = await fetch(getTransactionReceipt, {
        method: 'GET',
      })
      console.log(response);
      let responseJson = await response.json();
      console.log("Response Json Obtained " + responseJson);
      // var data = JSON.stringify(responseJson);
      var responseData1 = responseJson.data[0].data[0];
      var responseData2 = responseJson.data[0].data[1];
      console.log(responseData1 + " responsedata1");
      console.log(responseData2 + " responsedata2");
      if (responseData1 == undefined) {
        console.log("responseData1 is Undefined ");
        var newdata1 = 1;
        return newdata1
      }
      else if (responseData2 == undefined) {
        console.log("responseData2 is undefined but got responseData1 ");
        var newdata = Buffer.from(responseData1, 'base64').toString();
        console.log("newdata returning..." + newdata);
        return newdata;
      }
      else {
        console.log("Got responseData1 and responseData2 ");
        var newdata1 = Buffer.from(responseData1, 'base64').toString();
        var newdata2 = Buffer.from(responseData2, 'base64').toString();
        console.log("newdata1 is returning..." + newdata1);
        console.log("newdata2 is returning..." + newdata2);
        var newdata = newdata1 + newdata2;
        return newdata;
      }
    }
  }

  /**
   * @title transactionID
   * @dev Function to Display the Latest Transaction's ID
   */
  async transactionID() {
    var getTransactionList = 'http://rest-api:8008/blocks'
    console.log("Getting from: " + getTransactionList);
    let response = await fetch(getTransactionList, {
      method: 'GET',
    })
    console.log(response);
    let responseJson = await response.json();
    console.log(responseJson);
    var data = responseJson.data[0].batches[0].header.transaction_ids;
    var dataList = JSON.stringify(data);
    console.log("Response Data listing Latest Transaction Id " + data);
    console.log("String of Transaction Id " + dataList);
    if (dataList == undefined) {
      console.log("Obtained Undefined Data");
      var newdata1 = 1;
      return newdata1
    } else {
      console.log("Obtained transaction Id ");
      var newdata = dataList;
      console.log("Returning Transaction Id " + newdata);
      return newdata;
    }
  }


}
module.exports = { UserClient };











