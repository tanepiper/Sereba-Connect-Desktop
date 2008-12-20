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
};