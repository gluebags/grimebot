module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
    "handler": __webpack_require__(2),
    "log": __webpack_require__(3)
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*-----------------------------------------------------------------------------
@grimebot
Requires Azure Storage account with 'bot-queues' queue
-----------------------------------------------------------------------------*/

var builder = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"botbuilder\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
var botbuilder_azure = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"botbuilder-azure\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
var azure = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"azure-storage\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
var path = __webpack_require__(0);

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
  appId: process.env['MicrosoftAppId'],
  appPassword: process.env['MicrosoftAppPassword'],
  openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

// Log messages to bot-queues
bot.dialog('/', function (session) {
  var queuedMessage = { address: session.message.address, text: session.message.text };
  var queueSvc = azure.createQueueService(process.env.AzureWebJobsStorage);
  queueSvc.createQueueIfNotExists('bot-queues', function (err, result, response) {
    if (!err) {
      // Add the message to the queue
      var queueMessageBuffer = new Buffer(JSON.stringify(queuedMessage)).toString('base64');
      console.log(queueMessageBuffer);
      queueSvc.createMessage('bot-queues', queueMessageBuffer, function (err, result, response) {
        if (err) {
          // Queue insert error
          session.send('Queue insert error');
        }
      });
    } else {
      // Queue create error
      session.send('Queue creation error');
    }
  });

});

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*-----------------------------------------------------------------------------
@grimebot
Requires Azure Storage account with grimebotLog table
-----------------------------------------------------------------------------*/

var builder = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"botbuilder\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
var botbuilder_azure = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"botbuilder-azure\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
var azure = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"azure-storage\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
var path = __webpack_require__(0);

//Storage queue trigger read in

module.exports = function (context, myQueueItem) {
  context.log('Queue in:', myQueueItem);
  var botlog = {
    PartitionKey: String('Telegram Log'),
    RowKey: (myQueueItem.address.id),
    Source: String(myQueueItem.address.channelId),
    Username: String(myQueueItem.address.user.name),
    UserID: String(myQueueItem.address.user.id),
    isGroup: (myQueueItem.address.conversation.isGroup),
    groupid: String(myQueueItem.address.conversation.id),
    botID: String(myQueueItem.address.bot.id),
    botName: String(myQueueItem.address.bot.name),
    Text: String(myQueueItem.text)
  };
  //Applies retries to table insert
  var retryOperations = new azure.ExponentialRetryPolicyFilter();
  var tableSvc = azure.createTableService().withFilter(retryOperations);
  //Puts botlog object into storage table
  tableSvc.insertEntity('grimebotLog', botlog, function (error, result, response) {
    if (!error) {
      context.log('Written to table');
    }
  });
  context.done();
};



/***/ })
/******/ ]);