const config = require('./Config/config.json');
const Discord = require('discord.js');
const robot = new Discord.Client();
const Channels = require('./Config/channels.json');
const re = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;


const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');


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
  const category = robot.channels.cache.find(ct => ct.name.startsWith("📊 Статистика Канала"));
  const guild = robot.guilds.cache.get("809499536702570566");

  
  for (let i = 0; i < arr.length; i++) {
    result.push(arr[i].Name);
  }

  function channels() {
    if (eval("for (let i = 0; i < result.length; i++) {robot.channels.cache.find(chnl => chnl.name.startsWith(result[i]))}")) {
      mess.channel.send("⛔ [Ошибка]: Данные каналы уже существуют!");
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
          parent: robot.channels.cache.find(ct => ct.name.startsWith("📊 Статистика Канала")).id,
        })
        .catch(console.error);
      }
      mess.channel.send("⚠ [Уведомление]: Обновления статистики будет происходить каждый 10 минут!");
    }
  }

  if (category) {
    channels();
  }else{
    mess.guild.channels.create("📊 Статистика Канала",{
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

//Music catrgory

async function play(robot, mess, args) {
  try {
    const voiceChannel = mess.member.voice.channel;
    const permissions = voiceChannel.permissionsFor(mess.client.user);
    const randomColor = require('randomcolor');
    if (!voiceChannel) return mess.channel.send("Для выполнения этой команды вы должны находиться в канале!");
    if (!permissions.has('CONNECT')) return mess.channel.send("У вас нет правильных прав доступа!");
    if (!permissions.has('SPEAK')) return mess.channel.send("У вас нет правильных прав доступа!");
    if(!args[1].length) return mess.channel.send("Вам нужно отправить второй аргумент!");

    const validURL = (str) =>{
      var regex = /(http|https):\/\/(\w:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
      if(!regex.test(str)){
        return false;
      }else{ 
        return true;
      }
    }

    if (validURL(args[1])) {
      const videoFinder = async (query) => {
        const regex = /&[a-z]=[0-9][a-z]|&[a-z]*_[a-z]*=[A-Z, a-z, 0-9].*/gm
        const newQuery = query.replace(regex, '');
        const videoResult = await ytSearch(newQuery);

        for (let i = 0; i < videoResult.videos.length; i++) {
          if (videoResult.videos[i].url = newQuery) {
            return (videoResult.videos.length >= 1) ? videoResult.videos[i] : null;
          }
        }
      }

      // console.log(args[2]);
      const video = await videoFinder(args[1]);
      const stream = ytdl(video.url, {filter: 'audioonly'});
      const connection = await voiceChannel.join();
      connection.play(stream, {seek: 0, volume: 1, quality: 'highestaudio', highWaterMark: 1 << 25})
      .on('finish', () => {
        
      });

      const reply = `${mess.author}`;
      const block = new Discord.MessageEmbed()
      .setColor(randomColor({luminosity: 'light', hue: 'random'}))
      .setTitle(
        `Музыка от ${robot.user.username}`,
      )
      .setURL(video.url)
      .setDescription(`
      :musical_note: Сейчас играет: ***${video.title}***,
      :alarm_clock: Время песни: ${video.timestamp},
      :man_detective: Добавил: ***${mess.author.username}***
      `)
      .setAuthor(`Автор видео: ${video.author.name}`)
      .setFooter(`Музыка на канале: ${connection.channel.name}`)
      .setThumbnail(video.image);

      mess.channel.send(reply ,block);

      return
    }

    const connection = await voiceChannel.join();
    const videoFinder = async (query) => {
      const videoResult = await ytSearch(query);
      return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
    }
    const video = await videoFinder(args.join(' '));

    if (video) {
      const stream = ytdl(video.url, {filter: 'audioonly'});
      connection.play(stream, {seek: 0, volume: 1, quality: 'highestaudio', highWaterMark: 1 << 25})
      .on('finish', () => {
        
      });

      const block = new Discord.MessageEmbed()
        .setColor(randomColor({luminosity: 'light', hue: 'random'}))
        .setTitle(
          `Музыка от ${robot.user.username}`,
        )
        .setURL(video.url)
        .setDescription(`
        :musical_note: Сейчас играет: ***${video.title}***,
        :alarm_clock: Время песни: ${video.timestamp},
        :man_detective: Добавил: ***${mess.author.username}***
        `)
        .setAuthor(`Автор видео: ${video.author.name}`)
        .setFooter(`Музыка на канале: ${connection.channel.name}`)
        .setThumbnail(video.image);

        const reply = `${mess.author}`;

        mess.channel.send(reply ,block);

    }else{
      mess.channel.send("Результаты поиска не найдены!");
    }
  } catch (error) {
    console.error(error);
  }
}

async function leave(robot, mess, args) {
  try {
    const voiceChannel = mess.member.voice.channel;
  if (!voiceChannel) return mess.channel.send("Вы должны быть в голосовом канале, чтобы остановить музыку!");
  await voiceChannel.stop();
  await mess.channel.send(`${robot.user.username} Вышла(-шел) из голосового канала.`);
  } catch (error) {
    console.error(error);
  }
}

async function skip(robot, mess, args) {
    const server = mess.guild.id;
    console.log(server.dispatcher);
    if (server.dispatcher) return server.dispatcher.end();
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
    name: "setupStats",
    out: info_channels
  },


  //Music catrgory
  {
    name: "play",
    out: play
  },
  {
    name: "leave",
    out: leave
  },
  {
    name: "skip",
    out: skip
  }
];

module.exports.comms = comms_list;