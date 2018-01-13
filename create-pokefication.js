module.exports = {
    createPokefication: function (message, embed)
    {
        var pokefication = "";
        pokefication += "**" + message.author.username + "** \n";
        pokefication += embed.title + "\n";
        pokefication += embed.description + "\n";
        pokefication += embed.url + "\n \n";
        return pokefication;
    }
};