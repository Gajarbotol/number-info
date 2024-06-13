const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

// Use environment variables for the bot token, API URL, and admin ID
const token = process.env.BOT_TOKEN;
const apiUrl = process.env.API_URL;
const adminId = process.env.ADMIN_ID;

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(bodyParser.json());

// Create an object to store user IDs
let users = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Store the user ID when they start the bot
  users[chatId] = true;

  bot.sendMessage(chatId, 'MADE BY @GAJARBOTOL BOT IS RUNNING. SEND NUMBER FOR CHECK');
});

bot.onText(/\/admin/, (msg) => {
  const chatId = msg.chat.id;

  // Check if the message is from the admin
  if (chatId.toString() === adminId) {
    // Send the list of user IDs to the admin
    bot.sendMessage(chatId, 'User IDs: ' + Object.keys(users).join(', '));
  }
});

bot.onText(/\/send (.+) (.+)/, (msg, match) => {
  const chatId = msg.chat.id;

  // Check if the message is from the admin
  if (chatId.toString() === adminId) {
    const userId = match[1];
    const message = match[2];

    // Send the message to the specified user
    bot.sendMessage(userId, message);
  }
});

bot.onText(/\/broadcast (.+)/, (msg, match) => {
  const chatId = msg.chat.id;

  // Check if the message is from the admin
  if (chatId.toString() === adminId) {
    const message = match[1];

    // Send the message to all users
    for (let userId in users) {
      bot.sendMessage(userId, message);
    }
  }
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Check if the user ID is stored
  if (!users[chatId]) {
    return bot.sendMessage(chatId, 'Please start the bot first by sending /start');
  }

  // Rest of your code...
  if (text.startsWith('01')) {
    const phoneNumber = text;

    const url = `${apiUrl}?phone=${phoneNumber}`;

    bot.sendMessage(chatId, 'একটু অপেক্ষা করুন...').then((message) => {
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
            messageText += `Developer: MADE WITH @GAJARBOTOL\n`;

            bot.sendMessage(chatId, messageText);

            setTimeout(() => {
              bot.deleteMessage(chatId, message.message_id);
            }, 1100);
          })
          .catch(error => {
            console.error(`Error fetching data: ${error}`);
            bot.sendMessage(chatId, 'Failed to retrieve data. Please try again later.');
          });
      }, 100);
    });
  } else {
    bot.sendMessage(chatId, 'দয়া করে একটি সঠিক নাম্বার পাঠান.');
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Bot is running...');
});
