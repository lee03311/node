$(function(){

    var today = new Date();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    mm = mm < 10 ? '0'+mm : mm;
    today = yyyy+"."+mm;
    console.log(today)
    expenseCategoryList(today);
});

function expenseCategoryList(today){
    $.ajax({
        url:'/statistics/mylist',
        dataType: 'json',
        type: 'get',
        data:{
            date : today
        },
        success:function(data){
            if(data.result == 'success'){
                var totalCost = 0;
                for(i in data.rows){
                    totalCost += parseInt(data.rows[i].litres);
                }
                
                myExpenseChart(data.rows, totalCost);
            }
        },error:function(){
            alert('내 지출관리 목록에 오류가 발생했습니다.')
        }
    });
}

function myExpenseChart(data, totalCost){
    am4core.ready(function() {

        // Themes begin
        am4core.useTheme(am4themes_material);
        am4core.useTheme(am4themes_animated);
        // Themes end

        // Create chart instance
        var chart = am4core.create("chartdiv", am4charts.PieChart);

        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        
        pieSeries.dataFields.value = "litres";
        pieSeries.dataFields.category = "country";

        // Let's cut a hole in our Pie chart the size of 30% the radius
        chart.innerRadius = am4core.percent(40);

        // Put a thick white border around each Slice
        pieSeries.slices.template.stroke = am4core.color("#fff");
        pieSeries.slices.template.strokeWidth = 2;
        pieSeries.slices.template.strokeOpacity = 1;
        pieSeries.slices.template
        // change the cursor on hover to make it apparent the object can be interacted with
        .cursorOverStyle = [
            {
            "property": "cursor",
            "value": "pointer"
            }
        ];

        pieSeries.alignLabels = false;
        //- pieSeries.labels.template.bent = true;
        //- pieSeries.labels.template.radius = 3;
        //- pieSeries.labels.template.padding(0,0,0,0);

        pieSeries.ticks.template.disabled = true;

        pieSeries.labels.template.text = "{category}";
        pieSeries.labels.template.radius = am4core.percent(-25);
        pieSeries.labels.template.fill = am4core.color("white");

        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
            });

        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });

        pieSeries.labels.template.adapter.add("hidden", function(color, target) {
            return target.dataItem.values.value.percent < 5 ? true : false;
        });

        
        pieSeries.slices.template.tooltipText = " {category} : {value.value} ({value.percent.formatNumber('#.0')}%)";

        // Create a base filter effect (as if it's not there) for the hover to return to
        var shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
        shadow.opacity = 0;

        // Create hover state
        var hoverState = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists

        // Slightly shift the shadow and make it more prominent on hover
        var hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
        hoverShadow.opacity = 0.7;
        hoverShadow.blur = 5;

        // Add a legend
        //- chart.legend = new am4charts.Legend();
        chart.fontSize = 12;

        chart.data = data;

        let label = pieSeries.createChild(am4core.Label);
        label.text = numberWithCommas(totalCost);
        label.horizontalCenter = "middle";
        label.verticalCenter = "middle";
        label.fontSize = 20;
    }); // end am4core.ready()
}