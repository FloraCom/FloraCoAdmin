import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, collection, doc, query, where, updateDoc, getDocs, limit, Timestamp, orderBy } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { updateReadlist, getUpdatedlist, setReadList } from "../scripts/feedbackFunctions.js";

window.updateReadlist = updateReadlist;
window.getUpdatedlist = getUpdatedlist;
window.setReadList = setReadList;

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
let readList = [];
let selectedAll  = document.getElementById('selectAll').checked;

loadData((data) => {
  display(ords);
});


document.getElementById('selectAll').addEventListener('change', () => {

    selectedAll = document.getElementById('selectAll').checked;

    setReadList(ords, document.getElementById('selectAll'));
    populateContent(ords);


});

document.getElementById('read').addEventListener('click', () => {

    if (getUpdatedlist()) {
      readFeedbacks(getUpdatedlist());
    }else{
        showToast('No read list');
    }


});

function showToast(message) {
  var toast = document.getElementById("toast");
  toast.innerHTML = message;
  toast.classList.add("show");
  setTimeout(function(){ toast.classList.remove("show"); }, 2000);
}

document.getElementById('searchButton').addEventListener('click', ()=> {
  let search = document.getElementById('search').value;

  if (String(search).trim() !== "" ) {
      loadDataById(String(search).trim(), ordes => {
      display(ordes);
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
      loadDataById(String(search).trim(), ordes => {
        console.log(ordes);
        display(ordes);
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
  populateContent(orders);

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
	      <td><input type='checkbox' ${(selectedAll || order.status) ? 'checked' : ''} onchange='updateReadlist(${JSON.stringify(order).replace(/'/g, '&quot;')}, this);'></td>
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

  let ordrs = [];

  const db = getFirestore(app);
  const usersCollection = collection(db, "feedbacks");
  const q = query(usersCollection, where("email", "==", String(id)), limit(5));
  var querySnapshot = await getDocs(q);

  if(querySnapshot.docs.length == 0){
    callBack(ordrs);
  }

  querySnapshot.forEach((doc) => {
    try{
      if (doc.data()) {
        ordrs.push(doc.data());
      }
    }catch(err) {
      console.log(err);
    }
    callBack(ordrs);
  });
}

async function readFeedbacks(feedbacks) {
  if (feedbacks) {
    feedbacks.forEach((feedback, index) => {
        updateDoc(doc(getFirestore(app), 'feedbacks', feedback.id), {
            status: true
        }).then(done => {
          ords.splice(index, 1);
          populateContent(ords);
        });
    });

    document.getElementById('read').style.display = 'none';
    document.getElementById('selectAll').checked = false;
    showToast(feedbacks.length + ' Feedbacks Read');
  }
}

async function addDataWithCustomId(data) {
   const collectionRef = collection(db, "yourCollection");
   const docRef = doc(collectionRef); // Generate a document reference with a random ID
   const uniqueId = docRef.id;
   await setDoc(docRef, data);
   console.log("Document ID:", uniqueId);
   return uniqueId;
}