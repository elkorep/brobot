/**
 * Created by elkorep on 2017-08-22.
 */

var fs = require('fs');
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_CLIENT = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var config = require('./config.json');

var botToken = config.botToken;
var channel = config.slackchannel;
var rtm = new RTM_CLIENT(botToken);

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function(rtmStartData) {
  console.log('Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}');
});

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  var lcMessage = message.text.toLowerCase();

  if (lcMessage.contains('bro') || lcMessage.contains('brobot')) {
    if(lcMessage.contains('ptal')) {
      ptal(message);
    }
    else if (lcMessage.contains('reviews')) {
      reviews();
    }

    else if (lcMessage.contains('help')) {
      var help = fs.readFileSync('./help.txt').toString();
      rtm.sendMessage(help, channel);
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

  forEach(var word in splitMessage) {
    if(word.contains('@')) reviewers.push(word);
    else if(word.contains('https://github') && word.contains('pull')) pr = word;
  }
  if(pr !== '' && reviewers.length > 0) {
    forEach(var reviewer in reviewers) {
      text += reviewer + ' ';
    }
    text += pr;
    attachment.text = text;
    attachment.callback_id = pr;
    reviews.attachments.push(attachment);

    fs.writeFile('./reviews.json', reviews, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("reviews.json overwritten");
    });
  }
}

function reviews() {
    var reviews = require('./reviews.json');
    if(reviews.attachments.length > 0) {
      return rtm.sendMessage(reviews, channel);
    }
    return rtm.sendMessage('No Reviews Found');
}