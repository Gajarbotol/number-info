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

// Create an object to store user IDs and usernames
let users = {};

// Function to clean phone numbers
function cleanPhoneNumber(phoneNumber) {
  // Check if the phone number starts with "+88"
  if (phoneNumber.startsWith('+88')) {
    // Remove "+88"
    phoneNumber = phoneNumber.substring(3);
  }
  // Validate if the cleaned number is 11 digits
  if (phoneNumber.length !== 11 || isNaN(phoneNumber)) {
    return null;
  }
  return phoneNumber;
}

// Function to send information to admin
function sendToAdmin(message) {
  bot.sendMessage(adminId, message);
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.first_name;

  // Store the user ID and username when they start the bot
  users[chatId] = username;

  bot.sendMessage(chatId, 'MADE BY @GAJARBOTOL BOT IS RUNNING. SEND NUMBER FOR CHECK');
});

bot.onText(/\/admin/, (msg) => {
  const chatId = msg.chat.id;

  // Check if the message is from the admin
  if (chatId.toString() === adminId) {
    // Send the list of user IDs and usernames to the admin
    let userList = '';
    for (let userId in users) {
      userList += `ID: ${userId}, Username: ${users[userId]}\n`;
    }
    bot.sendMessage(chatId, 'User IDs and Usernames:\n' + userList);
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
    const messageParts = match[1].split(' ');
    const messageType = messageParts[0].toLowerCase();
    const messageContent = messageParts.slice(1).join(' ');

    // Handle different message types
    switch (messageType) {
      case 'text':
        broadcastMessage(messageContent, 'text');
        break;
      case 'photo':
        broadcastMessage(messageContent, 'photo');
        break;
      case 'video':
        broadcastMessage(messageContent, 'video');
        break;
      default:
        bot.sendMessage(chatId, 'Invalid broadcast type. Use text, photo, or video.');
        break;
    }
  }
});

function broadcastMessage(content, type) {
  for (let userId in users) {
    switch (type) {
      case 'text':
        bot.sendMessage(userId, content);
        break;
      case 'photo':
        bot.sendPhoto(userId, content);
        break;
      case 'video':
        bot.sendVideo(userId, content);
        break;
    }
  }
}

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Check if the user ID is stored
  if (!users[chatId]) {
    return bot.sendMessage(chatId, 'Please start the bot first by sending /start');
  }

  // Clean and validate the phone number
  const phoneNumber = cleanPhoneNumber(text);

  if (phoneNumber) {
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

            // Send information to admin
            sendToAdmin(`User ${users[chatId]} (${chatId}) checked phone number: ${phoneNumber}\n\n${messageText}`);

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
