const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require("firebase");
const express = require("express");
var dateFormat = require('dateformat');
var bodyParser = require('body-parser');
const app = express();


var config = {
  apiKey: "AIzaSyDG1mV_4yasiUJkUiyYM-nCOMra_Z3jhw4",
  authDomain: "start-moon.firebaseapp.com",
  databaseURL: "https://start-moon.firebaseio.com",
  projectId: "start-moon",
  storageBucket: "start-moon.appspot.com",
  messagingSenderId: "516803201821"
};
admin.initializeApp(config);
firebase.initializeApp(config);

// const auth = admin.auth();

app.locals.pretty = true;
app.use(express.static('public'));
app.set('views', './views'); //폴더명
app.set('view engine', 'pug'); //views 폴더에서 pug 확장자 파일을 찾아 결과를 뿌림
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

app.use(bodyParser.urlencoded({
  extended: false
}));

app.get('/', function (req, res) {
  res.render('login');
});

app.get('/signUp', function(req, res){
  res.render('signUp');
});

app.post('/join', function(req, res){
  var email = req.body.email;
  var password = req.body.password;

  firebase.auth().createUserWithEmailAndPassword(email, password)
  .then(function(){
    res.send({
      result: 'success'
    });
  })
  .catch(function(error) {
    if(error.code == 'auth/email-already-in-use'){
      res.send({
        result: 'fail',
        msg: '이미 존재하는 계정입니다.'
      });
    }
  });

});


// firebase.auth().onAuthStateChanged(function(firebaseUser) {
//   console.log(firebaseUser.uid);
// });
var userUid = '';
app.post('/confirm', function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  
  var result = '';
  firebase.auth().signInWithEmailAndPassword(email, password).then(function(user){
    console.log(user.uid);
    userUid = user.uid;
    result = 'success';
    res.send({
      result: result
    });
  }).catch(function(error){
    result = 'fail';
    res.send({
      result: result
    });
  });
});


app.get('/logout', function(req, res){
  var user = firebase.auth().currentUser;
  firebase.auth().signOut().then(function(){
    res.send({
      result: 'success'
    });
  }).catch(function(error){
    res.send({
      result: 'fail'
    });
  });

 
});

app.get('/list', function (req, res) {
  // var user = firebase.auth().currentUser;
  res.render('list');
});

app.get('/getList', function (req, res) {
  var user = firebase.auth().currentUser;
  firebase.database().ref('setting').orderByChild('writer').equalTo(user.uid).once('value', function (snapshot) {
    var rows = [];
    snapshot.forEach(function (childSnapshot) {
      var data = childSnapshot.val();
      var category = firebase.database().ref('data').orderByChild('category').equalTo(data.id);
      
      
      category.orderByChild('date').startAt(req.query.startDate).endAt(req.query.endDate).once('value', function (snapshot) {
        console.log(snapshot);
        // rows.push(data)
    });
  });
});




  firebase.database().ref('data').orderByChild('date').startAt(req.query.startDate).endAt(req.query.endDate).once('value', function (snapshot) {
    var rows = [];
    snapshot.forEach(function (childSnapshot) {
      var data = childSnapshot.val();

      if (data.date) {
        var date = data.date;
        data.date = dateFormat(date, 'mm/dd');
      }
      rows.push(data)
    });
    res.send({
      result: 'success',
      rows: rows
    });
  });
});

app.get('/list/category', function (req, res) {
  var user = firebase.auth().currentUser;
  firebase.database().ref('setting').orderByChild('writer').equalTo(user.uid).once('value', function (snapshot) {
    var rows = [];
    snapshot.forEach(function (childSnapshot) {
      var data = childSnapshot.val();
      rows.push(data);
      console.log(data)
    });
    res.send({
      result: 'success',
      rows: rows
    });
  });
});

app.get('/view', function (req, res) {
  var id = req.query.id;

  firebase.database().ref('data/' + id).once('value', function (snapshot) {

    var data = snapshot.val();
    //var date = data.date;
    //data.date = dateFormat(date, 'mm/dd');

    res.send({
      result: 'success',
      data: data
    });
  });
})


app.post('/add', function (req, res) {
  var data = req.body;
  if (!data.id) {
    data.id = firebase.database().ref().child('data').push().key;
  }

  if (data.id) {
    firebase.database().ref('data/' + data.id).set(data);
  }

  res.redirect('/list');
});

app.post('/delete', function (req, res) {
  var data = req.body;

  firebase.database().ref('data/' + data.id).remove();
  res.redirect('/list');
});

app.get(['/setting', '/setting/:id'], function (req, res) {
  if (req.params.id) {
    var categoryId = req.params.id;
    firebase.database().ref('setting/' + categoryId).once('value', function (snapshot) {
      var data = snapshot.val();
      res.render('setting', {
        data: data
      });
    });
  } else {
    res.render('setting');
  }
});

app.post('/setting/add', function (req, res) {
  var data = req.body;

  if (!data.id) {
    data.id = firebase.database().ref().child('setting').push().key;
  }

  if (data.id) {
    firebase.database().ref('setting/' + data.id).set(data);
  }
  res.redirect('/list');
});

app.post('/setting/delete', function (req, res) {
  var data = req.body;
  firebase.database().ref('setting/' + data.id).remove();
  res.redirect('/list');
});

const api = functions.https.onRequest(app);

module.exports = {
  api
}