// server.js
var express = require('express')
var Twitter = require('twitter')
var CronJob = require("cron").CronJob
var mysql = require('mysql')

var app = express()
var bodyParser = require('body-parser')



// ツイッターのキーとシークレットトークンを初期化（環境変数を使用）
var twitter = new Twitter({
  consumer_key: process.env['CONSUMER_KEY'],
  consumer_secret: process.env['CONSUMER_SECRET'],
  access_token_key: process.env['ACCESS_TOKEN_KEY'],
  access_token_secret: process.env['ACCESS_TOKEN_SECRET']
})



//'0 0 0-23/3 * * *' だと3時間ごと0分0秒
//毎時 ↓
var cronTime = '0 0 * * * *'
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




//Twitter webhook用URLにてCRCリクエストを処理
var crypto = require('crypto');

app.get('/webhook/twitter', function(req, res) {
  var crc_token = req.query.crc_token;
  if (!crc_token) {
    res.send('Error: crc_token missing from request.')
  } else {
    var signature = crypto.createHmac('sha256', process.env['CONSUMER_SECRET']).update(crc_token).digest('base64')
    console.log(`receive crc check. token=${crc_token} res=${signature}`)
    res.status(200);
//    res.json({ response_token: `sha256=${signature}` })
    res.send({
      response_token: 'sha256=' + signature
    })
  }
})


// POSTされたデータをパースして使用する
app.use(bodyParser.json());

// Twitterからのeventを自分のWebhook URLで受け取る
app.post('/webhook/twitter', function(req, res) {


  // イベントがfollow_eventsの場合、相手のidをfollowerに格納
  // フォローしてきた相手をフォローする。 鍵アカからのフォローはfollowイベント発火しない。
  if (req.body.follow_events) {
    res.setHeader('Content-Type', 'text/plain')
    var follower = req.body.follow_events[0].source.id;
    var screenName = req.body.follow_events[0].source.screen_name;
    console.log('フォロワーのIDは、' + follower)
    console.log('フォロワーのscreenNameは、' + screenName)

    // フォロワーが自分自身でない場合のみフォローバック
    if (follower != process.env['MYSELF']) {
      var param = { user_id: follower }
      twitter.post('friendships/create', param, function(err, tweet, response) {
        console.log('------------フォロワー情報-------------')
        console.log(tweet)

        tweetRep('@' + screenName + ' さん、フォローありがとうございます！')
      })
    }

  }
    res.send('200 OK')
})


// フォローありがとうございます返信リプ用の関数
function tweetRep(arg) {
  twitter.post('statuses/update', {status: arg}, function(err, tweet, response) {
    if(err) {
      return console.log(err)
    }else{
      return console.log('------------返信リプ内容-------------' + JSON.stringify(tweet, undefined,"\t"))
    }
  })
}


app.listen(app.get('port'), function() {
console.log("Node app is runnning at localhost:" + app.get('port'))
})
