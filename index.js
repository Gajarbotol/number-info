const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

// Use environment variables for the bot token and API URL
const token = process.env.BOT_TOKEN;
const apiUrl = process.env.API_URL;

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(bodyParser.json());

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Hi! Send a message starting with "01" to check details of a phone number.');
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text.startsWith('01')) {
    const phoneNumber = text;

    const url = `${apiUrl}?phone=${phoneNumber}`;

    bot.sendMessage(chatId, 'Please wait...').then((message) => {
      setTimeout(() => {
        axios.get(url)
          .then(response => {
            const data = response.data;

            let messageText = `Information for phone number: ${phoneNumber}\n\n`;
            messageText += `Name: ${data.name}\n`;
            messageText += `Carrier: ${data.carrier}\n`;
            messageText += `Country: ${data.country}\n`;
            messageText += `Location: ${data.location}\n`;
            messageText += `International Format: ${data.international_format}\n`;
            messageText += `Local Format: ${data.local_format}\n`;
            messageText += `Possible: ${data.is_possible ? 'Yes' : 'No'}\n`;
            messageText += `Timezones: ${data.timezones.join(', ')}\n`;
            messageText += `Developer: ${data.developer}\n`;

            bot.sendMessage(chatId, messageText);

            setTimeout(() => {
              bot.deleteMessage(chatId, message.message_id);
            }, 3000);
          })
          .catch(error => {
            console.error(`Error fetching data: ${error}`);
            bot.sendMessage(chatId, 'Failed to retrieve data. Please try again later.');
          });
      }, 1000);
    });
  } else {
    bot.sendMessage(chatId, 'Please send a phone number starting with "01".');
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Bot is running...');
});