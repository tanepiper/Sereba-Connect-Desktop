/**
 * Initialisation of Serebra Connect Alerts
 */
var Serebra;
if (!Serebra) Serebra = function(){};
Serebra.Chrome = function(){};
Serebra.Database = function(){};
Serebra.Menu = function(){};
Serebra.Messages = function(){};
Serebra.Network = function(){};
Serebra.SOAP = function(){};
Serebra.System = function(){};
Serebra.Update = function(){};

/* We need to handle command line requests */
Serebra.Initialize = function() {

    Serebra.ApplicationName = '';
    Serebra.ApplicationCode = '';
    Serebra.AuthCode = null;
    Serebra.AutoStart = false;
    Serebra.DatabaseFileName = '';
    Serebra.DebugMode = false;
    Serebra.DisplayPopups = true;
	Serebra.DisplayPopupsAnswers = true;
	Serebra.DisplayPopupsAwards = true;
	Serebra.DisplayPopupsBids = true;
	Serebra.DisplayPopupsMessages = true;
	Serebra.DisplayPopupsQuestions = true;
    Serebra.Errors = [];
    Serebra.FirstRun = false;
    Serebra.ForceUpdate = false;
    Serebra.ForceOffline = false;
	Serebra.IgnoreArray = [];
	Serebra.JustLoaded = true;
    Serebra.LoggedIn = false;
    Serebra.MessageCheckTime = 300000;
    Serebra.NetworkOnline = false;
    Serebra.Password = '';
    Serebra.PlayPopupSound = true;
    Serebra.RememberMe = false;
    Serebra.UnreadMessages = false;
    Serebra.Username = '';
	Serebra.UserTable = 'serebra_user_';

    //Cleanup from any update
    try {
      air.File.applicationStorageDirectory.resolvePath('update').deleteDirectory(true);
    } catch(err) {
      // Do nothing
    }
    air.NativeApplication.nativeApplication.addEventListener(air.InvokeEvent.INVOKE, Serebra._InvokeApplication);
};

Serebra._InvokeApplication = function(event) {
    Serebra.System.InvokeSettings(event.arguments, event.currentDirectory,
    function() {

        Serebra.Database.ConnectToFile({
            'databaseFile': Serebra.DatabaseFileName,
            'createFile': true
        });

        Serebra.System.LoadDatabaseSettings(function() {
            Serebra.Menu.Initialize();
            if (Serebra.FirstRun) {
                Serebra.Database.SetupFirstRun(function() {
                    Serebra.Chrome.LoginWindow(function() {
                        Serebra.Network.CheckLogin();
                    });
                });
            } else {
				Serebra.Chrome.LoginWindow(function() {
					Serebra.Network.CheckLogin();
				});
            }
        });
    });
};
Serebra.Database.DatabaseFile = null;

/**
 * Connects to a local SQLite database
 * @param {Object} options
 */
Serebra.Database.ConnectToFile = function(options) {

    /**
	 * Default options for connecting to a SQLite database
	 * @param {String} airDir The type of directory in AIR to connect to
	 * @param {String} The name of the database file
	 * @param {Boolean} If the file does not exist, it will be created by default, this allows you to overide that
	 */
    function defaults() {
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
Serebra.Database.CreateDB = function() {
    Serebra.FirstRun = true;
    var connection = new air.SQLConnection();
    connection.addEventListener(air.SQLErrorEvent.ERROR, Serebra.Database.ErrorHandler);
    connection.open(Serebra.Database.DatabaseFile, air.SQLMode.CREATE);
    connection.close();
    return true;
};
/**
 * The database error handler
 * @param {Object} event The event callback
 */
Serebra.Database.ErrorHandler = function(event) {
    air.trace(event.target);
};
/**
 * Allows you to pass a query to the passed database file
 * @param {Object} databaseFile The location of the database file
 * @param {Object} options The object that contains the options
 */
Serebra.Database.Query = function(options) {

    /**
	 * Default options for a query
	 * @param {String} queryString The query string to be passed to the database
	 */
    function defaults() {
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
    } catch(error) {
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
    function defaults() {
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
        'queryString': 'SELECT * FROM serebra_options WHERE key = "' + options.key + '"'
    });

    if (checkExists.result.data) {
        result = null;
        if (options.overwrite) {
            result = Serebra.Database.Query({
                'queryString': 'UPDATE serebra_options SET value = "' + options.value + '" WHERE key = "' + options.key + '"'
            });
        }
        exists = true;
    } else {
        exists = false;
        result = Serebra.Database.Query({
            'queryString': 'INSERT INTO serebra_options (key, value) VALUES("' + options.key + '", "' + options.value + '")'
        });
    }
    return {
        'exists': exists,
        'result': result
    };
};
Serebra.Database.SetupFirstRun = function(callback) {
    Serebra.Database.Query({
        'queryString': 'CREATE TABLE IF NOT EXISTS serebra_options (key TEXT, value TEXT);'
    });
    Serebra.Database.Query({
        'queryString': 'INSERT INTO serebra_options VALUES("displaypopups", "true");'
    });
    Serebra.Database.Query({
        'queryString': 'INSERT INTO serebra_options VALUES("popupsound", "true");'
    });
	Serebra.Database.Query({
        'queryString': 'INSERT INTO serebra_options VALUES("show_bids", "true");'
    });
	Serebra.Database.Query({
        'queryString': 'INSERT INTO serebra_options VALUES("show_messages", "true");'
    });
	Serebra.Database.Query({
        'queryString': 'INSERT INTO serebra_options VALUES("show_questions", "true");'
    });
	Serebra.Database.Query({
        'queryString': 'INSERT INTO serebra_options VALUES("show_answers", "true");'
    });
	Serebra.Database.Query({
        'queryString': 'INSERT INTO serebra_options VALUES("show_awards", "true");'
    });

    if (typeof callback === 'function') return callback();
};
Serebra.Database.UserTable = function(callback) {
	Serebra.UserTable = Serebra.UserTable + Serebra.Username.toLowerCase();
	
	var existing = Serebra.Database.Query({
    	'queryString': 'SELECT * FROM ' + Serebra.UserTable
	});
	if (!existing.result.data) {
		Serebra.Database.Query({
			'queryString': 'CREATE TABLE IF NOT EXISTS ' + Serebra.UserTable + ' (AlertID INTEGER PRIMARY KEY, Type TEXT, alertText TEXT, userLink TEXT, objectLink TEXT, messageRead INTEGER);'
		});
	}
	return callback();
}
Serebra.Menu.CreateLoginMenu = function() {
    air.NativeApplication.nativeApplication.icon.menu = new air.NativeMenu();
    air.NativeApplication.nativeApplication.icon.addEventListener('click', Serebra.Menu.SystrayClickHandler);

    var menuItems = {
        'serebraConnect': new air.NativeMenuItem("Open Serebra Connect", false),
        'loginMenu': new air.NativeMenuItem("Login", false),
		'whatsThis': new air.NativeMenuItem("Whats This?", false),
        'closeMenu': new air.NativeMenuItem("Exit", false)
    };

    jQuery.each(menuItems,
    function(i, menuItem) {
        air.NativeApplication.nativeApplication.icon.menu.addItem(menuItem);
        menuItem.addEventListener(air.Event.SELECT, Serebra.Menu.MenuItemClickHandler);
    });
};
/**
 * Adds items to the systray menu
 */
Serebra.Menu.CreateSystrayMenu = function() {
    air.NativeApplication.nativeApplication.icon.menu = new air.NativeMenu();
    air.NativeApplication.nativeApplication.icon.addEventListener('click', Serebra.Menu.SystrayClickHandler);

    var menuItems = {
        'serebraConnect': new air.NativeMenuItem("Open Serebra Connect", false),
        'messageCenter': new air.NativeMenuItem("Open Alerts Center", false),
        'updatesMenu': new air.NativeMenuItem("Check For Updates", false),
        'optionsMenu': new air.NativeMenuItem("Settings", false),
        'logoutMenu': new air.NativeMenuItem("Logout", false),
		'whatsThis': new air.NativeMenuItem("Whats This?", false),
        'closeMenu': new air.NativeMenuItem("Exit", false)
    };
    
    if(Serebra.DebugMode) {
      menuItems = jQuery.extend({'fakeAlerts': new air.NativeMenuItem("Create Fake Alert", false)}, menuItems);
    }

    jQuery.each(menuItems,
    function(i, menuItem) {
        air.NativeApplication.nativeApplication.icon.menu.addItem(menuItem);
        menuItem.addEventListener(air.Event.SELECT, Serebra.Menu.MenuItemClickHandler);
    });
};
/**
 * Initialises the main systray icon
 */
Serebra.Menu.Initialize = function() {
    function iconLoadComplete(event) {
        if (air.NativeApplication.supportsSystemTrayIcon) {
            air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
            Serebra.Menu.CreateLoginMenu();
        }
    }

    var iconLoader = new runtime.flash.display.Loader();
    iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
    iconLoader.load(new air.URLRequest('app:/assets/images/icon_tray_off.png'));
};
/**
 * Handles the click events from the systray menu and assigns functions
 * @param {Object} event The passed event
 */
Serebra.Menu.MenuItemClickHandler = function(event) {
    switch (event.target.label) {
    case "Open Serebra Connect":
        air.navigateToURL(new air.URLRequest('http://www.serebraconnect.com/'));
        break;
    case "Open Alerts Center":
        Serebra.Chrome.AlertCenter();
        break;
    case "Settings":
        Serebra.Chrome.Settings();
        break;
    case "Create Fake Alert":
        Serebra.SOAP.CreateFakeAlert(null,
        function() {});
        break;
    case "Check For Updates":
        Serebra.Update.InvokeApplicationUpdate({
            'updateXML':
            'http://dev.ifies.org/descriptor/update.xml',
            'displayFail': true
        });
        break;
    case "Login":
        Serebra.Chrome.LoginWindow(function() {
            Serebra.Network.CheckLogin();
        });
        break;
    case "Logout":
        Serebra.Network.Logout();
        break;
	case "Whats This?":
		Serebra.Chrome.WhatsThis();
		break;
    case "Exit":
        air.NativeApplication.nativeApplication.exit();
        break;
    default:
        break;
    }
    return;
};
Serebra.Menu.SystrayClickHandler = function(event) {
    if (Serebra.NetworkOnline) {
        Serebra.Chrome.AlertCenter();
    } else {
        Serebra.Chrome.LoginWindow(function() {
            Serebra.Network.CheckLogin();
        });
    }
};
Serebra.Messages.DeleteMessage = function(id, callback) {
    var deleted = false;

    var thisMessage = Serebra.Database.Query({
        'queryString': 'SELECT * FROM ' + Serebra.UserTable + ' WHERE AlertID = ' + id
    });

    if (thisMessage.result.data) {
        if (!thisMessage.result.data[0].messageRead) {
            Serebra.SOAP.ConsumeAlert({
                'authCode': Serebra.AuthCode,
                'applicationCode': Serebra.ApplicationCode,
                'alertID': id
            },
            function(soapDocument) {
                var errorCode = jQuery('errorFlag', soapDocument).text();
                var errorString = jQuery('errorString', soapDocument).text();
                var deleteRow;
                if (errorCode == "false") {
                    deleteRow = Serebra.Database.Query({
                        'queryString': 'DELETE FROM ' + Serebra.UserTable + ' WHERE AlertID = ' + id
                    });
                    if (deleteRow.success) {
                        deleted = true;
                    }
                } else if (errorString == "you don't own that alert") {
                    deleteRow = Serebra.Database.Query({
                        'queryString': 'DELETE FROM ' + Serebra.UserTable + ' WHERE AlertID = ' + id
                    });
                    if (deleteRow.success) {
                        deleted = true;
                    }
                }
                return callback(deleted);
            });
        } else {
            var deleteRow = Serebra.Database.Query({
                'queryString': 'DELETE FROM ' + Serebra.UserTable + ' WHERE AlertID = ' + id
            });

            if (deleteRow.result.complete) {
                deleted = true;
            }
        }
    }

    return callback(deleted);
};
Serebra.Network.CheckConnectivity = function(event) {
    air.trace('Network gone offline');
}

/**
 * The main network loop handler
 * @param {Object} event The callback event
 */
Serebra.Network.CheckURL = function(event) {
    if (event.currentTarget.available) {
        Serebra.Network.Online();
    } else {
        Serebra.Network.Logout();
    }
};
Serebra.Network.CheckLogin = function(options) {
    Serebra.SOAP.Authenticate({
        'username': Serebra.Username,
        'password': Serebra.Password,
        'applicationCode': Serebra.ApplicationCode
    },
    function(soapDocument) {
        var errorCode = jQuery('errorFlag', soapDocument).text();
        if (errorCode == "false") {
            Serebra.LoggedIn = true;
            Serebra.AuthCode = jQuery('authCode', soapDocument).text();
            Serebra.Menu.CreateSystrayMenu();
			
			Serebra.IgnoreArray.push(['ANSWER', Serebra.DisplayPopupsAnswers]);
			Serebra.IgnoreArray.push(['AWARD', Serebra.DisplayPopupsAwards]);
			Serebra.IgnoreArray.push(['BID', Serebra.DisplayPopupsBids]);
			Serebra.IgnoreArray.push(['MESSAGE', Serebra.DisplayPopupsMessages]);
			Serebra.IgnoreArray.push(['QUESTION', Serebra.DisplayPopupsQuestions]);
			
			Serebra.Database.UserTable(function() {
				Serebra.Network.Initialize(Serebra.MessageCheckTime);
            	Serebra.Chrome.AlertCenter();
			});
        } else {
            var errorMessage = jQuery('errorString', soapDocument).text();
            if (errorMessage === '') {
                errorMessage = 'Unknown Error';
            }
            Serebra.Errors.push('Login Error: ' + errorMessage);
            Serebra.Chrome.LoginWindow(function(results) {
                Serebra.Network.CheckLogin(results);
            });
        }
    });
};
Serebra.Network.CheckMessages = function() {
    Serebra.SOAP.GetUserAlerts({
        'authCode': Serebra.AuthCode,
        'applicationCode': Serebra.ApplicationCode
    },
    function(userAlerts) {
        jQuery('alert', userAlerts).each(function() {
            var id = jQuery(this).attr('id');
            var type = jQuery('type', this).text();
            var alertText = jQuery('alertText', this).text();
            var userLink = jQuery('userLink', this).text();
            var objectLink = jQuery('objectLink', this).text();
            var existing = Serebra.Database.Query({
                'queryString': 'SELECT * FROM ' + Serebra.UserTable + ' WHERE AlertID = ' + id
            });
            if (!existing.result.data) {
                Serebra.Database.Query({
                    'queryString': 'INSERT INTO ' + Serebra.UserTable + ' VALUES(' + id + ',"' + type + '","' + alertText + '","' + userLink + '","' + objectLink + '",0)'
                });
            }
        });

        var new_messages = 0;
        var all_existing = Serebra.Database.Query({
            'queryString': 'SELECT * FROM ' + Serebra.UserTable + ' WHERE messageRead = 0'
        });
        if (all_existing.result.data) {
            jQuery.each(all_existing.result.data,
            function(i, item) {
                new_messages++;
            });
        }

        if (new_messages) {

            var alertPlural = "alerts";
            if (new_messages === 1) {
                alertPlural = "alert"
            }

            if (Serebra.DisplayPopups) {
                Serebra.Chrome.Popup({
                    'message': '<h2>You have <span class="green">' + new_messages + '</span> new ' + alertPlural + '!</h2>',
                    'showLink': true,
                    'popupLife': 6000
                });
            }
						
						air.trace(Serebra.PlayPopupSound);
						if (Serebra.PlayPopupSound) {
              function onSoundLoaded(event) {
                var localSound = event.target;
                localSound.play();
            	}

            	var sound = new air.Sound();
            	sound.addEventListener(air.Event.COMPLETE, onSoundLoaded);
            	var req = new air.URLRequest("app:/assets/sounds/new_message.mp3");
            	sound.load(req);
            }

            function iconLoadComplete(event) {
                if (air.NativeApplication.supportsSystemTrayIcon) {
                    air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
                    air.NativeApplication.nativeApplication.icon.tooltip = 'Serebra Connect Alerts - You have unread messages';
                }
            }
            var iconLoader = new runtime.flash.display.Loader();
            iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
            iconLoader.load(new air.URLRequest('app:/assets/images/icon_tray_new.png'));

        }
    });
};
Serebra.Network.Monitor = null;
Serebra.Network.MessageCheckTimer = null;

/**
 * The main network initialization function
 */
Serebra.Network.Initialize = function(messageCheckTime) {
    air.NativeApplication.nativeApplication.addEventListener(air.Event.NETWORK_CHANGE, Serebra.Network.CheckConnectivity);

    var serviceCheck = new air.URLRequest('http://qa.serebracampus.com:8888/apiWebService.cfc?wsdl');
    Serebra.Network.Monitor = new air.URLMonitor(serviceCheck);
    Serebra.Network.Monitor.addEventListener(air.StatusEvent.STATUS, Serebra.Network.CheckURL);
    Serebra.Network.Monitor.start();
};
Serebra.Network.Logout = function() {
    Serebra.NetworkOnline = false;

    function iconLoadComplete(event) {
        if (air.NativeApplication.supportsSystemTrayIcon) {
            air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
            air.NativeApplication.nativeApplication.icon.tooltip = 'Serebra Connect Alerts Is Offline';

            jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(i, win) {
                if (win.title !== 'Serebra Connect Alerts') {
                    win.close();
                }
            });
			Serebra.UserTable = 'serebra_user_';
			Serebra.JustLoaded = true;
			if (Serebra.RememberMe == "false" || !Serebra.RememberMe) {
				Serebra.Username = '';
				Serebra.Password = '';
			}
			
            Serebra.Network.MessageCheckTimer.stop();
            Serebra.Menu.CreateLoginMenu();
        }
    }
    var iconLoader = new runtime.flash.display.Loader();
    iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
    iconLoader.load(new air.URLRequest('app:/assets/images/icon_tray_off.png'));
};
/**
 * The function to execute when we have a internet connection
 */
Serebra.Network.Online = function() {
    Serebra.NetworkOnline = true;

    function iconLoadComplete(event) {
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
    iconLoader.load(new air.URLRequest('app:/assets/images/icon_tray_on.png'));
    return;
};
Serebra.SOAP.Authenticate = function(values, callback) {
    var output = [];
    output.push('<?xml version="1.0" encoding="UTF-8"?>' + "\n\n");
    output.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
    output.push('<soapenv:Body>');
    output.push('<authenticate xmlns="http://DefaultNamespace">');
    output.push('<username>' + values.username + '</username>');
    output.push('<password>' + values.password + '</password>');
    output.push('<applicationCode>' + values.applicationCode + '</applicationCode>');
    output.push('</authenticate>');
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
    output.push('<authCode>' + values.authCode + '</authCode>');
    output.push('<applicationCode>' + values.applicationCode + '</applicationCode>');
    output.push('<alertID>' + values.alertID + '</alertID>');
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
};
Serebra.SOAP.GetResponse = function(output, callback) {

    jQuery.ajax({
        'type': 'POST',
        'url': 'http://qa.serebracampus.com:8888/apiWebService.cfc?wsdl',
        'contentType': 'text/xml',
        'data': output,
        'dataType': 'xml',
        'processData': false,
        'beforeSend': function(xhr) {
            xhr.setRequestHeader("SOAPAction", "http://qa.serebracampus.com:8888/apiWebService.cfc?wsdl");
        },
        'success': function(data) {
            return callback(data);
        },
        'error': function(XMLHttpRequest, textStatus, errorThrown) {
            return callback();
        }
    });
};
Serebra.SOAP.GetUserAlerts = function(values, callback) {
    var output = [];
    output.push('<?xml version="1.0" encoding="UTF-8"?>' + "\n\n");
    output.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
    output.push('<soapenv:Body>');
    output.push('<getUserAlerts xmlns="http://DefaultNamespace">');
    output.push('<authCode>' + values.authCode + '</authCode>');
    output.push('<applicationCode>' + values.applicationCode + '</applicationCode>');
    output.push('</getUserAlerts>');
    output.push('</soapenv:Body>');
    output.push('</soapenv:Envelope>');
    Serebra.SOAP.GetResponse(output.join(''), callback);
};
Serebra.System.InvokeSettings = function(AppArguments, CurrentDir, callback) {

    var fileStream = new air.FileStream();
    var settingsFile = air.File.applicationDirectory.resolvePath('settings.xml');

    jQuery.each(AppArguments,
    function(i, argument) {
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

    jQuery.get(settingsFile.url, null,
    function(data, success) {

        Serebra.ApplicationName = jQuery('appname', data).text();
        Serebra.ApplicationCode = jQuery('appcode', data).text();
        Serebra.DatabaseFileName = jQuery('database', data).text();

        if (typeof callback === 'function') {
            return callback();
        } else {
            throw new Error('You must return a callback with this function');
        }
    },
    'xml');
};
Serebra.System.LoadDatabaseSettings = function(callback) {
    var dbValues = Serebra.Database.Query({
        'queryString': 'SELECT * FROM serebra_options'
    });
    if (dbValues.result.data) {
        jQuery.each(dbValues.result.data,
        function(i, item) {
            switch (item.key) {
            case "autostart":
                Serebra.AutoStart = ((item.value === "true") ? true : false);
                break;
            case "checktime":
                Serebra.MessageCheckTime = parseInt(item.value, 10);
                break;
            case "password":
                Serebra.Password = item.value;
                break;
            case "rememberme":
                Serebra.RememberMe = ((item.value === "true") ? true : false);
                break;
            case "username":
                Serebra.Username = item.value;
                break;
            case "displaypopups":
                Serebra.DisplayPop = ((item.value === "true") ? true : false);
                break;
            case "popupsound":
                Serebra.PlayPopupSound = ((item.value === "true") ? true : false);
                break;
			case "show_answers":
                Serebra.DisplayPopupsAnswers = ((item.value === "true") ? true : false);
                break;
			case "show_awards":
                Serebra.DisplayPopupsAwards = ((item.value === "true") ? true : false);
                break;
			case "show_bids":
                Serebra.DisplayPopupsBids = ((item.value === "true") ? true : false);
                break;
			case "show_messages":
                Serebra.DisplayPopupsMessages = ((item.value === "true") ? true : false);
                break;
			case "show_questions":
                Serebra.DisplayPopupsQuestions = ((item.value === "true") ? true : false);
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
Serebra.Update.AppVersionCheck = function(event) {
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
    var stream = new air.URLStream();
    
    jQuery.each(remoteVersion,
    function(i, item) {
        if (item > thisVersion[i])
        update = true;
    });

    if (update) {
      var doUpdate = confirm("We have found an update for Serebra Connect Alerts.  Would you like to download now?");
      if (doUpdate) {
        jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(i, win) {
          if (win.title === 'Serebra Connect Alerts - Notification') {
            win.close();
          }
        });
        Serebra.Chrome.Popup({
          'message': '<h2>Downloading Update</h2>',
          'showLink': false,
          'popupLife': 6000
        });
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
    function updatingStatus(event) {
        var percentage = Math.round((event.bytesLoaded / event.bytesTotal) * 100);
    }

    function updateApplication(event) {
        var filename = "update/SRDesktop-" + remoteVersionString + ".air";
        var ba = new air.ByteArray();
        stream.readBytes(ba, 0, stream.bytesAvailable);
        updateFile = air.File.applicationStorageDirectory.resolvePath(filename);
        fileStream = new air.FileStream();
        fileStream.addEventListener(air.Event.CLOSE, installUpdate);
        fileStream.openAsync(updateFile, air.FileMode.WRITE);
        fileStream.writeBytes(ba, 0, ba.length);
        fileStream.close();

        function installUpdate(event) {
            var updater = new air.Updater();
            // Notice that the version name has to be present as a second parameter
            updater.update(updateFile, remoteVersionString);
        }
    }
};
Serebra.Update.ShowFail = false;

Serebra.Update.InvokeApplicationUpdate = function(options) {
    function defaults() {
        return {
            'updateXML': ''
        };
    }
    options = jQuery.extend(defaults(), options);
    var request = new air.URLRequest(options.updateXML);
    var loader = new air.URLLoader();
    Serebra.Update.ShowFail = options.displayFail;
    loader.addEventListener(air.Event.COMPLETE, Serebra.Update.AppVersionCheck);
    loader.load(request);
};
Serebra.Chrome.AlertCenter = function() {
    this.Initialise = function() {
        var windowOptions = new air.NativeWindowInitOptions();
        windowOptions.systemChrome = air.NativeWindowSystemChrome.NONE;
        windowOptions.type = air.NativeWindowType.NORMAL;
        windowOptions.transparent = true;

        var windowBounds = new air.Rectangle(0, 0, 640, 385);

        var newHTMLLoader = air.HTMLLoader.createRootWindow(false, windowOptions, false, windowBounds);
        newHTMLLoader.paintsDefaultBackground = false;
        newHTMLLoader.stage.nativeWindow.alwaysInFront = false;
        newHTMLLoader.navigateInSystemBrowser = true;
        newHTMLLoader.addEventListener(air.Event.COMPLETE, this.CreateWindow);
        try {
          newHTMLLoader.load(new air.URLRequest('app:/assets/html/MessageCenter.html'));  
        } catch (error) {
          air.Introspector.Console.log(error);
        }
        
    }
    this.CreateWindow = function(event) {
        //alert('AlertCenter Loaded')
        var windowDom = jQuery('#message-center', event.target.window.document).get(0);
        
        function closeWindow() {
            event.target.window.nativeWindow.visible = false;
            return false;
        }
        
        function minimiseWindow() {
            event.target.window.nativeWindow.minimize();
            return false;
          }

        function moveWindow() {
            event.target.window.nativeWindow.startMove();
        }

        function removeRow(id) {
            jQuery('tr#' + id, windowDom).remove();
            setupDom();
        }

        function setupDom() {
            jQuery('#window-handle', windowDom).unbind('mousedown.move').bind('mousedown.move', moveWindow);
            jQuery('.close-button', windowDom).unbind('click.close').bind('click.close', closeWindow);
            jQuery('.min-button', windowDom).unbind('click.min').bind('click.min', minimiseWindow);
            jQuery('#inner-table-wrapper', windowDom).remove();
            var allMessages = Serebra.Database.Query({
                'queryString': 'SELECT * FROM ' + Serebra.UserTable + ' ORDER BY AlertID DESC'
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
                jQuery.each(allMessages.result.data,
                function(i, item) {
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

                function iconLoadComplete(event) {
                    if (air.NativeApplication.supportsSystemTrayIcon) {
                        air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
                        air.NativeApplication.nativeApplication.icon.tooltip = 'Serebra Connect Alerts Is Online';
                        return;
                    }
                }
                var iconLoader = new runtime.flash.display.Loader();
                iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
                iconLoader.load(new air.URLRequest('app:/assets/images/icon_tray_on.png'));

            }
            jQuery('#outer-table-wrapper', windowDom).append(output.join(''));

            jQuery('#message-table tbody tr', windowDom).unbind('click.hilight').bind('click.hilight',
            function() {
                jQuery('#message-table tbody tr', windowDom).css({
                    'background-color': 'transparent'
                });
                jQuery(this).css({
                    'background-color': '#F4F7CD'
                });
                return false;
            });
            jQuery('#message-table .delete', windowDom).unbind('click.delete').bind('click.delete',
            function() {
                var id = jQuery(this).attr('rel');
                Serebra.Chrome.ConfirmPrompt("Are you sure you wish to delete this message?",
                function() {
                    Serebra.Messages.DeleteMessage(id,
                    function(deleted) {
                        if (deleted) {
                            removeRow(id);
                        }
                    });
                });
                return false;
            });

            jQuery('#delete-all', windowDom).unbind('click.deleteall').bind('click.deleteall',
            function() {
                Serebra.Chrome.ConfirmPrompt("Are you sure you wish to delete all messages?",
                function() {

                    var allMessages = Serebra.Database.Query({
                        'queryString': 'SELECT * FROM ' + Serebra.UserTable
                    });

                    if (allMessages.result.data) {
                        jQuery.each(allMessages.result.data,
                        function(i, item) {
                            var id = item.AlertID;
                            Serebra.Messages.DeleteMessage(item.AlertID,
                            function(deleted) {
                                if (deleted) {
                                    removeRow(id);
                                }
                            });
                        });
                    }

                });
                return false;
            });

            jQuery('#message-table tbody tr', windowDom).unbind('dblclick.open').bind('dblclick.open',
            function() {
                var row = this;
                var id = jQuery(this).attr('id');
                var thisMessage = Serebra.Database.Query({
                    'queryString': 'SELECT * FROM ' + Serebra.UserTable + ' WHERE AlertID = ' + id
                });
                if (thisMessage.result.data) {
                    var link = thisMessage.result.data[0].objectLink;
					air.navigateToURL(new air.URLRequest(link));
                    Serebra.SOAP.ConsumeAlert({
                        'authCode': Serebra.AuthCode,
                        'applicationCode': Serebra.ApplicationCode,
                        'alertID': id
                    },
                    function(response) {
                        var result = jQuery('consumedAlert', response).text();
                        if (result == 'true') {
                            Serebra.Database.Query({
                                'queryString': 'UPDATE ' + Serebra.UserTable + ' SET messageRead = 1 WHERE AlertID = ' + id
                            });
                            jQuery('.unread', row).addClass('read').removeClass('unread');
                            
							function iconLoadComplete(event) {
        						if (air.NativeApplication.supportsSystemTrayIcon) {
           							air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
            	    				air.NativeApplication.nativeApplication.icon.tooltip = 'Serebra Connect Alerts Is Online';
            					}
        					}
							
							var all_existing = Serebra.Database.Query({
        						'queryString': 'SELECT * FROM ' + Serebra.UserTable + ' WHERE messageRead = 0'
        					});
							if (!all_existing.result.data) {
								var iconLoader = new runtime.flash.display.Loader();
								iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
								iconLoader.load(new air.URLRequest('app:/assets/images/icon_tray_on.png'));
							}
                        }
                    });
                }
                return false;
            });
        }

        if (event.type === 'complete' && event.target.window.nativeWindow) {
            // Now we set up the window position
            var centerX = air.Screen.mainScreen.bounds.width / 2;
            var centerY = air.Screen.mainScreen.bounds.height / 2;
            event.target.window.nativeWindow.x = centerX - (event.target.window.nativeWindow.width / 2);
            event.target.window.nativeWindow.y = centerY - (event.target.window.nativeWindow.height / 2);
            event.target.window.nativeWindow.addEventListener(air.Event.ACTIVATE, setupDom);
        }
    }
    
    var alreadyOpen = false;
    jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(i, win) {
        if (win.title === 'Serebra Connect Alerts - Alert Center') {
            alreadyOpen = true;
            win.visible = true;
            win.activate();
            win.orderToFront();
        }
    });
    if (!alreadyOpen) {
     this.Initialise();
    }
};Serebra.Chrome.ConfirmPrompt = function(message, callback) {

    this.windowLoaded = function(event) {
        var thisWindow = event.target.window;

        if (thisWindow.nativeWindow && thisWindow.document) {
            var centerX = air.Screen.mainScreen.bounds.width / 2;
            var centerY = air.Screen.mainScreen.bounds.height / 2;
            thisWindow.nativeWindow.x = centerX - (thisWindow.nativeWindow.width / 2);
            thisWindow.nativeWindow.y = centerY - (thisWindow.nativeWindow.height / 2);

            var thisDom = jQuery('#confirm-message', thisWindow.document).get(0);
            thisWindow.nativeWindow.height = jQuery('#confirm-message', thisWindow.document).height() + 100;
           
             // Now lets set up the fields
            jQuery('#window-handle', thisDom).bind('mousedown.move',
            function() {
                thisWindow.nativeWindow.startMove();
            });
            
            jQuery('.close-button', thisDom).click(function() {
                thisWindow.close();
                return false;
            });
            
            jQuery('.message', thisDom).html('<h2>' + message + '</h2>');

            jQuery('.confirm-button', thisDom).click(function() {
                var value = jQuery(this).val();
                var returnValue;
                if (value === 'Yes') {
                  thisWindow.close();
                  return callback();
                }
                thisWindow.close();
                return false;
            });
        }
    }

    var windowOptions = new air.NativeWindowInitOptions();
    windowOptions.systemChrome = air.NativeWindowSystemChrome.NONE;
    windowOptions.transparent = true;
    windowOptions.type = air.NativeWindowType.LIGHTWEIGHT;

    var windowBounds = new air.Rectangle(0, 0, 255, 155);
    var newHTMLLoader = air.HTMLLoader.createRootWindow(true, windowOptions, false, windowBounds);
    newHTMLLoader.paintsDefaultBackground = false;
    newHTMLLoader.stage.nativeWindow.alwaysInFront = true;
    newHTMLLoader.navigateInSystemBrowser = true;
    newHTMLLoader.addEventListener(air.Event.COMPLETE, this.windowLoaded);

    var alreadyOpen = false;
    jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(i, win) {
        if (win.title === 'Serebra Connect Alerts - Confirm') {
            alreadyOpen = true;
        }
    });
    if (!alreadyOpen) {
        newHTMLLoader.load(new air.URLRequest('app:/assets/html/ConfirmPrompt.html'));
    }
};Serebra.Chrome.LoginWindow = function(callback) {

    this.windowLoaded = function(event) {
        var thisWindow = event.target.window.nativeWindow;
        var thisDocument = event.target.window.document;

        if (thisWindow && thisDocument) {
            var centerX = air.Screen.mainScreen.bounds.width / 2;
            var centerY = air.Screen.mainScreen.bounds.height / 2;
            thisWindow.x = centerX - (thisWindow.width / 2);
            thisWindow.y = centerY - (thisWindow.height / 2);

            // Before we display the screen, we want to set it up
            var loginDom = jQuery('#login-area', thisDocument).get(0);

            // Now lets set up the fields
            jQuery('#password', loginDom).val(Serebra.Password);
            jQuery('#rememberme', loginDom).attr('checked', Serebra.RememberMe);
            jQuery('#username', loginDom).val(Serebra.Username);

            jQuery('#window-handle', loginDom).bind('mousedown.move',
            function() {
                thisWindow.startMove();
            });

            jQuery('.close-button, #cancel', loginDom).click(function() {
                thisWindow.close();
                return false;
            });

            jQuery('#login', loginDom).click(function() {
                Serebra.Password = jQuery('#password', loginDom).val();
                Serebra.RememberMe = jQuery('#rememberme', loginDom).attr('checked');
                Serebra.Username = jQuery('#username', loginDom).val();

                if (Serebra.RememberMe === true) {
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
                } else {
                    Serebra.Database.SaveOrCreateOption({
                        'key': 'username',
                        'value': ''
                    });
                    Serebra.Database.SaveOrCreateOption({
                        'key': 'password',
                        'value': ''
                    });
                    Serebra.Database.SaveOrCreateOption({
                        'key': 'rememberme',
                        'value': ''
                    });
                }
                thisWindow.close();
                return callback();
            });

            jQuery('#create-account', loginDom).click(function() {
                var url = jQuery(this).attr('href');
                air.navigateToURL(new air.URLRequest(url));
                return false;
            });

            // Now we want to check for errors
            if (Serebra.Errors.length > 0) {
                var errorMessages = [];
                jQuery.each(Serebra.Errors,
                function(i, error) {
                    errorMessages.push('<li>' + error + '</li>');
                });
                Serebra.Errors = [];
                jQuery('#form-errors ul', loginDom).append(errorMessages.join(''));
                jQuery('#form-errors', loginDom).fadeIn();
            }
        }
    }

    var windowOptions = new air.NativeWindowInitOptions();
    windowOptions.systemChrome = air.NativeWindowSystemChrome.NONE;
    windowOptions.transparent = true;
    windowOptions.type = air.NativeWindowType.NORMAL;

    var windowBounds = new air.Rectangle(0, 0, 318, 285);

    var newHTMLLoader = air.HTMLLoader.createRootWindow(true, windowOptions, false, windowBounds);
    newHTMLLoader.paintsDefaultBackground = false;
    newHTMLLoader.stage.nativeWindow.alwaysInFront = true;
    newHTMLLoader.navigateInSystemBrowser = true;
    newHTMLLoader.addEventListener(air.Event.COMPLETE, this.windowLoaded);

    var alreadyOpen = false;
    jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(i, win) {
        if (win.title === 'Serebra Connect Alerts - Log In') {
            alreadyOpen = true;
        }
    });

    if (!alreadyOpen) {
        newHTMLLoader.load(new air.URLRequest('app:/assets/html/LoginWindow.html'));
    }
};
Serebra.Chrome.OKPrompt = function(message, callback) {

    this.windowLoaded = function(event) {
        var thisWindow = event.target.window;

        if (thisWindow.nativeWindow && thisWindow.document) {
            var centerX = air.Screen.mainScreen.bounds.width / 2;
            var centerY = air.Screen.mainScreen.bounds.height / 2;
            thisWindow.nativeWindow.x = centerX - (thisWindow.nativeWindow.width / 2);
            thisWindow.nativeWindow.y = centerY - (thisWindow.nativeWindow.height / 2);

            var thisDom = jQuery('#confirm-message', thisWindow.document).get(0);
            thisWindow.nativeWindow.height = jQuery('#confirm-message', thisWindow.document).height() + 100;
           
             // Now lets set up the fields
            jQuery('#window-handle', thisDom).bind('mousedown.move',
            function() {
                thisWindow.nativeWindow.startMove();
            });
            
            jQuery('.close-button', thisDom).click(function() {
                thisWindow.close();
                return false;
            });
            
            jQuery('.message', thisDom).html('<h2>' + message + '</h2>');

            jQuery('.confirm-button', thisDom).click(function() {
                var value = jQuery(this).val();
                var returnValue;
                if (value === 'OK') {
                  thisWindow.close();
                  return callback();
                }
                thisWindow.close();
                return false;
            });
        }
    }

    var windowOptions = new air.NativeWindowInitOptions();
    windowOptions.systemChrome = air.NativeWindowSystemChrome.NONE;
    windowOptions.transparent = true;
    windowOptions.type = air.NativeWindowType.LIGHTWEIGHT;

    var windowBounds = new air.Rectangle(0, 0, 255, 155);
    var newHTMLLoader = air.HTMLLoader.createRootWindow(true, windowOptions, false, windowBounds);
    newHTMLLoader.paintsDefaultBackground = false;
    newHTMLLoader.stage.nativeWindow.alwaysInFront = true;
    newHTMLLoader.navigateInSystemBrowser = true;
    newHTMLLoader.addEventListener(air.Event.COMPLETE, this.windowLoaded);

    var alreadyOpen = false;
    jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(i, win) {
        if (win.title === 'Serebra Connect Alerts - Confirm') {
            alreadyOpen = true;
        }
    });
    if (!alreadyOpen) {
        newHTMLLoader.load(new air.URLRequest('app:/assets/html/OKPrompt.html'));
    }
};Serebra.Chrome.Popup = function(options) {

    this.Initialise = function() {
        var windowOptions = new air.NativeWindowInitOptions();
        windowOptions.systemChrome = air.NativeWindowSystemChrome.NONE;
        windowOptions.type = air.NativeWindowType.LIGHTWEIGHT;
        windowOptions.transparent = true;

        var windowBounds = new air.Rectangle(0, 0, 255, 155);

        var newHTMLLoader = air.HTMLLoader.createRootWindow(false, windowOptions, false, windowBounds);
        newHTMLLoader.paintsDefaultBackground = false;
        newHTMLLoader.stage.nativeWindow.alwaysInFront = true;
        newHTMLLoader.navigateInSystemBrowser = true;
        newHTMLLoader.addEventListener(air.Event.COMPLETE, this.CreateWindow);
        newHTMLLoader.load(new air.URLRequest('app:/assets/html/MessagePopup.html'));
    }

    this.CreateWindow = function(event) {
        var windowDom = jQuery('#message-popup', event.target.window.document).get(0);
        var popupLife = new air.Timer(options.popupLife, 1);

        function closeWindow() {
            event.target.window.close();
            return false;
        }

        function moveWindow() {
            event.target.window.nativeWindow.startMove();
        }

        function openMessageCenter() {
            popupLife.stop();
            Serebra.Chrome.AlertCenter();
            closeWindow();
            return false;
        }

        function setupDom() {
            jQuery('#window-handle', windowDom).bind('mousedown.move', moveWindow);
            jQuery('.close-button', windowDom).bind('click.close', closeWindow);
            jQuery('.message', windowDom).html(options.message);
            if (options.showLink) {
                jQuery('.open-message-center', windowDom).css({
                    'display': 'block'
                })
                .bind('click.messageCenter', openMessageCenter);
            }
        }
        
        if (event.type === 'complete' && event.target.window.nativeWindow) {
            // Now we set up the window position
            event.target.window.nativeWindow.x = air.Screen.mainScreen.bounds.width - 255;
            event.target.window.nativeWindow.y = air.Screen.mainScreen.bounds.height - 155;
            event.target.window.nativeWindow.addEventListener(air.Event.ACTIVATE, setupDom);
            popupLife.addEventListener( air.TimerEvent.TIMER, closeWindow );
            event.target.window.nativeWindow.activate();
            event.target.window.nativeWindow.visible = true;
            popupLife.start();
        }

    }

    this.Initialise();
};Serebra.Chrome.Settings = function(options) {

    this.Initialise = function() {
        var windowOptions = new air.NativeWindowInitOptions();
        windowOptions.systemChrome = air.NativeWindowSystemChrome.NONE;
        windowOptions.type = air.NativeWindowType.NORMAL;
        windowOptions.transparent = true;

        var windowBounds = new air.Rectangle(0, 0, 500, 435);

        var newHTMLLoader = air.HTMLLoader.createRootWindow(false, windowOptions, false, windowBounds);
        newHTMLLoader.paintsDefaultBackground = false;
        newHTMLLoader.stage.nativeWindow.alwaysInFront = true;
        newHTMLLoader.navigateInSystemBrowser = true;
        newHTMLLoader.addEventListener(air.Event.COMPLETE, this.CreateWindow);
        newHTMLLoader.load(new air.URLRequest('app:/assets/html/Settings.html'));
    }

    this.CreateWindow = function(event) {
        var windowDom = jQuery('#options-window', event.target.window.document).get(0);
		         
        function closeWindow() {
            event.target.window.nativeWindow.visible = false;
            return false;
        }
        
        function minimiseWindow() {
            event.target.window.nativeWindow.minimize();
            return false;
          }

        function moveWindow() {
            event.target.window.nativeWindow.startMove();
        }

        function setupDom() {
            jQuery('#window-handle', windowDom).bind('mousedown.move', moveWindow);
            jQuery('.close-button', windowDom).bind('click.close', closeWindow);
						jQuery('.min-button', windowDom).bind('click.min', minimiseWindow);
			
            jQuery('#autostart', windowDom).attr('checked', Serebra.AutoStart);
            //jQuery('#display-answers', windowDom).attr('checked', Serebra.DisplayPopupsAnswers);
						//jQuery('#display-awards', windowDom).attr('checked', Serebra.DisplayPopupsAwards);
						//jQuery('#display-bids', windowDom).attr('checked', Serebra.DisplayPopupsBids);
						//jQuery('#display-messages', windowDom).attr('checked', Serebra.DisplayPopupsMessages);
						jQuery('#display-popup', windowDom).attr('checked', Serebra.DisplayPopups);
						//jQuery('#display-questions', windowDom).attr('checked', Serebra.DisplayPopupsQuestions);
            jQuery('#popup-sound', windowDom).attr('checked', Serebra.PlayPopupSound);
            jQuery('#checktime option', windowDom).each(function() {
                if (jQuery(this).val() == Serebra.MessageCheckTime) {
                    jQuery(this).attr('selected', 'selected');
                }
            });

            jQuery('.save', windowDom).bind('click.save',
            function() {
                Serebra.AutoStart = jQuery('#autostart', windowDom).attr('checked');
                Serebra.DisplayPopups = jQuery('#display-popup', windowDom).attr('checked');
								//Serebra.DisplayPopupsAnswers = jQuery('#display-answers', windowDom).attr('checked');
								//Serebra.DisplayPopupsAwards = jQuery('#display-awards', windowDom).attr('checked');
								//Serebra.DisplayPopupsBids = jQuery('#display-bids', windowDom).attr('checked');
								//Serebra.DisplayPopupsMessages = jQuery('#display-messages', windowDom).attr('checked');
								//Serebra.DisplayPopupsQuestions = jQuery('#display-questions', windowDom).attr('checked');
                Serebra.PlayPopupSound = jQuery('#popup-sound', windowDom).attr('checked');
                Serebra.RememberMe = jQuery('#rememberme', windowDom).attr('checked');
                Serebra.MessageCheckTime = jQuery('#checktime', windowDom).val();

								Serebra.Database.SaveOrCreateOption({
                    'key': 'autostart',
                    'value': Serebra.AutoStart
                });
									Serebra.Database.SaveOrCreateOption({
                    'key': 'displaypopups',
                    'value': Serebra.DisplayPopups
                });
								
								/**
								Serebra.Database.SaveOrCreateOption({
                    'key': 'show_answers',
                    'value': Serebra.DisplayPopupsAnswers
                });
								Serebra.Database.SaveOrCreateOption({
                    'key': 'show_awards',
                    'value': Serebra.DisplayPopupsAwards
                });
								Serebra.Database.SaveOrCreateOption({
                    'key': 'show_bids',
                    'value': Serebra.DisplayPopupsBids
                });
								Serebra.Database.SaveOrCreateOption({
                    'key': 'show_messages',
                    'value': Serebra.DisplayPopupsMessages
                });
								Serebra.Database.SaveOrCreateOption({
                    'key': 'show_questions',
                    'value': Serebra.DisplayPopupsQuestions
                });
								*/
								        
                Serebra.Database.SaveOrCreateOption({
                    'key': 'checktime',
                    'value': Serebra.MessageCheckTime
                });
                Serebra.Database.SaveOrCreateOption({
                    'key': 'popupsound',
                    'value': Serebra.PlayPopupSound
                });

                if (!Serebra.DebugMode) {
                    air.NativeApplication.nativeApplication.startAtLogin = Serebra.AutoStart;
                }

                Serebra.Network.MessageCheckTimer.stop();
                Serebra.Network.MessageCheckTimer.delay = Serebra.MessageCheckTime;
                Serebra.Network.MessageCheckTimer.start();
				
								/**
								Serebra.IgnoreArray = [];
								Serebra.IgnoreArray.push(['ANSWER', Serebra.DisplayPopupsAnswers]);
								Serebra.IgnoreArray.push(['AWARD', Serebra.DisplayPopupsAwards]);
								Serebra.IgnoreArray.push(['BID', Serebra.DisplayPopupsBids]);
								Serebra.IgnoreArray.push(['MESSAGE', Serebra.DisplayPopupsMessages]);
								Serebra.IgnoreArray.push(['QUESTION', Serebra.DisplayPopupsQuestions]);
								**/
								
								Serebra.Chrome.OKPrompt("Your settings will take affect the next time you log in.", function() {
									event.target.window.close();	
								});
                return false;
            });

            event.target.window.nativeWindow.orderToFront();
        }
        
        if (event.type === 'complete' && event.target.window.nativeWindow) {
            // Now we set up the window position
			var centerX = air.Screen.mainScreen.bounds.width / 2;
            var centerY = air.Screen.mainScreen.bounds.height / 2;
            event.target.window.nativeWindow.x = centerX - (event.target.window.nativeWindow.width / 2);
            event.target.window.nativeWindow.y = centerY - (event.target.window.nativeWindow.height / 2);
			setupDom();
			event.target.window.nativeWindow.visible = true;
        }

    }

    this.Initialise();
};Serebra.Chrome.WhatsThis = function(options) {

    this.Initialise = function() {
        var windowOptions = new air.NativeWindowInitOptions();
        windowOptions.systemChrome = air.NativeWindowSystemChrome.NONE;
        windowOptions.type = air.NativeWindowType.LIGHTWEIGHT;
        windowOptions.transparent = true;

        var windowBounds = new air.Rectangle(0, 0, 300, 300);

        var newHTMLLoader = air.HTMLLoader.createRootWindow(false, windowOptions, false, windowBounds);
        newHTMLLoader.paintsDefaultBackground = false;
        newHTMLLoader.stage.nativeWindow.alwaysInFront = true;
        newHTMLLoader.navigateInSystemBrowser = true;
        newHTMLLoader.addEventListener(air.Event.COMPLETE, this.CreateWindow);
        newHTMLLoader.load(new air.URLRequest('app:/assets/html/WhatsThis.html'));
    }

    this.CreateWindow = function(event) {
        var windowDom = jQuery('#message-popup', event.target.window.document).get(0);

        function closeWindow() {
            event.target.window.close();
            return false;
        }

        function moveWindow() {
            event.target.window.nativeWindow.startMove();
        }

        function setupDom() {
            jQuery('#window-handle', windowDom).bind('mousedown.move', moveWindow);
            jQuery('.close-button', windowDom).bind('click.close', closeWindow);
			jQuery('#ok-button', windowDom).bind('click.ok', closeWindow);
        }
        
        if (event.type === 'complete' && event.target.window.nativeWindow) {
            // Now we set up the window position
			event.target.window.nativeWindow.x = air.Screen.mainScreen.bounds.width - 300;
            event.target.window.nativeWindow.y = air.Screen.mainScreen.bounds.height - 240;
			setupDom();
			event.target.window.nativeWindow.visible = true;
        }

    }

    this.Initialise();
};