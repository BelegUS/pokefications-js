require('dotenv').load();

var logger = require('winston');
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
                    notifierClient.channels.get(district.channelId).send(createPokefication(message, embed));
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
    pokefication += message.author.username + "\n";
    pokefication += embed.title + "\n";
    pokefication += embed.description + "\n";
    pokefication += embed.url + "\n \n";
    return pokefication;
}