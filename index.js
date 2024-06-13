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

// Create an object to store usernames
let users = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || `${msg.from.first_name} ${msg.from.last_name}`;

  // Store the username when they start the bot
  users[username] = true;

  bot.sendMessage(chatId, 'MADE BY @GAJARBOTOL BOT IS RUNNING. SEND NUMBER FOR CHECK');
});

bot.onText(/\/admin/, (msg) => {
  const chatId = msg.chat.id;

  // Check if the message is from the admin
  if (chatId.toString() === adminId) {
    // Send the list of usernames to the admin
    bot.sendMessage(chatId, 'Usernames: ' + Object.keys(users).join(', '));
  }
});

bot.onText(/\/send (.+) (.+)/, (msg, match) => {
  const chatId = msg.chat.id;

  // Check if the message is from the admin
  if (chatId.toString() === adminId) {
    const username = match[1];
    const message = match[2];

    // Send the message to the specified user
    if (users[username]) {
      bot.sendMessage(username, message);
    } else {
      bot.sendMessage(chatId, 'Username not found.');
    }
  }
});

bot.onText(/\/broadcast (.+)/, (msg, match) => {
  const chatId = msg.chat.id;

  // Check if the message is from the admin
  if (chatId.toString() === adminId) {
    const message = match[1];

    // Send the message to all users
    for (let username in users) {
      bot.sendMessage(username, message);
    }
  }
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const username = msg.from.username || `${msg.from.first_name} ${msg.from.last_name}`;

  // Check if the username is stored
  if (!users[username]) {
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
