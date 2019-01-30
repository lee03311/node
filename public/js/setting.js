$(function(){
    getCategoryList();
})

function getCategoryList(){
    $.ajax({
        url: '/list/category',
        dataType: 'json',
        type: 'GET',
        async: false, /*동기*/
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
        ;;
    }
}