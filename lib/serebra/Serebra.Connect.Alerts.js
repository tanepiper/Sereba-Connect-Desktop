if (!Serebra) Serebra = {};

/* We need to handle command line requests */
Serebra.Initialize = function(){
	
	Serebra.ApplicationName = '';
	Serebra.ApplicationCode = '';
	Serebra.AuthCode = null;
	Serebra.AutoLogin = false;
	Serebra.AutoStart = false;
	Serebra.DatabaseFileName = '';
	Serebra.DebugMode = false;
	Serebra.Errors = [];
	Serebra.FirstRun = false;
	Serebra.ForceUpdate = false;
	Serebra.ForceOffline = false;
	Serebra.LoggedIn = false;
	Serebra.MessageCheckTime = 300000;
	Serebra.NetworkOnline = false;
	Serebra.Password = '';
	Serebra.RememberMe = false;
	Serebra.UnreadMessages = false;
	Serebra.Username = '';
	
	//Cleanup from any update
	try {
  	air.File.applicationStorageDirectory.resolvePath('update').deleteDirectory(true);
  } catch (err) {
		// Nothing to do
	}
	
	air.NativeApplication.nativeApplication.addEventListener(air.InvokeEvent.INVOKE, Serebra._InvokeApplication);
};

Serebra._InvokeApplication = function ( event ) {
	Serebra.System.InvokeSettings(event.arguments, event.currentDirectory, function() {
				
		Serebra.Database.ConnectToFile({
			'databaseFile': Serebra.DatabaseFileName,
			'createFile': true
		});
		
		Serebra.System.LoadDatabaseSettings(function(){
			Serebra.Menu.Initialize();
			if (Serebra.FirstRun) {
				Serebra.Database.SetupFirstRun(function(){
					Serebra.Chrome.LoginWindow(function(){
						Serebra.Network.CheckLogin();
					});
				});
			} else {
				if (Serebra.AutoLogin) {
		  		Serebra.Network.CheckLogin();
		  	} else {
					Serebra.Chrome.LoginWindow(function(){
						Serebra.Network.CheckLogin();
					});
				}
			}
		});
	});	
};

Serebra.Database = {};
Serebra.Database.DatabaseFile = null;

/**
 * Connects to a local SQLite database
 * @param {Object} options
 */
Serebra.Database.ConnectToFile = function(options){

	/**
	 * Default options for connecting to a SQLite database
	 * @param {String} airDir The type of directory in AIR to connect to
	 * @param {String} The name of the database file
	 * @param {Boolean} If the file does not exist, it will be created by default, this allows you to overide that
	 */
	function defaults(){
		return {
			'airDir': 'applicationStorageDirectory',
			'databaseFile': '',
			'createFile': true
		};
	}
	options = jQuery.extend(defaults(), options);
	
	var databaseFile = air.File[options.airDir];
	databaseFile = databaseFile.resolvePath(options.databaseFile);
	
	if (!databaseFile.exists) {
		if (options.createFile) {
			Serebra.Database.CreateDB(databaseFile);
		} else {
			databaseFile = null;
		}
	}
  Serebra.Database.DatabaseFile = databaseFile;
};

/**
 * Creates the database from the passed file location
 * @param {Object} databaseFile The location of the database file
 */
Serebra.Database.CreateDB = function(){
	Serebra.FirstRun = true;
	var connection = new air.SQLConnection();
	connection.addEventListener(air.SQLErrorEvent.ERROR, Serebra.Database.ErrorHandler);
	connection.open(Serebra.Database.DatabaseFile, air.SQLMode.CREATE);
	connection.close();
	return true;
};

Serebra.Database.SetupFirstRun = function(callback) {
	Serebra.Database.Query({
		'queryString': 'CREATE TABLE IF NOT EXISTS serebra_options (key TEXT, value TEXT);'
	});
	Serebra.Database.Query({
		'queryString': 'CREATE TABLE IF NOT EXISTS serebra_user_alerts (AlertID INTEGER PRIMARY KEY, Type TEXT, alertText TEXT, userLink TEXT, objectLink TEXT, messageRead INTEGER);'
	});
	
	if (typeof callback === 'function') return callback();
};

/**
 * Allows you to pass a query to the passed database file
 * @param {Object} databaseFile The location of the database file
 * @param {Object} options The object that contains the options
 */
Serebra.Database.Query = function(options){
	
	/**
	 * Default options for a query
	 * @param {String} queryString The query string to be passed to the database
	 */
	function defaults(){
		return {
			'queryString': ''
		};
	}
	options = jQuery.extend(defaults(), options);
  var transactionSuccessful = false;
  var result = false;
  
	try {
		var connection = new air.SQLConnection();
		connection.open(Serebra.Database.DatabaseFile, air.SQLMode.CREATE);
		
		var query = new air.SQLStatement();
		query.addEventListener(air.SQLErrorEvent.ERROR, Serebra.Database.ErrorHandler);
		query.sqlConnection = connection;
  	query.text = options.queryString;
		query.execute();
  	var success = query.getResult();
  	if (success) {
  		transactionSuccessful = true;
  		result = success;
		}
  	connection.close();
	} catch ( error ) {
		transactionSuccessful = false;
		result = error;
	}
  return {
		'success': transactionSuccessful,
		'result': result
	};
};

Serebra.Database.SaveOrCreateOption = function(options) {
	/**
	 * Default options for a query
	 * @param {String} queryString The query string to be passed to the database
	 */
	function defaults(){
		return {
			'key': '',
			'value': '',
			'overwrite': true
		};
	}
	options = jQuery.extend(defaults(), options);
 	var exists = false;
	var result;
	
	//First we do a search for the item
	var checkExists = Serebra.Database.Query({
		'queryString': 'SELECT * FROM serebra_options WHERE key = "'+options.key+'"'
	});
	
	if (checkExists.result.data) {
		result = null;
		if (options.overwrite) {
			result = Serebra.Database.Query({
				'queryString': 'UPDATE serebra_options SET value = "'+options.value+'" WHERE key = "'+options.key+ '"'
			});
		}
		exists = true;
	} else {
		exists = false;
		result = Serebra.Database.Query({
			'queryString': 'INSERT INTO serebra_options (key, value) VALUES("' + options.key + '", "' + options.value + '")'
		});
	}
	return {'exists':exists, 'result':result};
};

/**
 * The database error handler
 * @param {Object} event The event callback
 */
Serebra.Database.ErrorHandler = function(event){
	air.trace(event.target);
};
Serebra.Menu = {};

/**
 * Initialises the main systray icon
 */
Serebra.Menu.Initialize = function(){
	function iconLoadComplete ( event ) {
		if (air.NativeApplication.supportsSystemTrayIcon) {
			air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
			Serebra.Menu.CreateLoginMenu();
		}
	}
	
	var iconLoader = new runtime.flash.display.Loader();
	iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
	iconLoader.load(new air.URLRequest('app:/assets/images/icon_tray_natural.png'));
};

/**
 * Adds items to the systray menu
 */
Serebra.Menu.CreateSystrayMenu = function(){
	air.NativeApplication.nativeApplication.icon.menu = new air.NativeMenu();
	air.NativeApplication.nativeApplication.icon.addEventListener('click', Serebra.Menu.SystrayClickHandler);
	
	var menuItems = {
		'serebraConnect': new air.NativeMenuItem("Open Serebra Connect", false),
		'messageCenter': new air.NativeMenuItem("Open Alerts Center", false),
		'fakeAlerts': new air.NativeMenuItem("Create Fake Alert", false),
		'updatesMenu': new air.NativeMenuItem("Check For Updates", false),
		'optionsMenu': new air.NativeMenuItem("Settings", false),
		'logoutMenu': new air.NativeMenuItem("Logout", false),
		'closeMenu': new air.NativeMenuItem("Exit", false)
	};
		
	jQuery.each(menuItems, function(i, menuItem) {
		air.NativeApplication.nativeApplication.icon.menu.addItem(menuItem);
		menuItem.addEventListener(air.Event.SELECT, Serebra.Menu.MenuItemClickHandler);
	});
};

Serebra.Menu.CreateLoginMenu = function() {
	air.NativeApplication.nativeApplication.icon.menu = new air.NativeMenu();
	air.NativeApplication.nativeApplication.icon.addEventListener('click', Serebra.Menu.SystrayClickHandler);
	
	var menuItems = {
		'serebraConnect': new air.NativeMenuItem("Open Serebra Connect", false),
		'loginMenu': new air.NativeMenuItem("Login", false),
		'closeMenu': new air.NativeMenuItem("Exit", false)
	};
		
	jQuery.each(menuItems, function(i, menuItem) {
		air.NativeApplication.nativeApplication.icon.menu.addItem(menuItem);
		menuItem.addEventListener(air.Event.SELECT, Serebra.Menu.MenuItemClickHandler);
	});
}


Serebra.Menu.SystrayClickHandler = function(event){
	if (Serebra.NetworkOnline) {
		Serebra.Chrome.MessageCenter();
	} else {
		Serebra.Chrome.LoginWindow(function(){
			Serebra.Network.CheckLogin();	
		});
	}
};

/**
 * Handles the click events from the systray menu and assigns functions
 * @param {Object} event The passed event
 */
Serebra.Menu.MenuItemClickHandler = function(event){
	switch (event.target.label) {
		case "Open Serebra Connect":
			air.navigateToURL(new air.URLRequest('http://www.serebraconnect.com/'));
		break;
		case "Open Alerts Center":
			Serebra.Chrome.MessageCenter();
		break;
		case "Settings":
			Serebra.Chrome.Settings();
		break;
		case "Create Fake Alert":
			Serebra.SOAP.CreateFakeAlert(null, function(){});
		break;
		case "Check For Updates":
			Serebra.Update.InvokeApplicationUpdate({
	  		'updateXML': 'http://dev.ifies.org/descriptor/update.xml',
				'displayFail': true
	  	});
		break;
		case "Login":
			Serebra.Chrome.LoginWindow(function(){
				Serebra.Network.CheckLogin();	
			});
		break;
		case "Logout":
			Serebra.Network.Logout();
		break;
		case "Exit":
			air.NativeApplication.nativeApplication.exit();
		break;
		default:
		break;
	}
  return;
};Serebra.Messages = {};

Serebra.Messages.DeleteMessage = function(id, callback) {
	var deleted = false;
	
	var thisMessage = Serebra.Database.Query({
  	'queryString': 'SELECT * FROM serebra_user_alerts WHERE AlertID = ' + id
  });
	
	if (thisMessage.result.data) {
		if (!thisMessage.result.data[0].messageRead) {
			Serebra.SOAP.ConsumeAlert({
				'authCode': Serebra.AuthCode,
				'applicationCode': Serebra.ApplicationCode,
				'alertID': id
			}, function(soapDocument) {
				var errorCode = jQuery('errorFlag', soapDocument).text();
				var errorString = jQuery('errorString', soapDocument).text();
				var deleteRow;
				if (errorCode == "false") {
					deleteRow = Serebra.Database.Query({
						'queryString': 'DELETE FROM serebra_user_alerts WHERE AlertID = ' + id
					});
					if (deleteRow.success) {
						deleted = true;
					}
				} else if (errorString == "you don't own that alert") {
					deleteRow = Serebra.Database.Query({
						'queryString': 'DELETE FROM serebra_user_alerts WHERE AlertID = ' + id
					});
					if (deleteRow.success) {
						deleted = true;
					}
				}
				return callback(deleted);
			});
		} else {
			var deleteRow = Serebra.Database.Query({
				'queryString': 'DELETE FROM serebra_user_alerts WHERE AlertID = ' + id
			});
			
			if (deleteRow.result.complete) {
				deleted = true;
			}
		}
	}
		
	return callback(deleted);
};
Serebra.Network = {};

Serebra.Network.Monitor = null;
Serebra.Network.MessageCheckTimer = null;

/**
 * The main network initialization function
 */
Serebra.Network.Initialize = function(messageCheckTime) {
	air.NativeApplication.nativeApplication.addEventListener(air.Event.NETWORK_CHANGE, Serebra.Network.CheckConnectivity);
	
	var serviceCheck = new air.URLRequest('http://qa.serebracampus.com:8888/apiWebService.cfc?wsdl');
	Serebra.Network.Monitor = new air.URLMonitor( serviceCheck );
	Serebra.Network.Monitor.addEventListener(air.StatusEvent.STATUS, Serebra.Network.CheckURL);
	Serebra.Network.Monitor.start();
};


Serebra.Network.CheckConnectivity = function ( event ) {
	air.trace('Network gone offline');
}

/**
 * The main network loop handler
 * @param {Object} event The callback event
 */
Serebra.Network.CheckURL = function( event ){
	if (Serebra.Network.Monitor.available) {
		Serebra.Network.Online();
	} else {
		Serebra.Network.Logout();
	}
};

/**
 * The function to execute when we have a internet connection
 */
Serebra.Network.Online = function(){
	Serebra.NetworkOnline = true;
	
	function iconLoadComplete( event ) {
		if (air.NativeApplication.supportsSystemTrayIcon) {
    	air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
      air.NativeApplication.nativeApplication.icon.tooltip = 'Serebra Connect Alerts Is Online';

  		Serebra.Update.InvokeApplicationUpdate({
  			'updateXML': 'http://dev.ifies.org/descriptor/update.xml',
				'displayFail': false
  		});
			Serebra.Network.CheckMessages();
			Serebra.Network.MessageCheckTimer = new air.Timer(Serebra.MessageCheckTime, 0);
			Serebra.Network.MessageCheckTimer.addEventListener(air.TimerEvent.TIMER, Serebra.Network.CheckMessages);
			Serebra.Network.MessageCheckTimer.start();
			return;
    }
	}
	
  var iconLoader = new runtime.flash.display.Loader();
  iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
  iconLoader.load(new air.URLRequest('app:/assets/images/icon_desktop_16.png'));
	return;
};

Serebra.Network.Logout = function() {
	Serebra.NetworkOnline = false;
	
	function iconLoadComplete ( event ) {
		if (air.NativeApplication.supportsSystemTrayIcon) {
			air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
			air.NativeApplication.nativeApplication.icon.tooltip = 'Serebra Connect Alerts Is Offline';
			
			jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(i, win){
				if (win.title !== 'Serebra Connect Alerts') {
					win.close();	
				}
			});
			
			Serebra.Network.MessageCheckTimer.stop();
			Serebra.Menu.CreateLoginMenu();
		}
	}
	var iconLoader = new runtime.flash.display.Loader();
	iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
	iconLoader.load(new air.URLRequest('app:/assets/images/icon_tray_natural.png'));
}

Serebra.Network.CheckLogin = function( options ) {
	Serebra.SOAP.Authenticate({
		'username': Serebra.Username,
		'password': Serebra.Password,
		'applicationCode': Serebra.ApplicationCode
	}, function(soapDocument) {
		var errorCode = jQuery('errorFlag', soapDocument).text();
		if(errorCode == "false") {
			Serebra.LoggedIn = true;
			Serebra.AuthCode = jQuery('authCode', soapDocument).text();
			Serebra.Menu.CreateSystrayMenu();
			Serebra.Network.Initialize(Serebra.MessageCheckTime);
		} else {
			var errorMessage = jQuery('errorString', soapDocument).text();
			if (errorMessage === '') {
				errorMessage = 'Unknown Error';
			}
			Serebra.Errors.push('Login Error: ' + errorMessage);
			Serebra.Chrome.LoginWindow(function(results){
				Serebra.Network.CheckLogin(results);	
			});
		}
	});
};

Serebra.Network.CheckMessages = function() {
	Serebra.SOAP.GetUserAlerts({
		'authCode': Serebra.AuthCode,
		'applicationCode': Serebra.ApplicationCode
	}, function(userAlerts){
			var unreadCount = 0;
			jQuery('alert', userAlerts).each(function(){
			unreadCount = unreadCount + 1;
			var id = jQuery(this).attr('id');
			var type = jQuery('type', this).text();
			var alertText = jQuery('alertText', this).text();
			var userLink = jQuery('userLink', this).text();
			var objectLink = jQuery('objectLink', this).text();			
			var existing = Serebra.Database.Query({
				'queryString': 'SELECT * FROM serebra_user_alerts WHERE AlertID = ' + id
			});	
			if(!existing.result.data){
				Serebra.Database.Query({
					'queryString': 'INSERT INTO serebra_user_alerts VALUES(' + id + ',"' + type + '","' + alertText + '","' + userLink + '","' + objectLink + '",0)'
				});
				Serebra.UnreadMessages = true;
			} else {
				if (existing.result.data[0].messageRead === 0) {
					Serebra.UnreadMessages = true;
				}
			}
			
		});
		
		if (Serebra.UnreadMessages) {
			function iconLoadComplete ( event ) {
				if (air.NativeApplication.supportsSystemTrayIcon) {
					air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
					air.NativeApplication.nativeApplication.icon.tooltip = 'Serebra Connect Alerts - You have unread messages';
				}
				Serebra.Chrome.MessagePopup({
		  		'messageCount': unreadCount
		  	});
			}
			var iconLoader = new runtime.flash.display.Loader();
  		iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
  		iconLoader.load(new air.URLRequest('app:/assets/images/icon_tray_newalerts.png'));
		}
		
	});
};var Serebra;
if (!Serebra) Serebra = function(){};

Serebra.SOAP = {};

Serebra.SOAP.GetResponse = function(output, callback) {
	var xmlhttp;
	var appXML;
	var url = "http://qa.serebracampus.com:8888/apiWebService.cfc?wsdl";
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", url, true);					
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4) {
			return callback(xmlhttp.responseText);
		}
	};
			
	xmlhttp.setRequestHeader("Content-Type", "text/xml");
	xmlhttp.setRequestHeader('SOAPAction','http://qa.serebracampus.com:8888/apiWebService.cfc?wsdl');
	
	xmlhttp.send(output);
};

Serebra.SOAP.Authenticate = function(values, callback) {
	var output = [];
	output.push('<?xml version="1.0" encoding="UTF-8"?>' + "\n\n");
	output.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
		output.push('<soapenv:Body>');
			output.push('<authenticate xmlns="http://DefaultNamespace">');
				output.push('<username>'+values.username+'</username>');
				output.push('<password>'+values.password+'</password>');
				output.push('<applicationCode>'+values.applicationCode+'</applicationCode>');
			output.push('</authenticate>');
		output.push('</soapenv:Body>');
	output.push('</soapenv:Envelope>');
	Serebra.SOAP.GetResponse(output.join(''), callback);
};

Serebra.SOAP.GetUserAlerts = function(values, callback) {
	var output = [];
	output.push('<?xml version="1.0" encoding="UTF-8"?>' + "\n\n");
	output.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
		output.push('<soapenv:Body>');
			output.push('<getUserAlerts xmlns="http://DefaultNamespace">');
				output.push('<authCode>'+values.authCode+'</authCode>');
				output.push('<applicationCode>'+values.applicationCode+'</applicationCode>');
			output.push('</getUserAlerts>');
		output.push('</soapenv:Body>');
	output.push('</soapenv:Envelope>');
	Serebra.SOAP.GetResponse(output.join(''), callback);
};

Serebra.SOAP.ConsumeAlert = function(values, callback) {
	var output = [];
	output.push('<?xml version="1.0" encoding="UTF-8"?>' + "\n\n");
	output.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
		output.push('<soapenv:Body>');
			output.push('<consumeAlert xmlns="http://DefaultNamespace">');
				output.push('<authCode>'+values.authCode+'</authCode>');
				output.push('<applicationCode>'+values.applicationCode+'</applicationCode>');
				output.push('<alertID>'+values.alertID+'</alertID>');
			output.push('</consumeAlert>');
		output.push('</soapenv:Body>');
	output.push('</soapenv:Envelope>');
	Serebra.SOAP.GetResponse(output.join(''), callback);
};

Serebra.SOAP.CreateFakeAlert = function(values, callback) {
	var output = [];
	output.push('<?xml version="1.0" encoding="UTF-8"?>' + "\n\n");
	output.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
		output.push('<soapenv:Body>');
			output.push('<fakeAlert xmlns="http://DefaultNamespace">');
				output.push('<taskID>100786</taskID>');
				output.push('<userID>100037</userID>');
				output.push('<alertTypeID>6</alertTypeID>');
				output.push('<msgSenderUserID>0</msgSenderUserID>');
				output.push('<questionUserID>100037</questionUserID>');
				output.push('<bidID>0</bidID>');
			output.push('</fakeAlert>');
		output.push('</soapenv:Body>');
	output.push('</soapenv:Envelope>');
	Serebra.SOAP.GetResponse(output.join(''), callback);
};Serebra.System = {};

Serebra.System.InvokeSettings = function(AppArguments, CurrentDir, callback) {
	
	var fileStream = new air.FileStream();
	var settingsFile = air.File.applicationDirectory.resolvePath('settings.xml');

	jQuery.each(AppArguments, function(i, argument){
		switch (argument) {
			case "debug-mode":
				Serebra.DebugMode = true;
			break;
			case "force-update":
				Serebra.ForceUpdate = true;
			break;
			case "force-offline":
				Serebra.ForceOffline = true;
			break;
			default:
				// Do nothing
			break;
		}
	});
	
	jQuery.get(settingsFile.url, null, function(data, success){

		Serebra.ApplicationName = jQuery('appname', data).text();
		Serebra.ApplicationCode = jQuery('appcode', data).text();
		Serebra.DatabaseFileName = jQuery('database', data).text();
		 
		if (typeof callback === 'function') {
			return callback();
		} else {
			throw new Error('You must return a callback with this function');
		}
	},'xml');
};

Serebra.System.LoadDatabaseSettings = function ( callback ) {
	var dbValues = Serebra.Database.Query({
	  'queryString': 'SELECT * FROM serebra_options'
	});
	if (dbValues.result.data) {
		jQuery.each(dbValues.result.data, function(i, item){
	  	switch (item.key) {
	  		case "autologin":
	  			Serebra.AutoLogin = item.value;
	  		break;
				case "autostart":
					Serebra.AutoStart = item.value;
				break;
				case "checktime":
					Serebra.MessageCheckTime = parseInt(item.value, 10);
				break;
	  		case "password":
	  			Serebra.Password = item.value;
	  		break;
				case "rememberme":
	  			Serebra.RememberMe = item.value;
	  		break;
	  		case "username":
	  			Serebra.Username = item.value;
	  		break;
				default:
					//Do nothing
				break;
	  	}
		});
	}
	if (typeof callback === 'function') {
		return callback();
	} else {
		throw new Error('You must return a callback with this function');
	}
};
var Serebra;
if (!Serebra) Serebra = function(){};

Serebra.Update = {};
Serebra.Update.ShowFail = false;
Serebra.Update.InvokeApplicationUpdate = function ( options ) {
	function defaults() {
		return {
			'updateXML':''
		};
	}
	options = jQuery.extend(defaults(), options);
	var request = new air.URLRequest(options.updateXML); 
	var loader = new air.URLLoader(); 
	Serebra.Update.ShowFail = options.displayFail;
	loader.addEventListener(air.Event.COMPLETE, Serebra.Update.AppVersionCheck);
	loader.load(request);
};

Serebra.Update.AppVersionCheck = function ( event ) {
	var remoteVersionString = jQuery(event.target.data).find('version').text();
	var remoteVersion = remoteVersionString.split('.');
	var remoteAir = jQuery(event.target.data).find('url').text();
	
	var xmlString = air.NativeApplication.nativeApplication.applicationDescriptor;
	var appXml = new DOMParser();
	var xmlObject = appXml.parseFromString(xmlString, "text/xml");
	var root = xmlObject.getElementsByTagName('application')[0];
	var thisVersion = root.getElementsByTagName("version")[0].firstChild.data;
  thisVersion = thisVersion.split('.');

	var update = false;

	jQuery.each(remoteVersion, function(i, item){
		if (item > thisVersion[i])
			update = true;
	});
		
	if (update) {
		var confirmUpdate = confirm('We have found an update for Serebra Connect Alerts.  Would you like to download now?');
		
		if (confirmUpdate) {
  		var stream = new air.URLStream();
  		stream.addEventListener(air.ProgressEvent.PROGRESS, updatingStatus);
  		stream.addEventListener(air.Event.COMPLETE, updateApplication);
  		stream.load(new air.URLRequest(remoteAir));
  	}
	} else {
		if (Serebra.Update.ShowFail) {
			alert('No updates have been found at this time.');
			Serebra.Update.ShowFail = false;
		}
	}
	
	// Handlers
	function updatingStatus( event ) {
		var percentage = Math.round((event.bytesLoaded / event.bytesTotal) * 100);
	}
	
	function updateApplication ( event ) {
		var filename = "update/SRDesktop-" + remoteVersionString + ".air";
		var ba = new air.ByteArray();
		stream.readBytes(ba, 0, stream.bytesAvailable);
		updateFile = air.File.applicationStorageDirectory.resolvePath(filename);
		fileStream = new air.FileStream();
		fileStream.addEventListener( air.Event.CLOSE, installUpdate );
		fileStream.openAsync(updateFile, air.FileMode.WRITE);
		fileStream.writeBytes(ba, 0, ba.length);
 		fileStream.close();
		
		function installUpdate ( event ) {
			var updater = new air.Updater();
			// Notice that the version name has to be present as a second parameter
			updater.update(updateFile, remoteVersionString);
		}
	}
};Serebra.Chrome = {};

Serebra.Chrome.LoginWindow = function( callback ) {
	
	var username; var password; var autologin; var rememberme;
	
	function windowLoaded( event ) {
		var thisWindow = event.target.window;
		
		if (thisWindow.nativeWindow) {
			var thisDocument = thisWindow.document;
			var centerX = air.Screen.mainScreen.bounds.width / 2;
			var centerY = air.Screen.mainScreen.bounds.height / 2;
			thisWindow.nativeWindow.x = centerX - (thisWindow.nativeWindow.width / 2);
			thisWindow.nativeWindow.y = centerY - (thisWindow.nativeWindow.height / 2);
			thisWindow.nativeWindow.alwaysInFront = false;
		
			// Before we display the screen, we want to set it up
			var loginDom = jQuery('#login-area', thisDocument).get(0);
			// Now lets set up the fields
			jQuery('#autologin', loginDom).attr('checked', Serebra.AutoLogin);
			jQuery('#password', loginDom).val(Serebra.Password);
			jQuery('#rememberme', loginDom).attr('checked', Serebra.RememberMe);
			jQuery('#username', loginDom).val(Serebra.Username);
			
			jQuery('#window-handle', loginDom).bind('mousedown.move', function(){
				thisWindow.nativeWindow.startMove();
			});
			jQuery('.close-button, #cancel', loginDom).click(function(){
				thisWindow.nativeWindow.close();
			});
			jQuery('#login', loginDom).click(function(){
				Serebra.AutoLogin = jQuery('#autologin', loginDom).attr('checked');
				Serebra.Password = jQuery('#password', loginDom).val();
				Serebra.RememberMe = jQuery('#rememberme', loginDom).attr('checked');
				Serebra.Username = jQuery('#username', loginDom).val();
				if (Serebra.RememberMe === true) {
					Serebra.Database.SaveOrCreateOption({
						'key': 'autologin',
						'value': Serebra.AutoLogin
					});
					Serebra.Database.SaveOrCreateOption({
						'key': 'password',
						'value': Serebra.Password
					});
					Serebra.Database.SaveOrCreateOption({
						'key': 'rememberme',
						'value': Serebra.RememberMe
					});
					Serebra.Database.SaveOrCreateOption({
						'key': 'username',
						'value': Serebra.Username
					});
				}
				else {
					Serebra.Database.SaveOrCreateOption({
						'key': 'username',
						'value': ''
					});
					Serebra.Database.SaveOrCreateOption({
						'key': 'password',
						'value': ''
					});
					Serebra.Database.SaveOrCreateOption({
						'key': 'autologin',
						'value': ''
					});
					Serebra.Database.SaveOrCreateOption({
						'key': 'rememberme',
						'value': ''
					});
				}
				thisWindow.nativeWindow.close();
				return callback();
			});
			
			jQuery('#create-account', loginDom).click(function(){
				var url = jQuery(this).attr('href');
				air.navigateToURL(new air.URLRequest(url));
			});
			
			thisWindow.nativeWindow.visible = true;
			thisWindow.nativeWindow.orderToFront();
			// Now we want to check for errors
			if (Serebra.Errors.length > 0) {
				var errorMessages = [];
				jQuery.each(Serebra.Errors, function(i, error){
					errorMessages.push('<li>' + error + '</li>');
				});
				Serebra.Errors = [];
				jQuery('#form-errors ul', loginDom).append(errorMessages.join(''));
				jQuery('#form-errors', loginDom).fadeIn();
			}
		}
	}
	
	var windowOptions = new air.NativeWindowInitOptions();
	windowOptions.maximizable = false;
	windowOptions.minimizable = true;
	windowOptions.resizable = false;
	windowOptions.systemChrome = 'none';
	windowOptions.transparent = true;
	windowOptions.type = 'lightweight';
	
	var windowBounds = new air.Rectangle(0, 0, 318, 285);
	var newHTMLLoader = air.HTMLLoader.createRootWindow(false, windowOptions, false, windowBounds);
	newHTMLLoader.addEventListener(air.Event.COMPLETE, windowLoaded);
	var alreadyOpen = false;
	jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(i, win){
		if (win.title === 'Serebra Connect Alerts - Log In') {
			alreadyOpen = true;
		}
	});
	if (!alreadyOpen) {
		newHTMLLoader.load(new air.URLRequest('app:/assets/html/LoginWindow.html'));	
	}
};

Serebra.Chrome.MessagePopup = function( options ) {
	function windowLoaded( event ) {
		var thisWindow = event.target.window.nativeWindow;
		
		if (thisWindow) {
			var thisDocument = event.target.window.document;
			thisWindow.x = air.Screen.mainScreen.bounds.width - 255;
			thisWindow.y = 0;
			thisWindow.alwaysInFront = true;
		
			// Before we display the screen, we want to set it up
			var popupDom = jQuery('#message-popup', thisDocument).get(0);
			// Now lets set up the fields
			jQuery('#window-handle', popupDom).bind('mousedown.move', function(){
				thisWindow.startMove();
			});
			jQuery('.close-button', popupDom).click(function(){
				thisWindow.close();
			});
			
			jQuery('.message', popupDom).html('<h2>You have <span class="green">' + options.messageCount + '</span> new alerts!</h2>');
				
			thisWindow.visible = true;
			thisWindow.orderToFront();
			
			function closeWindow() {
				thisWindow.close();
			}
			
			var closeTimer = new air.Timer(6000, 1);
			closeTimer.addEventListener(air.TimerEvent.TIMER_COMPLETE, closeWindow);
			closeTimer.start();
		}
	}
	
	var windowOptions = new air.NativeWindowInitOptions();
	windowOptions.maximizable = false;
	windowOptions.minimizable = true;
	windowOptions.resizable = false;
	windowOptions.systemChrome = 'none';
	windowOptions.transparent = true;
	windowOptions.type = 'lightweight';
	
	var windowBounds = new air.Rectangle(0, 0, 255, 155);
	var newHTMLLoader = air.HTMLLoader.createRootWindow(false, windowOptions, false, windowBounds);
	newHTMLLoader.addEventListener(air.Event.COMPLETE, windowLoaded);
	
	var alreadyOpen = false;
	jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(i, win){
		if (win.title === 'Serebra Connect Alerts - Notification') {
			alreadyOpen = true;
		}
	});
	if (!alreadyOpen) {
		newHTMLLoader.load(new air.URLRequest('app:/assets/html/Popup.html'));
	}
};

Serebra.Chrome.Settings = function () {
	function windowLoaded( event ) {
		var thisWindow = event.target.window.nativeWindow;
		
		if (thisWindow) {
			var thisDocument = event.target.window.document;
			var centerX = air.Screen.mainScreen.bounds.width / 2;
			var centerY = air.Screen.mainScreen.bounds.height / 2;
			thisWindow.x = centerX - (thisWindow.width / 2);
			thisWindow.y = centerY - (thisWindow.height / 2);
			thisWindow.alwaysInFront = false;
		
			// Before we display the screen, we want to set it up
			var optionsDom = jQuery('#options-window', thisDocument).get(0);
			// Now lets set up the fields
			jQuery('#window-handle', optionsDom).bind('mousedown.move', function(){
				thisWindow.startMove();
			});
			jQuery('.close-button', optionsDom).click(function(){
				thisWindow.close();
			});
			jQuery('.min-button', optionsDom).click(function(){
				thisWindow.minimize();
			});
			
			jQuery('#autologin',  optionsDom).attr('checked', Serebra.AutoLogin);
			jQuery('#autostart',  optionsDom).attr('checked', Serebra.AutoStart);
			jQuery('#password',   optionsDom).val(Serebra.Password);
			jQuery('#rememberme', optionsDom).attr('checked', Serebra.RememberMe);
			jQuery('#username',   optionsDom).val(Serebra.Username);
			jQuery('#checktime option', optionsDom).each(function(){
				if (jQuery(this).val() == Serebra.MessageCheckTime) {
					jQuery(this).attr('selected', 'selected');
				}
			});
			
			jQuery('#save', optionsDom).bind('click.save', function(){
					Serebra.AutoLogin = jQuery('#autologin', optionsDom).attr('checked');
					Serebra.AutoStart = jQuery('#autostart', optionsDom).attr('checked');
					Serebra.Password = jQuery('#password', optionsDom).val();
					Serebra.RememberMe = jQuery('#rememberme', optionsDom).attr('checked');
					Serebra.Username = jQuery('#username', optionsDom).val();
					Serebra.MessageCheckTime = jQuery('#checktime', optionsDom).val();
					
					Serebra.Database.SaveOrCreateOption({'key':'username', 'value':Serebra.Username});
					Serebra.Database.SaveOrCreateOption({'key':'password', 'value':Serebra.Password});
					Serebra.Database.SaveOrCreateOption({'key':'autologin', 'value':Serebra.AutoLogin});
					Serebra.Database.SaveOrCreateOption({'key':'rememberme', 'value':Serebra.RememberMe});
					Serebra.Database.SaveOrCreateOption({'key':'autostart', 'value':Serebra.AutoStart});
					Serebra.Database.SaveOrCreateOption({'key':'checktime', 'value':Serebra.MessageCheckTime});
					if (!Serebra.DebugMode) {
		  			air.NativeApplication.nativeApplication.startAtLogin = Serebra.AutoStart;
		  		}
					
					Serebra.Network.MessageCheckTimer.stop();
					Serebra.Network.MessageCheckTimer.delay = Serebra.MessageCheckTime;
					Serebra.Network.MessageCheckTimer.start();
					
					thisWindow.close();
				});
			
			thisWindow.visible = true;
			thisWindow.orderToFront();
		}
	}
	
	var windowOptions = new air.NativeWindowInitOptions();
	windowOptions.maximizable = false;
	windowOptions.minimizable = true;
	windowOptions.resizable = false;
	windowOptions.systemChrome = 'none';
	windowOptions.transparent = true;
	windowOptions.type = 'lightweight';
	
	var windowBounds = new air.Rectangle(0, 0, 305, 480);
	var newHTMLLoader = air.HTMLLoader.createRootWindow(false, windowOptions, false, windowBounds);
	newHTMLLoader.addEventListener(air.Event.COMPLETE, windowLoaded);
	
	var alreadyOpen = false;
	jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(i, win){
		if (win.title === 'Serebra Connect Alerts - Settings') {
			alreadyOpen = true;
		}
	});
	if (!alreadyOpen) {
		newHTMLLoader.load(new air.URLRequest('app:/assets/html/OptionsWindow.html'));
	}
};

Serebra.Chrome.MessageCenter = function( options ) {
	function windowLoaded( event ) {
		var thisWindow = event.target.window.nativeWindow;
		
		if (thisWindow) {
			var thisDocument = event.target.window.document;
			var centerX = air.Screen.mainScreen.bounds.width / 2;
			var centerY = air.Screen.mainScreen.bounds.height / 2;
			thisWindow.x = centerX - (thisWindow.width / 2);
			thisWindow.y = centerY - (thisWindow.height / 2);
		
			// Before we display the screen, we want to set it up
			var messageDom = jQuery('#message-center', thisDocument).get(0);
			// Now lets set up the fields
			jQuery('#window-handle', messageDom).bind('mousedown.move', function(){
				thisWindow.startMove();
			});
			jQuery('.close-button', messageDom).click(function(){
				thisWindow.close();
			});
			jQuery('.min-button', messageDom).click(function(){
				thisWindow.minimize();
			});
			
			(function createTable() {
					var allMessages = Serebra.Database.Query({
						'queryString': 'SELECT * FROM serebra_user_alerts ORDER BY AlertID DESC'
  				});
					var output = [];
				
						output.push('<div id="inner-table-wrapper">');
	  					output.push('<table id="message-table" cellspacing="0" cellpadding="0" width="100%">');
	  						output.push('<thead>');
	  							output.push('<tr>');
	  								output.push('<th>&nbsp;</th>');
	  								output.push('<th>Type</th>');
	  								output.push('<th>Details</th>');
	  								output.push('<th>&nbsp;</th>');
	  							output.push('</tr>');
	  						output.push('</thead>');
	  					output.push('<tbody>');
	  					if (allMessages.result.data !== null) {
	  						jQuery.each(allMessages.result.data, function(i, item){
									output.push('<tr id="' + item.AlertID + '">');
	  								switch (item.messageRead) {
	  									case 0:
	  										output.push('<td width="55"><span class="unread">Unread</span></td>');
											break;
											case 1:
												output.push('<td width="55"><span class="read">Read</span></td>');
											break;
											default:
											break;
										}	
	  								output.push('<td width="55">' + item.Type + '</td>');
	  								output.push('<td width="450">' + item.alertText + '</td>');
	  								output.push('<td width="55"><a class="delete" href="#" rel="' + item.AlertID + '"><span>Delete</span<</a></td>');
	  							output.push('</tr>');
	  						});
	  						output.push('</tbody>');
	  						output.push('</table>');
								output.push('</div>');
							} else {
								output.push('<tr width="100%"><td colspan="5" width="100%"><h3>You have No Messages</h3></td></tr>');
								output.push('</tbody>');
	  						output.push('</table>');
								output.push('</div>');
							}
							jQuery('#outer-table-wrapper', messageDom).append(output.join(''));
							
							jQuery('#message-table tbody tr', messageDom).click(function(){
  							jQuery('#message-table tbody tr', messageDom).css({
  								'background-color': 'transparent'
  							});
  							jQuery(this).css({
  								'background-color': '#F4F7CD'
  							});
  						});
				
							jQuery('#message-table .delete', messageDom).bind('click.delete', function(){
								var id = jQuery(this).attr('rel');
								Serebra.Messages.DeleteMessage(id, function(deleted){
									if (deleted) {
				   					jQuery('tr#' + id, messageDom).fadeOut(function(){
											jQuery(this).remove();
											jQuery('#inner-table-wrapper', messageDom).remove();
											createTable();
										});
			  					}
								});
							});
				
	  					jQuery('#message-table tbody tr', messageDom).dblclick(function(){
								var row = this;
  							var id = jQuery(this).attr('id');
  							var thisMessage = Serebra.Database.Query({
  								'queryString': 'SELECT * FROM serebra_user_alerts WHERE AlertID = ' + id
  							});
								if (thisMessage.result.data) {
		  						var link = thisMessage.result.data[0].objectLink;
	  				
		  						Serebra.SOAP.ConsumeAlert({
		  							'authCode': Serebra.AuthCode,
		  							'applicationCode': Serebra.ApplicationCode,
		  							'alertID': id
		  						}, function(response){
		  							var result = jQuery('consumedAlert', response).text();
		  							if (result == 'true') {
		  								Serebra.Database.Query({
		  									'queryString': 'UPDATE serebra_user_alerts SET messageRead = 1 WHERE AlertID = ' + id
		  								});
		  								jQuery('.unread', row).addClass('read').removeClass('unread');
		  								air.navigateToURL(new air.URLRequest(link));
		  							}
		  						});
		  					}
							});
							return;
				})();
			
			thisWindow.visible = true;
			thisWindow.orderToFront();
		}
	}
	
	var windowOptions = new air.NativeWindowInitOptions();
	windowOptions.maximizable = false;
	windowOptions.minimizable = true;
	windowOptions.resizable = false;
	windowOptions.systemChrome = 'none';
	windowOptions.transparent = true;
	windowOptions.type = 'normal';
	
	var windowBounds = new air.Rectangle(0, 0, 640, 354);
	var newHTMLLoader = air.HTMLLoader.createRootWindow(false, windowOptions, false, windowBounds);
	newHTMLLoader.addEventListener(air.Event.COMPLETE, windowLoaded);
	
	var alreadyOpen = false;
	jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(i, win){
		if (win.title === 'Serebra Connect Alerts - Alert Center') {
			alreadyOpen = true;
		}
	});
	if (!alreadyOpen) {
		newHTMLLoader.load(new air.URLRequest('app:/assets/html/MessageCenter.html'));
	}
};

