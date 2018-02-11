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