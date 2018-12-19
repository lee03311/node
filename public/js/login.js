$(function(){

    var config = {
        apiKey: "AIzaSyDG1mV_4yasiUJkUiyYM-nCOMra_Z3jhw4",
        authDomain: "start-moon.firebaseapp.com",
        databaseURL: "https://start-moon.firebaseio.com",
        projectId: "start-moon",
        storageBucket: "start-moon.appspot.com",
        messagingSenderId: "516803201821"
      };
    firebase.initializeApp(config);

    $('#login').on('click', function(){
        var email = $('#email').val();
        var password = $('#password').val();

        var auth = firebase.auth();
        var promise = auth.signInWithEmailAndPassword(email, password);
        promise.catch(e => console.log(e.message));
    })
});