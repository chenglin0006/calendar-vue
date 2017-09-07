require('es6-promise').polyfill();
import Vue from 'vue';
import App from '../../src/App.vue';
import './index.less';
import formatter from 'date-formatter';

new Vue({
	  el: '#app',
	  components: {
	    'app': App
	  },
	  data(){
	  	return {
	  		checkInText:'2017-10-01',
	  		checkOutText:'2017-10-30',
	  		hotDaysList:['2017-10-01','2017-10-02'],
	  		maxScheduleDateNumber:365,
	  		maxDays:45,
	  		pageTitle:"test",
	  		chooseDateWay:''
	  	}
	  },
	  mounted(){
	  	this.chooseDateWay = this.getQueryString('chooseDateWay');
	  	console.log(this.chooseDateWay);
	  },
	  methods:{
	  	hideCalendarFun:function(checkInDate,checkOutDate){
	  		alert(checkInDate);
	  		alert(checkOutDate);
	  	},
		getQueryString:function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
			var r = window.location.search.substr(1).match(reg);
			if (r != null) return unescape(r[2]); return null;
		}
	  }
})
