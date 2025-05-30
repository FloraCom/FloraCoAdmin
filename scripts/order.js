
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, collection, doc, query, where, updateDoc, getDocs, limit, Timestamp, orderBy } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { updateItemDisplay, getItem, closeCard, openCard } from '../scripts/FloraCoFunctions.js';

window.updateItemDisplay = updateItemDisplay;
window.getItem = getItem;
window.closeCard = closeCard;
window.openCard = openCard;

const firebaseConfig = {
  apiKey: "AIzaSyDg_cruaRr3dHWuE8Ddzxk6OXlWKE445kA",
  authDomain: "floraco-main.firebaseapp.com",
  projectId: "floraco-main",
  storageBucket: "floraco-main.firebasestorage.app",
  messagingSenderId: "675774592408",
  appId: "1:675774592408:web:765b6016f902858bb267ed",
  measurementId: "G-2T9X6F21LB"
};

let ords = [];

var app = initializeApp(firebaseConfig);

loadData((data) => {
  display(ords);
});


document.getElementById('searchButton').addEventListener('click', ()=> {
  let search = document.getElementById('search').value;

  if (String(search).trim() !== "" ) {
      loadDataById(String(search).trim().toUpperCase().replace('FCOR', ''), ords => {
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
      loadDataById(String(search).trim().toUpperCase(), ords => {
        display(ords);
      });
    }else{
      display(ords);
    }
  }
});

async function loadData(callBack){

  let orders = [];

  const db = getFirestore(app);
  const usersCollection = collection(db, "orders");
  const q = query(usersCollection, where("placed", "<=", String(new Date().getTime())), where("status", "==", 0), orderBy("placed", "asc"), limit(10));
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
  const usersCollection = collection(db, "orders");
  const q = query(usersCollection, where("id", "==", String('FCOR'+id)), limit(5));
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

function handleRefund() {
  alert('Refund initiated for Order #390561');
}

function printInvoice() {
  window.print();
}

function display(orders){
  populateContent(ords);

  document.getElementById('dateInput').addEventListener('change', () => {
    setUpDateSearch();
  });
}

function getDate(dateStamp) {
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const d = new Date();
  d.setTime(parseInt(dateStamp));

  var date = d.getDate();
  var month = months[d.getMonth()];
  var year = d.getFullYear();
  return `${date}-${month.toUpperCase()}-${year}`;
}

function getToFormatDate(dateStamp) {
  const d = new Date();
  d.setTime(parseInt(dateStamp));
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
    let listDoc = document.getElementById('ordersList');
    listDoc.innerHTML = '';

    document.getElementById('searchResult').innerHTML = `${orders.length} Orders`;

    orders.forEach((order, index) => {
        let js = JSON.stringify(order).replace(/'/g, '&quot;');
        let li = document.createElement('li');
        li.innerHTML = `
          <div class="orderItem">
            <div class="card">
                <div class="itemDetails">
                  <div class="top">
                    <p class="category">${order.userId}</p>
                    <p class="category">${getDate(order.placed)}</p>
                  </div>
                  <p class="itemNo">${order.id}</p>
                </div>
                <p class="itemCount">${order.items.length} Items</p>
                <p class="itemMode ${(order.mode === "2") ? 'cod' : 'paid'}">${(order.mode === "2") ? 'COD' : 'Paid'}</p>
                <p class="itemShowText" onclick='updateItemDisplay(${js},  ${index});'>proceed</p>
                <p class="itemShowArrow" onclick='updateItemDisplay(${js},  ${index});'><i class="fi fi-ss-play"></i></p>
            </div>
          </div>
          <div class="hr">
            <hr>
          </div>
        `;
        listDoc.appendChild(li);
    });

}

export async function updateOrder(id, index){

  await updateDoc(doc(getFirestore(app), 'orders', id), {
      status: 1
  });
  ords.splice(index, 1);
  closeCard();
  populateContent(ords);

}

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

document.getElementById('close').addEventListener('click', () => {
  closeCard();
});

document.getElementById('loadMore').addEventListener('click', () => {
  
  document.getElementById('loadMore').style.display = "none";

  loadData((data) => {
    display(ords);
  });

});

/*document.getElementById('print').addEventListener('click', () => {
  document.getElementById('orderContent').style.justifyContent = "center";
  printInvoice();
  document.getElementById('orderContent').style.justifyContent = "end";
});*/