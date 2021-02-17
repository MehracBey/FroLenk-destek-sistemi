const FroLenk = require('discord.js');
const ayarlar = require('../ayarlar.json');
exports.run = async(client, message) => {
    message.channel.send(`Bot pingi : ` + client.ws.ping + `ms`);
}
exports.conf = {
    enabled : true,
    guildOnly : false,
    aliases : [''],
    permLevel : 0
}
exports.help = {
    name : 'ping',
    description : 'Botun Ping gösterir',
    usage : '!ping'
}
