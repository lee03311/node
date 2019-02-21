var category = null;
$(function(){
    var categories = getCategoryList()
    category = categories.category;

    getDays();
    drawCateogry();
});


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
            console.log(data)
            if(data.result == 'success'){
                var dailyUl = $("#cardList");
                
                dailyUl.empty();
                var rows = data.rows;
                if(rows.length > 0){
                    for(var i=0;i<rows.length;i++){
                        
                        $('<li/>').append(
                            $('<div/>').addClass('front card').append(
                                $('<div/>').addClass('date').css('background',categoryMap(rows[i].category)).text(rows[i].date)
                            ).append(
                                $('<div/>').addClass('title').text(rows[i].title)
                            )
                            
                            .append(
                                $('<div/>').addClass('writer')
                            )
                            // .append(
                            //     $('<div/>').addClass('starDiv').append(
                            //         $('<i/>').addClass('fas fa-star orange')
                            //     ).append(
                            //         $('<i/>').addClass('fas fa-star orange')
                            //     ).append(
                            //         $('<i/>').addClass('fas fa-star orange')
                            //     ).append(
                            //         $('<i/>').addClass('fas fa-star orange')
                            //     ).append(
                            //         $('<i/>').addClass('fas fa-star orange')
                            //     )
                            // )
                            
                            .append(
                                $('<div/>').addClass('cardContent').text(rows[i].contents)
                            )
                        ).append(
                            $('<div/>').addClass('back card').append(
                                $('<div/>').addClass('subBtn').append(
                                    $('<ul/>').append(
                                        $('<li/>').append(
                                            $('<i/>').addClass('far fa-edit')
                                        )
                                    ).append(
                                        $('<li/>').append(
                                            $('<i/>').addClass('far fa-trash-alt')
                                        )
                                    )
                                )
                            ).append(
                                $('<h3/>').addClass('title').text(rows[i].title)
                            ).append(
                                $('<p/>').addClass('content').text(rows[i].contents)
                            )
                        ).appendTo(dailyUl)
                    }
                }
            }
       },error:function(){
           //alert('getList 오류!!!');
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
    var dailyCategoryArea = $(".dailyCategoryArea");

    var select = $('#cateogry');
    select.empty();
     
   /*var catqegory = getCategoryList(); 동기로 카테고리 받아옴.*/
    var length = category.length;
    for(var i=0; i<length ;i++){
        var datas = category[i];

        $('<div/>').addClass('dailyCategory').append(
            $('<div/>').addClass('categoryColor').attr('data-category-id',datas.id).css('background', datas.color)
        ).append(
            $('<span/>').addClass('categoryText').text(datas.category)
        ).appendTo(dailyCategoryArea);


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
