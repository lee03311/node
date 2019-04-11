function budgetAdd(){
    var cost = $('#cost').val();
    var comment = $('#comment').val();
    var budgetCategory = $('#budgetCategory').val();
    var budgetCategoryTxt = $("#budgetCategory option:selected").text();


    var budgetAddArea = $('#budgetAddArea');

    $('<tr/>').append(
        $('<td/>').text(budgetCategoryTxt)
    ).append(
        $('<td/>').text(cost)
    ).append(
        $('<td/>').text(comment)
    ).append(
        $('<td/>').append(
            $('<span/>').attr('onclick', 'budgetRemove(this)').addClass('budgetRemoveBtn').append(
                $('<i/>').addClass('far fa-times-circle')
            )
        )
    ).appendTo(budgetAddArea);

    
    $('#cost').val('');
    $('#comment').val('');
    $('#budgetCategory').find("option:eq(0)").prop("selected", true);
}

function budgetRemove(obj){
    $(obj).parent().parent().remove();
}