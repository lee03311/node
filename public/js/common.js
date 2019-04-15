$(function(){
    $('.logout').click(function(){
        $.ajax({
            url: '/logout',
            dataType: 'json',
            type: 'get',
            success: function(data) {
                if(data.result == 'success'){
                    window.location ='/';
                }else{
                    alert('로그아웃하는데 문제가 발생하였습니다.');
                }
            }
        });
    });
})

function init() {
    
   
}

function logout(){
    $.ajax({
        url: '/logout',
        dataType: 'json',
        type: 'GET',
        success: function(data) {
            if(data.result == 'success'){
                window.location ='/';
            }else{
                alert('로그아웃하는데 문제가 발생하였습니다.');
            }
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

function numberWithCommas(x) {
    x = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    x+='원';
    return x;
}