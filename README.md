<app :showcalendar="showCalendar"
		:hotdayslist="hotDaysList"
		:maxscheduledatenumber="maxScheduleDateNumber"
		:initcheckintext="checkInText"
		:initcheckouttext="checkOutText"
		:maxdays="maxDays"
		:pagetitle="pageTitle"
		@hidecalendar="hideCalendarFun"></app>

data(){
	return {
		showCalendar:false,
		checkInText:'2017-10-01',
		checkOutText:'2017-10-03',
		hotDaysList:['2017-10-01','2017-10-02'],
		maxScheduleDateNumber:365,
		maxDays:45,
		pageTitle:"test"
	}
}

showcalendar：必选，设置日历的初始状态（true为显示，false为隐藏）
initcheckintext：非必选，初始化开始时间（默认是2017-10-01）
initcheckouttext：非必选，初始化结束时间（默认是2017-10-30）
hotdayslist：非必选，热门档期，字符串数组
maxscheduledatenumber：非必选，日历显示的天数（默认是365*2天）
maxdays：非必选，允许时间跨度的天数（默认是30天）
pagetitle：非必选，页面title（默认是“”）