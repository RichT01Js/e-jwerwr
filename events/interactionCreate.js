const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

// Kullanıcıların açtığı talepleri depolamak için bir Map oluşturuyoruz.
const userTickets = new Map();
const talepYetkilisiRolId = '1159849182350282753';

// Belirli bir sunucudaki aktif destek taleplerini saymak için kullanılacak fonksiyon
async function getActiveTicketsInGuild(guild) {
    let activeTicketCount = 0;

    // Sunucunuzdaki destek talebi kanallarını alın
    const ticketChannels = guild.channels.cache.filter(channel => channel.name.startsWith('destek-') && channel.type === 'GUILD_TEXT');

    // Her talep kanalını kontrol edin ve aktifse sayacı artırın
    for (const channel of ticketChannels.values()) {
        // Burada bir kontrol yaparak, kanalın aktif olduğunu belirleyin (örneğin bir mesaj kontrolü yapabilirsiniz)
        // Örnek olarak, bir mesajın varlığını kontrol edebilirsiniz:
        const messages = await channel.messages.fetch();
        if (messages.size > 0) {
            activeTicketCount++;
        }
    }

    return activeTicketCount;
}

module.exports = async (client, int) => {
    const req = int.customId.split('_')[0];

    client.emit('ticketsLogs', req, int.guild, int.member.user);

    switch (req) {
        case 'createTicket': {
            // Kullanıcının açık talebi var mı kontrol ediyoruz.
            if (userTickets.get(int.member.id)) {
                return int.reply({ content: 'Zaten açık bir talebiniz bulunuyor. Önce açık olan talebi kapatmalısınız.', ephemeral: true });
            }

            const ticketType = int.customId.split('_')[1]; // ticketType'i doğru şekilde alın.

            let channel = int.guild.channels.cache.find(x => x.name === `destek-${int.member.user.username}`);

            // Kullanıcı yeni bir talep açtığından, userTickets haritasına kullanıcı ID'sini ve talep türünü ekliyoruz.
            userTickets.set(int.member.id, ticketType);

            if (!channel) {
                channel = await int.guild.channels.create(`destek-${int.member.user.username}`, {
                    type: 'GUILD_TEXT',
                    topic: `wwww`,
                    permissionOverwrites: [
                        {
                            id: int.guild.id,
                            deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                        },
                        {
                            id: int.member.id,
                            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                        },
                        {
                            id: client.user.id,
                            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                        },
                        {
                            id: talepYetkilisiRolId, // Talep yetkilisi rolünün ID'si
                            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                        }
                    ]
                });

                const talepYetkilisi = int.guild.members.cache.filter(member => member.roles.cache.has(talepYetkilisiRolId));
                const talepYetkilisiMention = talepYetkilisi.map(member => `<@${member.id}>`).join(', ');

                await channel.send(`<@&${talepYetkilisiRolId}>\n<@${int.member.id}> Destek talebiniz başarıyla açıldı.`)

                const ticketEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setAuthor(`Merhaba, ${int.member.user.username}!`)
                    .setDescription('Destek sistemini amacı dışında kullanmak, trollemek, birden fazla destek talebi açmak yasaktır.');

                const closeButton = new MessageButton()
                    .setStyle('DANGER')
                    .setLabel('Talebi Sonlandır')
                    .setCustomId(`closeTicket_${int.member.id}`);

                const row = new MessageActionRow().addComponents(closeButton);

                await channel.send({ embeds: [ticketEmbed], components: [row] });

                return int.reply({ content: `Yeni bir talep açıldı! ${channel}`, components: [], ephemeral: true });
            } else {
                return int.reply({ content: `Zaten bir destek talebi açmışsınız. ${channel} ❌`, components: [], ephemeral: true });
            }
        }

        case 'closeTicket': {
            // Sadece talep yetkilisi rolüne sahip olan kişilerin talebi kapatabilmesini sağlamak için kontrol ekleyin.
            if (!int.member.roles.cache.has(talepYetkilisiRolId)) {
                return int.reply({ content: 'Bu işlemi gerçekleştirmek için gerekli yetkiye sahip değilsiniz.', ephemeral: true });
            }

            // Kanalı silmeye çalışmadan önce, kanalın varlığını kontrol edin.
            const channel = int.guild.channels.cache.find(x => x.name === `destek-${int.member.user.username}`);

            if (!channel) {
                // Kanal bulunamadıysa hiçbir hata mesajı göndermeden işlemi iptal edebiliriz.
                return;
            }

            // Kullanıcıya talebi silmek istediğinden emin olup olmadığını sormak için bir mesaj gönderiyoruz.
            const confirmEmbed = new MessageEmbed()
                .setColor('RED')
                .setDescription('Talebi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')
                .setFooter('Silme işlemini onaylamak için 30 saniye içinde tepki verin.');

            const confirmButton = new MessageButton()
                .setCustomId(`confirmDelete_${channel.id}`) // Kanalın ID'sini burada kullanın
                .setStyle('DANGER')
                .setLabel('Silme İşlemini Onayla');

            const row = new MessageActionRow().addComponents(confirmButton);

            await int.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

            const filter = (i) => i.user.id === int.member.user.id && i.customId === `confirmDelete_${channel.id}`; // Kanalın ID'sini burada da kullanın
            const collector = int.channel.createMessageComponentCollector({ filter, time: 30000, max: 1 });

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    // Kullanıcı zamanında yanıt vermedi.
                    return int.followUp({ content: 'Talep silme işlemi iptal edildi.', ephemeral: true });
                }

                // Kullanıcı onay verdi, talebi silme işlemini gerçekleştiriyoruz.
                try {
                    await channel.delete();
                    userTickets.delete(int.member.id); // Kullanıcının talebini haritadan da siliyoruz.

                    return int.followUp({ content: 'Talep başarıyla silindi.', ephemeral: true });
                } catch (error) {
                    console.error('Talebi silerken bir hata oluştu:', error);
                    return int.followUp({ content: 'Talep silinirken bir hata oluştu.', ephemeral: true });
                }
            });
        }

        default:
            break;
    }
};
