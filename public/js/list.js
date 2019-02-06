var category = null;
$(function(){
    var categories = getCategoryList()
    category = categories.category;

    getDays();
    drawCateogry();
    getTodoList();
})

function getDays(){
    var today = new Date();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    mm = mm < 10 ? '0'+mm : mm;
    today = yyyy+"."+mm;


    $('#thisMonth').text(today);
    getList(yyyy, mm);
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
    getList(year, month);
}

function getList(year, month){
    var m = matchMedia("(max-width: 768px)");

    var lastDay = ( new Date( year, month, 0) ).getDate();

    var date = {
        startDate : year+'/'+month+'/01',
        endDate : year+'/'+month+'/'+lastDay,
        category : category
    }

    $.ajax({
        url: 'getList',
        dataType: 'json',
        type: 'get',
        data: date,
        success: function(data) {
            if(data.result == 'success'){
                var dailyUl = $("<ul/>");//$("#dataArea");
                // var todolistUl = $("<ul/>");

                var dailyDiv = $('.daily');
                // var todolistDiv= $('.todolist');

                dailyDiv.empty();
                // todolistDiv.empty();
                var rows = data.rows;
                /*var cateogries = getCategoryList();*/
                dailyDiv.removeClass('noItem');

                if(rows.length > 0){
                    for(var i=0;i<rows.length;i++){
                        var title = rows[i].title;
                        if(title.length > 10){
                            title = title.substring(0, 10) + "...";
                        }
                        $("<li/>").attr('id', rows[i].id).attr('data-category', rows[i].category).addClass('list').attr('onclick','showInfo("daily", "'+rows[i].id+'")').append(
                            $('<div/>').addClass('circle').text(rows[i].date).css('background',categoryMap(rows[i].category))
                        ).append(
                            $('<span/>').text(title).addClass('textTitle')
                        ).append(
                            $('<div/>').addClass('textBox').append(
                                $('<span/>').text(rows[i].contents)
                            )
                        ).prependTo(dailyUl);
                    }
                }
                //daily add
                $("<li/>").addClass('dailyAddArea list').attr('onclick','openDialogForAdd("daily")').append(
                        $('<div/>').addClass('dailyAddDiv').append(
                            $('<span/>').addClass('glyphicon glyphicon-plus')
                        )
                ).prependTo(dailyUl);    


                // $("<li/>").addClass('todolistAddArea complete').attr('onclick','openDialogForAdd("todo")').append(
                //     $('<div/>').addClass('todolistAddDiv circle').append(
                //         $('<span/>').addClass('glyphicon glyphicon-plus')
                //     )
                // ).prependTo(todolistUl);
                
                dailyUl.appendTo(dailyDiv);
                // todolistUl.appendTo(todolistDiv);
            }
       },error:function(){
           //alert('getList 오류!!!');
           window.location = '/';
       }
    });
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

function getCategoryList(){
    var category;
    $.ajax({
        url: '/list/category',
        dataType: 'json',
        type: 'GET',
        async: false, /*동기*/
        success: function(data) {
            if(data.result == 'success'){
                category = data.rows;
            }
        }
    });
    return {
        category :category
    };
}

function categoryMap(categoryId){
    var backColor = 'rgb(255, 101, 58)';
    if(category){
        for(var i=0;i<category.length;i++){
            if(categoryId == category[i].id){
                backColor = category[i].color;
            }
        }
    }
    return backColor;
}

function drawCateogry(){ //첫 진입시 호출하여 메인의 사이드바에 카테고리 항목 그리는 거하고, 모달에 카테고리 그려주는거 2가지 일을 함.
    var menu = $("#menu");

    var select = $('#cateogry');
    select.empty();
     
   /*var catqegory = getCategoryList(); 동기로 카테고리 받아옴.*/
    var length = category.length;
    for(var i=0; i<length ;i++){
        var datas = category[i];

        $("<li/>").attr('id','cateogryList_'+datas.id).addClass('active').append(
            $("<a/>").attr('onclick', 'clickCategory("'+datas.id+'")').attr('href','javascript:void(0);').append(
                $("<div/>").addClass('categoryArea').attr('data-category-id',datas.id).css('background', datas.color)
            )
        ).prependTo(menu);

        select.append(
            $('<option/>').attr('value',datas.id).text(datas.category)
        )
    }


    $( "div.categoryArea" ).contextmenu(function() {
        event.preventDefault();
        if(!confirm('수정하시겠습니까?')){
            return false;
        }
        window.location='/category/'+$(this).attr('data-category-id');
    });
}


function clickCategory(categoryId){
    var clickLi = 'cateogryList_'+categoryId;

    if($('#'+clickLi).hasClass('active')){
        $('#'+clickLi).removeClass('active');
        $('#'+clickLi).addClass('inactive');
    }else if($('#'+clickLi).hasClass('inactive')){
        $('#'+clickLi).removeClass('inactive');
        $('#'+clickLi).addClass('active');
    }else{
        $('#'+clickLi).addClass('active');
    }

    //첫 로딩시 무조건 active를 붙임.
    $('.daily>ul>li').each(function(index){
        var li = $(this);
        if(li.attr('data-category') == categoryId){
            if($('#'+clickLi).hasClass('active')){
                li.show();
            }else{
                li.hide();
            }
        }
    });
}

function showInfo(status, id){
    $.ajax({
        url: '/view',
        dataType: 'json',
        type: 'GET',
        data: {status:status, id:id},
        success: function(data) {
            if(data.result == 'success'){
                $('#id').val(data.data.id);
                $('input[name=date]').val(data.data.date);
                $('#title').val(data.data.title);
                $('#contents').val(data.data.contents);
                $("#"+status).prop('checked', true);
                $("#todoComplete").prop('checked', false); 

                if(status == 'todolist'){
                    $('#cateogry').hide();
                    $('#cateogry').val('');
                    $("#todolist").prop('checked', true);
                    $("#todo_compelete").show();
                    
                    if(data.data.todoComplete && data.data.todoComplete == 'Y'){
                        $("#todoComplete").prop('checked', 'checked');                        
                    }
                }else{
                    $('#cateogry').show();
                    $("#todo_compelete").hide();
                    $('select[name="category"]').val(data.data.category);
                }                

                $('.deletebtn').show();
                $('#myModal').modal('show');
            }
       },error:function(){
           alert('getList 오류!!!');
       }
    });
}

function openDialogForAdd(status){
    $('#id').val('');
    $('input[name=date]').val('');
    $('#title').val('');
    $('#contents').val('');

    $('.deletebtn').hide();

    if(status == 'daily'){
        $("#cateogry option:eq(0)").prop("selected", true);
        $('#cateogry').show();
        $("#daily").prop('checked', true);
    }else{
        $('#cateogry').hide();
        $('#cateogry').val('');
        $("#todo_compelete").hide();
        $("#todolist").prop('checked', true);
    }



    $('#myModal').modal('show');
}
