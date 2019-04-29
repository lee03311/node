$(function(){
    getDays();
    myExpense();
    expenseCategoryList();
});

function getDays(){
    var today = new Date();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    mm = mm < 10 ? '0'+mm : mm;
    today = yyyy+"."+mm;


    $('#thisMonth').text(today);
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
    expenseCategoryList();
}


function myExpense(){ //내 예산 찾기
    $.ajax({
        url:'/expense/myBudget',
        dataType: 'json',
        type: 'get',
        success:function(data){
            // console.log(data)

            if(data.result == 'success'){
                // $('#remainCost').text(numberWithCommas(data.money));
                $('#totalCost').val(data.money);
            }
        }
    });
}

function expenseAdd(){
    var cost = $('#cost').val();
    var comment = $('#comment').val();
    var expenseCategory = $('#expenseCategory').val();
    var expenseCategoryTxt = $("#expenseCategory option:selected").text();
    var dates = $('#datepicker').val();

    if(!cost){
        alert('비용을 입력하세요');
        return false;
    }

    if(!comment){
        alert('코멘트를 입력하세요');
        return false;
    }

    var data = {
        status : 'add',
        cost : cost,
        comment : comment,
        date : dates,
        expenseCategory : expenseCategory,
        expenseCategoryTxt : expenseCategoryTxt
    }

    $.ajax({
        url:'/expense/add',
        dataType: 'json',
        type: 'post',
        data:data,
        success:function(data){

            if(data.result == 'success'){
                alert('등록에 성공하였습니다.')
                expenseCategoryList()
                $('#datepicker').val('');
                $('#cost').val('');
                $('#comment').val('');
                $('#expenseCategory').find("option:eq(0)").prop("selected", true);
            }
        },error:function(){
            alert('내 지출 관리에 문제가 발생했습니다.')
        }
    }); 

}

function expenseCategoryList(){
    $.ajax({
        url:'/expense/list',
        dataType: 'json',
        type: 'get',
        data:{
            date : $('#thisMonth').text()
        },
        success:function(data){
            if(data.result == 'success'){
                console.log(data);
                var expenseList = data.rows;
                var expenseAddArea = $('#expenseAddArea');

                expenseAddArea.empty();
                if(expenseList.length == 0){
                    $('<tr/>').append(
                        $('<td/>').attr('colspan', '4').text('데이터가 없습니다.')
                    ).appendTo(expenseAddArea);
                }

                var expenseTotalCost = 0;
                for(var i=0;i<expenseList.length;i++){
                    expenseTotalCost += parseInt(expenseList[i].cost);
                    $('<tr/>').addClass('expenseData').append(
                        $('<td/>').text(expenseList[i].categoryTxt)
                    ).append(
                        $('<td/>').text(numberWithCommas(expenseList[i].cost))
                    ).append(
                        $('<td/>').text(expenseList[i].comment)
                    ).append(
                        $('<td/>').append(
                            $('<span/>').attr('onclick', 'expenseRemove(this, "'+expenseList[i].id+'")').addClass('expenseRemoveBtn').append(
                                $('<i/>').addClass('far fa-times-circle')
                            )
                        )
                    ).appendTo(expenseAddArea);
                }

                var money = $('#totalCost').val();
                var remainExpense = money - expenseTotalCost;

                console.log(money);
                console.log(expenseTotalCost);
                $('#remainCost').text(numberWithCommas(remainExpense));
            }
        },error:function(){
            alert('내 지출관리 목록에 오류가 발생했습니다.')
        }
    });
}

function expenseRemove(obj, id){
    $.ajax({
        url:'/expense/add',
        dataType: 'json',
        type: 'post',
        data: {
            status : 'remove',
            id : id,
            date : $('#thisMonth').text()
        },
        success:function(data){
            if(data.result == 'success'){
                expenseCategoryList();
            }
        },error:function(){
            alert('예산 관리에 문제가 발생했습니다.')
        }
    });
}
