$(function(){
    budgetCategoryList();
});

function budgetAdd(){
    var cost = $('#cost').val();
    var comment = $('#comment').val();
    var budgetCategory = $('#budgetCategory').val();
    var budgetCategoryTxt = $("#budgetCategory option:selected").text();

    if(!cost){
        alert('비용을 입력하세요');
        return false;
    }

    if(!comment){
        alert('코멘트를 입력하세요');
        return false;
    }

    var btgTotalCost = $('#totalCost').val();
    var totalBudget = $('#myBudgetSlider').slider('value');

    if(totalBudget < btgTotalCost + cost){
        alert('정해진 예산금액을  초과합니다.');
        return false;
    }

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
            budgetCategoryList();
            // if(data.result == 'success'){
            //     var budgetAddArea = $('#budgetAddArea');

            //     $('<tr/>').addClass('budgetData').append(
            //         $('<td/>').text(budgetCategoryTxt)
            //     ).append(
            //         $('<td/>').text(numberWithCommas(cost))
            //     ).append(
            //         $('<td/>').text(comment)
            //     ).append(
            //         $('<td/>').append(
            //             $('<span/>').attr('onclick', 'budgetRemove(this, "'+data.id+'")').addClass('budgetRemoveBtn').append(
            //                 $('<i/>').addClass('far fa-times-circle')
            //             )
            //         )
            //     ).appendTo(budgetAddArea);
            
            //     var dataCount = $('.budgetData').length;
                
            //     if(dataCount > 0){
            //         $('#noBudgetArea').hide();
            //     }
            
            //     $('#cost').val('');
            //     $('#comment').val('');
            //     $('#budgetCategory').find("option:eq(0)").prop("selected", true);
            //     var remainBudget = totalBudget - (parseInt(btgTotalCost) + parseInt(cost));
            //     $('#totalCost').val(parseInt(btgTotalCost) + parseInt(cost));
            //     $('#remainBudget').text('여유비용 : ' + numberWithCommas(remainBudget));
            // }
        },error:function(){
            alert('예산 관리에 문제가 발생했습니다.')
        }
    }); 

}

function budgetPastMonthDataThisMonth(){
    $.ajax({
        url:'/budget/copyThisMonth',
        dataType: 'json',
        type: 'post',
        success:function(data){
            if(data.result == 'success'){
                if(!data.isPastMonthDataExist){
                    alert('지난달에도 등록된 예산정보가 없습니다.\r\n새로 등록하세요.');
                    return false;
                }
                budgetCategoryList();
            }
        },error:function(){
            // alert('예산 관리에 문제가 발생했습니다.')
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
        success:function(data){
            console.log(data);
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
                
                var money = numberWithCommas(data.money);
                $("#myBudgetValue").text(money);
                
                var btgCategory = data.myBudget;
                var btgTotalCost = 0;
                if(!data.money && btgCategory.length == 0){
                    if(confirm('이번달 예산이 등록되지 않았습니다.\r\n지난달 예산과 동일하게 등록하시겠습니까?')){
                        budgetPastMonthDataThisMonth();
                    }
                }

                for(var i=0;i<btgCategory.length;i++){
                    btgTotalCost += parseInt(btgCategory[i].cost);
                    var budgetAddArea = $('#budgetAddArea');

                    $('<tr/>').addClass('budgetData').append(
                        $('<td/>').text(btgCategory[i].categoryTxt)
                    ).append(
                        $('<td/>').text(numberWithCommas(btgCategory[i].cost))
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

                $('#totalCost').val(btgTotalCost);
                var remainBudget = data.money - btgTotalCost;
                $('#remainBudget').text('여유비용 : '+numberWithCommas(remainBudget));

                if(data.partnerInfo.email){
                    $('#partnerName').text(data.partnerInfo.email + '님의 예산')
                    $("#partnerBudgetSlider").slider('value', data.partnerInfo.partnerMoney);
                    $("#partnerBudgetValue").text(numberWithCommas(data.partnerInfo.partnerMoney));

                    var memberBtgCategory = data.partnerInfo.partnerBudget;
                    var partnerTotalBudget = 0;
                    for(var i=0;i<memberBtgCategory.length;i++){
                        var budgetAddArea = $('#partnerBudgetAddArea');

                        partnerTotalBudget += parseInt(memberBtgCategory[i].cost);
                        $('<tr/>').addClass('partnerBudgetData').append(
                            $('<td/>').text(memberBtgCategory[i].categoryTxt)
                        ).append(
                            $('<td/>').text(numberWithCommas(memberBtgCategory[i].cost))
                        ).append(
                            $('<td/>').text(memberBtgCategory[i].comment)
                        ).appendTo(budgetAddArea);
                    
                        var dataCount = $('.partnerBudgetData').length;
                        
                        if(dataCount > 0){
                            $('#noPartnerBudgetArea').hide();
                        }
                    }

                    var partnerRemainCost = parseInt(data.partnerInfo.partnerMoney) - partnerTotalBudget;
                    $('<tr/>').append(
                        $('<td/>').addClass('partnerTotalBudget').text('총액 (남은예산)')
                    ).append(
                        $('<td/>').attr('colspan', '3').text(numberWithCommas(partnerTotalBudget) + ' ('+numberWithCommas(partnerRemainCost)+')')
                    ).appendTo(budgetAddArea);
                }
            }
        },error:function(){
            alert('금액설정에 문제가 발생했습니다.')
        }
    });
}