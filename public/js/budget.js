$(function(){


    budgetCategoryList();
});

function budgetAdd(){
    var cost = $('#cost').val();
    var comment = $('#comment').val();
    var budgetCategory = $('#budgetCategory').val();
    var budgetCategoryTxt = $("#budgetCategory option:selected").text();


    var data = {
        status : 'add',
        cost : cost,
        comment : comment,
        budgetCategory : budgetCategory,
        budgetCategoryTxt : budgetCategoryTxt
    }

    $.ajax({
        url:'/budget/add',
        dataType: 'json',
        type: 'post',
        data:data,
        success:function(data){

            if(data.result == 'success'){
                var budgetAddArea = $('#budgetAddArea');

                $('<tr/>').addClass('budgetData').append(
                    $('<td/>').text(budgetCategoryTxt)
                ).append(
                    $('<td/>').text(cost)
                ).append(
                    $('<td/>').text(comment)
                ).append(
                    $('<td/>').append(
                        $('<span/>').attr('onclick', 'budgetRemove(this, "'+data.id+'")').addClass('budgetRemoveBtn').append(
                            $('<i/>').addClass('far fa-times-circle')
                        )
                    )
                ).appendTo(budgetAddArea);
            
                var dataCount = $('.budgetData').length;
                
                if(dataCount > 0){
                    $('#noBudgetArea').hide();
                }
            
                $('#cost').val('');
                $('#comment').val('');
                $('#budgetCategory').find("option:eq(0)").prop("selected", true);
            }
        },error:function(){
            alert('예산 관리에 문제가 발생했습니다.')
        }
    }); 

}

function budgetRemove(obj, id){
    $.ajax({
        url:'/budget/add',
        dataType: 'json',
        type: 'post',
        data: {
            status : 'remove',
            id : id
        },
        success:function(data){
            if(data.result == 'success'){

                $(obj).parent().parent().remove();
                var dataCount = $('.budgetData').length;                
                if(dataCount == 0){
                    $('#noBudgetArea').show();
                }
            }
        },error:function(){
            alert('예산 관리에 문제가 발생했습니다.')
        }
    });
}

function budgetMoneySlider(){
    var money = $('#myBudgetSlider').slider('value');

    $.ajax({
        url:'/budget/add',
        dataType: 'json',
        type: 'post',
        data:{
            money:money
        },
        success:function(){

        },error:function(){
            alert('금액설정에 문제가 발생했습니다.')
        }
    });
}


function budgetCategoryList(){
    $.ajax({
        url:'/budget/list',
        dataType: 'json',
        type: 'get',
        success:function(data){
            if(data.result == 'success'){
                $("#myBudgetSlider").slider('value', data.money);
                $("#myBudgetValue").text(data.money);

                var btgCategory = data.myBudget;
                for(var i=0;i<btgCategory.length;i++){
                    var budgetAddArea = $('#budgetAddArea');

                    $('<tr/>').addClass('budgetData').append(
                        $('<td/>').text(btgCategory[i].categoryTxt)
                    ).append(
                        $('<td/>').text(btgCategory[i].cost)
                    ).append(
                        $('<td/>').text(btgCategory[i].comment)
                    ).append(
                        $('<td/>').append(
                            $('<span/>').attr('onclick', 'budgetRemove(this, "'+btgCategory[i].id+'")').addClass('budgetRemoveBtn').append(
                                $('<i/>').addClass('far fa-times-circle')
                            )
                        )
                    ).appendTo(budgetAddArea);
                
                    var dataCount = $('.budgetData').length;
                    
                    if(dataCount > 0){
                        $('#noBudgetArea').hide();
                    }
                }

                if(data.partnerInfo.email){
                    $('#partnerName').text(data.partnerInfo.email + '님의 예산')
                    $("#partnerBudgetSlider").slider('value', data.partnerInfo.partnerMoney);
                    $("#partnerBudgetValue").text(data.partnerInfo.partnerMoney);

                    var memberBtgCategory = data.partnerInfo.partnerBudget;
                    for(var i=0;i<memberBtgCategory.length;i++){
                        var budgetAddArea = $('#partnerBudgetAddArea');

                        $('<tr/>').addClass('partnerBudgetData').append(
                            $('<td/>').text(memberBtgCategory[i].categoryTxt)
                        ).append(
                            $('<td/>').text(memberBtgCategory[i].cost)
                        ).append(
                            $('<td/>').text(memberBtgCategory[i].comment)
                        ).appendTo(budgetAddArea);
                    
                        var dataCount = $('.partnerBudgetData').length;
                        
                        if(dataCount > 0){
                            $('#noPartnerBudgetArea').hide();
                        }
                    }
                }
            }
        },error:function(){
            alert('금액설정에 문제가 발생했습니다.')
        }
    });
}

