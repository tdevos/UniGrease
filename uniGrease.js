// ==UserScript==
// @name        UniGrease
// @include     http://hhrmatriuap005v/uniwebtime/code/prest/rep_hist_list.asp*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js
// @version     0.1
// @grant       none
// ==/UserScript==

$(function () {
    
    var total = 0;
    var days = 0;
    
    $("body>table").find("tr").each(function () {
        var $lastTd = $(this).find("td:nth(3)");
        value = $lastTd.html();
        if (value !== null) {
            value = value.replace(/ /gi, "");
            if (value.length == 4) {
                days++;
                var valueToSeconds = toSeconds(value);
                total+= valueToSeconds;
                $lastTd.after(
                    $("<td>").css({align: "center", "text-align": "right"}).html(toHHMM(valueToSeconds - toSeconds("08:00")))
                );
            }
        }
    });
    
    var rest =  total - (days * toSeconds("08:00"));
    var restHHMM = toHHMM(rest);
    
    var $arrivalInput = $("<input>").css({
        width: "38px",
        "font-size" : "11px",
    }).val("00:00");
    
    // DISPLAY TOTAL
    var $td1 = $("<td>").css({align: "center", "border-bottom": "solid 1px"}).attr("align", "center").html("Total");
    var $td2 = $("<td>").css({align: "center", "border-bottom": "solid 1px"}).html("&nbsp;");
    var $td3 = $("<td>").css({align: "center", "border-bottom": "solid 1px"}).html("Prestations" + $("<div>").html($arrivalInput).html() + "-");
    var $td4 = $("<td>").css({align: "center", "border-bottom": "solid 1px"}).html("&nbsp;");
    var $td5 = $("<td>").css({align: "center", "border-bottom": "solid 1px"}).attr("align", "center").html(restHHMM);
    $("body>table>tbody>tr").last().before($("<tr>")
                                          .append($td1)
                                          .append($td2)
                                          .append($td3)
                                          .append($td4)
                                          .append($td5)
                                          );
    
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
