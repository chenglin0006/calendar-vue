var $ = require('jquery');
Date.prototype.format = function(format) //author: meizz 
{
  var o = { 
    "M+" : this.getMonth()+1, //month 
    "d+" : this.getDate(),    //day 
    "h+" : this.getHours(),   //hour 
    "m+" : this.getMinutes(), //minute 
    "s+" : this.getSeconds(), //second 
    "q+" : Math.floor((this.getMonth()+3)/3),  //quarter 
    "S" : this.getMilliseconds() //millisecond 
  } 
  if(/(y+)/.test(format)) format=format.replace(RegExp.$1, 
    (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
  for(var k in o)if(new RegExp("("+ k +")").test(format)) 
    format = format.replace(RegExp.$1, 
      RegExp.$1.length==1 ? o[k] : 
        ("00"+ o[k]).substr((""+ o[k]).length)); 
  return format; 
} 
var current = new Date();
var TODAY = new Date(current.format('yyyy-MM-dd'));
var ONE_DAY_TS = 86400000;
var deltaDay = function(to, from) {
    return (to.getTime() - from.getTime()) / ONE_DAY_TS;
};
var addDay = function(date, day) {
    return new Date(date.getTime() + day * ONE_DAY_TS);
};
module.exports = {
    TODAY:TODAY,
    current:current,
    ONE_DAY_TS:ONE_DAY_TS,
    deltaDay:deltaDay,
    addDay:addDay,
    format:Date.prototype.format,
    CHOOSEMANYDAY:'many',   //常量：标识查多日
    CHOOSEONEDAY:'one',     //常量：标识查单日
    clickDateToRepaintCalendar: function(checkInDate,checkOutDate,chooseDateWay) {
        var liArry = $('.v-calendar--date-day-wrapper');
        var self = this;
        liArry.forEach(function(ele,index){
            var currentTime = ele.getAttribute('data-time');
            var currentType = ele.getAttribute('data-type');
            if(currentType == "0"){
                return ;
            }
            $(ele).removeClass('is-active');
            $(ele).removeClass('is-select');
            $(ele).find('.v-calendar--date-item.tag').text('');
            if(((checkInDate&&currentTime == checkInDate.getTime()) || (checkOutDate && currentTime == checkOutDate.getTime()))&&(checkOutDate&& checkInDate && currentTime > checkInDate.getTime() && currentTime < checkOutDate.getTime())){
                $(ele).addClass('is-active');
                $(ele).addClass('is-select');
            }
            if(((checkInDate&&currentTime == checkInDate.getTime()) || (checkOutDate && currentTime == checkOutDate.getTime()))&&!(checkOutDate && checkInDate && currentTime > checkInDate.getTime() && currentTime < checkOutDate.getTime())){
                $(ele).addClass('is-active');
                if(checkInDate&&currentTime == checkInDate.getTime()&&chooseDateWay==self.CHOOSEMANYDAY){
                    $(ele).find('.v-calendar--date-item.tag').text('开始');
                } else if(checkOutDate && currentTime == checkOutDate.getTime()){
                    $(ele).find('.v-calendar--date-item.tag').text('结束');
                }
            }
            if(!((checkInDate&&currentTime == checkInDate.getTime()) || (checkOutDate && currentTime == checkOutDate.getTime()))&&(checkOutDate && checkInDate && currentTime > checkInDate.getTime() && currentTime < checkOutDate.getTime())){
                $(ele).addClass('is-select');
            }
        });
    },
    generateCalendarData : function(maxScheduleDateNumber,hotDaysList) {
        var self = this;
        if(!maxScheduleDateNumber){
            maxScheduleDateNumber = 365*2;
        } else {
            maxScheduleDateNumber = maxScheduleDateNumber+1;
        }
        var emptyDate = {
            getDate: function() {},
            getTime: function() {}
        };
        var leftPadding = [6, 0, 1, 2, 3, 4, 5];
        var rightPadding = [0, 6, 5, 4, 3, 2, 1];
        var getCalendarMap = function() {
            var calendar = [];
            var curr = TODAY;
            for (var i = 0, len = maxScheduleDateNumber; i < len; i++) {
                calendar.push(addDay(curr, i));
            }
            var calendarMap = calendar.reduce(function(coll, item) {
                var m = item.format('yyyy年MM月');
                coll[m] = coll[m] || [];
                coll[m].push(item);
                return coll;
            }, {});
            return calendarMap;
        };

        var convertMonth = function(month) {
            var date = month.map(function(item) {
                return {
                    type: 1,
                    date: item
                };
            });
            var firstDate = month[0];
            for (var i = 0, ii = leftPadding[firstDate.getDay()]; i < ii; i++) {
                date.unshift({
                    type: 0,
                    date: emptyDate
                });
            }
            var lastDate = month[month.length - 1];
            for (var j = 0, jj = rightPadding[lastDate.getDay()]; j < jj; j++) {
                date.push({
                    type: 0,
                    date: emptyDate
                });
            }
            return date;
        };

        var convertCalendarMap = function(calendarMap) {
            var calendarObj = [];
            Object.keys(calendarMap).forEach(function(month,index){
                var date = convertMonth(calendarMap[month]);
                calendarObj.push({
                    month: month,
                    date: date
                });
            });
            return calendarObj;
        };

        var calendarMap = getCalendarMap();
        var calendarObj = convertCalendarMap(calendarMap);
        calendarObj = self.getDateDayClass(calendarObj,hotDaysList);
        return calendarObj;
    },
    //根据起始日期以及热门日期获得class
    getDateDayClass: function(calendarData,hotDaysList){
        calendarData.forEach(function(item,index){
            var monthGroup = item.date;
            monthGroup.forEach(function(ele,index){
                var className = "";
                if(hotDaysList&&hotDaysList.length){
                    hotDaysList.forEach(function(item,index){
                        var hotDate = new Date(item);
                        if(ele.date.getTime() == hotDate.getTime()){
                            className = 'hot';
                            return;
                        }
                    });
                }
                ele.className = className;
            });
        });
        return calendarData;
    },
    //页面滚动至选中日期
    toActiveDayIndex: function(num){
        if($('.v-calendar--date-day-wrapper.is-active')[0]){
            var activeDateOffset = $('.v-calendar--date-day-wrapper.is-active')[0].offsetTop-num;
            $('.v-calendar--date').scrollTop(activeDateOffset);
        }
    },
    //填充日历文案
    fillChooseDateText: function(activeChooseDateWay,titleStr){
        if(activeChooseDateWay == this.CHOOSEMANYDAY){
            $('.one-way .way-date').text('');
            $('.one-way').removeClass('active-text');
            $('.many-way').addClass('active-text');
            $('.many-way .way-date').text(titleStr);
        } else {
            $('.many-way .way-date').text('');
            $('.many-way').removeClass('active-text');
            if(titleStr){
                $('.one-way').addClass('active-text');
            } else {
                $('.one-way').removeClass('active-text');
            }
            $('.one-way .way-date').text(titleStr);
        }
    },
    //日期点击事件
    clickDate: function(e,checkInDate,checkOutDate,chooseDateWay){
        var cal = {};
        cal.checkInDate = checkInDate;
        cal.checkOutDate = checkOutDate;
        var target = $(e.currentTarget);
        var mTimes = $(target).attr('data-time');
        var type = $(target).attr('data-type');
        if(type=="0"){
            return cal;
        }
        var date = new Date();
        date.setTime(mTimes);
        if(chooseDateWay == this.CHOOSEMANYDAY){
            //多日选择日期变换逻辑
            if(checkInDate&& !checkOutDate && date.getTime() == checkInDate.getTime()){
                checkInDate = null;
            } else {
                if (checkOutDate) {
                    checkInDate = date;
                    checkOutDate = null;
                } else {
                    if (checkInDate&&date.getTime() > checkInDate.getTime()) {
                        checkOutDate = date;
                    } else {
                        checkInDate = date;
                    }
                }
            }
            cal.checkInDate = checkInDate;
            cal.checkOutDate = checkOutDate;
        } else {
            //单日选择日期变幻逻辑
            if(checkInDate&&date.getTime() == checkInDate.getTime()){
                checkInDate = null;
            } else {
                checkInDate = date;
            }
            cal.checkInDate = checkInDate;
        }
        return cal;
    }
};