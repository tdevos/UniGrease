// ==UserScript==
// @name        UniGrease
// @include     */uniwebtime/code/prest/rep_hist_list.asp*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js
// @require     https://raw.githubusercontent.com/nnnick/Chart.js/v0.2.0/Chart.js
// @version     0.4
// @grant       none
// ==/UserScript==
$(function () {
  var $canvas = $('<canvas/>') .attr({
    width: '500px',
    height: '400px'
  }),
  $table = $('body>table');
  $countDown = $("<span>").appendTo($table);
  
  function countDown(hourInSeconds){
    nowDate = new Date();
    date = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 0, 0, hourInSeconds)
    rest = date.getTime() - nowDate.getTime();
    secondsTotal = rest/1000;
    $countDown.html(toHHMM(secondsTotal, true));
  }
  
  /* STYLE IT */
  $table.css({
    float: 'left'
  });
  $table.after($canvas);
  function getLastBadge(callback) {
    $.ajax({
      url: 'ptage_list_hist.asp',
      type: 'post',
      dataType: 'html',
      success: function (data) {
        var hour = $(data) .find('tr:nth(9) td:nth(2)') .html();
        callback(hour);
      }
    });
  }
  var total = 0;
  var days = 0;
  var daysNames = [
  ];
  var daysData = [
  ];
  var normalData = [
  ];
  var maxData = [
  ];
  var minDataHour = '05:00';
  var minData = [
  ];
  var averageData = [
  ];
  $('body>table') .find('tr') .each(function () {
    var $lastTd = $(this) .find('td:nth(3)');
    value = $lastTd.html();
    if (value !== null) {
      value = value.replace(/ /gi, '');
      if (value.length == 4) {
        var $firstTd = $(this) .find('td:nth(0)');
        daysNames.push($firstTd.html());
        days++;
        var valueToSeconds = toSeconds(value);
        daysData.push(valueToSeconds);
        normalData.push(toSeconds('08:00'));
        maxData.push(toSeconds('09:00'));
        minData.push(toSeconds(minDataHour));
        total += valueToSeconds;
        var seconds = toSeconds(value);
        var hours = Math.round(seconds / 3600);
        var decimal = hours + Math.round((seconds / 3600 - hours) * 100) / 100;
        $lastTd.append(' (' + decimal + ')');
        $lastTd.after($('<td>') .css({
          align: 'center',
          'text-align': 'right'
        }) .html(toHHMM(valueToSeconds - toSeconds('08:00')))
        );
      }
    }
  });
  daysNames.reverse();
  daysData.reverse();
  var total = 0;
  var $arrivalInput = $('<input>') .css({
    width: '38px',
    'font-size': '11px',
  }) .val('00:00');
  // DISPLAY TOTAL
  var $td1 = $('<td>') .css({
    align: 'center',
    'border-bottom': 'solid 1px'
  }) .attr('align', 'center') .html('Total');
  var $td2 = $('<td>') .css({
    align: 'center',
    'border-bottom': 'solid 1px'
  }) .html('&nbsp;');
  var $td3 = $('<td>') .css({
    align: 'center',
    'border-bottom': 'solid 1px'
  }) .html('&nbsp;');
  var $td4 = $('<td>') .css({
    align: 'center',
    'border-bottom': 'solid 1px'
  }) .html('&nbsp;');
  var $td5 = $('<td>') .css({
    align: 'center',
    'border-bottom': 'solid 1px'
  }) .html('&nbsp;');
  getLastBadge(function (lastBadge) {
    var days = 0;
    $.each(daysData, function (day, data) {
      averageData.push(total - (toSeconds('08:00') * day) + data);
      total += data;
      days++;
    });
    var rest = total - (days * toSeconds('08:00'));
    var restHHMM = toHHMM(toSeconds(lastBadge) + toSeconds('08:30')) + ' (' + toHHMM(rest) + ')';
    //        if((toSeconds("08:30") - rest) <= toSeconds("09:30")){
    var toGo = toSeconds(lastBadge) + toSeconds('08:30') - rest
    if(toGo > (toSeconds(lastBadge) + toSeconds('09:30'))){
      var toGo = toSeconds(lastBadge) + toSeconds('09:30')
    }
    
    countDown(toGo);
    setInterval(function () {
      countDown(toGo);
    }, 1000);
    
    var hourToGo = (toGo > toSeconds('18:00')) ? '18:00 (' + (toHHMM(toSeconds('18:00') - toGo)) + ')' : toHHMM(toGo);
    /*}else{
            var toGo = toSeconds(lastBadge) + toSeconds("09:30");
            var hourToGo = toHHMM(toGo) + " (-" + toHHMM(toSeconds(lastBadge) + toSeconds("08:30") - rest - toGo) + ")";
        }*/
    var currentdate = new Date();
    var now = currentdate.getHours() + ':' + currentdate.getMinutes();
    /* TODO */
    daysData.push(toSeconds(now) - toSeconds(lastBadge) - toSeconds('00:30'));
    averageData.push(total - (toSeconds('08:00') * days) + (toSeconds(now) - toSeconds(lastBadge) - toSeconds('00:30')));
    var hourIfYouLeaveNow = now + ' (' + toHHMM(toSeconds(now) - toGo) + ')';
    var $table = $('<table>') .append($('<tr>') .append($('<td>') .html('Normal')) .append($('<td>') .html(restHHMM))
    ) .append($('<tr>') .append($('<td>') .html('Théorical leaving')) .append($('<td>') .html(hourToGo))
    ) .append($('<tr>') .append($('<td>') .html('If you leave now')) .append($('<td>') .html(hourIfYouLeaveNow))
    );
    
    
    var $td6 = $('<td>') .html($table);
    $('body>table>tbody>tr') .last() .before($('<tr>') .append($td1) .append($td2) .append($td3) .append($td4) .append($td5) .append($td6)
    );
  });
  daysNames.push('TODAY');
  normalData.push(toSeconds('08:00'));
  maxData.push(toSeconds('09:00'));
  minData.push(toSeconds(minDataHour));
  new Chart($canvas.get(0) .getContext('2d')) .Line({
    labels: daysNames,
    datasets: [
      {
        data: minData,
        fillColor: 'rgba(0,0,0,0)',
        strokeColor: 'rgba(0,200,100,0.0)',
      },
      {
        data: maxData,
        fillColor: 'rgba(0,0,0,0)',
        strokeColor: 'rgba(0,200,100,0.5)',
      },
      {
        data: normalData,
        fillColor: 'rgba(0,0,0,0)',
        strokeColor: 'rgba(255,0,0,0.4)',
      },
      {
        strokeColor: 'rgba(0,0,0,0)',
        fillColor: 'rgba(0,0,0,0.3)',
        data: averageData
      },
      {
        strokeColor: 'rgba(0,0,0,1)',
        fillColor: 'rgba(0,0,0,0)',
        data: daysData
      }
    ]
  }, {
    pointDotRadius: 1
  });
  function toSeconds(time) {
    var parts = time.split(':');
    var seconds = ( + parts[0]) * 60 * 60 + ( + parts[1]) * 60;
    if (time.indexOf('-') > - 1)
    seconds = seconds * - 1;
    return seconds;
  }
  function toHHMM(sec, withSeconds = false) {
    var negative = false;
    if (sec < 0) {
      negative = true;
      sec = sec * - 1;
    }
    var sec_num = parseInt(sec, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = Math.floor(sec_num - (hours * 3600) - (minutes * 60));
    if (hours < 10) {
      hours = '0' + hours;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    if(withSeconds){
      var time = hours + ':' + minutes + ':' + seconds;
    }else{
      var time = hours + ':' + minutes;
    }
    
    if (negative)
    time = '-' + time
    return time;
  }
});
