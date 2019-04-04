$(function(){
    getTodoList();
});


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
                var todolistUl = $("#todolist");
                var todoComplete = $("#todoComplete");

                var rows = data.rows;
                todolistUl.empty();
                todoComplete.empty();
                
                if(rows.length > 0){
                    for(var i=0;i<rows.length;i++){
                        var date = new Date(rows[i].date);
                        var month = (date.getMonth()+1);
                        var day = date.getDate();

                        if(month <= 9){
                            month = '0'+month;
                        }

                        if(day <= 9){
                            day = '0'+day;
                        }

                        var li = $('<li/>').addClass('using').attr('id', rows[i].id)
                        .append(
                            $('<label/>').append(
                                $('<input/>').attr('type','checkbox').attr('onclick','todoContentsCheck(this)').addClass('todoContentsCheck')
                                .attr('value','Y').attr('name','todoClear').attr('id','todoClear'+i)
                            ).append(
                                $('<span/>').addClass('title').text(rows[i].title)
                            )
                        ).append(
                            $('<span/>').addClass('badge').text(month+'/'+day)
                        ).append(
                            $('<i/>').addClass('fas fa-chevron-circle-down').attr('onclick', 'openTodoContents(this)').css('display', 'none')
                        ).append(
                            $('<i/>').addClass('fas fa-chevron-circle-right').attr('onclick', 'openTodoContents(this)')
                        ).append(
                            $('<div/>').addClass('todoModifyDiv').append(
                                    $('<i/>').addClass('far fa-edit').attr('onclick', 'modifyTodoContents('+JSON.stringify(rows[i])+')')
                                ).append(
                                    $('<i/>').addClass('far fa-trash-alt').attr('onclick', 'removeTodoContents(this)')
                            )
                        ).append(
                            $('<div/>').addClass('contents').attr('id',rows[i].id + 'Content').append(
                                $('<ul>').append(
                                    $('<li>').text(rows[i].contents)
                                )
                            )
                        );

                        if(rows[i].todoComplete){
                            if(rows[i].todoComplete == 'Y'){
                                li.prependTo(todoComplete);
                                $('#todoClear'+i).prop('checked', true);
                            }else{
                                li.prependTo(todolistUl);
                                $('#todoClear'+i).prop('checked', false);
                            }
                        }else{
                            li.prependTo(todolistUl);
                            $('#todoClear'+i).prop('checked', false);
                        }
                    }
                }

            }
       },error:function(){
        //    alert('getList 오류!!!');
           window.location = '/';
       }
    });
}

function todoAddBtn(){
    $.ajax({
        url: '/todolist/add',
        dataType: 'json',
        type: 'post',
        data:$('#todoForm').serialize(),
        success: function(data) {
            if(data.result == 'success'){
                getTodoList();
            }
        }
    });
}

function modifyTodoContents(obj){

    var status = todoSectionToggle();
    console.log(status)
    if(status){
        $('#id').val(obj.id);

        $('#datepicker').val(obj.date);
        $('#title').val(obj.title);
        $('#contents').val(obj.contents);
    }
}

function removeTodoContents(){

}

function todoSectionToggle(){
    if($(".todoAddSection").is(":visible")){
        $(".todoAddSection").slideUp();
        $('.headerBtnAdd').show();

        $('#id').val('');
        $('#datepicker').val('');
        $('#title').val('');
        $('#contents').val('');
        return false;
    }else{
        $(".todoAddSection").slideDown();
        $('.headerBtnAdd').hide();
        return true;
    }
}

function openTodoContents(obj){
    var liId = $(obj).parent().attr('id');
    var contents = $(obj).parent().find('#'+liId+'Content');

    if(contents.is(":visible")){
        contents.slideUp();
        $(obj).parent().find('.fa-chevron-circle-down').hide();
        $(obj).parent().find('.fa-chevron-circle-right').show();
    }else{
        contents.slideDown();
        $(obj).parent().find('.fa-chevron-circle-down').show();
        $(obj).parent().find('.fa-chevron-circle-right').hide();
    }
}

function todoContentsCheck(obj){
    var status = 'Y';
    var id = $(obj).parent().parent().attr('id');
    if($(obj).is(":checked")){
        $(obj).next().css('text-decoration','line-through');
        $(obj).next().css('color','#ccc');
    }else{
        $(obj).next().css('text-decoration','inherit');
        $(obj).next().css('color','#333');
        status = 'N';
    }

    $.ajax({
        url: '/todolist/status',
        dataType: 'json',
        type: 'post',
        data:{
            id:id,
            status:status
        },
        success: function(data) {
            if(data.result == 'success'){
                getTodoList();
            }
        }
    });
}