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

  var msg = firebase.auth().createUserWithEmailAndPassword(email, password)
  .then(function(){
    return 'success';
  })
  .catch(function(error) {
    // if(error.code == 'auth/email-already-in-use'){
    //   /*res.send({
    //     result: 'fail',
    //     msg: '이미 존재하는 계정입니다.'
    //   });*/
    // }
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
  //console.log(login(email, password))
  firebase.auth().signInWithEmailAndPassword(email, password)
  .then(user => {
    result = 'success';
    res.status(200).send({ result: result });
    return true;
  })
  .catch(error => {
    result = error.code;
    res.status(500).send({ error: error.code });
  });
});

function login(email, password){
  firebase.auth().signInWithEmailAndPassword(email, password).then(function(user){
    return 'success';
  }).catch(function(error){
    return 'fail';
  });
}

app.get('/logout', function(req, res){
  var user = firebase.auth().currentUser;
  firebase.auth().signOut().then(function(){
    res.send({result: 'success'});
    return true;
  }).catch(function(error){
    res.status(500).send({ error: error.code });
  });
});

app.get('/list', function (req, res) {
  // var user = firebase.auth().currentUser;
  res.render('list');
});

app.get('/getList', function (req, res) {
  var user = firebase.auth().currentUser;
  var categories = [];

  // user.uid = 'ZFvimDC4QHYYHtQ8C3V0Du5ivB62';
  firebase.database().ref('setting').orderByChild('writer').equalTo(user.uid).once('value', function (categorySnapshot) {
    categorySnapshot.forEach(function (childSnapshot) {
      var data = childSnapshot.val();
      categories.push(data.id);
    });
  });

  var datas = [];
  firebase.database().ref('daily').orderByChild('date').startAt(req.query.startDate).endAt(req.query.endDate).once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var data = childSnapshot.val();

        var exist = categories.indexOf(data.category);
        if(exist !== -1){
          if (data.date) {
            var date = data.date;
            data.date = dateFormat(date, 'mm/dd');
          }
          datas.push(data);
        }
    });

    res.status(200).send({ 
      result : 'success',
      rows:datas
    });

  });
});


app.get('/getTodoList', function (req, res) {
  var user = firebase.auth().currentUser;
  var datas = [];
  firebase.database().ref('todolist/'+user.uid).once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var data = childSnapshot.val();

      if (data.date) {
        var date = data.date;
        data.date = dateFormat(date, 'mm/dd');
      }
      datas.push(data);

    });
    
    res.status(200).send({ 
      result : 'success',
      rows:datas
    });
  });
});


app.get('/list/category', function (req, res) {
  var user = firebase.auth().currentUser;

  // .orderByChild('writer').equalTo(user.uid)
  firebase.database().ref('setting').once('value', function (snapshot) {
    var rows = [];
    var requestCategory = [];
    snapshot.forEach(function (childSnapshot) {
      var data = childSnapshot.val();

      if(data.writer === user.uid){
        rows.push(data);
      }

      // if(data.member.share)
      // console.log(data)

      if(data.member){
        var memberArr = data.member['request'];

        for(var i=0;i<memberArr.length;i++){
          if(memberArr[i] === user.email){
            console.log(data);
            requestCategory.push(data.id)
          }
        }
      }
    });
    res.send({
      result: 'success',
      rows: rows,
      requestCategory :requestCategory
    });
  });
});

app.get('/view', function (req, res) {
  var id = req.query.id;
  var status = req.query.status;

  var url = '';
  if(status === 'daily'){
    url = 'daily/' + id;
  }else if(status === 'todolist'){
    var user = firebase.auth().currentUser;

    url = 'todolist/'+user.uid+'/'+id
  }
  firebase.database().ref(url).once('value', function (snapshot) {

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

  var addData = {};
  addData['id'] = data.id;
  addData['date'] = data.date;
  addData['title'] = data.title;
  addData['contents'] = data.contents;
  
  if(data.writeRadio === 'daily'){
    
    addData['category'] = data.category;

    if (!addData.id) {
      addData.id = firebase.database().ref().child('daily').push().key;
    }

    if (addData.id) {
      firebase.database().ref('daily/' + addData.id).set(addData);
    }

  }else if(data.writeRadio === 'todolist'){
    var user = firebase.auth().currentUser;
    if(data.todoComplete){
      addData['todoComplete'] = data.todoComplete;
    }
    
    if (!addData.id) {
      addData.id = firebase.database().ref().child('todolist/'+user.uid).push().key;
    }

    if (addData.id) {
      firebase.database().ref('todolist/' +user.uid+"/"+addData.id).set(addData);
    }
  }

  res.redirect('/list');
});

app.post('/delete', function (req, res) {
  var id = req.body.id;
  var status = req.body.writeRadio;

  var url = '';
  if(status === 'daily'){
    url = 'daily/'+id;
  }else if(status === 'todolist'){
    var user = firebase.auth().currentUser;
    url = 'todolist/'+user.uid+'/'+id;
  }
  firebase.database().ref(url).remove();
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

  var user = firebase.auth().currentUser;
  data.writer = user.uid;

  if(user){
    if (!data.id) {
      data.id = firebase.database().ref().child('setting').push().key;
    }

    if (data.id) {
      firebase.database().ref('setting/' + data.id).set(data);
    }
  }
  res.redirect('/list');
});

app.post('/setting/delete', function (req, res) {
  var data = req.body;
  firebase.database().ref('setting/' + data.id).remove();
  res.redirect('/list');
});

app.post('/setting/addMember', function(req, res){
  var newMember = req.body.member;
  var categoryId = req.body.id;

  var data = {
    member : {
      request : [newMember]      
    }
  };

  if (categoryId) {
    firebase.database().ref('setting/' + categoryId+"/member/request").push(newMember);
  }
});

app.post('/setting/rejectMember', function(req, res){
  console.log('reject');
  console.log(req.query)
});

app.post('/setting/acceptMember', function(req, res){
  var requestId = req.body.requestId;
  var user = firebase.auth().currentUser;

  if(!user){
    res.redirect('/login');
  }
  var result = 'success';
  if(requestId){
    firebase.database().ref('setting/'+requestId+"/member/request").once('value', function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if(childSnapshot.val() == user.email){
          childSnapshot.ref.remove();
          firebase.database().ref('setting/'+requestId+"/member/share").push(user.uid);
        }
      });
    });
  }else{
    result = 'fail';
  }
  
  res.send({
    result: result
  });

});


/*예산 */
app.get('/budget', function(req, res){
  res.render('budget');
})


const api = functions.https.onRequest(app);

module.exports = {
  api
}