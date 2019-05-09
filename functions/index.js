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


admin.initializeApp(config);
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
        res.set('Cache-Control', 'public, max-age=0');
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
  if(!host.includes('localhost')){
    console.log('cache : public')
    res.set('Cache-Control', 'public, max-age=0');
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
  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    // res.set('Cache-Control', 'public, max-age=0');
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = '__session';
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = 'session';
  }

  res.clearCookie(sessionCookie);
  res.clearCookie('csrfToken');

  res.status(200).send({ 
    result : 'success'
  });
});

app.get('/list', function (req, res) {
  // var user = firebase.auth().currentUser;

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    // res.set('Cache-Control', 'public, max-age=0');
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }
  // console.log('getList 1=======================');

  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;
   
      res.render('list2',{email:email});
      return true;
    }).catch(error => {
      console.log('list render ===>' + error);
      res.redirect('/');
  });
});

app.get('/todolist', function (req, res) {
  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
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
      
      res.render('todolist',{email:email, rows:datas});
    });
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});


app.get('/getList', function (req, res) {
 
  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    // res.set('Cache-Control', 'public, max-age=0');
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

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
              data.date = dateFormat(date, 'dd');
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
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    var datas = [];

    firebase.database().ref('setting').orderByChild('member/uid').equalTo(uid).on("child_added", function(snapshot, prevChildKey) {
      var newPost = snapshot.val();
      var shareWriter = snapshot.key;

      if(newPost['item'].includes('todo')){
        firebase.database().ref('todolist/'+shareWriter).orderByChild('date').once('value', function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var data = childSnapshot.val();
            if (data.date) {
              var date = data.date;
              // data.date = dateFormat(date, 'mm/dd');
            }
            data['shareMemberTodo'] = 'Y';
            data['shareMemberUid'] = shareWriter;
            datas.push(data);      
          });
        });
      }
    });

    firebase.database().ref('todolist/'+uid).orderByChild('date').once('value', function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var data = childSnapshot.val();
        if (data.date) {
          var date = data.date;
          // data.date = dateFormat(date, 'mm/dd');
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

app.post('/todolist/add', function (req, res) {
  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
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

    if(data.todoComplete){
      addData['todoComplete'] = data.todoComplete;
    }else{
      addData['todoComplete'] = 'N';
    }
    
    if (!addData.id) {
      addData.id = firebase.database().ref().child('todolist/'+uid).push().key;
    }

    if (addData.id) {
      firebase.database().ref('todolist/' +uid+"/"+addData.id).set(addData);
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

app.post('/todolist/delete', function (req, res) {
  
  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }


  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;
    var id = req.body.id;

    firebase.database().ref('todolist/'+uid+'/'+id).remove();

    res.send({
      result: 'success'
    });

    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });

  
});

app.post('/todolist/status', function (req, res) {
  var data = req.body;

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    if(uid){
      if (data.id) {
        var memberId = uid;
        if(data.shareMemberTodo == 'Y'){
          memberId = data.shareMemberUid;
        }

        var todolistData = {};
        todolistData['/todolist/'+memberId+'/'+data.id+'/todoComplete'] = data.status; /*해당 카테고리의 show, hidden 값만 변경 */
        firebase.database().ref().update(todolistData);
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


app.get('/list/category', function (req, res) {
  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  var rows = [];
  var shareCategory = [];
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    firebase.database().ref('setting').orderByChild('member/uid').equalTo(uid).on("child_added", function(snapshot, prevChildKey) {
      var newPost = snapshot.val();

      if(newPost['item'].includes('daily')){
        if(newPost['categoryItem']){
          shareCategory = newPost['categoryItem'];
        }
      }
    });


    firebase.database().ref('category').once('value', function (snapshot) {
      
      snapshot.forEach(function (childSnapshot) {
        var data = childSnapshot.val();

        if(data.writer === uid){
          rows.push(data);
        }
        if(shareCategory.includes(data.id)){
          rows.push(data);
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
    res.set('Cache-Control', 'public, max-age=0');
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
    res.set('Cache-Control', 'public, max-age=0');
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

      if(data.care && data.care === 'foodCheck'){
        addData['care'] = data.care;
        addData['foodCheckPoint'] = data.foodCheckPoint;
      }
      
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
    res.set('Cache-Control', 'public, max-age=0');
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
      res.set('Cache-Control', 'public, max-age=0');
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
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    if(uid){
      if(data.id){
        var categoryData = {};
        categoryData['/category/'+data.id+'/color'] = data.color;
        categoryData['/category/'+data.id+'/category'] = data.category;
        categoryData['/category/'+data.id+'/type'] = data.type;
        firebase.database().ref().update(categoryData);
        res.send({
          result: 'success'
        });
      }else{
        if (!data.id) {
          data.categoryId = firebase.database().ref().child('category').push().key;
          data.writer = uid;
          data.status = 'show';
        }
        
        if(data.id){
          firebase.database().ref('category/' + data.id).set(data);
        }
        res.send({
          result: 'success'
        });
      }
    }
    
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});

app.post('/category/status', function (req, res) {
  var data = req.body;

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    if(uid){
      if (data.id) {
        var categoryData = {};
        categoryData['/category/'+data.id+'/status'] = data.status; /*해당 카테고리의 show, hidden 값만 변경 */
        firebase.database().ref().update(categoryData);
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

app.post('/category/delete', function (req, res) {
  var data = req.body;
  firebase.database().ref('category/' + data.id).remove();
  res.send({
    result: 'success'
  });
  return true;
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
app.get('/setting2', function(req, res){

  res.render('backup/setting');
});

app.get('/setting', function(req, res){
  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }


  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;
    

    // firebase.database().ref('setting/'+uid+'/item').once('value', function (snapshot) {
    //   snapshot.forEach(function (childSnapshot) {
    //     var data = childSnapshot.val();

    //     shareItem.push(data);
    //   });

    //   if(shareItem.includes('daily')){
    //     firebase.database().ref('setting/'+uid+'/categoryItem').once('value', function (categorySnapshot) {
    //       categorySnapshot.forEach(function (childSnapshot) {
            
    //         var categorySnapshotData = childSnapshot.val();
    //         shareCategory.push(categorySnapshotData);
    //       });

    //       res.render('setting',{email:email, shareItem:shareItem, shareCategory:shareCategory});
    //     });
    //   }else{
    //     res.render('setting',{email:email, shareItem:shareItem});
    //   }
    // });
    
    var shareItem = [];
    var shareCategory = [];
    var member = '';
    firebase.database().ref('setting/'+uid).once('value', function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key;
        var data = childSnapshot.val();
        if(key === 'item'){
          shareItem = data;
        }else if(key === 'categoryItem'){
          shareCategory = data;
        }else if(key === 'member'){
          member = data.member;
        }
      });
      res.render('setting',{email:email, shareItem:shareItem, shareCategory:shareCategory, member:member});
    });
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});

app.get('/setting/shareMember', function(req, res){

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  var data = req.query;

  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    if(uid){
      if(data.status === 'add'){
        admin.auth().getUserByEmail(data.shareMemberEmail).then(function(userRecord) {
          var verifyMember = {
            member : userRecord.email,
            uid : userRecord.uid
          }
          var addData = {};
          addData['member'] = verifyMember

          if(data.item){
            var itemObj = [];
            if(typeof data.item === 'string'){
              itemObj.push(data.item);
            }else{
              itemObj = data.item;
            }
            addData['item'] = itemObj;
          }

          if(data.categoryItem){
            var ctgObj = [];
            if(typeof data.categoryItem === 'string'){
              ctgObj.push(data.categoryItem);
            }else{
              ctgObj = data.categoryItem;
            }
            addData['categoryItem'] = ctgObj;
          }
          
          firebase.database().ref('setting/' + uid).set(addData);
      
          res.send({
            result: 'success'
          });
      
          return true;
        })
        .catch(function(error) {
          console.log("Error fetching user data:", error);
          
          res.send({
            result: 'error'
          });
        });
      }else if(data.status === 'clear'){
        firebase.database().ref('/setting/'+uid+'/member').remove();
      }
    }
    return true;
  }).catch(error => {
    console.log(error);
  });
});

/*예산 */
app.get('/budget', function(req, res){

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    res.render('budget',{email:email});
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });

});

app.post('/budget/add', function(req, res){
  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  var data = req.body;
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    var now = new Date();
          
    var pastMonth = now.setDate(now.getDate() - 1);
    now = dateFormat(now, 'yyyymm');
    pastMonth = dateFormat(pastMonth, 'yyyymm');
    console.log(pastMonth);

    if(uid){
      if(data.money){
        var budgetMoney = {};
        budgetMoney['budget/' + uid + '/' + now +'/'+'money'] = data.money;
        firebase.database().ref().update(budgetMoney);
        res.send({
          result: 'success'
        });
      }

      if(data.status){
        if(data.status === 'add'){
          var btgCategory = {
            cost : data.cost,
            comment : data.comment,
            category : data.budgetCategory,
            categoryTxt : data.budgetCategoryTxt
          }
          var id = firebase.database().ref().child('budget/' + uid + '/' + now +'/btgCategory/').push().key;
          firebase.database().ref('budget/' + uid + '/' + now +'/btgCategory/'+id).set(btgCategory);

          res.send({
            result: 'success',
            id:id
          });
        }else if(data.status === 'remove'){
          firebase.database().ref('budget/' + uid + '/' + now +'/btgCategory/'+data.id).remove();


          res.send({
            result: 'success'
          });
        }
      }
    }
    return true;
    
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});

app.post('/budget/copyThisMonth', function(req, res){
  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  var data = req.body;
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    var now = new Date();
    var pastMonth = now.setMonth(now.getMonth()-1);
    
    
    var today = dateFormat(new Date(), 'yyyymm');
    pastMonth = dateFormat(pastMonth, 'yyyymm');

    if(uid){
      var isPastMonthDataExist = false;
      firebase.database().ref('budget/' + uid + '/' + pastMonth).once("value", function(snapshot, prevChildKey) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var data = childSnapshot.val();
          isPastMonthDataExist = true;
  
          if(key === 'btgCategory'){
            childSnapshot.forEach(function (dataChildSnapShot){
              var categoryObj = dataChildSnapShot.val();

              var id = firebase.database().ref().child('budget/' + uid + '/' + today +'/btgCategory/').push().key;
              firebase.database().ref('budget/' + uid + '/' + today +'/btgCategory/'+id).set(categoryObj);
            });
          }else if(key === 'money'){
            money = data;

            var budgetMoney = {};
            budgetMoney['budget/' + uid + '/' + today +'/'+'money'] = data;
            firebase.database().ref().update(budgetMoney);
          }

        });
        
        res.send({
          result: 'success',
          isPastMonthDataExist : isPastMonthDataExist
        });
      });
    }
    
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});


app.get('/budget/list', function(req, res){

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  var data = req.body;

  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    var datas = [];
    var money = 0;

    
    var now = new Date();
    now = dateFormat(now, 'yyyymm');

    firebase.database().ref('budget/' + uid + '/' + now).once("value", function(snapshot, prevChildKey) {
      var myBudget = snapshot.val();

      snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key;
        var data = childSnapshot.val();

        if(key === 'btgCategory'){
          childSnapshot.forEach(function (dataChildSnapShot){
            var categoryObj = dataChildSnapShot.val();
            var categoryId = dataChildSnapShot.key;
            categoryObj['id'] = categoryId;

            datas.push(categoryObj);
          })
        }else if(key === 'money'){
          money = data;
        }
      });

      firebase.database().ref('setting/' + uid+'/member').once("value", function(settingSnapshot, prevChildKey) {
        var member = settingSnapshot.val();
        var partnerData = [];
        var partnerMoney = 0;
        firebase.database().ref('budget/' + member.uid +'/' + now).once("value", function(memberSnapshot, prevChildKey) {
          // var setting = memberSnapshot.val();
  
          memberSnapshot.forEach(function (memberChildSnapshot) {
            var memberKey = memberChildSnapshot.key;
            var memberData = memberChildSnapshot.val();
    
            if(memberKey === 'btgCategory'){
              memberChildSnapshot.forEach(function (memberDataChildSnapShot){
                var partnerDataObj = memberDataChildSnapShot.val();
                var partnerDataId = memberDataChildSnapShot.key;
                partnerDataObj['id'] = partnerDataId;
    
                partnerData.push(partnerDataObj);
              })
            }else if(memberKey === 'money'){
              partnerMoney = memberData;
            }
          });
    
          
          res.send({
                result: 'success',
                money : money,
                myBudget : datas,
                partnerInfo : {
                  email : member.member,
                  partnerBudget : partnerData,
                  partnerMoney : partnerMoney
                }
          });
        });
      });
      return true;
    });
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});


app.get('/statistics', function(req, res){

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    res.render('expenseStatistics',{email:email});
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});

app.get('/statistics/mylist', function(req, res){

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

var data = req.body;
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    var data = req.query;
    var dates = data.date;
    var datas = [];
    var tmp = [];

    if(dates){
      dates = dateFormat(dates, 'yyyymm');
    }

    firebase.database().ref('expense/' + uid +'/'+dates).once('value', function (snapshot) {
      var index = 0;
      snapshot.forEach(function (childSnapshot) {
        var data = childSnapshot.val();

        var setData = {
          category : data.categoryTxt,
          litres : parseInt(data.cost)
        }

        if(typeof tmp[setData['category']] === 'undefined'){
          tmp[setData['category']] = index++;
          datas.push(setData);
        }else{
          var obj = datas[tmp[setData['category']]];
          obj.litres += parseInt(setData.litres);
        }
      });
      res.status(200).send({ 
        result : 'success',
        rows:datas
      });
    });
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});


app.get('/statistics/list/orderbydate', function(req, res){

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  var data = req.body;
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    var data = req.query;
    var dates = data.date;
    var datas = [];
    var tmp = [];

    if(dates){
      dates = dateFormat(dates, 'yyyymm');
    }

    firebase.database().ref('expense/' + uid +'/'+dates).once('value', function (snapshot) {
      var index = 0;
      snapshot.forEach(function (childSnapshot) {
        var data = childSnapshot.val();

        var setData = {
          country : dateFormat(data.date, 'mm/dd'),
          visits : parseInt(data.cost)
        }

        if(typeof tmp[setData['country']] === 'undefined'){
          tmp[setData['country']] = index++;
          datas.push(setData);
        }else{
          var obj = datas[tmp[setData['country']]];
          obj.visits += parseInt(setData.visits);
        }
      });


      firebase.database().ref('setting/' + uid+'/member').once("value", function(settingSnapshot, prevChildKey) {
        var member = settingSnapshot.val();
        firebase.database().ref('expense/' + member.uid +'/'+dates).once('value', function (snapshot) {
          var index = 0;
          snapshot.forEach(function (childSnapshot) {
            var data = childSnapshot.val();
    
            var setData = {
              country : dateFormat(data.date, 'mm/dd'),
              visits : parseInt(data.cost)
            }
    
            if(typeof tmp[setData['country']] === 'undefined'){
              tmp[setData['country']] = index++;
              datas.push(setData);
            }else{
              var obj = datas[tmp[setData['country']]];
              obj.visits += parseInt(setData.visits);
            }
          });
  
          datas.sort(function(a, b){
            var aDate = dateFormat(a.country, 'dd');
            var bDate = dateFormat(b.country, 'dd');
            
            return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
          });

          res.status(200).send({ 
            result : 'success',
            rows:datas
          });
        });
        return true;
      });
    });
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});

app.get('/statistics/partner/list', function(req, res){

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

var data = req.body;
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    var data = req.query;
    var dates = data.date;
    var datas = [];
    var tmp = [];

    if(dates){
      dates = dateFormat(dates, 'yyyymm');
    }


    firebase.database().ref('setting/' + uid+'/member').once("value", function(settingSnapshot, prevChildKey) {
      var member = settingSnapshot.val();
      firebase.database().ref('expense/' + member.uid +'/'+dates).once('value', function (snapshot) {
        var index = 0;
        snapshot.forEach(function (childSnapshot) {
          var data = childSnapshot.val();
  
          var setData = {
            category : data.categoryTxt,
            litres : parseInt(data.cost)
          }
  
          if(typeof tmp[setData['category']] === 'undefined'){
            tmp[setData['category']] = index++;
            datas.push(setData);
          }else{
            var obj = datas[tmp[setData['category']]];
            obj.litres += parseInt(setData.litres);
          }
        });

        res.status(200).send({ 
          result : 'success',
          rows:datas
        });
      });

      return true;
      })
      .catch(function(error) {
          res.status(500).send({
          result: 'fail'
        });
      });
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});


app.get('/expense', function(req, res){

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    res.render('expense',{email:email});
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});

app.get('/expense/myBudget', function(req, res){

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    var datas = [];
    var money = 0;

    var now = new Date();
    now = dateFormat(now, 'yyyymm');
    
    firebase.database().ref('budget/' + uid + '/' + now).once("value", function(snapshot, prevChildKey) {
      var myBudget = snapshot.val();

      snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key;
        var data = childSnapshot.val();

        if(key === 'btgCategory'){
          childSnapshot.forEach(function (dataChildSnapShot){
            var categoryObj = dataChildSnapShot.val();
            var categoryId = dataChildSnapShot.key;
            categoryObj['id'] = categoryId;

            datas.push(categoryObj);
          })
        }else if(key === 'money'){
          money = data;
        }
      });

      
      res.send({
        result: 'success',
        money : money,
        myBudget : datas,
      });
    });
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});

app.post('/expense/add', function(req, res){
  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  var data = req.body;
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    if(uid){
      var dates = data.date;
      var yearMonth = '';
      if(dates){
        yearMonth = dateFormat(dates, 'yyyymm');
      }

      if(data.status){
        if(data.status === 'add'){

          var btgCategory = {
            cost : data.cost,
            comment : data.comment,
            date : dates,
            category : data.expenseCategory,
            categoryTxt : data.expenseCategoryTxt
          }

          var id = firebase.database().ref().child('expense/' + uid + '/'+yearMonth).push().key;
          firebase.database().ref('expense/' + uid +'/'+yearMonth +'/' +id).set(btgCategory);

          res.send({
            result: 'success',
            id:id
          });
        }else if(data.status === 'remove'){
          firebase.database().ref('expense/' + uid +'/'+yearMonth +'/' +data.id).remove();
          res.send({
            result: 'success'
          });
        }
      }
    }
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});

app.get('/expense/list', function(req, res){

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

var data = req.body;
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    var data = req.query;
    var dates = data.date;
    var datas = [];

    if(dates){
      dates = dateFormat(dates, 'yyyymm');
    }

    firebase.database().ref('expense/' + uid +'/'+dates).once('value', function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var data = childSnapshot.val();
        data['id'] = childSnapshot.key;
        datas.push(data);
      });
      res.status(200).send({ 
        result : 'success',
        rows:datas
      });
    });
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});


app.get('/partnerExpense', function(req, res){

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    firebase.database().ref('setting/' + uid+'/member').once("value", function(settingSnapshot, prevChildKey) {
      var member = settingSnapshot.val();
      var partnerData = [];

      admin.auth().getUserByEmail(member.member).then(function(userRecord) {
        firebase.database().ref('setting/'+member.uid+'/item').once('value', function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var data = childSnapshot.val();
            partnerData.push(data);
          });

          res.render('partnerExpense',{email:email, partnerShareOpenYn : partnerData.includes('expense')});
      });

      return true;
      })
      .catch(function(error) {
          res.status(500).send({
          result: 'fail'
        });
      });


      // firebase.database().ref('expense/' + member.uid +'/'+dates).once('value', function (snapshot) {
      //   snapshot.forEach(function (childSnapshot) {
      //     var data = childSnapshot.val();
      //     data['id'] = childSnapshot.key;
      //     datas.push(data);
      //   });
      //   res.status(200).send({ 
      //     result : 'success',
      //     rows:datas
      //   });
      // });
    });
    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});

app.get('/expense/partner/list', function(req, res){

  var host = req.get('host') || '';
  var sessionCookie = null;

  if(!host.includes('localhost')){
    res.set('Cache-Control', 'public, max-age=0');
    sessionCookie = req.cookies.__session;
  }else{
    res.setHeader('Cache-Control', 'private');
    sessionCookie = req.cookies.session;
  }

var data = req.body;
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var uid = decodedClaims.sub;
    var email = decodedClaims.email;

    var data = req.query;
    var dates = data.date;
    var datas = [];

    if(dates){
      dates = dateFormat(dates, 'yyyymm');
    }

    firebase.database().ref('setting/' + uid+'/member').once("value", function(settingSnapshot, prevChildKey) {
      var member = settingSnapshot.val();
      var partnerData = [];
      var partnerMoney = 0;

      firebase.database().ref('expense/' + member.uid +'/'+dates).once('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var data = childSnapshot.val();
          data['id'] = childSnapshot.key;
          datas.push(data);
        });
        res.status(200).send({ 
          result : 'success',
          rows:datas
        });
      });
    });

    return true;
  }).catch(error => {
    console.log(error);
    res.redirect('/');
  });
});


const api = functions.https.onRequest(app);

module.exports = {
  api
}
