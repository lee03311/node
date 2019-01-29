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
                    $("<span/>").text(category[i].category).appendTo(categoryList);
                }
            }
        }
    });
}