var CronJob = require('cron').CronJob;
const HashMap = require('hashmap');
const Listener = require('./seriesManager/listener.js');
const SeriesTask = require('./seriesManager/seriesTask.js');
const ActiveMemberManager = require('./activeMemberManager.js');
const Instagram = require('./instagram.js');

var setup = function setup(){

  const job = new CronJob('0 10 0 * * *', function() {

    SeriesTask.checkRemoveSerie();
    ActiveMemberManager.day();

  }, null, true, 'Europe/Paris');
  job.start();

  const job2 = new CronJob('0 0 * * * *', function() {

    Instagram.update();

  }, null, true, 'Europe/Paris');
  job2.start();
  Instagram.update();

  console.log("Cron tasks are started !");
}
module.exports = {
  setup: setup
}
