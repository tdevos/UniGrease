// ==UserScript==
// @name        UniGrease
// @include     */uniwebtime/code/prest/rep_hist_list.asp*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js
// @require     http://www.chartjs.org/assets/Chart.js
// @version     0.3
// @grant       none
// ==/UserScript==

$(function () {
    
    var $canvas = $('<canvas/>').attr({width: "800px", height: "400px"});

    $("body>table").after($canvas);

    function getLastBadge(callback){
        $.ajax({
            url: "ptage_list_hist.asp",
            type: "post",
            dataType: "html",
            success: function (data) {
                var hour = $(data).find("tr:nth(9) td:nth(2)").html();
                callback(hour);
            }
        });
    }
    
    var total = 0;
    var days = 0;
    
    var daysNames = [];
    var daysData = [];
    var normalData = [];
    var maxData = [];
    
    $("body>table").find("tr").each(function () {
        var $lastTd = $(this).find("td:nth(3)");
        value = $lastTd.html();
        if (value !== null) {
            value = value.replace(/ /gi, "");
            if (value.length == 4) {
                var $firstTd = $(this).find("td:nth(0)");
                daysNames.push($firstTd.html());
                
                days++;
                var valueToSeconds = toSeconds(value);
                daysData.push(valueToSeconds);
                
                normalData.push(toSeconds("08:00"));
                maxData.push(toSeconds("09:00"));
    
                total+= valueToSeconds;
                $lastTd.after(
                    $("<td>").css({align: "center", "text-align": "right"}).html(toHHMM(valueToSeconds - toSeconds("08:00")))
                );
            }
        }
    });
    
    daysNames.reverse();
    daysData.reverse();
    
    var aaa = $canvas.get(0);
    
    var newChart = new Chart(aaa.getContext("2d")).Line({
        labels: daysNames,
        datasets : [
            {
                data : maxData,
                fillColor : "rgba(100,100,100,0.5)"
            },
            {
                data : normalData,
                fillColor : "rgba(100,100,100,0.5)"
            },
            {
                fillColor : "rgba(100,100,100,0.5)",
                data : daysData
            }
        ]
    }, {
        pointDotRadius : 1
    });
    
    var $arrivalInput = $("<input>").css({
        width: "38px",
        "font-size" : "11px",
    }).val("00:00");
    
    // DISPLAY TOTAL
    var $td1 = $("<td>").css({align: "center", "border-bottom": "solid 1px"}).attr("align", "center").html("Total");
    var $td2 = $("<td>").css({align: "center", "border-bottom": "solid 1px"}).html("&nbsp;");
    var $td3 = $("<td>").css({align: "center", "border-bottom": "solid 1px"}).html("&nbsp;");
    var $td4 = $("<td>").css({align: "center", "border-bottom": "solid 1px"}).html("&nbsp;");
    
    getLastBadge(function(lastBadge){
        var rest =  total - (days * toSeconds("08:00"));
        var restHHMM = toHHMM(toSeconds(lastBadge) + toSeconds("08:30")) + " (" + toHHMM(rest) + ")";
        
        if((toSeconds("08:30") - rest) <= toSeconds("09:30")){
            var toGo = toSeconds(lastBadge) + toSeconds("08:30") - rest;
            var hourToGo = (toGo > toSeconds("18:00"))?"18:00 (" + (toHHMM(toSeconds("18:00") - toGo)) + ")":toHHMM(toGo);
        }else{
            var toGo = toSeconds(lastBadge) + toSeconds("09:30");
            var hourToGo = toHHMM(toGo) + " (-" + toHHMM(toSeconds(lastBadge) + toSeconds("08:30") - rest - toGo) + ")";
        }
        
        var currentdate = new Date();
        var now = currentdate.getHours() + ":" + currentdate.getMinutes();
        var hourIfYouLeaveNow = now + " (" + toHHMM(toSeconds(now) - toGo) + ")";
        var $table = $("<table>").append(
            $("<tr>").append($("<td>").html("Normal")).append($("<td>").html(restHHMM))
        ).append(
            $("<tr>").append($("<td>").html("Théorical leaving")).append($("<td>").html(hourToGo))
        ).append(
            $("<tr>").append($("<td>").html("If you leave now")).append($("<td>").html(hourIfYouLeaveNow))
        );
        var $td5 = $("<td>").html($table);
        $("body>table>tbody>tr").last().before($("<tr>")
                                          .append($td1)
                                          .append($td2)
                                          .append($td3)
                                          .append($td4)
                                          .append($td5)
                                          );
    
    });
    
    function toSeconds(time) {
        var parts = time.split(':');
        var seconds = (+parts[0]) * 60 * 60 + (+parts[1]) * 60;
        if(time.indexOf("-") > -1)
            seconds = seconds * -1;
        return seconds;
    }
    
    function toHHMM(sec) {
        var negative = false;
        if (sec < 0) {
            negative = true;
            sec = sec * -1;
        }
        
        var sec_num = parseInt(sec, 10);
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);

        if (hours < 10) {hours = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        var time = hours + ':' + minutes;
        
        if (negative)
            time = "-" + time
        return time;
    }
    
});
