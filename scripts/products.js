
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
	apiKey: "AIzaSyDg_cruaRr3dHWuE8Ddzxk6OXlWKE445kA",
	authDomain: "floraco-main.firebaseapp.com",
	projectId: "floraco-main",
	storageBucket: "floraco-main.firebasestorage.app",
	messagingSenderId: "675774592408",
	appId: "1:675774592408:web:765b6016f902858bb267ed",
	measurementId: "G-2T9X6F21LB"
};

const categories = {
	"floral-supply": ["flowers", "decorations", "buds"],
	"plant": ["air", "aquatic", "bamboo", "bonsai", "cactus", "carnivorus", "climber", "conifer", "creeper", "cycad", "decorative", "flowering", "ferns", "ficus", "fig", "fruit", "grafted-fruit", "ground-cover", "herb", "kokedama", "palm", "perennial", "shrubs", "spice", "succulent", "vegetable"],
	"tree": ["fruit-tree", "shade-tree", "evergreen"],
	"seed": ["vegetable", "flower", "herb"],
	"bulb": ["flowering", "fruit"],
	"soil": ["potting-mix", "compost", "topsoil", "cocopeat"],
	"fertilizer": ["organic", "chemical", "liquid"],
	"pot-and-vase": ["ceramic", "plastic", "glass"],
	"gardening-tool": ["outdoor", "indoor"]
};

var app = initializeApp(firebaseConfig);

let params = new URLSearchParams(window.location.search);
let category = params.get('category');
let sub = params.get('sub');
let id = params.get('id');
let offer = params.get('offer');

let variation = 0;
let product = '';
let quantity = 0;
let products = [];
let filterProducts = [];
let displayAmount = 15;
let productDict = {};

async function setUpProductList(){

	let productsOffer = {};

	let offers = JSON.parse(window.localStorage.getItem('FloraCoAdminOffers'));

	offers.forEach((offer) => {

		if (offer.items.length > 0) {

			(offer.items).forEach(item => {
				if (productsOffer[item]) {
					productsOffer[item] += offer.discount;
				}else{
					productsOffer[item] = offer.discount;
				}
			});

		}
	});

	window.localStorage.setItem('FloraCoAdminOfferProducts', JSON.stringify(productsOffer));

	display();
}

function populateContent(products) {

	let content = document.getElementById('productsList');
	content.innerHTML = '';

	document.getElementById('searchResult').innerHTML = products.length + ' Products Found';
	
	products = Object.values(products);

	let productsOffer = JSON.parse(window.localStorage.getItem('FloraCoAdminOfferProducts'));

	products.forEach((obj, index) => {

		productDict[obj.id] = obj;

		filterProducts.push(obj);
		obj.variations.forEach((variant) => {

			const li = document.createElement('li');
			li.className = 'productCard';
			li.innerHTML = `
	            <a href="https:/floracom.github.io/FloraCoProduct/index.html?category=${obj.parentCategory}&sub=${obj.subCategory}&id=${obj.id}&variant=${variant.id}" target="_blank" class="cardA">
	              <p class="category" id="prId">${obj.id}</p>
	              <div class="card">
	                <div class="cardImg">
	                  <img class="cardImageView" src="${variant.image}" onerror="src='./media/fc.png'">
	                </div>
	                <div class="cardText">
	                  <div class="off">
	                    <p class="category">${capitalizeFirstLetter(obj.parentCategory)}</p>
	                    ${isNotOfferProduct(productsOffer, obj.id) ? '' : '<p class="productOffer">'+getDiscount(productsOffer, obj.id)+'% off</p>'}
                 	  </div>
	                  <h3 class="title">${obj.name}</h3>
	                  <h3 class="category">${variant.id}</h3>
	                  <div class="prices">
	                    <h3 class="price">${getPrice(isNotOfferProduct(productsOffer, obj.id), getDiscount(productsOffer, obj.id), obj.variations[0].price)}</h3>
	                    <span class="priceSpan">${isNotOfferProduct(productsOffer, obj.id) ? getSpanOfferPrice(0.1, obj.variations[0].price) : obj.variations[0].price}</span>
	                  </div>
	                </div>
	              </div>
	            </a>
            `;
			content.appendChild(li);
		});
	});
}

function filterSearch(){
	let search = document.getElementById('search').value;

	let filteredList = [];

	if (search.trim() !== "") {
		Object.values(filterProducts).forEach(product => {
			if(String(product.name).toLowerCase().includes(search.toLowerCase())){
				filteredList.push(product);
			}
			console.log(product);
		});
		populateContent(filteredList);
		
	}else{
		populateContent(products);
	}
}

function capitalizeFirstLetter(val) {
	return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function getPrice(isNotOffer, productsOffer, price){

	if (!isNotOffer) {
		return Math.ceil((parseInt(price) - ((parseInt(price)*productsOffer)/100)));
	}else{
		return price;
	}

}

function getSpanOfferPrice(productOffer, price){

	if (productOffer) {
		return Math.ceil((parseInt(price) + (parseInt(price)*productOffer)));
	}else{
		return price;
	}

}

function getDiscount(productsOffer, id){

	if (isNotOfferProduct(productsOffer, id)) {
		return 10;
	}else{
		return (productsOffer[String(id)]);
	}

}

function isNotOfferProduct(productsOffer, id){
	return (productsOffer[String(id)] === undefined); 
}

async function updateList(){

    const date = new Date();
    const timestampFromDate = Timestamp.fromDate(date);
    const now = Timestamp.now();
	const db = getFirestore(app);
	const usersCollection = collection(db, "offers");
	const q = query(usersCollection, where("validity", ">=", now));

	var querySnapshot = await getDocs(q);

	if(querySnapshot.docs.length == 0){
		window.localStorage.setItem('FloraCoAdminOffers', '[]');
	}

	let offers = [];

	querySnapshot.forEach(doc => {

		offers.push(doc.data());

	});
	window.localStorage.setItem('FloraCoAdminOffers', (JSON.stringify(offers)));

	setUpProductList();

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
			products = [];

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

updateList();


document.getElementById('searchButton').addEventListener('click', ()=> filterSearch());
document.getElementById('search').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); 
    filterSearch();
  }
});