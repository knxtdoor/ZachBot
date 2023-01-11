const fs = require('fs');




let econ = readEconomy();

exports.process = (message)=>{
	user = message.author;
	if(econ[user.id] == undefined){
		econ[user.id] = newUser();
	}
	econ[user.id].balance++;
}

exports.sync = syncFile;

function readEconomy(){
	return JSON.parse(fs.readFileSync("./economy.json"))
}
function syncFile(){
	fs.writeFileSync("./economy.json",JSON.stringify(econ));
}
function newUser(){
	return {balance:0}
}
