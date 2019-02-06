const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require("firebase");
const express = require("express")
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
  
  if(req.query.category){
    var title = req.query.category;
    for(var i=0;i<title.length;i++){
      categories.push(title[i].id);
    }
  }

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
  firebase.database().ref('category').once('value', function (snapshot) {
    var rows = [];
    snapshot.forEach(function (childSnapshot) {
      var data = childSnapshot.val();

      if(data.writer === user.uid){
        rows.push(data);
      }

      if(data.member){
        for(key in data.member) {
          if(data.member[key] === user.email){
            rows.push(data);
          }
         }
      }
    });

    res.send({
      result: 'success',
      rows: rows
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

app.get(['/category', '/category/:id'], function (req, res) {
  if (req.params.id) {
    var user = firebase.auth().currentUser;
    // if(user===null){
    //   res.redirect('/');
    // }
    var categoryId = req.params.id;
    firebase.database().ref('category/' + categoryId).once('value', function (snapshot) {
      var data = snapshot.val();
      var writeYn = 'N';
      if(user.uid === data.writer){
        writeYn = 'Y';
      }
      res.render('category', {
        data: data,
        writeYn : writeYn
      });
    });
  } else {
    res.render('category');
  }
});

app.post('/category/add', function (req, res) {
  var data = req.body;

  var user = firebase.auth().currentUser;
  data.writer = user.uid;

  if(user){
    if (!data.id) {
      data.id = firebase.database().ref().child('category').push().key;
    }

    if (data.id) {
      firebase.database().ref('category/' + data.id).set(data);
    }
  }
  res.redirect('/list');
});

app.post('/category/delete', function (req, res) {
  var data = req.body;
  firebase.database().ref('category/' + data.id).remove();
  res.redirect('/list');
});

app.post('/category/addMember', function(req, res){
  var newMember = req.body.member;
  var categoryId = req.body.id;

  var result = 'fail';
  var newKey = '';

  if (categoryId) {
    var member = {
      email : newMember
    }


    admin.auth().getUserByEmail(newMember).then(function(userRecord) {
      var verifyUser = {
        email : userRecord.email,
        uid : userRecord.uid
      }
      var newKeyObj = firebase.database().ref('category/' + categoryId+'/member').push(newMember);
      result = 'success';
      newKey = newKeyObj.key;

      res.send({
        result: result,
        newKey : newKey
      });

    })
    .catch(function(error) {
        res.status(500).send({
        result: 'fail'
      });
    });
  }
});

app.post('/category/removeMember', function(req, res){
  var memberKey = req.body.memberKey;
  var categoryId = req.body.categoryId;

  var result = 'fail';
  if(categoryId && memberKey){
    firebase.database().ref('category/'+categoryId+'/member/'+memberKey).remove();
    result = 'success';
  } 

  res.send({
    result: result
  });
  
});



/*설정 */
app.get('/setting', function(req, res){
  res.render('setting');
});

app.get('/setting/shareMember', function(req, res){

  admin.auth().getUserByEmail(req.query.userEmail).then(function(userRecord) {
    var verifyUser = {
      email : userRecord.email,
      uid : userRecord.uid
    }

    res.send({
      result: verifyUser
    });

    return verifyUser;
  })
  .catch(function(error) {
    console.log("Error fetching user data:", error);
  });


});

/*예산 */
app.get('/budget', function(req, res){
  res.render('budget');
});


const api = functions.https.onRequest(app);

module.exports = {
  api
}