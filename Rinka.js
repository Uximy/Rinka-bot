const Discord = require('discord.js');
const robot = new Discord.Client();
const comms = require("./comms.js");
let config = require('./Config/config.json');
const Channels = require('./Config/channels.json');
const randomColor = require('randomcolor');
const playerU = require('play-dl');

const reload = function Reloadchannelname(guild) {
  const arr = Object.values(Channels.channels);
  var result = [];
  const channel_info = null;
  const category = [];
  
  for (let i = 0; i < arr.length; i++) {
    result.push(arr[i].Name);
  }
  for (const value in Channels.channels) {
    category.push(value);
  }

  try {
    for (let i = 0; i < result.length; i++) {
      const channel_info = robot.channels.cache.find(chnl => chnl.name.startsWith(result[i]));
      channel_info.setName(`${Channels.channels[category[i]].Name} ${eval(Channels.channels[category[i]].count_users)}`);
    }
  } catch (error) {
    console.error(error);
  }

}

robot.on("ready", () =>{
  robot.user.setPresence({
    status: config.activity.PresenceStatus,
    activity: {
      name: config.prefix + 'help',
      type: config.activity.typestatus,
    }
  });
  console.log(`Бот ${robot.user.username} готов(-ва) к работе! 🕵`);
  console.log(`Статус бота ${robot.user.username} на данный момент: ${robot.user.presence.status}`);
  playerU.setToken({
    spotify: {
      client_id: 'e9c14b2b086f4ded90836d4f2a9978a7',
      client_secret: '528f219bbc274475af755cc3c080401b',
      refresh_token: 'AQAXZL5zYc6BK_VAXS9p8TrYBJHHnoUIkzevcIYV95aDv2kPiuTBsVJOmwHY5E8Rs294eT5HZeO3kKAa0BS2O5gR36f7D33LZJKILvut-dE88zyMmztJT_0B1NZ0C2vC1ng',
      market: 'KZ'
    }
  })
  const guild = robot.guilds.cache.get("809499536702570566");
  const emojSpotify = guild.emojis.cache.find(em => em.name.startsWith('Spotify'));
  const emojYouTube = guild.emojis.cache.find(em => em.name.startsWith('Youtube'));
  const emojServers = guild.emojis.cache.find(em => em.name.startsWith('Servers'));
  if(!emojSpotify) return guild.emojis.create('./img/Spotify_Emoji.png', 'Spotify')
  if(!emojYouTube) return guild.emojis.create('./img/YouTube_Emoji.png', 'Youtube')   
  if(!emojServers) return guild.emojis.create('./img/Servers.png', 'Servers')
  setInterval(reload, 600000, guild);
});


robot.on("reconnecting", () => {
  console.log(`Бот ${robot.user.username} реконектится! 🔨`);
  console.log(`Статус бота ${robot.user.username} на данный момент: ${robot.user.presence.status}`);
});
robot.on("disconnect", () => {
  console.log(`Бот ${robot.user.username} отключился! 💀`);
  console.log(`Статус бота ${robot.user.username} на данный момент: ${robot.user.presence.status}`);
});

robot.on('message', (msg) => {
  if (msg.author.username != robot.user.username && msg.author.discriminator != robot.user.discriminator) {
    var comm = msg.content.trim() + " ";
    var comm_name = comm.slice(0, comm.indexOf(" "));
    var messArr = comm.split(" ");
    for (comm_count in comms.comms) {
      var comm2 = config.prefix + comms.comms[comm_count].name;
      if (comm2 == comm_name) {
        comms.comms[comm_count].out(robot, msg, messArr);
      }
    }
  }
});

robot.on('guildMemberAdd', async (member) => {
  try {
    const block = new Discord.MessageEmbed()
      .setColor(randomColor({luminosity: 'light', hue: 'random'}))
      .setTitle(
        `${member.displayName} добро пожаловать на сервер ${member.guild.name}`,
      )
      .setDescription(`Рофлодарова, Дружочек-пирожочек, заходи и выбирай роль в ${robot.channels.cache.get(config.role_channel)}`,)
      .setThumbnail(member.user.displayAvatarURL());
    member.roles.add(member.guild.roles.cache.get(config.userRole));

    const channel = await robot.channels.fetch(config.glav_channel);
    channel.send(member.user, block);

    setTimeout(Reloadchannelname, 600000, member);
  } catch (err) {
    console.log(`[ERROR]: ${err}`);
  }
});
robot.on('guildMemberRemove', async (member) => {
  try{
    const channel = await robot.channels.fetch(config.glav_channel);
    channel.send(`${member.user.username} покинул(-а) наше игровое сообщество... :'(`);
    setTimeout(Reloadchannelname, 600000, member);
  }catch(err){
    console.log(`[ERROR] ${err}`)
  }
})

robot.on('message', function(msg) {
  msg.content = msg.content.toLowerCase();
  if(msg.content.includes(`discord.gg`) && !(checkRole(msg.member))) {
    msg.delete();
  }
});

function checkRole(member) 
{
  for(let i = 0; i <= config.roleImmunityId.length; i++) 
  {
    if(member.roles.cache.get(config.roleImmunityId[i])) return 1;
  }
  return 0;
}

robot.login(config.token);
