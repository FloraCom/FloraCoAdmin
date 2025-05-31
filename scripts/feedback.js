
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, collection, doc, query, where, updateDoc, getDocs, limit, Timestamp, orderBy } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

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

let ords = [];

loadData((data) => {
  display(ords);
});


document.getElementById('searchButton').addEventListener('click', ()=> {
  let search = document.getElementById('search').value;

  if (String(search).trim() !== "" ) {
      loadDataById(String(search).trim(), ords => {
      display(ords);
    });
  }else{
    display(ords);
  }

});

document.getElementById('search').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); 
    let search = document.getElementById('search').value;
    if (String(search).trim() !== "" ) {
      loadDataById(String(search).trim(), ords => {
        display(ords);
      });
    }else{
      display(ords);
    }
  }
});

document.getElementById('loadMore').addEventListener('click', () => {
  
  document.getElementById('loadMore').style.display = "none";

  loadData((data) => {
    display(ords);
  });

});

function setUpDateSearch(){

  let ordes = getOrdersByDate(ords);

  if (ordes === null) {
    display(ords);
  }else{
    populateContent(ordes);
  }

}

function getOrdersByDate(orders) {

  let ordes = [];

  if (String(getDateInput()).trim() === "") {
    return null;
  }else{
    orders.forEach(order => {

      if (String(getDateInput()) == String(getToFormatDate(order.placed))) {
          ordes.push(order);
      }
    });
    return ordes;
  }

}

function display(orders){
  populateContent(ords);

  document.getElementById('dateInput').addEventListener('change', () => {
    setUpDateSearch();
  });
}

function getDate(dateStamp) {
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  var d = new Date();
  d = dateStamp.toDate();

  var date = d.getDate();
  var month = months[d.getMonth()];
  var year = d.getFullYear();
  return `${date}-${month.toUpperCase()}-${year}`;
}

function getToFormatDate(dateStamp) {
  var d = new Date();
  var date = d.getDate();
  var month = d.getMonth()+1;
  var year = d.getFullYear();
  return `${year}-${String(month).padStart(2, '0')}-${date}`;
}

function getDateInput() {
  return document.getElementById('dateInput').value;
}


function populateContent(orders) {

    document.getElementById('loadMore').style.display= "flex";
    let tbody = document.getElementById('productList');
    tbody.innerHTML = '';

    document.getElementById('searchResult').innerHTML = `${orders.length} Feedbacks`;

    orders.forEach((order, index) => {

		tbody.innerHTML += `
		<tr>
	      <td><input type='checkbox'></input></td>
	      <td class="description">${getDate(order.time)}<br>${order.name}</td>
	      <td>${order.category}</td>
	      <td>${order.sub}</td>
	      <td class="description">${order.email}<br><br>${order.content}</td>
	      <td class="actions"><a href="https://mail.google.com/mail/?view=cm&fs=1&to=${order.email}" target="_blank">MAIL</a></td>
        </tr>
		`;
    });

}

async function loadData(callBack){

  let orders = [];

  const db = getFirestore(app);
  const usersCollection = collection(db, "feedbacks");
  const q = query(usersCollection, where("time", "<=", Timestamp.fromDate(new Date())), where("status", "==", false), orderBy("time", "asc"), limit(10));
  var querySnapshot = await getDocs(q);

  if(querySnapshot.docs.length == 0){
    callBack(orders);
  }

  querySnapshot.forEach((doc) => {
    try{
      if (doc.data()) {
        orders.push(doc.data());
      }
    }catch(err) {
      console.log(err);
    }
  });
  ords = orders;
  callBack(orders);
}

async function loadDataById(id, callBack){

  let orders = [];

  const db = getFirestore(app);
  const usersCollection = collection(db, "feedbacks");
  const q = query(usersCollection, where("email", "==", String(id)), limit(5));
  var querySnapshot = await getDocs(q);

  if(querySnapshot.docs.length == 0){
    callBack(orders);
  }

  querySnapshot.forEach((doc) => {
    try{
      if (doc.data()) {
        orders.push(doc.data());
      }
    }catch(err) {
      console.log(err);
    }
  });
  callBack(orders);
}
