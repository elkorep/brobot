/**
 * Created by elkorep on 2017-08-22.
 */

var fs = require('fs');
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_CLIENT = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var WebClient = require('@slack/client').WebClient;
var config = require('./config.json');

var botToken = config.botToken;
var channel = config.slackchannel;
var rtm = new RTM_CLIENT(botToken);
var webApi = new WebClient(config.webapitoken);
var brobotName = config.brobotName;

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function(rtmStartData) {
  console.log('Logged in to ' + rtmStartData.team.name + ' as ' + rtmStartData.self.name);
});

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  if (message.text && message.subtype !== 'bot_message'){
    var lcMessage = message.text.toLowerCase();
    if (message.text.indexOf(brobotName) > -1 || lcMessage.indexOf('bro') > -1 || lcMessage.indexOf('brobot') > -1) {
      if (lcMessage.indexOf('ptal') > -1) {
        ptal(message);
      }
      else if (lcMessage.indexOf('reviews') > -1) {
        reviews(message);
      }
      else if (lcMessage.indexOf('help') > -1) {
        var help = fs.readFileSync('./help.txt').toString();
        rtm.sendMessage(help, message.channel);
      }
    }
  }
});

function ptal(message) {
  var splitMessage = message.text.split(' ');
  var reviews = require('./reviews.json');
  var attachment = require('./attachment.json');
  var reviewers = [];
  var pr = '';
  var text = '';
  var reviewExists = false;

  splitMessage.forEach(function(word) {
    if (word.indexOf('@') > -1 && word.indexOf(brobotName) === -1) reviewers.push(word);
    else if (word.indexOf('https://github') > -1 && word.indexOf('pull') > -1) pr = word;
  });

  if (pr !== '' && reviewers.length > 0) {
    reviewers.forEach(function(reviewer){
      text += reviewer + ' ';
    });
    text += pr;
    reviews.attachments.forEach(function(att){
      if (!reviewExists) reviewExists = att.text.indexOf(pr) > -1;
    });

    if (!reviewExists) {
      attachment.text = text;
      reviews.attachments.push(JSON.parse(JSON.stringify(attachment)));

        fs.unlink('./reviews.json', function(err){
        if (err && err.code !== 'ENOENT') throw err;
        var options = { flag : 'w' };
        fs.writeFile('./reviews.json', JSON.stringify(reviews), options, function(err) {
          if (err) {
            return console.log(err);
          }
          console.log('reviews.json overwritten');
        });
      });
    }
  }
}

function reviews(message) {
  var reviews = require('./reviews.json');
  if (reviews.attachments.length > 0) {
    var interactiveMessage = {
      username: 'brobot',
      attachments: JSON.stringify(reviews.attachments),
    };
    return webApi.chat.postMessage(message.channel, reviews.text, interactiveMessage, function(err) {
      if (err) {
        console.log('Error:', err);
      }
    });
  }
  return rtm.sendMessage('Sorry Bro, No Reviews Found', message.channel);
}

rtm.start();