const { Permissions, MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
    name: 'setup',

    execute(client, message) {
        // Yalnızca sunucuyu yönetme yetkisine sahip kişilere izin verelim
        if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
            return message.channel.send('Bi sen akıllısın amk ❌');
        }

        const setupEmbed = new MessageEmbed();
        setupEmbed.setColor('RED');
        setupEmbed.setTitle('Richdesign Destek');
        setupEmbed.setThumbnail('https://cdn.discordapp.com/attachments/1059064754896908290/1141032633074208808/download.jpg');
        setupEmbed.setDescription('> - 🔓| Destek Talebi açmak için size en uygun seçeneği seçiniz. \n > \n > - ⛔️| birden fazla talep açmak, talepleri rahatsız etmek, amacı dışında kullanmak **yasaktır.**');
        setupEmbed.setImage('https://cdn.discordapp.com/attachments/1112309371825815582/1160134082668265582/standard.gif?ex=65338e0f&is=6521190f&hm=f29ded7e0cff8ecab474dc0f6cdab6b3d270b13d419d41bb6d144fccdebad82c&');

        const selectMenu = new MessageSelectMenu();
        selectMenu.setCustomId('createTicket');
        selectMenu.setPlaceholder('Talep Açmak İçin Size En Uygun Seçeneği Seçin');
        selectMenu.addOptions([
            {
                emoji: '🧰',
                label: 'Destek',
                description: 'Destek talebi açmak için tıkla',
                value: 'newTicket_destek'
            },
            {
                emoji: '📦',
                label: 'sipariş',
                description: 'Sipariş vermek için tıkla',
                value: 'newTicket_siparis'
            },
            {
                emoji: '♻️',
                label: 'Iade',
                description: 'Iade talebi oluşturmak için tıkla',
                value: 'newTicket_iade'
            },
            {
                emoji: '📰',
                label: 'Yetkili Başvuru',
                description: 'Yetkili başvuru talebi oluşturmak için tıkla',
                value: 'newTicket_yetkilialim'
            },
            {
                emoji: '🎉',
                label: 'Reklam & işbirliği',
                description: 'işbirliği talebi oluşturmak için tıkla',
                value: 'newTicket_isbirligi'
            },
            {
                emoji: '❓',
                label: 'Özel Üyelik',
                description: 'yakında..',
                value: 'w'
            },

        ]);

        const row = new MessageActionRow().addComponents(selectMenu);

        message.channel.send({ embeds: [setupEmbed], components: [row] });
    },
};
