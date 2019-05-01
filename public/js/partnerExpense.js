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
    partnerExpenseList();
}


function partnerExpenseList(){
    $.ajax({
        url:'/expense/partner/list',
        dataType: 'json',
        type: 'get',
        data:{
            date : $('#thisMonth').text()
        },
        success:function(data){
            if(data.result == 'success'){
                var expenseList = data.rows;
                var expenseAddArea = $('#expenseAddArea');

                expenseAddArea.empty();
                if(expenseList.length == 0){
                    $('<tr/>').append(
                        $('<td/>').attr('colspan', '3').text('데이터가 없습니다.')
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
                    ).appendTo(expenseAddArea);
                }

                var money = $('#totalCost').val();
                var remainExpense = money - expenseTotalCost;

                $('#remainCost').text(numberWithCommas(remainExpense));
            }
        },error:function(){
            alert('내 지출관리 목록에 오류가 발생했습니다.')
        }
    });
}