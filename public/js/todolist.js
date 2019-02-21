var category = null;
$(function(){
    getDays();
    // getTodoList();
});

function getDays(){
    var today = new Date();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    mm = mm < 10 ? '0'+mm : mm;
    today = yyyy+"."+mm;


    $('#thisMonth').text(today);
}

/* 
 * @param {*} status 
 * 월 이동 관련 스크립트
 */
function moveDays(status){
    var days = $('#thisMonth').text();
    days = days.replace(".", "/") + "/01";
    var info = new Date(days);
    var month = info.getMonth() + 1;
    var year = info.getFullYear(); 

    if(status == 'pre'){
        month--;
        if(month == 0){
            month = 12;
            year--;
        }
    }else{
        month++;
        if(month == 13){
            month = 1;
            year++;
        }
    }
    month = month < 10 ? '0'+ month : month;
    var newDays = year+"."+ month;
    $('#thisMonth').text(newDays);
}

function getTodoList(){
    // var lastDay = ( new Date( year, month, 0) ).getDate();

    // var date = {
    //     startDate : year+'/'+month+'/01',
    //     endDate : year+'/'+month+'/'+lastDay
    // }
    $.ajax({
        url: 'getTodoList',
        dataType: 'json',
        type: 'GET',
        success: function(data) {
            if(data.result == 'success'){
                var todolistUl = $("<ul/>");

                var todolistDiv= $('.todolist');

                todolistDiv.empty();
                var rows = data.rows;
                // dailyDiv.removeClass('noItem');

                if(rows.length > 0){
                    for(var i=0;i<rows.length;i++){
                        if(rows[i].todoComplete){
                            $("<li/>").attr('id', rows[i].id).addClass('complete').attr('onclick','showInfo("todolist","'+rows[i].id+'")').append(
                                //$('<div/>').addClass('circle').text(rows[i].date).css('background',categoryMap(rows[i].category))
                            ).append(
                                
                                $('<span/>').text(rows[i].title +" (" + rows[i].date + ") ").addClass('textTitle')
                            ).prependTo(todolistUl);
                        }else{
                            $("<li/>").attr('id', rows[i].id).addClass('list').attr('onclick','showInfo("todolist","'+rows[i].id+'")').append(
                                // $('<div/>').addClass('circle').text(rows[i].date)
                            ).append(
                                $('<span/>').text(rows[i].title +" (" + rows[i].date + ") ").addClass('textTitle')
                            ).append(
                                $('<div/>').addClass('textBox').append(
                                    $('<span/>').text(rows[i].contents)
                                )
                            ).prependTo(todolistUl);
                        }
                    }
                    
                }
                $("<li/>").addClass('todolistAddArea list').attr('onclick','openDialogForAdd("todo")').append(
                    $('<div/>').addClass('todolistAddDiv circle').append(
                        $('<span/>').addClass('glyphicon glyphicon-plus')
                    )
                ).prependTo(todolistUl);
                
                todolistUl.appendTo(todolistDiv);
            }
       },error:function(){
        //    alert('getList 오류!!!');
           window.location = '/';
       }
    });
}