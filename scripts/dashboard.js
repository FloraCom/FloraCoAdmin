var lineChartData = {

	label : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	datasets : [
		{
			fillColor : "red",
			strokeColor : "pink",
			pointColor : "blue",
			pointStrokeColor : "#000",
			data : [65, 70, 21, 34, 53, 62, 83, 91, 22, 98, 67, 86]
		}
	]

};

const chartCtx = document.getElementById('revenueChart');

var con = new Chart(chartCtx).Line(lineChartData);