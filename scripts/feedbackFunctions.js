import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, collection, doc, deleteDoc, setDoc, query, where, updateDoc, getDocs, limit, Timestamp, orderBy } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

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
let readList = [];

const deleteDocument = async (collectionName, documentId, callBack) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    callBack(null);
  } catch (error) {
  	callBack(error);
    console.log("Error deleting document:", error);
  }
};

export function updateReadlist(order, inField) {

	if (inField.checked) {
		readList.push(order);
	}else{
		let index = getIndex(readList, order.id);
		readList.splice(index, 1);
	}
	
	if (readList.length > 0) {
		document.getElementById('read').style.display = 'block';
	}else{
		document.getElementById('read').style.display = 'none';
	}

	console.log(readList);
}

export function getUpdatedlist(){
	return readList;
}

export function setReadList(orders, checkField){

	if (checkField.checked) {
		readList = orders;
	}else{
		readList = [];
	}

	if (readList.length > 0) {
		document.getElementById('read').style.display = 'block';
	}else{
		document.getElementById('read').style.display = 'none';
	}
}


function getIndex(arr, value){
	return arr.findIndex((obj)=> obj.id === value);
}


export async function deleteCoupon(id){

	if (promptDelete(id)) {
		deleteDocument('coupons', id, (error) => {
			if (error) {
				showToast('Error '+error);
			}else{
				showToast('Deleted Coupon '+id);
			}
		});
	}
}

export async function deleteOffer(id){
	if (promptDelete(id)) {
		deleteDocument('offers', id, (error) => {
			if (error) {
				showToast('Error '+error);
			}else{
				showToast('Deleted Offer '+id);
			}
		});
	}
}

function promptDelete(id) {
  let person = prompt("Please enter PASSCODE");
  if (person != null && person === id) {
  		return true;
  }
  return false;
}
function showToast(message) {
  var toast = document.getElementById("toast");
  toast.innerHTML = message;
  toast.classList.add("show");
  setTimeout(function(){ toast.classList.remove("show"); }, 2000);
}
