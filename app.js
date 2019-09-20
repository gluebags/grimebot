// Another node Telegram bot attempt

console.debug();
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('C:/apps/scripts/telegram-bot/bot.db');
var fs = require('fs');
const imageHash = require('image-hash');
const TelegramBot = require('node-telegram-bot-api');
const token = '579523662:AAHlU-79yJ_D9miBPqwr9LHBhSG0446VFcw';
const options = {
  polling: true
};
const bot = new TelegramBot(token, options);
const downloadDir = 'C:/apps/scripts/telegram-bot/images/';
const request = require('request');
const dick = 'xx';


const storage = require('azure-storage');
const connectionString = "DefaultEndpointsProtocol=https;AccountName=xx;AccountKey=xx;TableEndpoint=https://xx.table.cosmos.azure.com:443/;";
const storageClient = storage.createTableService(connectionString);

DefaultEndpointsProtocol = https; AccountName = xx; AccountKey = xx ==; TableEndpoint = https://xx.table.cosmos.azure.com:443/;

var config = {}

config.endpoint = connectionString;
config.primaryKey = AccountKey;

// Get images

bot.on('message', (msg) => {
if (typeof msg.photo == 'object') {
var tgPhoto_id = (msg.photo[msg.photo.length-1].file_id);
var photoId = msg.photo[msg.photo.length-1].file_id;
var path = bot.downloadFile(photoId, downloadDir).then(function (path) {
var timestamp = msg.date;
var user_name = msg.from.username;
var user_id = msg.from.id;

// Tell me whats going on
console.log("Photo Submitted by: " + user_name);
console.log("User ID: " + user_id);
console.log("Timestamp: " + timestamp);
console.log("tgPhoto_id: " + photoId);
console.log("Input File: " + path);
console.log('File Renamed to '+downloadDir+tgPhoto_id+".jpg");

// Rename the file to its Telegram fileID
  fs.renameSync(path, downloadDir+tgPhoto_id+".jpg");

//Get some hash
  imageHash((path, downloadDir+tgPhoto_id+".jpg"), 16, true, (error, data) => {
    if (error) throw error;
    console.log(data);
    // 'data' is the md5
    db.run('INSERT INTO photos(file_id, user_id,user,hash,timestamp) VALUES(?, ?, ?, ?, ?)' , [photoId,user_id,user_name,data,timestamp] , function(err) {
//    db.run('INSERT INTO photos(file_id, user_id,user,hash) VALUES(?, ?, ?, ?)' , [photoId,user_id,user_name,data] , function(err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        return;
        db.close();
      });
    });
});

}   else {
  console.log(msg);
// Show me what's in everything else
};

  });
