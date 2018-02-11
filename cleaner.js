require('dotenv').load();

const districtProvider = require('./districts.js');
const districts = districtProvider.getDistricts();
const Discord = require('discord.js');

const cleanerClient = new Discord.Client();


cleanerClient.on('ready', function () {
    const ONE_HOUR = 60 * 60 * 1000;
    var interval = setInterval(function () {
        console.log('Cleaning old messages');
        districts.forEach(function (district) {
            cleanerClient.channels.get(district.channelId).fetchMessages().then(function (messages) {
                messages.forEach(function (message) {
                    if (((new Date) - message.createdAt) > ONE_HOUR) {
                        message.delete();
                    }
                });
            });
        });
    }, ONE_HOUR / 4);
});

cleanerClient.login(process.env.notifierToken);