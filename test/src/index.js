require('es6-promise').polyfill();
import Vue from 'vue';
import App from '../../src/App.vue';
import VueRainbow from 'vue-rainbow';
import './index.less';
import formatter from 'date-formatter';
Vue.use(VueRainbow);

new Vue({
	  el: 'body',
	  components: {
	    'app': App
	  },
	  data(){
	  	return {
	  		showCalendar:false,
	  		checkInText:'2017-10-01',
	  		checkOutText:'2017-10-30',
	  		hotDaysList:['2017-10-01','2017-10-02'],
	  		maxScheduleDateNumber:365,
	  		maxDays:45,
	  		pageTitle:"test"
	  	}
	  },
	  methods:{
	  	showCalendarFun:function(){
	  		this.showCalendar = true;
	  	},
	  	hideCalendarFun:function(checkInDate,checkOutDate){
	  		if(checkInDate){
	  			this.checkInText = formatter(checkInDate,'YYYY-MM-DD');
	  		}	
	  		if(checkOutDate){
	  			this.checkOutText = formatter(checkOutDate,'YYYY-MM-DD');
	  		}
	  		this.showCalendar = false;
	  	}
	  }
})
