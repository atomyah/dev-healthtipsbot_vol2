// server.js
var express = require('express')
var Twitter = require('twitter')
var CronJob = require("cron").CronJob

var app = express()


//ツイッターモジュールをインスタンス化
var twitter = new Twitter({
  consumer_key: '＜あなたのConsumer API keys＞',
  consumer_secret: '＜あなたのAPI secret key＞',
  access_token_key: '＜あなたのAccess token＞',
  access_token_secret: '＜あなたのAccess token secret＞'
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


// 呟く内容の配列
var tipsArray = [
  "朝食べるたんぱく質がトリプトファンになり、昼間にセロトニンになり、夜メラトニンになります。朝食に納豆味噌汁焼き魚は理にかなっているわけです",
  "ふつうに食事をとっていても女性は鉄分が不足しがちです。サプリメントで補いましょう",
  "1日に3食取るようになったのは江戸時代の元禄年間からです。照明器具の発達で夜がまで活動できるようになったからです。それまでは2食が普通でした",
  "2016年カナダとオーストラリアの共同研究で、アルコールの腸内環境や脳への悪影響が立証されました。酒は百薬の長論は完全否定されました",
  "人類は遠い昔にビタミンCを生成する能力を失いました。現代人はさらにビタミンB3（ナイアシン）の生成能力を失いつつあります",
  "生野菜を食べるとき、葉野菜は洗いましょう。農薬だけでなく軟体動物の這った痕などさまざまな因子がついています。外食チェーンの生サラダでは洗っていないでしょう",
  "現代医学は症状を悪としてそれに対抗するように薬を次々と開発してきました。特に国民皆保険の日本人は簡単に薬を欲しがります。結果、本来の免疫力は弱ってしまったといえます",
  "スーパーの刺身売り場で、ブロックでなく切り身で売っているものは相当量のエタノールをふりかけて切っています",
  "むかしは二人にひとりもの割合で癌になったでしょうか。アルツハイマーや難病患者がますます増えています。死ぬ病は減りましたが死ねない病が増えました。医学は発達しているのでしょうか",
  "お酒を控える基準に誰もがγ-GPTを気にしています。しかし本当に悪影響があるのは脳に対してです。健康診断ではわかりません",
  "精白した米や小麦にはほとんど栄養素が入っていません。医師の玄米主食率が高いのは本当です",
  "ノンカロリー、ノンシュガーと謳っている製品は本当に良いのでしょうか。それらの原材料名一覧をご覧ください。代わりにアセスルファムK、アスパルテームなどの人工甘味料が入っています",
  "食事、運動は自分でコントロールできますが睡眠はそうもいかない場合があります。睡眠薬には依存性の重篤なものが多いので、医師の処方を盲信せず自分で調べることが大切です",
  "精神的不調のほとんどは休息と食事療法で治癒できます。基本は高たんぱく低糖質です。女性は鉄分も。ちなみに医大では食事療法について学びません",
  "ランニング等有酸素運動はとても良い運動です。しかし運動したあとにビール、は美味しいですが、脱水状態のうえにさらに脱水効果の大きな飲料物を摂るわけですからカラダには危険行為です",
  "お酒もタバコも（ただし添加物無添加のもの）、違法ですが大麻ですら、時々嗜む程度なら問題ないのです。毎日摂取することが問題なのです。「合法だから問題ない」わけではないです"
]




// ランダムにつぶやく関数
function cycleTweet() {
  var tips = tipsArray[Math.floor(Math.random() * tipsArray.length)]

  // 自動投稿
  twitter.post('statuses/update', {status: tips}, (err, tweet, response)=> {
    if(err) {
      return console.log(err)
    }else{
      return console.log(tweet)
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
