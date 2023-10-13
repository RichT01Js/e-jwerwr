const { Permissions, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'site',

    execute(client, message) {

        const setupEmbed = new MessageEmbed();
        setupEmbed.setColor('GREEN');
        setupEmbed.setTitle('AkiraNetwork Sunucu Bilgileri');
        setupEmbed.setThumbnail('https://cdn.discordapp.com/attachments/1013478490634453033/1135962170732056707/akiranwbyrichh.png');
        setupEmbed.setDescription('> - 🌏 | Sunucu Adresi: **oyna.akiranetwork.net** \n> - 💥 | WEB Adresi: **akiranetwork.net** \n> - ⚔️ | Sunucu Sürümü: **1.8.9**');
        setupEmbed.setFooter('www.akiranetwork.net / play.akiranetwork.net');
        setupEmbed.setImage('https://cdn.discordapp.com/attachments/1013478162912518195/1072680668452098128/Baslksz-1.png');

        message.channel.send({ embeds: [setupEmbed] });
    },
};