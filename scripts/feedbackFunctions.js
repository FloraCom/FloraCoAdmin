let readList = [];

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