import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, collection, doc, deleteDoc, setDoc, query, where, updateDoc, getDocs, limit, Timestamp, orderBy } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { updateReadlist, getUpdatedlist, setReadList, deleteCoupon, deleteOffer } from "../scripts/feedbackFunctions.js";

window.updateReadlist = updateReadlist;
window.getUpdatedlist = getUpdatedlist;
window.setReadList = setReadList;
window.deleteCoupon = deleteCoupon;
window.deleteOffer = deleteOffer;

const firebaseConfig = {
  apiKey: "AIzaSyDg_cruaRr3dHWuE8Ddzxk6OXlWKE445kA",
  authDomain: "floraco-main.firebaseapp.com",
  projectId: "floraco-main",
  storageBucket: "floraco-main.firebasestorage.app",
  messagingSenderId: "675774592408",
  appId: "1:675774592408:web:765b6016f902858bb267ed",
  measurementId: "G-2T9X6F21LB"
};

var app = initializeApp(firebaseConfig);
let db = getFirestore(app);
let offers = [];
let coupons = [];

let category = document.getElementById('category').value;


display();

getCoupons();
getOffers();

document.getElementById('category').addEventListener('change', ()=> {

	category = document.getElementById('category').value;
	display();

});

document.getElementById('items').addEventListener('change', ()=> {

	let selectedItems = (getSelectValues(document.getElementById('items')));

	document.getElementById('selectedItems').innerHTML = selectedItems.length+' Items<br>'+selectedItems.join('<br>');

});

document.getElementById('offerImage').addEventListener('change', () => {

	document.getElementById('banner').src = document.getElementById('offerImage').value;

});

document.getElementById('searchButton').addEventListener('click', () => {
	console.log(getSelectValues(document.getElementById('items')));
});

function getSelectValues(select) {
  var result = [];
  var options = select && select.options;
  var opt;

  for (var i=0, iLen=options.length; i<iLen; i++) {
    opt = options[i];

    if (opt.selected) {
      result.push(opt.value || opt.text);
    }
  }
  return result;
}

function display() {

	fetch("./assets/products.json")
	.then((res) => {if (!res.ok) {} return res.json();})
	.then((data) => {

		try{

			if (category === undefined || category === null) {
				category = 'plant';
			}

			let cat = data['products']['all'][category];
			let products = [];

			cat = (cat) ? cat : {};

			Object.values(cat).forEach(product => {

				products = products.concat(Object.values(product));
				
			});

			document.getElementById('search').placeholder='Search '+String(category).replaceAll("-", " ");

			if (products) {
				populateContent(products);
			}

		}catch(error) {
			console.log(error);
		}
		
	}).catch();
}

function populateContent(products) {

	const option = document.getElementById('items');
	option.innerHTML = ``;
	products.forEach((obj, index) => {
		option.innerHTML += `
            <option value="${obj.id}">${obj.id} ${obj.name}</option>
        `;
	});

	document.getElementById('searchResult').innerHTML = products.length + ' Products Found';
}

document.getElementById('form').addEventListener('submit', (e) => {
	e.preventDefault();
	submiiit();
});

document.getElementById('cancel').addEventListener('click', (e) => {
	e.preventDefault();
	document.getElementById('offerAdd').style.display = 'none';
});

document.getElementById('createOffer').addEventListener('click', (e) => {
	e.preventDefault();
	document.getElementById('offerAdd').style.display = 'flex';
});

document.getElementById('couponAdd').addEventListener('click', (e) => {
	e.preventDefault();
	document.getElementById('couponAdd').style.display = 'none';
	document.getElementById('couponCreate').style.display = 'flex';
});

document.getElementById('cancelCoupon').addEventListener('click', (e) => {
	e.preventDefault();
	document.getElementById('couponAdd').style.display = '';
});

document.getElementById('addCoupon').addEventListener('click', () => {
	sCoupon();
});

async function getOffers() {

	const db = getFirestore(app);
	const usersCollection = collection(db, "offers");
	const q = query(usersCollection);
	var querySnapshot = await getDocs(q);

	querySnapshot.forEach(doc => {

		offers.push(doc.data());

	});
	populateOffers(offers);
}

async function getCoupons() {
	const db = getFirestore(app);
	const usersCollection = collection(db, "coupons");
	const q = query(usersCollection);
	var querySnapshot = await getDocs(q);

	querySnapshot.forEach(doc => {

		coupons.push(doc.data());

	});


	populateCoupons(coupons);
}

async function populateCoupons(coupons){

	let couponCards = document.getElementById('couponCards');
	couponCards.innerHTML = ``;

	coupons.forEach(coupon => {
		couponCards.innerHTML += `
            <div class="couponCard">
              <div class="couponC">
                <div class="couponDetails">
                  <p id="couponCode">${coupon.code} - ${coupon.discount}</p>
                  <p id="couponDetails">#${coupon.id}</p>
                  <p class="description">Validity <br> ${getDate(coupon.validity)}</p>
                  <button class="delete" onclick="deleteCoupon('${coupon.id}');">Delete</button>
                </div>
              </div>
            </div>
		`;

	});	
}

async function populateOffers(offers){
	let offerCards = document.getElementById('offerCards');
	offerCards.innerHTML = ``;

	offers.forEach(offer => {
		offerCards.innerHTML += `
            <div class="offerCard">
              <div class="offerC">
                <a class="offerImage" href="${offer.image}" target="_blank">
                  <img src="${offer.image}" alt="${offer.name}">
                </a>
                <div class="offerDetails">
                  <p id="offerDetails">#${offer.id}<br>${offer.name}<br><br>Upto - ${getDate(offer.validity)}</p>
                  <p id="offerItems"></p>
                  <p id="offerItemsList" class="description"></p>
                </div>
                <button class="delete" onclick="deleteOffer('${offer.id}');">Delete</button>
              </div>
            </div>
		`;
	});	
}

async function submiiit(){


	const offer = {
		id: document.getElementById('offerId').value,
		name:  document.getElementById('offerName').value,
		image:  document.getElementById('offerImage').value,
		discount:  parseInt(document.getElementById('offerDiscount').value),
		category:  document.getElementById('category').value,
		validity: Timestamp.fromDate(new Date(document.getElementById('offerValidity').value)),
		items: getSelectValues(document.getElementById('items'))
	}

	if ((offer.validity > Timestamp.fromDate(new Date())) && String(offer.id).trim() !== "" &&String(offer.name).trim() !== "" &&String(offer.name).trim() !== "" &&String(offer.category).trim() !== "" && !isNaN(offer.discount) && (offer.items.length > 0)) {
		var reff = doc(db, "offers", offer.id);

		const docRef = setDoc(reff, offer)
		.then(()=>{
			showToast('New Offer Added');
		})
		.catch((error)=>{
			console.log('Error'+error);
		});

		document.getElementById('offerAdd').style.display = 'none';
	}
	showToast('Invalid Offer ');
}

async function sCoupon(){
	const coupon = {
		id: document.getElementById('cId').value,
		code:  document.getElementById('cCode').value,
		discount:  parseInt(document.getElementById('cDiscount').value),
		validity: Timestamp.fromDate(new Date(document.getElementById('cValidity').value))
	}

	if (String(coupon.id).trim() !== "" && String(coupon.code).trim() !== "" && ((coupon.validity) > Timestamp.fromDate(new Date()) && parseInt(coupon.discount) < 100) && promptDelete(coupon.id)) {
		var reff = doc(db, "coupons", coupon.id);

		const docRef = setDoc(reff, coupon)
		.then(()=>{
			showToast('New Coupon Added');
		})
		.catch((error)=>{
			console.log('Error'+error);
		});

		document.getElementById('couponAdd').style.display = '';
	}else{
		showToast('Invalid Coupon');
	}
}

function getDate(dateStamp) {
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const d = dateStamp.toDate();

  var date = d.getDate();
  var month = months[d.getMonth()];
  var year = d.getFullYear();
  return `${date}-${month}-${year}`;
}

function showToast(message) {
  var toast = document.getElementById("toast");
  toast.innerHTML = message;
  toast.classList.add("show");
  setTimeout(function(){ toast.classList.remove("show"); }, 2000);
}

function promptDelete(id) {
  let person = prompt("Please enter passcode");
  if (person != null && person === id) {
  		return true;
  }
  return false;
}