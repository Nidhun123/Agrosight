const { TransactionProcessor } = require('sawtooth-sdk/processor');
const EventHandler = require('./eventHandler');

/**
 * @dev validator port
 */
const address = 'tcp://validator:4004';
/**
 * @dev transactionProcesssor instance created 
 */
const transactionProcesssor = new TransactionProcessor(address);
/**
 * @dev Registering class "EventHandler"  
 */
transactionProcesssor.addHandler(new EventHandler());
transactionProcesssor.start(); 
