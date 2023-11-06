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

client.on('messageCreate', async message => {
  if (message.content.startsWith(`${prefix}block`)) {
    const args = message.content.split(' ');
    if (args.length >= 3) {
      const targetUser = message.mentions.users.first();
      if (targetUser) {
        const reason = args.slice(2).join(' ');
        message.reply(`Du hast ${targetUser.tag} erfolgreich blockiert. Grund: ${reason}`);
      } else {
        message.reply('Du musst einen Benutzer mit "@" erwähnen.');
      }
    } else {
      message.reply('Falsche Verwendung des Befehls. Verwende: !block @username grund');
    }
  } else if (!blockedUsers.has(message.author.id)) {
    if (message.channel.name && message.channel.name.includes('global') && !message.author.bot) {
      if (!cooldown.has(message.author.id)) {
        if (message.content.includes('@')) {
          await message.delete().catch(console.error);
        } else {
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
                const codeBlock = "\n" + message.content + "";
                const combinedMessage = `${codeBlock}\n[Invite me](https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot)・[Support](https://discord.gg/YOUR_DISCORD_SERVER)`;
                const embed = new MessageEmbed()
                  .setColor('#0099ff')
                  .setAuthor(`${message.guild.name} - ${message.author.tag}`, message.guild.iconURL())
                  .setDescription(combinedMessage);

                globalChatChannel.send({ embeds: [embed] });
              }
            }
          });
        }
      }
    }
  }
});

client.on('messageCreate', message => {
  if (message.content.startsWith(`${prefix}help`)) {
    message.reply('Der Kanal muss den Namen "global chat" (unabhängig von anderen Wörtern im Namen) enthalten, damit der Bot funktioniert.');
  }
});

const blockedUsers = new Map();

client.on('messageCreate', async message => {
  if (message.content.startsWith(`${prefix}block`)) {
    const args = message.content.split(' ');
    if (args.length >= 3) {
      const targetUser = message.mentions.users.first();
      if (targetUser) {
        const reason = args.slice(2).join(' ');
        blockedUsers.set(targetUser.id, reason);
        message.reply(`Du hast ${targetUser.tag} erfolgreich blockiert. Grund: ${reason}`);
      } else {
        message.reply('Du musst einen Benutzer mit "@" erwähnen.');
      }
    } else {
      message.reply('Falsche Verwendung des Befehls. Verwende: !block @username grund');
    }
  }
});

const token = 'DEIN_BOT_TOKEN';
client.login(token);
