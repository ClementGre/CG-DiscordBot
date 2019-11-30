const Listener = require('./listener.js');
const HashMap = require('hashmap');

module.exports = class UserAdder {

  constructor(users, sName, msg){
    this.users = users;
    this.sName = sName;
    this.lastMsg = msg;
    this.sTypes = [];
    this.sTime = 40;
    this.sSeasons = 1;
    this.sEp = 0;
    this.status = 0;
    this.user = msg.author;

    this.seriesTypes = new HashMap(
      'Action', '👊🏻',
      'Ados', '🙆‍♀️',
      'Comédie', '🎭',
      'Documentaire', '📚',
      'Drames', '😳',
      'Enfants', '👼',
      'Musique et comédie musicale', '🎵',
      'Humour', '😆',
      'Horreur', '😨',
      'Noël', '🎄',
      'Policier', '👥',
      'Romance', '💕',
      'SF et fantastique', '👽',
      'Stand up et talk shows', '🗣️');

    this.sendTypeMessage();
  }

  getTypeEmbed(){
    var props = '';
    for(const entry of this.seriesTypes.entries()){
      props += entry[1] + ' ' + entry[0] + '\n';
    }
    var types = '';
    for(const type of this.sTypes){
      types += this.seriesTypes.get(type) + ' ' + type + '\n';
    }

    const embed = {
      color: 16746215,
      author: {
        name: this.user.tag + " | Ajouter une série",
        icon_url: this.user.avatarURL
      },
      title: "Vous devez tout d\'abord définir le type de la série",
      fields: [
        {
          name: 'Nom de la série',
          value: this.sName,
          inline: true
        },{
          name: 'Types possibles',
          value: props
        },{
          name: 'Types choisis :',
          value: (types === '') ? 'Aucun' : types
        },{
          name: 'Commandes',
          value: '❌ Annuler\n⏭️ Suivant\nVous pouvez ajouter des types personalisés en envoyant un message sous ce format : ``<emoji> <Type de la série>``'
        }
      ],
      footer: {
        text: 'Sélexionnez des types avec les réactions',
        icon_url: client.user.avatarURL
      }
    }
    return embed;
  }
  sendTypeMessage(){

    var embed = this.getTypeEmbed();
    this.lastMsg.channel.send({embed}).then(msg => {
      this.currentMsg = msg;
      var emojis = this.seriesTypes.values();
      emojis[emojis.length] = '❌';
      emojis[emojis.length] = '⏭️';
      this.react(msg, emojis, 0);

      const filter = (reaction, user) => {return (reaction.emoji.name === '❌' || reaction.emoji.name === '⏭️') && user.tag === this.user.tag};
      const collector = msg.createReactionCollector(filter, {max: 1, time: 60000 * 5, errors: ['time']});

      collector.on('collect', reaction => {

        if(reaction.emoji.name === '❌'){
          this.lastMsg.reply('La procédure a bien été annulée.');
          this.currentMsg.delete();
          this.users.delete(this.user.tag);
        }else if(reaction.emoji.name === '⏭️'){
          this.status = 1;
          this.currentMsg.delete();
          this.sendTimeMessage();
        }

      });

      collector.on('end', reactions => {
        if(reactions.get('❌') == null && reactions.get('⏭️') == null){
          this.lastMsg.reply('Vous deviez réagir au message préçédent (1), la procédure est annulée.');
          this.currentMsg.delete();
          this.users.delete(this.user.tag);
        }
      });

    });
  }
  updateTypeMessage(){
    var embed = this.getTypeEmbed();
    this.currentMsg.edit({embed});
  }

  getTimeEmbed(){

    var types = '';
    for(const type of this.sTypes){
      types += '\\' + this.seriesTypes.get(type) + ' ' + type + ', ';
    }

    const embed = {
      color: 16746215,
      author: {
        name: this.lastMsg.author.tag + " | Ajouter une série",
        icon_url: this.lastMsg.author.avatarURL
      },
      title: "Quel est la durée moyenne d\'un épisode ?",
      fields: [
        {
          name: 'Nom de la série',
          value: this.sName,
          inline: true
        },{
          name: 'Type·s de la série',
          value: (types === '') ? 'Aucun' : types,
          inline: true
        },{
          name: 'Durée d\'un épisode',
          value: this.sTime + ' minutes'
        },{
          name: 'Commandes',
          value: '⏮️ Précédent\n⏭️ Suivant \nEnvoyez un message contenant le nombre de minutes moyennes d\'un épisode'
        }
      ],
      footer: {
        text: 'Entrez le nombres de minutes avec un message',
        icon_url: client.user.avatarURL
      }
    }
    return embed;
  }
  sendTimeMessage(){

    var embed = this.getTimeEmbed();
    this.lastMsg.channel.send({embed}).then(msg => {
      this.currentMsg = msg;
      this.react(msg, ['⏮️', '⏭️'], 0);

      const filter = (reaction, user) => {return (reaction.emoji.name === '⏮️' || reaction.emoji.name === '⏭️') && user.tag === this.user.tag};
      const collector = msg.createReactionCollector(filter, {max: 1, time: 60000 * 5, errors: ['time']});

      collector.on('collect', reaction => {
        if(reaction.emoji.name === '⏮️'){
          this.status = 0;
          this.currentMsg.delete();
          this.sendTypeMessage();
        }else if(reaction.emoji.name === '⏭️'){
          this.status = 2;
          this.currentMsg.delete();
          this.sendSeasonsMessage();
        }
      });
      collector.on('end', reactions => {
        if(reactions.get('⏮️') == null && reactions.get('⏭️') == null){
          this.lastMsg.reply('Vous deviez réagir au message préçédent (2), la procédure est annulée.');
          this.currentMsg.delete();
          this.users.delete(this.user.tag);
        }
      });
    });

  }
  updateTimeMessage(){
    var embed = this.getTimeEmbed();
    this.currentMsg.edit({embed});
  }

  getSeasonsEmbed(){

    var types = '';
    for(const type of this.sTypes){
      types += '\\' + this.seriesTypes.get(type) + ' ' + type + ', ';
    }

    const embed = {
      color: 16746215,
      author: {
        name: this.lastMsg.author.tag + " | Ajouter une série",
        icon_url: this.lastMsg.author.avatarURL
      },
      title: "Combien de saisons comporte la série ?",
      fields: [
        {
          name: 'Nom de la série',
          value: this.sName,
          inline: true
        },{
          name: 'Type·s de la série',
          value: (types === '') ? 'Aucun' : types,
          inline: true
        },{
          name: 'Durée d\'un épisode',
          value: this.sTime + ' minutes',
          inline: true
        },{
          name: 'Nombre de saisons',
          value: this.sSeasons + ' saisons'
        },{
          name: 'Commandes',
          value: '⏮️ Précédent\n⏭️ Suivant \nEnvoyez un message contenant le nombre de saisons de la série'
        }
      ],
      footer: {
        text: 'Entrez le nombres de saisons avec un message',
        icon_url: client.user.avatarURL
      }
    }
    return embed;
  }
  sendSeasonsMessage(){

    var embed = this.getSeasonsEmbed();
    this.lastMsg.channel.send({embed}).then(msg => {
      this.currentMsg = msg;
      this.react(msg, ['⏮️', '⏭️'], 0);

      const filter = (reaction, user) => {return (reaction.emoji.name === '⏮️' || reaction.emoji.name === '⏭️') && user.tag === this.user.tag};
      const collector = msg.createReactionCollector(filter, {max: 1, time: 60000 * 5, errors: ['time']});

      collector.on('collect', reaction => {
        if(reaction.emoji.name === '⏮️'){
          this.status = 1;
          this.currentMsg.delete();
          this.sendTimeMessage();
        }else if(reaction.emoji.name === '⏭️'){
          this.status = 3;
          this.currentMsg.delete();
          this.sendEpMessage();
        }
      });
      collector.on('end', reactions => {
        if(reactions.get('⏮️') == null && reactions.get('⏭️') == null){
          this.lastMsg.reply('Vous deviez réagir au message préçédent (3), la procédure est annulée.');
          this.currentMsg.delete();
          this.users.delete(this.user.tag);
        }
      });
    });

  }
  updateSeasonsMessage(){
    var embed = this.getSeasonsEmbed();
    this.currentMsg.edit({embed});
  }

  getEpEmbed(){

    var types = '';
    for(const type of this.sTypes){
      types += '\\' + this.seriesTypes.get(type) + ' ' + type + ', ';
    }

    const embed = {
      color: 16746215,
      author: {
        name: this.lastMsg.author.tag + " | Ajouter une série",
        icon_url: this.lastMsg.author.avatarURL
      },
      title: "Combien d'épisodes comporte la série au total ?",
      fields: [
        {
          name: 'Nom de la série',
          value: this.sName,
          inline: true
        },{
          name: 'Type·s de la série',
          value: (types === '') ? 'Aucun' : types,
          inline: true
        },{
          name: 'Durée d\'un épisode',
          value: this.sTime + ' minutes',
          inline: true
        },{
          name: 'Nombre de saisons',
          value: this.sSeasons + ' saisons',
          inline: true
        },{
          name: 'Nombre d\'épisodes',
          value: this.sEp + ' épisodes',
        },{
          name: 'Commandes',
          value: '⏮️ Précédent\n⏭️ Suivant \nEnvoyez un message contenant le nombre d\'épisodes de la série'
        }
      ],
      footer: {
        text: 'Entrez le nombres d\'épisodes avec un message',
        icon_url: client.user.avatarURL
      }
    }
    return embed;
  }
  sendEpMessage(){

    var embed = this.getEpEmbed();
    this.lastMsg.channel.send({embed}).then(msg => {
      this.currentMsg = msg;
      this.react(msg, ['⏮️', '⏭️'], 0);

      const filter = (reaction, user) => {return (reaction.emoji.name === '⏮️' || reaction.emoji.name === '⏭️') && user.tag === this.user.tag};
      const collector = msg.createReactionCollector(filter, {max: 1, time: 60000 * 5, errors: ['time']});

      collector.on('collect', reaction => {
        if(reaction.emoji.name === '⏮️'){
          this.status = 2;
          this.currentMsg.delete();
          this.sendSeasonsMessage();
        }else if(reaction.emoji.name === '⏭️'){
          this.status = 4;
          this.currentMsg.delete();
          //this.sendXXXMessage();
        }
      });
      collector.on('end', reactions => {
        if(reactions.get('⏮️') == null && reactions.get('⏭️') == null){
          this.lastMsg.reply('Vous deviez réagir au message préçédent (4), la procédure est annulée.');
          this.currentMsg.delete();
          this.users.delete(this.user.tag);
        }
      });
    });

  }
  updateEpMessage(){
    var embed = this.getEpEmbed();
    this.currentMsg.edit({embed});
  }

  userSendMessageWithReaction(msg, emoji, other){
    this.lastMsg = msg;
    if(this.status === 0){
      if(this.seriesTypes.get(other) == null && this.seriesTypes.search(emoji) == null){
        if(this.seriesTypes.count() < 20){
          this.seriesTypes.set(other, emoji);
          this.react(this.currentMsg, [emoji], 0)
          this.updateTypeMessage();
        }
      }
    }
  }
  userSendMessageWithNumber(msg, number){
    this.lastMsg = msg;
    if(this.status === 1){
      if(number <= 180){
        this.sTime = Math.floor(number / 5) * 5;
        this.updateTimeMessage();
      }else{
        msg.reply('La durée d\'un épisode ne peut pas dépasser 3h');
      }
    }else if(this.status === 2){
      if(number <= 50){
        if(number > 0){
          this.sSeasons = number;
          this.updateSeasonsMessage();
        }else{
          msg.reply('Joue pas avec les mots, petit...');
        }
      }else{
        msg.reply('Sérieusement, vous connaissez une série avec plus de 50 saisons ? ...Non !');
      }
    }else if(this.status === 3){
      if(number <= 1000){
        if(number > 0){
          this.sEp = Math.floor(number);
          this.updateEpMessage();
        }else{
          msg.reply('Joue pas avec les mots, petit...');
        }
      }else{
        msg.reply('Sérieusement, vous connaissez une série avec plus de 1000 épisodes ? ...Non !');
      }
    }
  }

  userAddReact(emoji){
    if(this.status === 0){
      var type = this.seriesTypes.search(emoji.name);
      if(type != null){
        for(const findType of this.sTypes){
          if(findType === type) return;
        }
        this.sTypes[this.sTypes.length] = type;
        this.updateTypeMessage();
      }
    }
  }
  userRemoveReact(emoji){
    if(this.status === 0){
      var type = this.seriesTypes.search(emoji.name);
      if(type != null){
        var index = this.sTypes.indexOf(type);
        console.log(this.sTypes.indexOf(type));
        if(index != -1){
          this.sTypes.splice(index, 1);
          this.updateTypeMessage();
        }
      }
    }

  }

  react(msg, emojis, index){
    if(emojis.length > index+1){
      msg.react(emojis[index]).then(() => this.react(msg, emojis, index+1));
    }else{
      msg.react(emojis[index]);
    }
  }
  isCurrent(msgId){
    return msgId == this.currentMsg.id;
  }

}
