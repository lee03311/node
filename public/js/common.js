// $(document).keydown(function(e) {
//     key = (e) ? e.keyCode : event.keyCode;
//     var t = document.activeElement;
     
//     if (key == 116 || key == 17 || key == 82) { /*key == 8 -> backspace||  */
//         if (e) {
//             e.preventDefault();
//         } else {
//             event.keyCode = 0;
//             event.returnValue = false;
//         }
//     }
// });



function init() {
    gapi.load('auth2', function() { // Ready. 
    });
}

function logout(){
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function (){
        $.ajax({
            url: '/logout',
            dataType: 'json',
            type: 'GET',
            success: function(data) {
                console.log(data.result)
                //window.location ='/list';
            }
        });
    });
    auth2.disconnect();
}
