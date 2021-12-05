const config = require('./Config/config.json');
const Discord = require('discord.js');
const robot = new Discord.Client();
const Channels = require('./Config/channels.json');
const re = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

//? список функции

function clearMessage(robot, mess, args){
  try{
    const emojis = robot.emojis.cache.get("813422124463161405");
    if(mess.member.roles.cache.get(config.roledeveloper)){
      const arggs = mess.content.split(' ').slice(1); // Все аргументы за именем команды с префиксом
      const amount = arggs.join(' '); // Количество сообщений, которые должны быть удалены
      if (!amount) return mess.channel.send('Вы не указали, сколько сообщений нужно удалить!'); // Проверка, задан ли параметр количества
      if (isNaN(amount)) return mess.channel.send('Это не число!'); // Проверка, является ли числом ввод пользователя 
      if (amount > 100) return mess.channel.send('Вы не можете удалить 100 сообщений за раз'); // Проверка, является ли ввод пользователя числом больше 100
      if (amount < 1) return mess.channel.send('Вы должны ввести число больше чем 1'); // Проверка, является ли ввод пользователя числом меньше 1
        
      async function delete_messages() { // Объявление асинхронной функции
        await mess.channel.messages.fetch({
              imit: amount
        }).then(messages => {
          mess.channel.bulkDelete(messages, true)
          mess.channel.send(`Удалено ${amount} сообщений!`)
        }).catch(console.error);
      }
      delete_messages(); // Вызов асинхронной функции
    }else{
      mess.channel.send(`У вас нету прав для использование этой команды! ${emojis}`)
    }
  }
  catch(e){
    console.log(`[ERROR] ${e}`)
    mess.channel.send("У меня ошибка!")
  }
 
}

function ping(robot, mess, args) {
  try{
    if(mess.member.roles.cache.get(config.roledeveloper)){
      const check = robot.emojis.cache.get('813421996184567808')
      mess.channel.send(`Проверка бота завершилась успешно! ${check}`)
    }else{
      mess.channel.send("У вас нету прав для использование этой команды!")
    }
  }catch(e){
    console.log(`[ERROR] ${e}`)
    mess.channel.send("У меня ошибка!")
  }
  
}

function info_channels(robot, mess, args) {

  const arr = Object.values(Channels.channels);

  var result = [];

  const category = robot.channels.cache.find(ct => ct.name.startsWith("📊 Статистика Канала 📊"));

  for (let i = 0; i < arr.length; i++) {
    result.push(arr[i].Name);
  }

  function channels() {
    if (eval("for (let i = 0; i < result.length; i++) {robot.channels.cache.find(chnl => chnl.name.startsWith(result[i]))}")) {
      mess.channel.send("[Ошибка]: Данные каналы уже существуют!");
    }
    else{
      for(const key in Channels.channels){
        mess.guild.channels.create(`${Channels.channels[key].Name} ${eval(Channels.channels[key].count_users)}`,{
          type: "voice",
          permissionOverwrites: [
            {
              id: mess.guild.roles.everyone,
              allow: [
              'VIEW_CHANNEL',
              'READ_MESSAGE_HISTORY'
              ],
              deny: [
              'CONNECT',
              'MANAGE_CHANNELS',
              'SPEAK'
              ]
            },
            {
              id: mess.guild.roles.cache.get(config.userRole),
              allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
              deny: ['CONNECT','MANAGE_CHANNELS','SPEAK']
            },
            {
              id: mess.guild.roles.cache.get(config.role_Rinka),
              allow: ['VIEW_CHANNEL','MANAGE_CHANNELS','READ_MESSAGE_HISTORY'],
            }
          ],
          parent: robot.channels.cache.find(ct => ct.name.startsWith("📊 Статистика Канала 📊")).id,
        })
        .catch(console.error);
      }
    }
  }

  if (category) {
    channels();
  }else{
    mess.guild.channels.create('📊 Статистика Канала 📊',{
      type: "category",
      permissionOverwrites: [
        {
          id: mess.guild.roles.everyone,
          allow: ['READ_MESSAGE_HISTORY'],
          deny: ['CONNECT', 'MANAGE_CHANNELS','SPEAK','VIEW_CHANNEL']
        }
      ],
      position: 0,
    })
    .catch(console.error)
    .then(setTimeout(channels, 390));
  }
}

//? вызов функции
var comms_list = [
  {
    name: "ping",
    out: ping
  },
  {
    name: "clear",
    out: clearMessage,
  },
  {
    name: "createStatschannels",
    out: info_channels
  }
];

module.exports.comms = comms_list;