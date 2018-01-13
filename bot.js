require('dotenv').load();

var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new winston.transports.File({ filename: './logs/combined.log', timestamp: true, maxsize: 1000000 })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: './logs/exceptions.log', timestamp: true, maxsize: 1000000 })
    ],
    exitOnError: true
});

var inside = require('point-in-polygon');
var districtProvider = require('./districts.js');
var districts = districtProvider.getDistricts();
const Discord = require('discord.js');

const checkerClient = new Discord.Client();
const notifierClient = new Discord.Client();

checkerClient.on('ready', function () {
    console.log('I am ready!');
});

checkerClient.on('message', function (message) {
    if (message.channel.name.indexOf(process.env.canalNamePrefix) > -1 && message.embeds.length > 0) {
        message.embeds.forEach(function(embed) {
            var coordinates = extractCoordinatesFromGoogleMapsUrl(embed.url);
            districts.forEach(function(district) {
                if(inside(coordinates, district.polygon)) {
                    notifierClient.channels.get(district.channelId).send(createPokefication(message, embed), {
                        files: [message.author.avatarURL + ".png", embed.image.url + ".png"]
                    });
                }
            });
        })
    }
});

checkerClient.login(process.env.checkerToken);
notifierClient.login(process.env.notifierToken);

function extractCoordinatesFromGoogleMapsUrl(url)
{
    var coordsString = url.slice(url.indexOf("=") + 1);
    return coordsString.split(",");
}

function createPokefication(message, embed)
{
    var pokefication = "";
    pokefication += "**" + message.author.username + "** \n";
    pokefication += embed.title + "\n";
    pokefication += embed.description + "\n";
    pokefication += embed.url + "\n \n";
    return pokefication;
}