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
// firebase.initializeApp(config);
admin.initializeApp(config);
firebase.initializeApp(config);

const auth = admin.auth();

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

var userInfo = null;

app.get('/test', function (req, res) {
  res.render('login_bak');
});

app.get('/', function (req, res) {
  res.render('login');
});

app.get('/confirm', function (req, res) {
  var user = req.query;
  var id_token = req.query.token;
  // Build Firebase credential with the Google ID token.
  var credential = firebase.auth.GoogleAuthProvider.credential(id_token);

  // Sign in with credential from the Google user.
  firebase.auth().signInAndRetrieveDataWithCredential(credential).then(function () {}).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });


});

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    userInfo = user.email;
    // User is signed in.
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;
  } else {
    // User is signed out.
    // ...
  }
});

app.get('/confirmUser', function (req, res) {
  // Build Firebase credential with the Google ID token.
  var credential = firebase.auth.GoogleAuthProvider.credential(id_token);

  // Sign in with credential from the Google user.
  firebase.auth().signInAndRetrieveDataWithCredential(credential).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });

  /*firebase.auth().signInWithEmailAndPassword(email, password).then(function(){
    res.redirect('/list');
  }).catch(function(error){
    res.redirect('/');
  });*/
});

app.get('/list', function (req, res) {
  res.render('list');
});

app.get('/getList', function (req, res) {
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
  firebase.database().ref('setting').once('value', function (snapshot) {
    var rows = [];
    snapshot.forEach(function (childSnapshot) {
      var data = childSnapshot.val();
      rows.push(data)
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