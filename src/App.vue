
<template>
    <div v-show="showCalendar" class="v-calendar" transition="v-calendar">
        <header class="normal m-header" v-show="showMHeader">
            <a href="javascript:void(0);" class="btn-back js_back" @click="hideCalendar"></a>
            <h1>选择查找日期</h1>
            <a href="javascript:void(0);" class="js_del"></a>
        </header>
        <div class="choos-date-way">
            <div class="many-way choose-way" :class="{
                'active':(activeChooseDateWay=='many'),
                'active-text':showManyActiveText
                }" @click="changeChooseWay">
                <i></i>
                <div class="way-title">查多日</div>
                <div class="way-date" v-if="activeChooseDateWay=='many'">{{dateTextShow}}</div>
            </div>
            <div class="one-way choose-way" :class="{
                'active':(activeChooseDateWay=='one'),
                'active-text':showOneActiveText
                }" @click="changeChooseWay">
                <i></i>
                <div class="way-title">查单日</div>
                <div class="way-date" v-if="activeChooseDateWay=='one'">{{dateTextShow}}</div>
            </div>
        </div>

        <div class="v-calendar--header">
            <ul class="v-calendar--header-wrapper">
                <li class="v-calendar--header-item">一</li>
                <li class="v-calendar--header-item">二</li>
                <li class="v-calendar--header-item">三</li>
                <li class="v-calendar--header-item">四</li>
                <li class="v-calendar--header-item">五</li>
                <li class="v-calendar--header-item">六</li>
                <li class="v-calendar--header-item">日</li>
            </ul>
        </div>
        <div class="v-calendar--date">
            <div class="v-calendar--date-wrapper" v-for="c in cal">
                <div class="v-calendar--date-month">{{ c.month }}</div>
                <ul class="v-calendar--date-day-group">
                    <li class="v-calendar--date-day-wrapper"
                        :class="{
                        'is-active': (checkInDate&&(d.date.getTime() === checkInDate.getTime()) || (checkOutDate && d.date.getTime() === checkOutDate.getTime())),
                        'is-select': (checkInDate&&checkOutDate && (d.date.getTime() > checkInDate.getTime()) && (d.date.getTime() < checkOutDate.getTime())),
                        'hot': (d.className == 'hot')
                        }"
                        v-for="d in c.date"
                        @click="clickDate(d)">
                        <i></i>
                        <div class="v-calendar--date-item">{{ d.date.getDate() }}</div>
                        <div class="v-calendar--date-item tag" v-if="checkInDate&&activeChooseDateWay=='many'&&(d.date.getTime() === checkInDate.getTime())">开始</div>
                        <div class="v-calendar--date-item tag" v-if="checkOutDate &&activeChooseDateWay=='many'&& d.date.getTime() === checkOutDate.getTime()">结束</div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="choose-ok-div"><div class="choose-ok" @click="chooseDateOk">确认</div></div>
    </div>
</template>

<script>
    import formatter from 'date-formatter';
    import calendarObj from './calendar.js';
    import $ from 'jquery';
    import Request from 'superagent';
    import Jsonp from 'superagent-jsonp';
    import fetchJsonp from 'fetch-jsonp';

    var UAStr = (navigator.userAgent).toLowerCase(),
    isIOS = /(iphone|ipad)/.test(UAStr),
    isAndroid = /android/.test(UAStr);
    var mDomain = document.domain.indexOf("dianping")==-1? '//m.51ping.com':'//m.dianping.com';

    export default {

        data: function() {
            return {
                cal: null,  //渲染整个日历的数据
                checkInDate:null,   //当前checkInDate
                checkOutDate:null,  //当前checkOutDate
                finalCheckInDate:null,      //最终checkInDate
                finalCheckOutDate:null,     //最终checkOutDate
                calendarShow:true,
                showCalendarHeader:false,
                activeChooseDateWay:calendarObj.CHOOSEMANYDAY,
                finalChooseDateWay:calendarObj.CHOOSEMANYDAY,
                showManyActiveText:false,
                showOneActiveText:false,
                hotDaysList:this.hotdayslist,
                maxScheduleDateNumber:this.maxscheduledatenumber
            };
        },

        props:['initcheckintext',
                'initcheckouttext',
                'showcalendar',
                'hotdayslist',
                'maxscheduledatenumber',
                'maxdays',
                'pagetitle'
        ],

        ready:function(){
            this.checkInDate = this.initcheckintext?new Date(this.initcheckintext):new Date('2017-10-01');
            this.checkOutDate = this.initcheckouttext?new Date(this.initcheckouttext):new Date('2017-10-30');
            this.finalCheckInDate = this.checkInDate;
            this.finalCheckOutDate = this.checkOutDate;
            this.initCalendarIndex();
            var self = this;
            self.$watch('hotdayslist',function(){
                self.hotDaysList = self.hotdayslist;
                self.initCalendarIndex();
            });
            self.$watch('showcalendar',function(){
                self.showCalendar = self.showcalendar?self.showcalendar:false;
            });
            self.$watch('maxScheduleDateNumber',function(){
                self.maxScheduleDateNumber = self.maxScheduleDateNumber;
                self.initCalendarIndex();
            });
            self.$watch('initcheckintext',function(){
                self.checkInDate = this.initcheckintext?new Date(self.initcheckintext):new Date('2017-10-01');
                self.finalCheckInDate = self.checkInDate;
                self.resetCalendarIndex();
            });
            self.$watch('initcheckouttext',function(){
                self.checkOutDate = self.initcheckouttext?new Date(self.initcheckouttext):new Date('2017-10-30');
                self.finalCheckOutDate = self.checkOutDate;
                self.resetCalendarIndex();
            });
            self.$watch('showCalendar',function(){
                //点击返回时将当前起始日期置为上次点击完成时的起始日期
                if(!self.showCalendar){
                    self.checkInDate = self.finalCheckInDate;
                    self.checkOutDate = self.finalCheckOutDate;
                    if(self.checkInDate.getTime()!=self.checkOutDate.getTime()){
                        self.activeChooseDateWay = calendarObj.CHOOSEMANYDAY;
                    } else {
                        self.activeChooseDateWay = calendarObj.CHOOSEONEDAY;
                    }
                    if(self.activeChooseDateWay==calendarObj.CHOOSEMANYDAY){
                        self.showManyActiveText = true;
                        self.showOneActiveText = false;
                    } else {
                        self.showManyActiveText = false;
                        self.showOneActiveText = true;
                    }
                } else {
                    self.$nextTick(function(){
                        calendarObj.toActiveDayIndex(140);
                    });
                }
            });
        },

        methods: {
            //初始化日历
            initCalendarIndex: function(){
                //渲染日历
                console.log(this.hotDaysList);
                this.cal = calendarObj.generateCalendarData(this.maxScheduleDateNumber,this.hotDaysList);
                //初始化页面
                this.resetCalendarIndex();
            },
            //重置相关日历数据
            resetCalendarIndex: function(){
                if(this.checkInDate&&this.checkOutDate&&this.checkInDate.getTime() == this.checkOutDate.getTime()){
                    this.activeChooseDateWay = calendarObj.CHOOSEONEDAY;
                    this.showOneActiveText = true;
                    this.showManyActiveText = false;
                } else if(this.checkInDate&&this.checkOutDate&&this.checkInDate.getTime() != this.checkOutDate.getTime()){
                    this.activeChooseDateWay = calendarObj.CHOOSEMANYDAY;
                    this.showOneActiveText = false;
                    this.showManyActiveText = true;
                } else {
                    this.showOneActiveText = false;
                    this.showManyActiveText = false;
                }
            },
            //日历点击事件
            clickDate: function(item) {
                if (item.type === 0) return;
                var date = item.date;
                if(this.activeChooseDateWay == calendarObj.CHOOSEMANYDAY){
                    //查多日
                    if(this.checkInDate&& !this.checkOutDate && date.getTime() == this.checkInDate.getTime()){
                        //重复点击则置空
                        this.checkInDate = null;
                    } else {
                        if (this.checkOutDate) {
                            this.checkInDate = date;
                            this.checkOutDate = null;
                        } else {
                            if (this.checkInDate&&date.getTime() > this.checkInDate.getTime()) {
                                this.checkOutDate = date;
                            } else {
                                this.checkInDate = date;
                            }
                        }
                    }
                    this.showOneActiveText = false;//移除查单日的显示日期样式
                    if(this.checkInDate&&this.checkOutDate){
                        if((this.checkOutDate.getTime()-this.checkInDate.getTime())/calendarObj.ONE_DAY_TS>=this.maxDays){
                            alert('一次最多可查'+this.maxDays+'天');
                            this.checkOutDate = null;
                            return ;
                        }
                        this.showManyActiveText = true;
                    } else if (!this.checkInDate&&!this.checkOutDate){
                        this.showManyActiveText = false;
                    } else {
                        this.showManyActiveText = true;
                    }
                } else {
                    //查单日
                    if(this.checkInDate&&date.getTime() == this.checkInDate.getTime()){
                        this.checkInDate = null;
                    } else {
                        this.checkInDate = date;
                    }
                    this.showManyActiveText = false;
                    if(this.checkInDate){
                        this.showOneActiveText = true;
                    } else {
                        this.showOneActiveText = false;
                    }
                    this.checkOutDate = null;
                }
            },
            //点击日期头部的返回事件
            hideCalendar: function() {
                //点击返回时将当前起始日期置为上次点击完成时的起始日期
                this.showCalendar =false;
                this.$emit('hidecalendar',null,null);
            },
            //点击完成
            chooseDateOk:function(){
                if(!this.checkInDate){
                    if(this.activeChooseDateWay == calendarObj.CHOOSEMANYDAY){
                        alert('请选择您想查询的时段');
                    } else {
                        alert('请选择日期');
                    }
                    return;
                }
                if(this.activeChooseDateWay==calendarObj.CHOOSEMANYDAY && this.checkInDate && !this.checkOutDate){
                    alert('请选择结束日期');
                    return;
                }
                //点击完成时如果是查单日则将checkoutdate置为null
                if(this.activeChooseDateWay == calendarObj.CHOOSEONEDAY){
                    this.checkOutDate = null;
                }
                //点击完成时为最终的起始日期赋值
                this.finalCheckInDate = this.checkInDate;
                this.finalCheckOutDate = this.checkOutDate?this.checkOutDate:this.checkInDate;
                this.finalChooseDateWay = this.activeChooseDateWay;
                this.$emit('hidecalendar',this.finalCheckInDate,this.finalCheckOutDate);
            },
            //切换查询日期方式（多日或者单日）
            changeChooseWay: function(e){
                var self = this;
                var jItem = $(e.currentTarget);
                if(jItem.hasClass('many-way')){
                    if(self.activeChooseDateWay == calendarObj.CHOOSEMANYDAY){
                        return;
                    } else {
                        self.activeChooseDateWay = calendarObj.CHOOSEMANYDAY;
                    }
                } else {
                    if(self.activeChooseDateWay == calendarObj.CHOOSEONEDAY){
                        return;
                    } else {
                        self.activeChooseDateWay = calendarObj.CHOOSEONEDAY;
                    }
                }
                //每次切换tab都将起始日期置空并隐藏各显示日期的样式
                self.checkInDate = null;
                self.checkOutDate = null;
                this.showManyActiveText = false;
                this.showOneActiveText = false;
            }
        },

        computed: {
            //显示的日期
            dateTextShow: function(){
                var text = ""
                if(this.checkInDate&&this.checkOutDate&&this.checkInDate.getTime()!=this.checkOutDate.getTime()){
                    text = formatter(this.checkInDate, 'YYYY-MM-DD')+' 至 '+formatter(this.checkOutDate, 'YYYY-MM-DD');
                } else if(this.checkInDate&&this.checkOutDate&&this.checkInDate.getTime()==this.checkOutDate.getTime()){
                    text = formatter(this.checkInDate, 'YYYY-MM-DD');
                } else if(this.checkInDate&&!this.checkOutDate){
                    text = formatter(this.checkInDate, 'YYYY-MM-DD');
                }
                return text;
            },
            showMHeader: function(){
                //m站显示头部
                return true;
            },
            showCalendar: function(){
                return this.showcalendar?this.showcalendar:false;
            },
            maxDays: function(){
                return this.maxdays?this.maxdays:30;
            },
            pageTitle: function(){
                return this.pagetitle?this.pagetitle:"";
            }
        }
    }
</script>

<style lang="less" scoped>
  @import url("./less/border.less");
  @import url("./less/util.less");

  @bordercolor:#ebebeb;
body{
        margin:0;
        padding:0;
        border:0;
        outline:0;
        background:transparent;
        box-sizing:border-box;
        line-height:inherit;
        font-size:inherit;
        color:inherit;
        font-family:PingFangSC-Regular,-apple-system,Roboto,Helvetica Neue,PingFang SC,Noto Sans CJK SC,sans-serif;
        li{
            list-style: none;
        }

        ul{
            margin:0;
        }
    }

h1{
    margin:0;
}
    .v-calendar{
        position:fixed;
        top:0px;
        left:0;
        width:100%;
        height:100%;
        background:#fff;
        z-index:10000;
    }
    .v-calendar--title{
        height:32px;
        padding-top: 7px;
        padding-bottom: 6px;
        border-bottom:1px solid #d7d7d7;
        font-size:16px;
        box-shadow: 0px 2px 1px rgba(204, 202, 200, 0.2);
        position:relative;
        background:#fff;
        z-index:1;
    }
    .v-calendar--title-back{
        display:block;
        width:35px;
        position:relative;
        position:absolute;
        left:15px;
        height:100%;
        top:0;
        z-index:10;
        &:after{
            content:"";
            display:block;
            position:absolute;
            left:0;
            top:50%;
            background-size:8px 14px;
            -webkit-transform:translateY(-50%) rotate(135deg);
            transform:translateY(-50%) rotate(135deg);
            width:8px;
            height:8px;
            border:none;
            border-bottom:2px solid #f63;
            border-right:2px solid #f63;
        }
    }
    .v-calendar--title-btn{
        position:absolute;
        right:15px;
        color:#f63;
        display:block;
        text-align:right;
        height:100%;
        top:0;
    }
    .v-calendar--title-content{
        display:block;
        text-align:center;
        font-weight:400;
        line-height:20px;
        width:100%;
        position:absolute;
        left:0;
        top:15px;
        font-size: 14px;
    }
    .v-calendar--header{
        height:25px;
        line-height:25px;
        background:#ffffff;
        color:#333;position:
        relative;
        z-index:10;
        .borderline(#e1e1e1,bottom);
        margin-top: -18px;
    }
    .v-calendar--header-wrapper{
        display:-webkit-box;
        display:flex;
    }
    .v-calendar--header-item{
        display:block;
        -webkit-box-flex:1;
        flex:1;
        text-align:center;
        font-size: 12px;
        color: #777777;
    }
    .v-calendar--date{
        position:absolute;
        height:100%;
        width:100%;
        left:0;
        top:0;
        padding-top:135px;
        overflow-y:scroll;
        -webkit-overflow-scrolling:touch;
        &.no-scroll{
            overflow: hidden;
            position: fixed;
            height: 100%;
            width: 100%;
        }
    }
    .v-calendar--date-month{
        height:43px;
        line-height:43px;
        text-align:center;
        font-size: 15px;
        color: #333;
    }
    .v-calendar--date-day-group{
        // .borderline(#e1e1e1,bottom);
        border-bottom: solid 1px @bordercolor;
        overflow:hidden;
        padding-left: 0;
        &:last-child{
            padding-bottom: 0;
        }
    }
    .v-calendar--date-day-wrapper{
        height:53px;
        width:14.285%;
        float:left;
        // .borderline(#e1e1e1,top);
        // .borderline(#e1e1e1,right);
        border-top:1px solid @bordercolor;
        border-right:1px solid @bordercolor;
        text-align:center;
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
        position: relative;
        &:nth-child(7n){
            // .borderline(none,right);
            border-right:none;
        }
        &.is-active{
            background:#f63;
            color:#fff;
            // .borderline(#f63,right);
            // .borderline(#f63,top);
            border-right-color:#f63;
            border-top-color: #f63;
            &.hot{
                i{
                    width: 7px;
                    height: 9px;
                    position: absolute;
                    top: 4px;
                    left: 4px;
                    background: url('./img/hot_active.png') no-repeat top left;
                    background-size: contain;
                }
            }
        }
        &.is-select{
            background:#FFF6F2;
            color:#f63;
            // .borderline(#ffc7b4,right);
            border-right-color:@bordercolor;
        }
        &.hot{
            i{
                width: 7px;
                height: 9px;
                position: absolute;
                top: 4px;
                left: 4px;
                background: url('./img/hot_rest.png') no-repeat top left;
                background-size: contain;
            }
        }
    }
    .v-calendar--date-item{
        display:block;
        height:25px;
        line-height:40px;
        font-size: 15px;
        &.tag{
            line-height: 25px;
            font-size: 10px;
        }
    }

    .v-calendar {
        &.transition {
            transition: all .2s ease-in-out;
            transform: translate3d(0, 0, 0);
        }

        &.enter, &.leave {
            transform: translate3d(100%, 0, 0);
        }
        .choose-ok-div{
            position: fixed !important;
            bottom: 0;
            left: 0px;
            right: 0px;
            text-align: center;
            background-color: white;
            line-height: 44px;
            .borderline(#e1e1e1,top);
            .choose-ok{
                text-align: center;
                background-color: #f63;
                color: white;
                border-radius: 5px;
                line-height: 44px;
                display: inherit;
                margin-left: 10px;
                margin-right: 10px;
                margin-bottom: 5px;
                margin-top: 6px;
                font-size: 18px;
            }
        }
        
    }
    .choos-date-way{
        display: box;
        display: -webkit-box;
        display: -ms-flexbox;
        text-align: center;
        background: white;
        z-index: 10;
        position: relative;
        padding-top: 12px;
        padding-left: 10px;
        padding-right: 10px;
        padding-bottom: 8px;
        background-color: white;
        z-index: 10001;
        .choose-way{
            display: block;
            -webkit-box-flex: 1;
            box-flex: 1;
            -ms-box-flex: 1;
            -ms-flex: 1;
            width: 50%;
            height: 42px;
            border:solid 1px #cccccc;
            border-radius: 5px;
            color:#111111;
            position: relative;
            &:last-child{
                margin-left: 10px;
            }
            &.active{
                border:none;
                background-color: #ffe1d7;
                color:#f63;
                height: 44px;
                .way-date{
                        display: none;
                }
                i{
                    width: 21px;
                    height: 21px;
                    position: absolute;
                    top: 0;
                    left: 0;
                    background: url('./img/choose-way-active.png') no-repeat top left;
                    background-size: contain;
                }
                &.active-text{
                    .way-title{
                        font-size: 14px;
                        margin-top: 5px;
                    }
                    .way-date{
                        display: inherit;
                        font-size: 10px;
                    }
                }
            }
            .way-title{
                font-size: 16px;
                margin-top: 11px;
                line-height: 22px;
            }
        }
    }

    .v-calendar--title-content{
        display:inline-block;
        text-align:center;
        font-weight:400;
        line-height:20px;
        position:relative;
        top:-7px;
        font-size: 16px;
        width: inherit;
        background-color: #f0f0f0;
        padding-left: 11px;
        padding-right: 8px;
        border-radius: 4px;
        padding-bottom: 5px;
        padding-top: 5px;
        color: #777;
        i{
            width: 20px;
            height: 21px;
            background: url('./img/calendar-title-icon.png') no-repeat top left;
            background-size: contain;
            display: inline-block;
            vertical-align: bottom;
        }
        span{
            padding-left: 6px;
            margin-left: 8px;
            .borderline(#d7d7d7,left);
        }
    }

    header{
        position: relative;
        height: 44px;
        line-height: 44px;
        text-align: center;
        background-color: #FCFCFC;
        box-shadow: 0 0 3px #CCC;
        z-index: 100;
        &.normal{
            background-color: #fcfcfc;
            z-index: 100002;
        }
        .btn-back {
            position: absolute;
            left: 0;
            top: 0;
            .size(44px; 44px);
            &:after {
              content: '';
              position: absolute;
              left: 16px;
              top: 12px;
              .size(11px; 20px);
              background: url(./img/un_icon.png) -10px 0 no-repeat;
              background-size: 41px auto;
            }
          }
          h1{
            padding: 0 88px;
            font-size: 18px;
            font-weight: normal;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
    }
    .v-calendar--date-wrapper:last-child{
        padding-bottom: 180px;
    }

    body.ios{
        header.m-header{
            padding-top: 20px;
            .btn-back{
                top: 20px;
            }
        }
        .v-calendar--date{
            padding-top: 90px;
        }
        .v-calendar--date-wrapper:last-child{
            padding-bottom: 130px;
        }
        &.tool-index{
            .v-calendar--date{
                padding-top: 90px;
            }
            .v-calendar--date-wrapper:last-child{
                padding-bottom: 130px;
            }
        }
        &.result-index{
            .v-calendar--date{
                padding-top: 155px;
            }
            .v-calendar--date-wrapper:last-child{
                padding-bottom: 200px;
            }
        }
    }

    body.android{
        .v-calendar--date{
            padding-top: 90px;
        }
        .v-calendar--date-wrapper:last-child{
            padding-bottom: 135px;
        }
        &.tool-index{
            .v-calendar--date{
                padding-top: 90px;
            }
            .v-calendar--date-wrapper:last-child{
                padding-bottom: 135px;
            }
        }
    }

</style>
