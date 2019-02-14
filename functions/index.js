const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require("firebase");
const express = require("express")
var dateFormat = require('dateformat');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
// var cookieSession = require('cookie-session')
// var serviceAccount = require('path/to/serviceAccountKey.json');
const app = express();


var config = {
  apiKey: "AIzaSyDG1mV_4yasiUJkUiyYM-nCOMra_Z3jhw4",
  authDomain: "start-moon.firebaseapp.com",
  databaseURL: "https://start-moon.firebaseio.com",
  projectId: "start-moon",
  storageBucket: "start-moon.appspot.com",
  messagingSenderId: "516803201821"
};


// var serviceAccount = require("path/to/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert({
      "type": "service_account",
      "project_id": "start-moon",
      "private_key_id": "9fbdef91720617aee9e6226205ea2d1dbd949d8c",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCsSGE6vraOO0id\nUBFPYCOuZmrChEjSm5ZnwHUQIrJWK0dt2blrWAn26qN8G34658EGDHETPYWMWLOW\nJ9I9RKaWGFxCakJ/cYzg3kpdnDlsJDRp8YvHclKXr/qfmdeMFr0dq6ypLVurD5xB\nsC7J8fVSBKa9b3SDZ6vGPpnN8ogmQK4E7walBXUjkX01wmygJlwehuH4EVaJenYW\nnPRzXezlIL6NADzV3iAsvoRKE1GtXVBD5rAcVqiE/puJHdfdogKEy1HbNQxYnBdl\n/0YwBUdiY0Cgc6jIfQsuIK4Zr9nc38oJPh4o+w6KKwGPPMjzIkx6GX+Pmlfw+L4z\n18qkvlKnAgMBAAECggEACBlrAMEAghVFZ6fg+HNTmhpUgIqJheUsn/oLRtPqwGRO\nelqW/fXomgQT5XzBZXGJwIgLNNValuuAndmHZ7v3fOzuQW0PbUBgWB37LwVuKahW\nEnj5kknMmjb6uFAaMwrKnz934YgxXAxi0y++M149ozp2wEciGh9gkvRUdLsnLW0f\nQUn0+6VtU4N3uFB5pKaFoM+oZ8IGv87c1k6sdQVgOqKxTbneZYoFccK+jzSAH0As\nk8SDvRMeSJICTVuiUngC0OJPDoW/v+r5c5dtUAkIxfWVMn8oVD02OibWzsV2WgOV\nHnsUtcqKo2lBfId8D9zkBiACZqyJwQP7yrsPZUcWGQKBgQDWDxV68Uv6LFg0lYGR\nhsoSe+qkUnxxOaa6c13kfXTJXR4MMOmjv5+P3+wWAHJHo4eJLuql+2mhheaLIG9u\nIp3BnnL1sNvyOiBgJNl2AuIq8cmBg5JV/t/ETyBzZL3D2uf91S76NCnEvdQ8dVLp\nw3hdOb22icFwTNe4HUNRH7BObQKBgQDOCdtZ4Y5b5SCWKr99B+Xcgq4WT4w2Vpbw\nzRTKBjXPXDqJxu11UwgO3TdxCKXUzGgyRdVxnBO3q+WOV7x7VkiyKPkPkg92Ndq9\ncG+a4JUgWHmT5kK4H9EWES6DhqRi/hF2HfDL+Yhh+zXf9QYoBvQkrUlg7//r6nHi\n4b9BZ+7o4wKBgQCcIQpgzsjE4z0+tWF4/KA81ScyzXs4tn0Wd3kfZCYfjQyShcaU\nCfte3Et9TLwN5ofAFnlNsU+9YUXjajf8U8FO7Lwa2fHC/oSIu7flLHs8KXj5Pzco\nBCvAKpqXr/39cZhOewS1uABTIMZBhq2AFXOgQ7JNBrMRruqUvrtP21YkDQKBgQDE\nLR5tthWV6dPdJ1ar9ZknHEYleBhIpKmTHbFtqfwSM/6IsJ/n1ecWQAtJ1LIQq4+K\nTnOseK9Ncp5fqaoMxVryR5DdAnU2WJCtTyD0lmFnKtaXu+ZK6gBqwnFHSiu7Fa4K\niPd9P1pb8JSbaPEzq2tKgLQdWGaUeeV14Pv5irwvgQKBgH9Lt01Wb5fjWxV8L5gy\na9wh1o6HhuREYRNKzto9iotP3i+ywR6TOH+73Ge51JClRVF99o8/WZLOQ77M5Wkw\nhKjxZ7OxFvDALfuCIf7arx0+uUpmSOPV4bC5LsG8m+WAFq6c0Dt8QE0VFq06vW8P\nB//jpkCiX3yfjI4pzimG7LAV\n-----END PRIVATE KEY-----\n",
      "client_email": "firebase-adminsdk-3al80@start-moon.iam.gserviceaccount.com",
      "client_id": "114174226695599818119",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-3al80%40start-moon.iam.gserviceaccount.com"
        
  }),
  databaseURL: "https://start-moon.firebaseio.com"
});

// admin.initializeApp(config);
firebase.initializeApp(config);

app.locals.pretty = true;
app.use(express.static('public'));
app.set('views', './views'); //폴더명
app.set('view engine', 'pug'); //views 폴더에서 pug 확장자 파일을 찾아 결과를 뿌림
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

app.use(bodyParser.urlencoded({
  extended: true
}));  

app.use(cookieParser());
app.use(attachCsrfToken('/confirm', 'csrfToken', (Math.random()* 100000000000000000).toString()));
// app.use(checkIfSignedIn('/list'));

function attachCsrfToken(url, cookie, value) {
  return function(req, res, next) {
    if (req.url === url) {
      res.cookie(cookie, value);
    }
    next();
  }
}

function checkIfSignedIn(url) {
  return function(req, res, next) {
    if (req.url === url) {
      var host = req.get('host') || '';
      var sessionCookie = null;

      if(!host.includes('localhost')){
        res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        sessionCookie = req.cookies.__session;
      }else{
        res.setHeader('Cache-Control', 'private');
        sessionCookie = req.cookies.session;
      }
      // User already logged in. Redirect to profile page.
      admin.auth().verifySessionCookie(sessionCookie).then(function(decodedClaims) {
        // res.redirect('/list');
        return true;
      }).catch(function(error) {
        next();
      });
    } else {
      next();
      return false;
    }
  }
}
app.get('/', function (req, res) {
  // var host = req.get('host') || '';
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
    if(error.code === 'auth/email-already-in-use'){
      res.send({
        result: 'fail',
        msg: '이미 존재하는 계정입니다.'
      });
    }
  });
});



app.post('/confirm', function (req, res) {
  var email = req.body.email;
  var password = req.body.password;

  var host = req.get('host') || '';
  console.log('/confirm : ' + host)
  if(!host.includes('localhost')){
    console.log('cache : public')
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  }else{
    console.log('cache : private')
    res.setHeader('Cache-Control', 'private');
  }

  firebase.auth().signInWithEmailAndPassword(email, password).then(function(firebaseUser) {
    if(firebaseUser){
      firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
        var expiresIn = 60 * 60 * 24 * 1 * 1000; // Set session expiration to 1 days.
        
        admin.auth().verifyIdToken(idToken).then(function(decodedClaims) {
          // In this case, we are enforcing that the user signed in in the last 5 minutes.
          if (new Date().getTime() / 1000 - decodedClaims.auth_time < 5 * 60) {
            return admin.auth().createSessionCookie(idToken, {expiresIn: expiresIn});
          }
          throw new Error('UNAUTHORIZED REQUEST!');
        })
        .then(function(sessionCookie) {
          // Note httpOnly cookie will not be accessible from javascript.
          // secure flag should be set to true in production.
          
          var secure = true;
          var cookiesKey = '__session';
          if(host.includes('localhost')){
            secure = false;
            cookiesKey = 'session';
          }
          var options = {maxAge: expiresIn, httpOnly: true, secure: secure /** to test in localhost */};
          console.log('options -> ');
          console.log(options)
          res.cookie(cookiesKey, sessionCookie, options)
          res.status(200).send({result: 'success'});
          return true;
        })
        .catch(function(error) {
          console.log(error)
          res.status(401).send('UNAUTHORIZED REQUEST!');
        });
        return true;
      }).catch(function(error) {
        console.log(error)
        res.status(401).send('UNAUTHORIZED REQUEST!');
      });    
    }
    return true;
  }).catch(function(error) {
    console.log(error)
  });    
});

app.get('/logout', function(req, res){

  if(!host.includes('localhost')){
    key = '__'+key;
  }
  res.clearCookie(key);
  res.clearCookie('csfrToken');
  res.send({result: 'success'});
});

app.get('/list', function (req, res) {
  // var user = firebase.auth().currentUser;
  res.render('list');
});

app.get('/getList', function (req, res) {
 
  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    // res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }
  console.log('getList 1=======================');

  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;
    console.log('getList 2=======================' + uid + " , " + email);

    var categories = [];
  
    if(req.query.category){
      var title = req.query.category;
      for(var i=0;i<title.length;i++){
        categories.push(title[i].id);
      }
    }
  
    console.log('getList 3=======================' + categories);
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
    return true;
  }).catch(error => {
    res.redirect('/');
  });
});


app.get('/getTodoList', function (req, res) {

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    var datas = [];
    firebase.database().ref('todolist/'+uid).once('value', function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var data = childSnapshot.val();
        if (data.date) {
          var date = data.date;
          data.date = dateFormat(date, 'mm/dd');
        }
        datas.push(data);
  
      });
      res.status(200).send({result : 'success',rows:datas});
    });
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});


app.get('/list/category', function (req, res) {
  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  var rows = [];
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    firebase.database().ref('category').once('value', function (snapshot) {
      
      snapshot.forEach(function (childSnapshot) {
        var data = childSnapshot.val();

        if(data.writer === uid){
          rows.push(data);
        }

        if(data.member){
          for(key in data.member) {

            if(data.member[key] === email){
              rows.push(data);
            }
          }
        }
      });
      res.send({
        result: 'success',
        rows: rows
      });
    })
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});

app.get('/view', function (req, res) {
  var id = req.query.id;
  var status = req.query.status;

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    var url = '';
    if(status === 'daily'){
      url = 'daily/' + id;
    }else if(status === 'todolist'){
      url = 'todolist/'+uid+'/'+id
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

    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});


app.post('/add', function (req, res) {
  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  var data = req.body;
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

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
      if(data.todoComplete){
        addData['todoComplete'] = data.todoComplete;
      }
      
      if (!addData.id) {
        addData.id = firebase.database().ref().child('todolist/'+uid).push().key;
      }

      if (addData.id) {
        firebase.database().ref('todolist/' +uid+"/"+addData.id).set(addData);
      }
    }

    res.send({
      result: 'success'
    });

    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });

});

app.post('/delete', function (req, res) {
  
  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }


  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;
    var id = req.body.id;
    var status = req.body.writeRadio;

    var url = '';
    if(status === 'daily'){
      url = 'daily/'+id;
    }else if(status === 'todolist'){
      url = 'todolist/'+uid+'/'+id;
    }
    firebase.database().ref(url).remove();
    res.redirect('/list');

    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });

  
});

app.get(['/category', '/category/:id'], function (req, res) {
  if (req.params.id) {
    var host = req.get('host') || '';
    var sessionCookie = null;
  
    if(!host.includes('localhost')){
      res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
      sessionCookie = req.cookies.__session;
    }else{
      res.setHeader('Cache-Control', 'private');
      sessionCookie = req.cookies.session;
    }


    admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
      var uid = decodedClaims.sub;
      var email = decodedClaims.email;

      var categoryId = req.params.id;
      firebase.database().ref('category/' + categoryId).once('value', function (snapshot) {
        var data = snapshot.val();
        var writeYn = 'N';
        if(uid === data.writer){
          writeYn = 'Y';
        }
        res.render('category', {
          data: data,
          writeYn : writeYn
        });
      });
      return true;
    }).catch(error => {
      console.log(error);
      res.redirect('/');
    });

  } else {
    res.render('category');
  }
    
});

app.post('/category/add', function (req, res) {
  var data = req.body;

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    data.writer = uid;

    if(uid){
      if (!data.id) {
        data.id = firebase.database().ref().child('category').push().key;
      }

      if (data.id) {
        firebase.database().ref('category/' + data.id).set(data);
      }
    }
    res.redirect('/list');
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
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
      return true;
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
