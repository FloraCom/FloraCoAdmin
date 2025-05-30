import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getDatabase, runTransaction, ref, child, get, set, onValue, update, remove, off} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

const firebaseConfig = {
	apiKey: "AIzaSyDg_cruaRr3dHWuE8Ddzxk6OXlWKE445kA",
	authDomain: "floraco-main.firebaseapp.com",
	projectId: "floraco-main",
	storageBucket: "floraco-main.firebasestorage.app",
	messagingSenderId: "675774592408",
	appId: "1:675774592408:web:765b6016f902858bb267ed",
	measurementId: "G-2T9X6F21LB"
};

const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

var app = initializeApp(firebaseConfig);
const rdb = getDatabase(app);

let currentYear = new Date().getFullYear();
let selectedMonth = new Date().getMonth();
let products = [];
let salesdata = {};
let ordersdata = {};
let productsdata = {};
let totalSales = 0;
let totalOrders = 0;
let x = [];


const yearDisplay = document.getElementById("yearDisplay");
const monthGrid = document.getElementById("monthGrid");

setChart();
renderCalendar();

document.getElementById('increaseYear').addEventListener('click', ()=> changeYear(+1));
document.getElementById('decreaseYear').addEventListener('click', ()=> changeYear(-1));


setProducts(products => {

	document.getElementById('inventory').innerHTML = products.length;

	salesData();
	ordersData();
	usersData();
	productsData();

});


async function salesData(){
	const dataRef = ref(rdb, 'numericals/sales');
	get(dataRef).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            salesdata = Object.assign({}, salesdata, data);
			convertSalesData();
            updateSales(false);
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
}

async function ordersData(){
	const dataRef = ref(rdb, 'numericals/orders');
	get(dataRef).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            ordersdata = Object.assign({}, ordersdata, data);
            updateOrders(false);
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
}

async function usersData(){
	const dataRef = ref(rdb, 'numericals/users');
	get(dataRef).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            document.getElementById('customers').innerHTML = data;
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
}

async function productsData(){
	const dataRef = ref(rdb, 'numericals/product');
	get(dataRef).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            productsdata = Object.assign({}, productsdata, data);
            updateProducts(false);
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
}

async function updateSales(isAll){

	if (isAll) {
		Object.values(salesdata).forEach(sale => {
			totalSales += sale;
		});
	}else{
		totalSales = salesdata[getMonthText(selectedMonth)];
		let prevSales = salesdata[getMonthText(selectedMonth-1)];
		let difference = 0;

		if (prevSales === null || prevSales === undefined) {
			prevSales = 0;
		}

		difference = ((totalSales - prevSales)/totalSales)*100;

		if (isNaN(difference)) {
			difference = 0;
		}

		if (difference >= 0 || isNaN(difference)) {
			document.getElementById('earningsDiv').innerHTML = `
	            <i class="fi fi-ss-arrow-small-up"></i>
	            <span id="earningsPercent">${difference}%</span>
			`;
			document.getElementById('earningsDiv').classList.add('up');
		}else{
			document.getElementById('earningsDiv').innerHTML = `
	            <i class="fi fi-ss-arrow-small-down"></i>
	            <span id="earningsPercent">${difference}%</span>
			`;
			document.getElementById('earningsDiv').classList.remove('up');
		}

	}

	if (totalSales === undefined) {
		totalSales = 0;
	}

	document.getElementById('earnings').innerHTML = totalSales;
}

async function updateOrders(isAll){

	if (isAll) {
		Object.values(ordersdata).forEach(order => {
			totalOrders += order;
		});
	}else{
		totalOrders = ordersdata[getMonthText(selectedMonth)];
		let prevOrders = ordersdata[getMonthText(selectedMonth-1)];
		let difference = 0;
		
		if (prevOrders === null || prevOrders === undefined) {
			prevOrders = 0;
		}

		if (totalOrders === null || totalOrders === undefined) {
			totalOrders = 0;
		}

		difference = ((totalOrders - prevOrders)/totalOrders)*100;

		if (isNaN(difference)) {
			difference = 0;
		}

		if (difference >= 0) {
			document.getElementById('ordersDiv').innerHTML = `
	            <i class="fi fi-ss-arrow-small-up"></i>
	            <span id="earningsPercent">${difference}%</span>
			`;
			document.getElementById('ordersDiv').classList.add('up');
		}else{
			document.getElementById('ordersDiv').innerHTML = `
	            <i class="fi fi-ss-arrow-small-down"></i>
	            <span id="earningsPercent">${difference}%</span>
			`;
			document.getElementById('ordersDiv').classList.remove('up');
		}

	}

	if (totalOrders === undefined) {
		totalOrders = 0;
	}

	document.getElementById('orders').innerHTML = totalOrders;
}

async function updateProducts(){

	let totalSold = 0;

	Object.values(productsdata).forEach(product => {
		totalSold += product;
	});

	document.getElementById('products').innerHTML = totalSold;
}

async function convertSalesData(){
	let monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		
	for (var i = 0; i <= new Date().getMonth(); i++) {

		let month =  String(i+1).padStart(2, '0')+String(new Date().getFullYear());
		let sale = salesdata[month];
		if (sale) {
			x.push(sale);
		}else{
			x.push(0);
		}

	}

	let mon =  new Date().getMonth()+1;

	setChart(x.slice(0, mon), monthList.slice(0, mon));
}

function getMonthText(month) {
	return String(month+1).padStart(2, '0')+String(currentYear);
}

function setChart(dataa, labelss){
	const ctx = document.getElementById('statsChart').getContext('2d');

	const data = {
	  labels: labelss,
	  datasets: [{
	    label: 'Sales',
	    data: dataa,
	    fill: true,
	    backgroundColor: 'lightgreen',
	    borderColor: 'darkgreen',
	    tension: 0.4,
	    pointBackgroundColor: 'darkgreen',
	    pointBorderColor: '#fff',
	    pointHoverRadius: 6,
	    pointRadius: 4,
	    pointHoverBorderColor: 'darkgreen'
	  }]
	};

	const config = {
	  type: 'line',
	  data: data,
	  options: {
	    responsive: true,
	    plugins: {
	      tooltip: {
	        enabled: false,
	        mode: 'nearest',
	        intersect: false,
	        backgroundColor: 'rgba(0,100,0,0.8)',
	        titleColor: '#fff',
	        bodyColor: '#fff',
	        borderColor: '#fff',
	        borderWidth: 1
	      },
	      legend: {
	        display: false
	      }
	    },
	    animation: {
	      duration: 100,
	      easing: 'easeOutQuart'
	    },
	    scales: {
	        xAxes: [{
	            gridLines: {
	                display:false
	            }
	        }],
	        yAxes: [{
	            gridLines: {
	                display:false
	            },
	            ticks: {
	            	stepSize: 1000
	            },
	            beginAtZero:true
	        }]
	    },
	    hover: {
	      mode: 'index',
	      intersect: false
	    }
	  }
	};

	new Chart(ctx, config);
}

function showToast(message) {
  var toast = document.getElementById("toast");
  toast.innerHTML = message;
  toast.classList.add("show");
  setTimeout(function(){ toast.classList.remove("show"); }, 2000);
}

function renderCalendar() {
  yearDisplay.textContent = currentYear;
  monthGrid.innerHTML = "";

  months.forEach((month, index) => {
    const div = document.createElement("div");
    div.textContent = month;
    div.classList.add("month");
    if (index === selectedMonth) div.classList.add("selected");


    div.onclick = () => {

		if ((index <= new Date().getMonth() && parseInt(currentYear) === parseInt(new Date().getFullYear())) || (parseInt(currentYear) < parseInt(new Date().getFullYear()))) {
			selectedMonth = index;
			renderCalendar();

			salesData();
			ordersData();
	    }else{
	    	showToast('Invalid Year');
	    }
	};
    monthGrid.appendChild(div);
  });
}

function changeYear(delta) {
  currentYear += delta;

  if (currentYear >= new Date().getFullYear()) {
  	selectedMonth = new Date().getMonth();
  }

  if (currentYear > new Date().getFullYear()) {
  		currentYear =  new Date().getFullYear();
  		showToast('Invalid Year');
  }else{
  	renderCalendar();
  }

}

function getIndex(arr, value){
	return arr.findIndex((obj)=> obj['id'] === value);
}

function setProducts(callBack) {
	fetch("./assets/products.json")
	.then((res) => {if (!res.ok) {} return res.json();})
	.then((data) => {

	    let inventory = data['products']['all'];
	    Object.values(inventory).forEach(obj => {
	    	products = products.concat(Object.values(obj));
	    });

	    callBack(products);

	}).catch();
}
