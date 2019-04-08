function getCategory(shareCategory){
    $.ajax({
        url:'/list/category',
        dataType: 'json',
        type: 'GET',
        success:function(data){
            var category = data.rows;
            var categoryList = $('.categoryList');
            categoryList.empty();

            for(var i=0;i<category.length;i++){
                var datas = category[i];

                var div = $('<div/>').addClass('dailyCategory').attr('data-show-status', datas.status);
                if(datas.status == 'show'){
                    div.addClass('active');
                }
                
                div.attr('id', 'cateogryList_'+datas.id).append(
                    $('<div/>').addClass('categoryColor').attr('data-category-id',datas.id).css('background', datas.color)
                ).append(
                    $('<span/>').addClass('categoryText').text(datas.category).attr('onclick', 'editCategory('+JSON.stringify(datas)+')')
                ).append(
                    $('<span/>').css('cursor', 'pointer').append(
                        $('<i/>').addClass('far fa-trash-alt').css('font-size','12px')
                    ).attr('onclick', 'removeCategory("'+datas.id+'")')
                );
                
                categoryList.append(div);
            }
            shareCategoryDraw(category, shareCategory);
        }
    });
}
function shareCategoryDraw(category, shareCategory){
    var shareSelectCategory = $('.shareSelectCategory');
    shareSelectCategory.empty();

    for(var i=0;i<category.length;i++){
        var datas = category[i];
        
        var div = $('<div/>');
        
        div.attr('id', datas.id).append(
            $('<span/>').addClass('categoryText').text(category[i].category)
        )
        .append(
            $('<label/>').addClass('switch').append(
                $('<input/>').attr('type', 'checkbox').attr('name', 'categoryItem').attr('id','ctg_'+datas.id).attr('value', datas.id)
            ).append(
                $('<span/>').addClass('slider round')
            )
        );
        
        shareSelectCategory.append(div);
    }

    if(shareCategory){
        var shareCategoryArr = shareCategory.split(',');
        for(var i=0;i<shareCategoryArr.length;i++){
            $('#ctg_'+shareCategoryArr[i]).prop('checked', 'checked')
        }
    }

    $('input[name=categoryItem]').change(function(){
        if($(this).is(':checked')){
            $('#daily').prop('checked', true);
        }
    });
}

function addCategory(){
    if($('#category').val() == ''){
        alert('카테고리명을 입력하세요.');
        return false;
    }

    if(!confirm('카테고리를 추가하시겠습니까?')){
        return false;
    }

    $.ajax({
        url:'/category/add',
        dataType: 'json',
        type: 'post',
        data: $('#categoryForm').serialize(),
        success:function(data){
            alert('등록되었습니다.');
            getCategory();
        },error:function(){
            alert('관리자에게 문의하세요');
        }
    });
}

function editCategory(obj){
    console.log(obj)
}

function removeCategory(id){
    if(!id){
        alert('해당하는 카테고리가 존재하지 않습니다.');
        return false;
    }

    if(!confirm('카테고리를 삭제하시겠습니까?')){
        return false;
    }

    $.ajax({
        url:'/category/delete',
        dataType: 'json',
        type: 'post',
        data: {
            id:id
        },
        success:function(data){
            alert('삭제되었습니다.');
            getCategory();
        },error:function(){
            alert('관리자에게 문의하세요');
        }
    });
}

function addShareMember(){
    var shareMemberEmail = $('#shareMemberEmail').val();

    var regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;

    if($('#daily').is(':checked')){//카테고리 선택하세요 띄우기
        if(!$('input[name=categoryItem]').is(':checked')){
            alert('공유할 카테고리를 선택하세요.');
            return false;
        }
    }

    if(!shareMemberEmail){
        alert('공유할 멤버의 이메일을 입력하세요');
        return false;
    }

    if(!regExp.test(shareMemberEmail)){
        alert('공유할 멤버의 이메일을 정확하게 입력하세요');
        return false;
    }

    if(confirm('입력한 멤버와 공유하시겠습니까?')){
        $('#status').val('add');
        $.ajax({
            url:'/setting/shareMember',
            dataType: 'json',
            type: 'get',
            data: $('#shareItems').serialize(),
            success:function(data){
                if(data.result == 'success'){
                    $('#shareMemberEmail').attr('readonly', true);
                    $('#shareMemberEmail').css('background', '#ccc');
                    $('#shareMemberEmail').parent().css('background', '#ccc');
                    alert('저장되었습니다.');
                }
            },error:function(error){
                console.log(error);
            }
        });
    }
}

function clearShareMember(){
    if(!confirm('등록된 멤버와의 공유를 끊으시겠습니까?')){
        return false;
    }
    $('#status').val('clear');
    $.ajax({
        url:'/setting/shareMember',
        dataType: 'json',
        type: 'get',
        data:{
            status:'clear'
        },
        success:function(data){

            if(data.result == 'success'){
                $('#shareMemberEmail').attr('readonly', true);
                $('#shareMemberEmail').css('background', '#ccc');
                $('#shareMemberEmail').parent().css('background', '#ccc');
            }
        }
    });

    $('#shareMemberEmail').removeAttr('readonly');
    $('#shareMemberEmail').css('background', '#fff');
    $('#shareMemberEmail').parent().css('background', '#fff');
    $('#shareMemberEmail').val('');
}