# node-app-client

Socket client for use with [node-app-srv](https://github.com/mcmlxxix/node-app-srv)

## Description

[node-app-client](https://github.com/mcmlxxix/node-app-client) is a socket client for use with [node-app-srv](https://github.com/mcmlxxix/node-app-srv). The JSON application socket service accepts connections from the client and allows interaction with a any number of custom node.js applications and/or databases.

## Installation

	npm install node-app-client

## Usage

	var appName = "test";
	var appHost = "localhost";
	var appPort = 10089;

	var appClient = require('node-app-client').create(appName,appHost,appPort);

	appClient.connect();

	var userName = "admin";
	var userPass = "admin";

	function callback(response) {
		console.log("packet received: " + JSON.stringify(response));
	}
	
	/* authenticate client connection */
	appClient.auth(callback,userName,userPass);
	
	var db = "testdb";
	var path = "path.to.object";

	/* read a record from database */
	appClient.read(callback,db,path);
	
# Core methods

	appClient.auth(callback,userName,userPass);
	appClient.connect();
	appClient.disconnect();
	
# JSON-DB methods

	/* record locking: see ./lib/defs.js for valid <lock> types */
	appClient.lock(callback,db,path,lock);
	appClient.read(callback,db,path);
	appClient.write(callback,db,[{path:"path/to",key:"object",value:10},...]);
	appClient.unlock(callback,db,path);
	
	/* generic request: see ./lib/defs.js for valid <oper> types */
	appClient.request(callback,db,oper,data)

	/* clients subscribed to a path within an object receive an update of that object any time a change occurs */
	appClient.subscribe(callback,db,path);
	appClient.unsubscribe(callback,db,path);
	
## JPath integration

	[node-jpath](https://github.com/mcmlxxix/node-jpath) allows for xpath-style queries in a JSON environment. 
	
# Examples

	/* return all path.to.property records where property == value */
	appClient.read(callback,db,"path.to[property==value]");
	
	/* return all records with child 'property' containing a child 'value' > 10 */
	appClient.read(callback,db,"*.property[value>10]");
	
	/* see [node-jpath](https://github.com/mcmlxxix/node-jpath) for more examples */





