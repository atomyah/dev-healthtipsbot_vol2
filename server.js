// server.js
var express = require('express')
var Twitter = require('twitter')
var CronJob = require("cron").CronJob
var mysql = require('mysql')

var app = express()



// ツイッターのキーとシークレットトークンを初期化（環境変数を使用）
var twitter = new Twitter({
  consumer_key: process.env['CONSUMER_KEY'],
  consumer_secret: process.env['CONSUMER_SECRET'],
  access_token_key: process.env['ACCESS_TOKEN_KEY'],
  access_token_secret: process.env['ACCESS_TOKEN_SECRET']
})



//'0 0 0-23/3 * * *' だと3時間ごと0分0秒
//毎分 ↓
var cronTime = '0 * * * * *'
new CronJob({
  cronTime: cronTime,
  onTick: function() {
    cycleTweet()
  },
  start: true
})


// MySQL in Appデータベース接続詞
var connectionString = process.env.MYSQLCONNSTR_localdb;
var host = /Data Source=([0-9\.]+)\:[0-9]+\;/g.exec(connectionString)[1];
var port = /Data Source=[0-9\.]+\:([0-9]+)\;/g.exec(connectionString)[1];
var database = /Database=([0-9a-zA-Z]+)\;/g.exec(connectionString)[1];
var username = /User Id=([a-zA-z0-9\s]+)\;/g.exec(connectionString)[1];
var password = /Password=(.*)/g.exec(connectionString)[1];
var exampleSql = "";

var connection = mysql.createConnection({
  host     : host,
  port     : port,
  user     : username,
  password : password,
  database : database,
  debug    : true
});





// ランダムにつぶやく関数
function cycleTweet() {

  //tipsテーブルからランダムにとってくるselect文
  connection.query('select tips from tips order by rand() limit 1', function(err, rows) {
    if(err) {
      return console.log(err)
    }else{
      tips = rows[0].tips
      console.log(tips)


      // 自動投稿
      twitter.post('statuses/update', {status: tips}, (err, tweet, response)=> {
        if(err) {
          return console.log(err)
        }else{
          return console.log(tweet)
        }
      })

    }
  })
}


// HTTPリッスン用の設定
app.set('port', (process.env.PORT || 5000));
  app.get('/', function(req, res) {
    res.send('Hello World')
})

app.listen(app.get('port'), function() {
console.log("Node app is runnning at localhost:" + app.get('port'))
})
