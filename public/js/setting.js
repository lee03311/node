$(function(){
    getCategoryList();
})

function getCategoryList(){
    $.ajax({
        url: '/list/category',
        dataType: 'json',
        type: 'GET',
        success: function(data) {
            if(data.result == 'success'){
                var category = data.rows;
                console.log(category);
                var categoryList = $("#categoryList");
                
                for(var i=0;i<category.length;i++){
                    // $("<span/>").text(category[i].category).appendTo(categoryList);

                    $('<div/>').append(
                            $('<div/>').addClass('categoryArea').css('background-color', category[i].color)
                        ).append(
                            $('<span/>').addClass('categoryText').text(category[i].category)
                        ).append(
                            $('<label/>').addClass('switch').append(
                                $('<input/>').attr('type', 'checkbox')
                            ).append(
                                $('<span/>').addClass('slider round')
                            )
                        ).appendTo(categoryList);
                }
            }
        }
    });
}

function addMember(){
    if($('#shareMember').val()){
        $.ajax({
            url: '/setting2/shareMember',
            dataType: 'json',
            type: 'GET',
            data:{
                userEmail : $('#shareMember').val()
            },
            success: function(data) {
                console.log(data)
                var shareMemberList = $('.shareMemberList');
                if(data.result){
                    alert('test')
                    var shareUser = data.result;

                    $('<div/>').addClass('shareMemberUser')
                    .append(
                        $('<span/>').text(shareUser.email)
                    ).append(
                        $('<span/>').addClass('glyphicon glyphicon-remove')
                    ).appendTo(shareMemberList);
                }
            }
        });
    }
}