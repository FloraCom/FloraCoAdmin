import { updateOrder } from "../scripts/order.js";

let inventory = {};
fetch("./assets/products.json")
.then((res) => {if (!res.ok) {} return res.json();})
.then((data) => {

    inventory = data['products']['all'];

}).catch();

let count = 0;

function getDate(dateStamp) {
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const d = new Date();
  d.setTime(parseInt(dateStamp));

  var date = d.getDate();
  var month = months[d.getMonth()];
  var year = d.getFullYear();
  return `${date}-${month.toUpperCase()}-${year}`;
}


export function printInvoice() {
  window.print();
}


export function updateItemDisplay(ord, index){
	
	openCard();
	count = 0;
	let id = ord.id;
	document.getElementById('orderId').innerHTML = `${ord.id}`;
	document.getElementById('statusPayment').innerHTML = `${(ord.mode == "2") ? "COD" : 'Paid'}`;
	document.getElementById('statusPayment').style.backgroundColor = `${(ord.mode === "2") ? "black" : '#f5eecf'}`;
	document.getElementById('statusPayment').style.color = `${(ord.mode === "2") ? "white" : '#856404'}`;
	document.getElementById('timeDisplay').innerHTML = getDate(ord.placed);
	document.getElementById('total').innerHTML = ord.cost;

	document.getElementById('proceed').addEventListener('click', ()=> {
		if (count == 0) {
			updateOrder(document.getElementById('orderId').innerHTML , index);
			count++;
		}
	});

	const container = document.getElementById('order-items');
	container.innerHTML = '';
	ord.items.forEach(item => {
		let it = getItem(item.category, item.sub, item.id);
		container.innerHTML += `
	    <div class="order-item">
	      <img id="item-image" onerror="src='../media/fc.png';" src="${it.variations[getIndex(it.variations, item.variation)].image}" alt="${it.name}" />
	      <div class="item-info">
	        <div class="item-title">${it.name}</div>
	        <div class="item-title">${item.variation}</div>
	        <div class="item-price">${item.quantity} x Rs.${item.price}</div>
	      </div>
	    </div>
	  `;
	});

}

export function updateItemDisplayPrint(ord, index){
	
	openCard();
	count = 0;
	let id = ord.id;
	document.getElementById('address').innerHTML = `To: <br>${ord.address.name}<br>${ord.address.street}<br>${ord.address.locality}<br>${ord.address.pincode}<br>${ord.address.country}`;
	document.getElementById('orderId').innerHTML = `${ord.id}`;
	document.getElementById('statusPayment').innerHTML = `${(ord.mode == "2") ? " COD" : ' PAID'}`;
	document.getElementById('timeDisplay').innerHTML = getDate(ord.placed);

	document.getElementById('print').addEventListener('click', ()=> {
		if (count == 0) {
			updateOrder(document.getElementById('orderId').innerHTML , index);
			count++;
		}
	});

	let priceSum = 0;

	const container = document.getElementById('order-items');
	container.innerHTML = '';
	ord.items.forEach(item => {

		let qtyPrice = parseInt(item.quantity) * parseInt(item.price);

		priceSum += qtyPrice;

		let it = getItem(item.category, item.sub, item.id);
		container.innerHTML += `
	        
	        <tr>
	          <td>${it.name}<br>${item.variation}</td>
	          <td><span class="item-mrp">${item.quantity} x ${item.price}.00</span></td>
	          <td><span  class="item-price">${qtyPrice}</span></td>
	        </tr>

	  `;
	});

	document.getElementById('total').innerHTML = priceSum+'.00';
	document.getElementById('discount').innerHTML = (priceSum - parseInt(ord.cost))+'.00';
	document.getElementById('gtotal').innerHTML = ord.cost+'.00';

}

function getIndex(arr, value){
	return arr.findIndex((obj)=> obj['id'] === value);
}

export function getItem(category, sub, id){
  if (Object.keys(inventory).length > 0) {
    return inventory[category][sub][id];
  }else {
    return null;
  }
}


export function closeCard() {
  document.getElementById('orderContent').classList.remove('openCard');
}

export function openCard() {
  document.getElementById('orderContent').classList.add('openCard');
}