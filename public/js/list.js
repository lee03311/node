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
                        
                        $('<li/>').attr('data-category', rows[i].category).append(
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
                                            $('<a/>').attr('onclick', 'javascript:editContent("'+year+'","'+month+'", '+JSON.stringify(rows[i])+')').append($('<i/>').addClass('far fa-edit'))
                                        )
                                    ).append(
                                        $('<li/>').append(
                                            $('<a/>').attr('onclick', 'javascript:deleteContent("'+rows[i].id+'")').append($('<i/>').addClass('far fa-trash-alt'))
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

function editContent(year, month, data){ /*수정일때*/
    // $('#category').val(obj.category);
    $('#id').val(data.id);
    $('select[name="category"]').val(data.category);
    $('#datepicker').val(year + '/' +month +'/' +data.date);
    $('#title').val(data.title);
    $('#contents').val(data.contents);

    goListAndWrite('update');
}

function deleteContent(id){
    $('#id').val(id);
    reportDelete();
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

        console.log(datas)
        $('<div/>').addClass('dailyCategory active')
        .attr('id', 'cateogryList_'+datas.id)
        .attr('onclick', 'javascript:toggleCategoryActive("'+datas.id+'",this)').append(
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

function toggleCategoryActive(categoryId, obj){
    if($(obj).hasClass('active')){
        $(obj).removeClass('active');
    }else{
        $(obj).addClass('active');
    }

    var status = 'show';
    var clickLi = 'cateogryList_'+categoryId;
    $('#cardList>li').each(function(index){
        var li = $(this);
        if(li.attr('data-category') == categoryId){
            if($('#'+clickLi).hasClass('active')){
                li.show();
            }else{
                li.hide();
                status = 'hidden';
            }


            $.ajax({
                url: '/category/add',
                dataType: 'json',
                type: 'post',
                data:{
                    id:categoryId,
                    status:status
                },
                success: function(data) {
                    if(data.result == 'success'){
                        category = data.rows;
                    }
                }
            });
        }
    });
}
