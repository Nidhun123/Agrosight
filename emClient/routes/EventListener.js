/* Creates custom event subscription to application specific events */
/* event alerts when a word matching the location of event */
//  REGEX_ALL and REGEX_ANY  means in REGEX_ALL all the attributes to the same key in custom event definition should satisfy the given condition in "matchString"
// In REGEX_ANY any one attribute satisfies the "matchString" , the event will be triggered  
const {
        Message,
        EventFilter,
        EventList,
        EventSubscription,
        ClientEventsSubscribeRequest,
        ClientEventsSubscribeResponse
} = require('sawtooth-sdk/protobuf');
const { Stream } = require('sawtooth-sdk/messaging/stream');
const { TextDecoder } = require('text-encoding/lib/encoding')

var decoder = new TextDecoder('utf8')
const VALIDATOR_URL = "tcp://validator:4004"
const stream = new Stream(VALIDATOR_URL);
let socket;
const setSocket = (currentSocket) => {
        socket = currentSocket;
}
const startEventListner = (socketConnection) => {
        console.log("Starting Event Listener");
        setSocket(socketConnection);
        stream.connect(() => {
                stream.onReceive(getEventsMessage);
                EventSubscribe(stream);
        })
}

/**
 * @title checkStatus
 * @dev Returns the subscription request status
 * @param {*} response decoded response when a subscription is requested
 */
function checkStatus(response) {
        let msg = ""
        if (response.status === 0) {
                msg = 'subscription : OK'
        } else if (response.status === 1) {
                msg = 'subscription : GOOD '
        } else {
                msg = 'subscription failed !'
        }
        return msg
}

/**
 * @title getEventsMessage
 * @dev event message handler 
 * @param {*} message 
 */
function getEventsMessage(message) {
        let eventlist = EventList.decode(message.content).events
        eventlist.map(function (event) {
                if (event.eventType == 'sawtooth/block-commit') {
                        console.log("Sawtooth Block-commit-Event ", event);
                }
                else if (event.eventType == "Event/WordMatch") {
                        console.log("Word-Match-Event", event);
                        socket.emit('Word-Match-Event', event);
                }
                
        })
}

/**
 * @title EventSubscribe
 * @param {*} stream 
 */
function EventSubscribe(stream) {
        try {
                console.log("Inside Subscription");
                /**
                 * @dev subscription of block-commit event done below
                 * here the block-commit event is inbuit in sawtooth sdk
                 */
                const blockCommitSubscription = EventSubscription.create({ eventType: 'sawtooth/block-commit' })
                /**
                 * @dev First Custom Event  
                 * subscription of Event/WordMatch event done below , 
                 * here the custom event is defined in T.P
                 */
                const wordMatchSubscription = EventSubscription.create({
                        eventType: 'Event/WordMatch',
                        filters: [EventFilter.create({
                                key: "location",
                                matchString: "singapore",
                                filterType: EventFilter.FilterType.REGEX_ALL
                        })]

                })
                /**
                 * @dev subscription request of blockcommitSubscription,wordMatchSubscription is done below 
                 */
                const subscription_request = ClientEventsSubscribeRequest.encode({ subscriptions: [blockCommitSubscription, wordMatchSubscription] }).finish();
                stream.send(Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_REQUEST, subscription_request)
                        .then(function (response) { return ClientEventsSubscribeResponse.decode(response) })
                        .then(function (decoded_Response) {
                                console.log(checkStatus(decoded_Response))
                        })
        }
        catch (error) {
                console.log(error);
        }
}

module.exports = startEventListner;
