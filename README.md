# メモ
* staticミドルウェアを使う事で、ファイルを公開できる（外部からのリクエストに応答ができる）
* app.jsのテンプレートにapp.use(express.static(path.join(__dirname, 'public')))とある
* [MongoDBのインストール参考サイト](http://nigohiroki.hatenablog.com/entry/2013/01/05/234631)
* mongodb-nativeというライブラリを使ってJSからMongoDBを触るが、バージョン1.2から [MongoClient](http://mongodb.github.io/node-mongodb-native/api-generated/mongoclient.html) というクラスが出てきて、やり方が大幅に変わったらしい ([参考](http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html))
* とても良さそうな例があった [Node.js + MongoDB Hello World Example](http://doduck.com/node-js-mongodb-hello-world-example/)

# ubuntuへのmongoDBのインストール
* http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/ が参考になる
* Proxy配下からapt-keyをする場合、http_proxyなどの設定と合わせて、下記のように-Eをつけると良い。

```
export http_proxy=http://<proxy>:<port>
export https_proxy=http://<proxy>:<port>
sudo -E apt-add-repository ppa:linaro-maintainers/toolchain
```

# node-inspector(debugger)に関して
* イントール方法：npm install -g node-inspector
* まずnode --debug-brk <app>でアプリを起動。
* 次に別のターミナルからnode-inspectorと実行。
* アプリ自体は設定した通りのポートでアクセス可能（デフォルト3000）
* デバッガでbreak pointで止まっているときはアプリ自体も止まるので注意（当たり前だが）

# findに関してメモ
* cursorからデータを取る実装を最初やっていたので、貼付けておく

```javascript
  var cursor = myCollection.find();
  var videos = new Array();
  cursor.each(function(err, item) {
    // itemがnullで帰ってくる=全てのループが完了したということみたい
    // http://mongodb.github.io/node-mongodb-native/api-generated/cursor.html (eachのサンプルより)
    if (err) {
      console.log("Error happens in find : " + err);
    }
    else if (item) {
      videos.push(item);
    }
    else {
      console.log("item is null : " + videos.length)  ;
      onFound(videos);
    }
  });
```
# Fileのアップロード
* postしたデータを保存する方法。一度tmpフォルダへ保存した後、おきたい場所へコピーするみたい（そして、tmpのファイルを消す）。
* [参考サイト](http://pxpss.blogspot.jp/2012/09/express.html)

```javascript
exports.uploadVideo = function(req, res) {
  console.log(req.files.newvideo.type);
  var target_path = './public/uploads/' + req.files.newvideo.name;
  var tmp_path = req.files.newvideo.path;

  console.log("Uploading... : " + target_path);
  fs.rename(tmp_path, target_path, function(err) {
    if (err) {
      throw err;
    }

    fs.unlink(tmp_path, function() {
      if (err) {
        throw err ;
      }
      console.log("Done upload : " + target_path);
    });
  });

  res.redirect("/");
};
```

# Jadeメモ
* [Tutorial](http://jade-lang.com/tutorial/)
* 条件式のイコールは、a = b といった具合に、=は１つ

# UnitTestメモ
* Testフレームワークはmochaを使う
 - http://visionmedia.github.io/mocha/

* Assertionに使うライブラリを利用者が選べるのが特徴。
 - 今回はBDDスタイルで、shouldというライブラリを利用。
 - [shouldのgithub](https://github.com/visionmedia/should.js)

* Routingのテスト
 - supertestというlibraryが、expressのroutingのテストには便利な模様
 - [visionmedia/supertest](https://github.com/visionmedia/supertest)
 - [expressで作ったHelloWorldをsupertestでテストする](http://takatamajp.wordpress.com/2012/11/18/unit_testing_for_express_using_supertest/)
 - [How does one unit test routes with Express?](http://stackoverflow.com/questions/9517880/how-does-one-unit-test-routes-with-express)

* Sinon.JSもやっておきたい
 - [Sinon.JS](http://sinonjs.org/) ← これは向いてないっぽいけど、sinon.jsって重要みたい。

* その他メモ
 - [node.jsでこんなのもテストしたい!! という話](http://qiita.com/fnobi/items/14c9f298d88fc2a2e53d) ← この中で触れられているexpress-testは、express 3系だと上手く動かない模様。
 - [CoffeeScriptとExpressとMongoDbとMochaでNode.jsするメモ](http://codedehitokoto.blogspot.jp/2012/02/coffeescriptexpressmongodbmochanodejs.html)


# Front-end側のstyleについて

* OOCSS (Object Oriented CSS) で作る
  - BEM (Block Element Modifier) を採用
  - [公式サイト](http://bem.info/method/definitions/)
  - これに従い、ファイルはblockごとに切る

# EC2へのdeployに関して

* foreverを使って永続化した
  - [Node.js + Express + forever を構成して nginx から流す](http://qiita.com/ogwmtnr/items/03996d3798facbc600da)
  - [Node.jsのdaemon化について(foreverを使ってみる)](http://qiita.com/n_morioka/items/837967c0e2711198bd74)

