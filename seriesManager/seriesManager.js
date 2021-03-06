const EditJsonFile = require("edit-json-file");
const Listener = require('./listener.js');

var deleteSerie = function deleteSerie(sName, deleteMessage, deleteChannel){

  let file = EditJsonFile('./seriesManager/series.json');
  if(file.get(sName + "") != null){

    var messageId = file.get(sName + ".messageId");
    var channelId = file.get(sName + ".channelId");

    file.unset(sName);
    file.save();

    if(deleteMessage){
      client.channels.get(Listener.RECAP_CHANNEL_ID).fetchMessage(messageId).then((msg) => { if(msg != null) msg.delete() });
    }if(deleteChannel){
      var channel = client.channels.get(channelId);
      if(channel != null) channel.delete();
    }
  }
}

var deleteVoteSerie = function deleteVoteSerie(id, deleteMessage){

  let file = EditJsonFile('./seriesManager/seriesToVote.json');
  if(file.get(id + "") != null){

    file.unset(id);
    file.save();

    if(deleteMessage){
      client.channels.get(Listener.VOTE_CHANNEL_ID).fetchMessage(id).then((msg) => msg.delete());
    }
  }
}

var addSerie = function addSerie(json, sName){

  var series = requireReload('./series.json');
  if(series[sName] != null){
    json.channelId = series[sName].channelId;
    json.messageId = series[sName].messageId;
    deleteSerie(sName, false, false);
  }

  const SeriesMessager = require('./seriesMessager.js');

  var chnCallback = function callback(id){
    json.channelId = id;
    saveSerieJson(json, sName);
  }
  var msgCallback = function callback(id){
    json.messageId = id;
    SeriesMessager.createSerieChannel(json, sName, chnCallback);
  }
  SeriesMessager.sendSerieMessage(json, sName, msgCallback);
}

var addVoteSerie = function addVoteSerie(json, messageId){

  if(messageId == ''){

    var callback = function callback(id){
      saveVoteSerieJson(json, id);
    }
    const SeriesMessager = require('./seriesMessager.js');
    SeriesMessager.sendVoteSerieMessage(json, callback);
  }else{
    saveVoteSerieJson(json, messageId);
  }

}

var saveSerieJson = function saveSerie(json, sName){
  let file = EditJsonFile('./seriesManager/series.json');
  file.set(sName, json);
  file.save();
}
var saveVoteSerieJson = function saveVoteSerie(json, messageId){
  let file = EditJsonFile('./seriesManager/seriesToVote.json');
  file.set(messageId, json);
  file.save();
}

var requireReload = function(modulePath){
    delete require.cache[require.resolve(modulePath)];
    return require(modulePath);
};

module.exports = {
    deleteSerie: deleteSerie,
    deleteVoteSerie: deleteVoteSerie,
    addSerie: addSerie,
    addVoteSerie: addVoteSerie
}
