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
    
   
}

function logout(){
    var auth2 = gapi.auth2.getAuthInstance();

    auth2.signOut();
    //auth2.disconnect();
    $.ajax({
        url: '/logout',
        dataType: 'json',
        type: 'GET',
        success: function(data) {
            console.log(data.result)

            window.location ='/';
        }
    });

}


function verifyEmail(email){
    var emailRule = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;//이메일 정규식
 
    if(!emailRule.test(email)) {            
        //경고
        return false;
    }

    return true;
}