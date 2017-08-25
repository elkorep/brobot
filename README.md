# brobot

BroBot is built to work with slack. It is meant to be used as a helper for development teams. Keep track of github pull requests, and attach reviewer(s) to it. You can then view the list and clear an item by clicking the Review button.

More features to come...

**Pre-req**

Copy the [config-template.json](https://github.com/elkorep/brobot/blob/master/config-template.json) file to `config.json` and fill it in:
- botToken: the token found in slack for the bot
- slackchannel: the channel id
- webapitoken: the web api token (if you want to post messages not as bot) or the bot token
- brobotName: the name of the bot (usually encoded like W6TFDV5NY)

**Bro Commands**

- <user> bro PTAL <url> = add a review with reviewer(s)
- Reviews bro = displays reviews and reviewers
