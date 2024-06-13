// Import required modules
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual Bot Token
const bot = new TelegramBot('6991433735:AAHODToXJ6igTUpMkPlWjJKgIRaPne9gc7Y', {polling: true});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const phoneNumber = msg.text;

    // Make a GET request to the external service
    axios.get(`https://lxbadboy.co/truecaller/?phone=${phoneNumber}`)
        .then(response => {
            // Send the response content back to the user
            bot.sendMessage(chatId, response.data);
        })
        .catch(error => {
            console.error(error);
            bot.sendMessage(chatId, 'Failed to get info');
        });
});
