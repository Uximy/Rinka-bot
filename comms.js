const config = require('./Config/config.json');
const Discord = require('discord.js');
const robot = new Discord.Client();
const Channels = require('./Config/channels.json');
const regexYoutubeLink = /^((http|https)\:\/\/)?(www\.youtube\.com|youtu\.?be)\/((watch\?v=)?([a-zA-Z0-9\w].*))(&.*)*$/; //? Old Regex "/(http|https):\/\/(\w:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;"
const regexDeleteabchannel = /[\?|&](start_radio=|index=)(.*)[0-9]\&.*|&ab_channel=.*/ // /(&.*)*$/;
const regexSpotifyLink = /^(?:spotify:|https:\/\/[a-z]+\.spotify\.com\/(track\/|user\/(.*)\/playlist\/))(.*)$/;
const playerU = require('play-dl');
const args_url = [];
const emojis = robot.emojis.cache.get("813422124463161405");
const gm = require('gm');
let request = require('request');
const imgbbUploader = require("imgbb-uploader");
const randomColor = require('randomcolor');
const dispatcher = robot.voice.createBroadcast();

//? список функции

function clearMessage(robot, mess, args){
  try{
    if(mess.member.roles.cache.get(config.roledeveloper)){
      const arggs = mess.content.split(' ').slice(1); // Все аргументы за именем команды с префиксом
      const amount = arggs.join(' '); // Количество сообщений, которые должны быть удалены
      if (!amount) return mess.channel.send('Вы не указали, сколько сообщений нужно удалить!'); // Проверка, задан ли параметр количества
      if (isNaN(amount)) return mess.channel.send('Это не число!'); // Проверка, является ли числом ввод пользователя 
      if (amount > 100) return mess.channel.send('Вы не можете удалить 100 сообщений за раз'); // Проверка, является ли ввод пользователя числом больше 100
      if (amount < 1) return mess.channel.send('Вы должны ввести число больше чем 1'); // Проверка, является ли ввод пользователя числом меньше 1
        
      async function delete_messages() { // Объявление асинхронной функции
        await mess.channel.messages.fetch({
          limit: amount
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
  catch(error){
    console.error(error.message);
    mess.channel.send("У меня ошибка!");
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
  }catch(error){
    console.error(error.message);
    mess.channel.send("У меня ошибка!")
  }
  
}

function info_channels(robot, mess, args) {
  try {
    if(mess.member.roles.cache.get(config.roledeveloper)){
      const guild = robot.guilds.cache.get("809499536702570566");
      const arr = Object.values(Channels.channels);
      var result = [];
      const category = robot.channels.cache.find(ct => ct.name.startsWith("📊 Статистика Канала"));
      
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
    }else{
        mess.channel.send(`У вас нету прав для использование этой команды! ${emojis}`)
      }
  } catch (error) {
    console.error(error.message);
  }
}

//? Music catrgory

async function play(robot, mess, args) {
  args_url.length == 1 ? args_url.splice(0, 1, args[1]) : args_url.push(args[1])
  const voiceChannel = mess.member.voice.channel;
  const guild = robot.guilds.cache.get("809499536702570566");
  const emojSpotify = guild.emojis.cache.find(em => em.name.startsWith('Spotify'));
  const emojYouTube = guild.emojis.cache.find(em => em.name.startsWith('Youtube'));
  const emojServers = guild.emojis.cache.find(em => em.name.startsWith('Servers')); 
  if(!emojServers) return guild.emojis.create('./img/Servers.png', 'Servers');
  if(!args[1].length) return mess.channel.send(`⛔ [Ошибка]: Вам нужно отправить ссылку музыки из сервиса ${emojYouTube}YouTube/${emojSpotify}Spotify или Названия песни!`);
  try {
    const validURLYoutube = (str) =>{
      if(!regexYoutubeLink.test(str)){
        return false;
      }else{
        return true;
      }
    }
    //! Plays the link YouTube
    if (validURLYoutube(args[1])) {
      if(!emojYouTube) return guild.emojis.create('./img/YouTube_Emoji.png', 'Youtube')
      const videoFinder = async (query) => {
        const newQuery = query.replace(regexDeleteabchannel, '');
        const videoResult = await playerU.search(newQuery, {fuzzy: true}); 
        return videoResult[0]
      }

      const playlistFinder = async (query) => {
        const newQuery = query.replace(regexDeleteabchannel, '');
        const videoResult2 = await playerU.playlist_info(newQuery, { incomplete: true,  });
        const PlayList = [];
        for (let i = 0; i < videoResult2.videos.length; i++) {
          PlayList.push({
            name: videoResult2.videos[i].title,
            link: videoResult2.videos[i].url,
            time: videoResult2.videos[i].durationRaw,
            livebool: videoResult2.videos[i].durationRaw == '0:00' ? true : false
          });
        }
        return PlayList;
      }
      const video = await videoFinder(args[1]);
      let count = 0;
      if(video == null){
        mess.channel.send('⚠ [Предупреждение]: Результат поиска не найдены!');
      }else{
        var stream = (await playerU.stream(video.url, {quality: 2})).stream;
        //! Stream - это переменная как dispatcher, с помощью неё можно реализовать pause и skip
        const connection = await voiceChannel.join();
        function sendMessage() {
          gm(request(video.thumbnails[0].url))
            .draw(['image Over 5,10,120,50 "img/youtube.png"']) // youtube img
            .resizeExact('640', '360')
            .autoOrient()
            .noProfile()
            .write("img/musicImgYoutube.png", function(err){
              if (err){
                return console.log(err.message);
              }
              imgbbUploader("23f5d3136302ce349c121d669e92b56e", "img/musicImgYoutube.png")
                .then(response => {
                  const block = new Discord.MessageEmbed()
                  .setColor(randomColor({luminosity: 'light', hue: 'random'}))
                  .setDescription(`
                  :musical_note: Сейчас играет: **[${video.title}](${video.url})**,
                  ${emojServers} Играет с сервиса: ${emojYouTube},
                  :man_detective: Добавил: **${mess.author}**,
                  :alarm_clock: Время песни: ${video.live == true ? ":infinity:" : video.durationRaw}
                  `)
                  .setAuthor(`Автор видео: ${video.channel.name}`, video.channel.icons[0].url, video.channel.url)
                  
                  .setFooter(`Музыка на канале: ${connection.channel.name}`)
                  .setThumbnail(response.display_url)
                  
                  mess.channel.send(block);
                  connection.play(stream, {quality: 'highestaudio', highWaterMark: 1 << 25})
                })
            })
        }
        return args_url, sendMessage()
      }
    }
    else{
      //! Plays the text Music
      const connection = await voiceChannel.join();
      const videoFinder = async (query) => {
        const videoResult = await playerU.search(query.replace(args[0], ''), {limit: 1, fuzzy: true});
        return videoResult[0];
      }
      const video = await videoFinder(args.join(' '));
      if (video == null) {
        mess.channel.send("⚠ [Предупреждение]: Результаты поиска не найдены!");
      }else{
        const stream = (await playerU.stream(video.url, {quality: 2})).stream;
        connection.play(stream, {seek: 0, volume: 1, quality: 'highestaudio', highWaterMark: 1 << 25});
        // .on('finish', () => {});

        const block = new Discord.MessageEmbed()
          .setColor(randomColor({luminosity: 'light', hue: 'random'}))
          .setDescription(`
          :musical_note: Сейчас играет: **[${video.title}](${video.url})**,
          :man_detective: Добавил: **${mess.author}**,
          :alarm_clock: Время песни: ${video.live == true ? ":infinity:" : video.durationRaw}
          `)
          .setAuthor(`Автор видео: ${video.channel.name}`, video.channel.icons[0].url, video.channel.url)
          .setFooter(`Музыка на канале: ${connection.channel.name}`)
          .setThumbnail(video.thumbnails[0].url);

          mess.channel.send(block);
      }
    }

    
    const validURLSpotify = (str) =>{
      if (!regexSpotifyLink.test(str)) {
        return false;
      } else {
        return true;
      }
    }

    //! Plays the link Spotify
    if (validURLSpotify(args[1])) {
      if (!voiceChannel) return mess.channel.send("⛔ [Ошибка]: Для выполнения этой команды вы должны находиться в канале где находится бот!");
      if(!emojSpotify) return guild.emojis.create('./img/Spotify_Emoji.png', 'Spotify')
      if(playerU.is_expired()){
        await playerU.refreshToken()
      }
      
      let sp_data = await playerU.spotify(args[1]);
      let searched = await playerU.search(`${sp_data.artists[0].name} - ${sp_data.name}`, {limit: 1});
      if (searched == null) return mess.channel.send('⚠ [Предупреждение]: Результат поиска не найдены!');
      const player = (await playerU.stream(searched[0].url, {quality: 2})).stream
      const connection = await voiceChannel.join();
      
      function sendMessage() {
        gm(request(sp_data.thumbnail.url))
          .draw(['image Over 0,15,195,74 "img/spotify.png"']) // spotify img
          .resizeExact('406', '406')
          .write("img/musicImgSpotify.png", function(err){
            if (err){
              return console.log(err.message);
            }
            imgbbUploader("23f5d3136302ce349c121d669e92b56e", "img/musicImgSpotify.png")
              .then((response) => {
                const block = new Discord.MessageEmbed()
                .setColor(randomColor({luminosity: 'light', hue: 'random'}))
                .setDescription(`
                :musical_note: Сейчас играет: **[${searched[0].title}](${sp_data.url})**,
                ${emojServers} Играет с сервиса: ${emojSpotify},
                :man_detective: Добавил: **${mess.author}**,
                :alarm_clock: Время песни: ${searched[0].durationRaw}
                `)
                .setAuthor(`Автор музыки: ${searched[0].channel.name}`, searched[0].channel.icons[0].url, searched[0].channel.url)
                .setFooter(`Музыка на канале: ${connection.channel.name}`)
                .setThumbnail(response.url);
                
                mess.channel.send(block);
                connection.play(player, {seek: 0, volume: 1, quality: 'highestaudio', highWaterMark: 1 << 25});
                
              });
          });
      }
      return sendMessage()
    }

  } catch (error) {
    if (!voiceChannel) return mess.channel.send("⛔ [Ошибка]: Для выполнения этой команды вы должны находиться в любом голосов канале!");
    const permissions = voiceChannel.permissionsFor(mess.client.user);
    if (!permissions.has('CONNECT')) return mess.channel.send("⚠ [Предупреждение]: У меня нет право присоединяться к голосовому каналу!");
    if (!permissions.has('SPEAK')) return mess.channel.send("⚠ [Предупреждение]: У меня нет право говорить на данном голосовом канале!");
    console.error('Причина ошибки: ' + error);
    mess.channel.send("⛔ [Ошибка]: Не возможно воспроизвести данную музыку, возможно вы ввели битую ссылкую.");
  }
}

async function pause(robot, mess, args) {
  try {
    (await playerU.stream(args_url[0], {quality: 2})).pause
  } catch (error) {
    const voiceChannel = mess.member.voice.channel;
    if (!voiceChannel) return mess.channel.send("⛔ [Ошибка]: Для выполнения этой команды вы должны находиться в любом голосов канале!");
    console.error(error.message);
  }
}

async function resume(robot, mess, args) {
  try {
    const voiceChannel = mess.member.voice.channel;
    (await playerU.stream()).resume;
  } catch (error) {
    const voiceChannel = mess.member.voice.channel;
    if (!voiceChannel) return mess.channel.send("⛔ [Ошибка]: Для выполнения этой команды вы должны находиться в любом голосов канале!");
    console.error(error.message);
  }
}

async function skip(robot, mess, args) {
  try {
    const voiceChannel = mess.member.voice.channel;
    if (!voiceChannel) return mess.channel.send("⛔ [Ошибка]: Для выполнения этой команды вы должны находиться в канале где находится бот!");
  } catch (error) {
    console.error(error.message);
  }
}

var comms_list = [
  //? Settings category
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

  //? Music category
  {
    name: "play",
    out: play
  }//,
  // {
  //   name: "pause",
  //   out: pause
  // },
  // {
  //   name: "resume",
  //   out: resume
  // },
  // {
  //   name: "skip",
  //   out: skip
  // }
];

module.exports.comms = comms_list;