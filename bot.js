const katowiceChannelNamePart = "kat";

var logger = require('winston');
var auth = require('./auth.json');
var inside = require('point-in-polygon');
const Discord = require('discord.js');

var szopienice = [
    [50.25854406088136,19.09174919128418],
    [50.259962523285395,19.10247802734375],
    [50.26287065128684,19.10848617553711],
    [50.271648828603915,19.113893508911133],
    [50.27444653255556,19.11174774169922],
    [50.27472080840839,19.097156524658203],
    [50.27477566338936,19.0887451171875],
    [50.27197797877764,19.083595275878906],
    [50.26764398590971,19.081449508666992],
    [50.265614005512276,19.080591201782227]
];

const checkerClient = new Discord.Client();
const notifierClient = new Discord.Client();

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
checkerClient.on('ready', function () {
    console.log('I am ready!');
});

// Create an event listener for messages
checkerClient.on('message', function (message) {
    // If the message is "ping"
    if (message.channel.name.indexOf(katowiceChannelNamePart) > -1 && message.embeds.length > 0) {
        message.embeds.forEach(function(embed) {
            var coordinates = extractCoordinatesFromGoogleMapsUrl(embed.url);
            if(inside(coordinates, szopienice)) {
                notifierClient.channels.get("400764952371134466").send(createPokefication(message, embed));
            }
        })
    }
});

// Log our bot in
checkerClient.login(auth.checkerToken);
notifierClient.login(auth.notifierToken);

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
    pokefication += embed.url + "\n";
    return pokefication;
}