const { Permissions, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

module.exports = {
  name: "ban",
  description: "Bu komut birini yasaklar",
  category: "moderasyon",
  example: ["!ban @üye"],
  execute: async (client, message, args) => {
    try {
      const member = message.mentions.members.first();
      const permission = message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS);

      if (!permission)
        return message.reply({ 
          content: "Bi sen akıllısın zaten amk"
        }).then(msg => setTimeout(() => msg.delete(), 5000));

      if (!args[0]) return message.reply({ content: `@ETİKET` }).then(msg => setTimeout(() => msg.delete(), 5000));

      if (!member) return message.reply({ content: `Bulamadım` }).then(msg => setTimeout(() => msg.delete(), 5000));

      if (member.id === message.author.id)
        return message.reply({ content: `Yapma` }).then(msg => setTimeout(() => msg.delete(), 5000));

      if (message.member.roles.highest.position < member.roles.highest.position)
        return message.reply({
          content: `banlıyorum şuan bak banlıyom bak banladım hopppaa`
        }).then(msg => setTimeout(() => msg.delete(), 5000));

      if (!member.bannable) return message.reply({ content: `yapamam` }).then(msg => setTimeout(() => msg.delete(), 5000));

      const banReason = args.slice(1).join(' ');

      if (!banReason) return message.reply({ content: `Sebep Belirt` }).then(msg => setTimeout(() => msg.delete(), 5000));

      const embed = new MessageEmbed()
        .setColor("#10f700")
        .setDescription(`\n> - ${member} adlı kullanıcı **${banReason}** sebebiyle sunucudan engellenecek.\n> - bu kullanıcıyı sunucudan engellemek istediğine emin misin?`);

      const confirmButton = new MessageButton()
        .setCustomId('confirm')
        .setLabel('Siktiri Çek ✅')
        .setStyle('SUCCESS');

      const denyButton = new MessageButton()
        .setCustomId('deny')
        .setLabel('Affet ⛔️')
        .setStyle('DANGER');

      const actionRow = new MessageActionRow()
        .addComponents(confirmButton, denyButton);

      const msg = await message.channel.send({ embeds: [embed], components: [actionRow] });

      const filter = (interaction) => interaction.user.id === message.author.id;
      const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

      collector.on('collect', (interaction) => {
        if (interaction.customId === 'confirm') {
          member.ban({ reason: banReason })
            .then(() => {
              const successEmbed = new MessageEmbed()
                .setColor("RED")
                .setDescription(`${member} sunucudan **${banReason}** sebebiyle **SINIRSIZ(perma)** süre boyunca engellendi.`);
              
              interaction.update({ embeds: [successEmbed], components: [] });
            })
            .catch((error) => {
              const errorEmbed = new MessageEmbed()
                .setColor("RED")
                .setDescription(`Hata: ${error.message}`);

              interaction.update({ embeds: [errorEmbed], components: [] });
              setTimeout(() => msg.delete(), 5000);
            });
        } else if (interaction.customId === 'deny') {
          const cancelEmbed = new MessageEmbed()
            .setColor("RED")
            .setDescription(`Bu seferlik acıdım hadi *(sunucudan uzaklaştırma işlemi iptal edildi)*`);
          
          interaction.update({ embeds: [cancelEmbed], components: [] });
        }
      });

      collector.on('end', () => {
        const timeoutEmbed = new MessageEmbed()
          .setColor("RED")
          .setDescription(`Göte Mukayyet Allaha Emanet`);
        
        msg.edit({ embeds: [timeoutEmbed], components: [] });
        setTimeout(() => msg.delete(), 5000);
      });
    } catch (err) {
      message.reply({ content: `Üzgünüm, bir hata oluştu: ${err}` });
    }
  },
};
