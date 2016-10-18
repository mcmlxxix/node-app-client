var net, fs, tx, err, oper, lock, crypto;

function JSONClient(app,host,port) {
	this.app = app;
	this.host = host;
	this.port = port;
	
	/* request counter */
	this.counter = 0;
	
	/* client socket */
	this.socket;
	
	/* callback storage */
	this.callback = {};
}

/* core commands */
JSONClient.prototype.connect = function() {
	this.socket = connect.call(this);
}
JSONClient.prototype.disconnect = function() {
	disconnect.call(this);
}
JSONClient.prototype.auth = function(callback,user,pass) {
	var request = auth.call(this,user,pass);
	handleRequest.call(this,callback,request,false);
}

/* jsondb commands */
JSONClient.prototype.lock = function(callback,db,path,lockType) {
	var request = lockTransaction.call(this,db,path,lockType);
	handleRequest.call(this,callback,request,false);
}
JSONClient.prototype.unlock = function(callback,db,path) {
	var request = unlockTransaction.call(this,db,path);
	handleRequest.call(this,callback,request,false);
};
JSONClient.prototype.read = function(callback,db,path) {
	var request = read.call(this,db,path);
	handleRequest.call(this,callback,request,false);
};
JSONClient.prototype.write = function(callback,db,path,data) {
	var request = write.call(this,db,path,data);
	handleRequest.call(this,callback,request,false);
};
JSONClient.prototype.subscribe = function(callback,db,path) {
	var request = subscribe.call(this,db,path);
	handleRequest.call(this,callback,request,true);
};
JSONClient.prototype.unsubscribe = function(callback,db,path) {
	var request = unsubscribe.call(this,db,path);
	handleRequest.call(this,callback,request,true);
};
JSONClient.prototype.request = function(callback,db,oper,data) {
	var request = new Request(oper,this.app,db,data);
	handleRequest.call(this,callback,request,false);
}

/* query object */
function Request(oper,app,db,data,lock) {
	this.oper = oper;
	this.app = app;
	this.db = db;
	this.data = data;
	this.lock = lock;
}

/* request handler */
function handleRequest(callback,request,persist) {
	request.qid = this.counter++;
	this.callback[request.qid] = {func:callback,persist:persist};
	output(this.socket,request);
}
function handleCallback(request) {
	if(request.qid == null || this.callback[request.qid] == null) 
		return null;
	if(typeof this.callback[request.qid].func == "function")
		this.callback[request.qid].func(request);
	if(this.callback[request.qid].persist == false)
		delete this.callback[request.qid];
}

/* events */
function onConnect(socket) {
}
function onClose() {
	this.socket.rl.close();
}
function onError(e) {
	log(e);
}
function onReceive(str) {
	var request = tx.decode(JSON.parse(str));
	handleCallback.call(this,request);
	return request;
}

/* socket functions */
function output(socket,request) {
	request = JSON.stringify(tx.encode(request));
	socket.write(request + "\r\n");
	return request;
}
function connect() {
	var s = new net.Socket();
	s.setEncoding('utf8');
	s.ip = s.remoteAddress;
	s.rl = rl.createInterface({
		input:s,
		output:s
	});
	s.rl.on('line',(s)=>onReceive.call(this,s));
	s.on("close",()=>onClose.call(this));
	s.on("error",(e)=>onError.call(this,e));
	s.on('connect',()=>onConnect.call(this));
	return s.connect(this.port,this.host);
}
function disconnect() {
	this.socket.end();
}

/* server functions */
function auth(user,pass) {
	var hash = crypto.createHash('md5').update(pass).digest('hex');
	return new Request(oper.AUTH,undefined,{name:user,pass:hash});
}
function lockTransaction(db,path,lockType) {
	return new Request(oper.LOCK,this.app,db,[{path:path}],lockType);
}
function unlockTransaction(db,path) {
	return new Request(oper.UNLOCK,this.app,db,[{path:path}]);
}
function read(db,path) {
	return new Request(oper.READ,this.app,db,[{path:path}]);
}
function write(db,path,data) {
	return new Request(oper.WRITE,this.app,db,data);
}
function subscribe(db,path) {
	return new Request(oper.SUBSCRIBE,this.app,db,[{path:path}]);
}
function unsubscribe(db,path) {
	return new Request(oper.UNSUBSCRIBE,this.app,db,[{path:path}]);
}

/* initialization */
function init() {
	var defs = require('./lib/defs');
	tx = require('./lib/transform');
	net = require('net');
	rl = require('readline');	
	crypto = require('crypto');

	err = defs.error;
	oper = defs.oper;
	lock = defs.lock;
}

/* goooooo */
init();

/* module methods */
module.exports.create = function(app,host,port) {
	return new JSONClient(app,host,port);
}