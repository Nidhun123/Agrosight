
const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
const crypto = require('crypto');
const { TextEncoder, TextDecoder } = require('text-encoding/lib/encoding')
const { InvalidTransaction, InternalError } = require('sawtooth-sdk/processor/exceptions')

/**
 * @dev Transaction Family
 */
const FAMILY_NAME = 'Agrosight';
const NAMESPACE = hash(FAMILY_NAME).substring(0, 6);

var encoder = new TextEncoder('utf8')
var decoder = new TextDecoder('utf8')

/**
 * @title hash
 * @dev function to hash a data
 * @param {*} v is the input given for hashing 
 */
function hash(v) {
    return crypto.createHash('sha512').update(v).digest('hex');
}

/**
 * @title VehicleDataAddress
 * @notice function to generate the address in which event details is stored,when
 * Date of Event is given as input parameter
 * @dev Here the address is created based on Transaction Family "Event_Managment_App"
 * @dev The addressing scheme is " FamilyName + Date of Event"
 * @param {*} date date of event booking
 */
function EventDataAddress(date) {
    let nameHash = hash("Agrosight")
    let dateHash = hash(date)
    return nameHash.slice(0, 6) + dateHash.slice(0, 64)
  }
  
/**
 * @title writeToStore
 * @dev function to write the data to the state
 * @param {*} context Provides the instance of current state
 * @param {*} address Address to which the data is written
 * @param {*} msg is the data that is written in state
 */
function writeToStore(context, address, msg) {
    /**
     * @dev Adding Custom Event Event/WordMatch
     * @dev Here Key is "location" and the match string is "singapore" 
     * It is mentioned in EventListner file 
     */
    let msg_eve = msg[2];
    let msg_eve_lower = msg_eve.toLowerCase();
    let msgB = encoder.encode(msg_eve_lower)
    attribute = [['location', msg_eve_lower.toString()]]
    context.addEvent('Event/WordMatch', attribute, msgB)
    /**
     * @dev Adding Some Data in Transaction Receipt 
     */
    context.addReceiptData(Buffer.from("New Event Data Entered successfully.............", 'utf8'));
    /**
     * @dev encoding the data to be written in state and writing it in state
     */
    msgBytes = encoder.encode(msg)
    let enteries = {
        [address]: msgBytes
    }
    return context.setState(enteries);
}

/**
 * @title registration
 * @notice function to enter the details of Event
 * @param {*} context the instance of current state
 * @param {*} name Name of Event 
 * @param {*} date date
 * @param {*} location location of event
 * @param {*} info informations regarding the event
 * @param {*} signer public key of the User (transaction signer) 
 */
function registration(context, name, date,packed,location,info,category,quantity, image, signer) {
    let event_Address = EventDataAddress(name)
    let event_detail = [name,date,packed,location,info,category,quantity,image, signer]
    return context.getState([event_Address]).then(function (data) {
        console.log("data ", data)
        if (data[event_Address] == null || data[event_Address] == "" || data[event_Address] == []) {
            /**
             * @dev Adding Some Data in Transaction Receipt
             */
            context.addReceiptData(Buffer.from("New Event on  : " + date + " Entering..........", 'utf8'));
            return writeToStore(context, event_Address, event_detail)
        }
        else {
            throw new InvalidTransaction("Already Event registered on  " + date);
        }
    })
}

/**
 * @title deleteData
 * @dev function to delete the event details
 * @param {*} context instance of current state
 * @param {*} date event date
 * @param {*} signer public key of the User (transaction signer) 
 */
function deleteData(context,date, signer) {
    console.log("date " + date);
    console.log("signer " + signer);
    let event_Address = EventDataAddress(date)
    console.log("Event Details Address " + event_Address)
    console.log("data deletion progressing");
    return context.getState([event_Address]).then(function (data) {
        console.log("data ", data)
        if (data[event_Address] == null || data[event_Address] == "" || data[event_Address] == []) {
            throw new InvalidTransaction("No such state exists to delete details")
        }
        else {
            /**
             * @dev Adding Some Data in Transaction Receipt
             */
            context.addReceiptData(Buffer.from("Deleting Event on : " +date + "...", 'utf8'));
            return context.deleteState([event_Address])
        }
    })
}


class EventHandler extends TransactionHandler {
    constructor() {
        super(FAMILY_NAME, ['1.0'], [NAMESPACE]);
    }
    /**
     * @title apply
     * @param {*} transactionProcessRequest Valid Transaction From Client 
     * @param {*} context instance of current state
     */
    apply(transactionProcessRequest, context) {
        /**
         * @dev Payload is obtained from transactionProcessRequest and decoded
         */
        let payloadBytes = decoder.decode(transactionProcessRequest.payload)
        console.log("payloadbytes ", payloadBytes);
        /**
         * @dev Here the public key of the transaction signer is obtained from header and 
         * stored in "sign"
         */
        let sign = transactionProcessRequest.header.signerPublicKey
        console.log("signing Public key " + sign);
        let payload = payloadBytes.toString().split(',')
        console.log("payload ", payload);
        let action = payload[0];
        console.log("action ", action);
        /**
         * @dev function call is based on action
         */
        if (action === "Add Registration") {
            return registration(context, payload[2], payload[3], payload[4], payload[5],payload[6],payload[7],payload[8],payload[9], sign)
        }
        else if (action === "Delete State") {
            return deleteData(context, payload[2], sign)
        }
        else if (action === "") {
            throw new InvalidTransaction("Action is Required")
        }
    }
}
module.exports = EventHandler;








