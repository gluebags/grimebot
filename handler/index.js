/*-----------------------------------------------------------------------------
@grimebot
Requires Azure Storage account with 'bot-queues' queue
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var azure = require('azure-storage');
var path = require('path');

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