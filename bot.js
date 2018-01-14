require('dotenv').load();

var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new winston.transports.File({filename: './logs/combined.log', timestamp: true, maxsize: 1000000})
    ],
    exceptionHandlers: [
        new winston.transports.File({filename: './logs/exceptions.log', timestamp: true, maxsize: 1000000})
    ],
    exitOnError: true
});

const inside = require('point-in-polygon');
const districtProvider = require('./districts.js');
const districts = districtProvider.getDistricts();
const pokeDataExtracter = require('./extract-pokedata');
const pokeficationCreator = require('./create-pokefication');
const Discord = require('discord.js');

const checkerClient = new Discord.Client();
const notifierClient = new Discord.Client();

checkerClient.on('ready', function () {
    console.log('I am ready!');
});

notifierClient.on('ready', function () {
    const ONE_HOUR = 60 * 60 * 1000;
    var interval = setInterval(function () {
        console.log('Cleaning old messages');
        districts.forEach(function (district) {
            notifierClient.channels.get(district.channelId).fetchMessages().then(function (messages) {
                messages.forEach(function (message) {
                    if (((new Date) - message.createdAt) > ONE_HOUR) {
                        message.delete();
                    }
                });
            });
        });
    }, ONE_HOUR / 2);
});

checkerClient.on('message', function (message) {
    if (message.channel.name.indexOf(process.env.canalNamePrefix) > -1 && message.embeds.length > 0) {
        message.embeds.forEach(function (embed) {
            const coordinates = pokeDataExtracter.extractCoordinatesFromGoogleMapsUrl(embed.url);
            districts.forEach(function (district) {
                if (inside(coordinates, district.polygon)) {
                    notifierClient.channels.get(district.channelId).send(pokeficationCreator.createPokefication(message, embed), {
                        files: [message.author.avatarURL + ".png", embed.image.url + ".png"]
                    });
                }
            });
        });
        checkerClient.users.delete(message.author.id);  // Remove Author from cache, otherwise Pokemon names won't change
    }
});

checkerClient.login(process.env.checkerToken);
notifierClient.login(process.env.notifierToken);