/*-----------------------------------------------------------------------------
@grimebot
Requires Azure Storage account with grimebotLog table
-----------------------------------------------------------------------------*/
"use strict";
var builder = require('botbuilder');
var botbuilder_azure = require('botbuilder-azure');
var azure = require('azure-storage');
var path = require('path');

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

