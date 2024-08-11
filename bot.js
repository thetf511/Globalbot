const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const prefix = '!';
const cooldown = new Set();
const cooldownTime = 5000; 

client.once('ready', () => {
  console.log(`Eingeloggt als ${client.user.tag}`);

  updateStatus();

  setInterval(() => {
    updateStatus();
  }, 5 * 60 * 1000);
});

function updateStatus() {
  const activities = [
    { name: 'Global', type: 'PLAYING' },
    { name: `auf ${client.guilds.cache.size} Servern`, type: 'WATCHING' }
  ];

  const randomActivity = activities[Math.floor(Math.random() * activities.length)];

  client.user.setActivity(randomActivity.name, { type: randomActivity.type });
}

const blockedUsers = new Map();

client.on('messageCreate', async message => {
  if (message.content.startsWith('!block')) {
    const args = message.content.split(' ');
    if (args.length >= 3) {
      const userID = args[1];
      const reason = args.slice(2).join(' ');
      blockedUsers.set(userID, reason);
      message.channel.send(`Der Benutzer mit der ID ${userID} wurde erfolgreich blockiert. Grund: ${reason}`);
    } else {
      message.channel.send('Falsche Verwendung des Befehls. Verwende: !block <UserID> <Grund>');
    }
  }

  if (message.content === '!blocklist') {
    if (blockedUsers.size > 0) {
      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Liste der blockierten Benutzer');
      
      blockedUsers.forEach((reason, userID) => {
        embed.addField(`UserID: ${userID}`, `Grund: ${reason}`);
      });

      message.channel.send({ embeds: [embed] });
    } else {
      message.channel.send('Keine blockierten Benutzer gefunden.');
    }
  }

  if (blockedUsers.has(message.author.id)) {
    message.delete();
    return;
  }

  if (!message.author.bot && message.channel.name && message.channel.name.toLowerCase().includes('global')) {
    if (message.content.trim() !== '' || message.attachments.size > 0 || message.stickers.size > 0) {
      const cleanedContent = message.cleanContent; 
      const combinedMessage = `${cleanedContent}\n[Invite me](https://discord.com/api/oauth2/authorize?client_id=1141889300330455080&permissions=8&scope=bot)・[Support](https://discord.gg/5cCAVMV6Me)`;

      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(`${message.guild.name} - ${message.author.tag}`, message.guild.iconURL())
        .setDescription(combinedMessage)
        .setFooter(`User ID: ${message.author.id}`);

      if (message.attachments.size > 0) {
        const attachment = message.attachments.first();
        embed.setImage(attachment.url);
      }

      if (message.stickers.size > 0) {
        const sticker = message.stickers.first();
        embed.setImage(sticker.url);
      }

      const globalChatChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase().includes('global'));
      if (globalChatChannel) {
        const sentMessage = await globalChatChannel.send({ embeds: [embed] });

        message.delete().catch(console.error);
      }
    }
  }

  if (!blockedUsers.has(message.author.id)) {
    if (message.channel.name && message.channel.name.includes('global') && !message.author.bot) {
      if (!cooldown.has(message.author.id)) {
        cooldown.add(message.author.id);

        setTimeout(() => {
          cooldown.delete(message.author.id);
        }, cooldownTime);

        client.guilds.cache.forEach(guild => {
          if (guild.id !== message.guild.id) {
            const globalChatChannel = guild.channels.cache.find(
              channel => channel.name && channel.name.includes('global') && channel.type === 'GUILD_TEXT'
            );

            if (globalChatChannel) {
              const cleanedContent = message.cleanContent; 
              const combinedMessage = `${cleanedContent}\n[Invite me](https://discord.com/api/oauth2/authorize?client_id=1141889300330455080&permissions=8&scope=bot)・[Support](https://discord.gg/5cCAVMV6Me)`;
              const embed = new MessageEmbed()
                .setColor('#3498db')
                .setAuthor(`${message.guild.name} - ${message.author.tag}`, message.guild.iconURL())
                .setDescription(`**Nachricht von ${message.author.tag}:**\n${cleanedContent}`)
                .setFooter(`User ID: ${message.author.id}`);
                

              if (message.attachments.size > 0) {
                const attachment = message.attachments.first();
                embed.setImage(attachment.url);
              }

              if (message.stickers.size > 0) {
                const sticker = message.stickers.first();
                embed.setImage(sticker.url);
              }

              globalChatChannel.send({ embeds: [embed] });
            }
          }
        });
      }
    }
  }
});

client.on('messageCreate', message => {
  if (message.content.startsWith(`${prefix}help`)) {
    message.reply('**Bot dont Have Commands**In order for the bot to work, you need a channel that has a global name, the messages will be sent to every server on which the bot is in the channel with a global name. If problems occur, please come to the support server immediately and open a ticket');
  }
});


const token = '';
client.login(token);
