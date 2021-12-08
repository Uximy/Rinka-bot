const Discord = require('discord.js');
const robot = new Discord.Client();
const comms = require("./comms.js");
const config = require('./Config/config.json');
const Channels = require('./Config/channels.json');
var randomColor = require('randomcolor');


function Reloadchannelname(guild) {
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

  function reload() {
    for (let i = 0; i < result.length; i++) {
      const channel_info = robot.channels.cache.find(chnl => chnl.name.startsWith(result[i]));
      channel_info.setName(`${Channels.channels[category[i]].Name} ${eval(Channels.channels[category[i]].count_users)}`)
      .then(console.log("Работает раз в 10 минут!!!!!"));
    }
  }

  setTimeout(reload, 8000);
}

robot.on("ready", () =>{
  robot.user.setPresence({
    activity: {
      name: config.status,
      type: config.typestatus,
    },
    status: "dnd"
  });
  console.log(`Бот ${robot.user.username} готов(-ва) к работе!`);
  console.log(`Статус бота ${robot.user.username} на данный момент: ${robot.user.presence.status}`);

  const guild = robot.guilds.cache.get("809499536702570566");

  setInterval(Reloadchannelname, 600000, guild);
});
robot.on("reconnecting", () => {
  console.log(`Бот ${robot.user.username} реконектится!`);
  console.log(`Статус бота ${robot.user.username} на данный момент: ${robot.user.presence.status}`);
});
robot.on("disconnect", () => {
  console.log(`Бот ${robot.user.username} отключился!`);
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
  for(let i = 0; i < config.roleImmunityId.length; i++) 
  {
      if(member.roles.cache.get(config.roleImmunityId[i])) return 1;
  }
  return 0;
}



robot.login(config.token);

