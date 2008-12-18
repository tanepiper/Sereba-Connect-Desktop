var Serebra;
if (!Serebra) Serebra = function(){};

Serebra.Network = {};
// Url we want to check
Serebra.Network.monitorCheckURL = 'http://www.serebraconnect.com';
// How often we want to check
Serebra.Network.pollInterval = 300000; //for testing - 5000;

/**
 * The main network initialization function
 */
Serebra.Network.Initialize = function(messageCheckTime){
	if (!ForceOffline) {
		// Lets overide the poll time from the options.
		if (messageCheckTime) {
			Serebra.Network.pollInterval = messageCheckTime;
		}
  	var url = new air.URLRequest(Serebra.Network.monitorCheckURL);
  	var monitor = new air.URLMonitor(url);
  	monitor.pollInterval = Serebra.Network.pollInterval;
  	monitor.addEventListener(air.StatusEvent.STATUS, Serebra.Network.MainLoop);
  	monitor.start();
  } else {
		Serebra.Network.Offline();
	}
};

/**
 * The function to execute when we have a internet connection
 */
Serebra.Network.Online = function(){
	SerebraOnline = true;
	
	function iconLoadComplete( event ) {
		if (air.NativeApplication.supportsSystemTrayIcon && !unreadMessages) {
    	air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
      air.NativeApplication.nativeApplication.icon.tooltip = 'Serebra Connect Desktop Is Online';
			
			if (!DebugMode || ForceUpdate) {
	  		Serebra.Update.InvokeApplicationUpdate({
	  			'updateXML': 'http://dev.ifies.org/descriptor/update.xml',
					'displayFail': false
	  		});
	  	}
			Serebra.Network.CheckMessages();
    }
	}
	
  var iconLoader = new runtime.flash.display.Loader();
  iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
  iconLoader.load(new air.URLRequest('app:/assets/images/icon_desktop_16.png'));
};

/**
 * The function to execute when offline
 */
Serebra.Network.Offline = function(){
	SerebraOnline = false;
	
	function iconLoadComplete ( event ) {
		if (air.NativeApplication.supportsSystemTrayIcon) {
			air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
			air.NativeApplication.nativeApplication.icon.tooltip = 'Serebra Connect Desktop Is Offline';
		}	
	}
	
	var iconLoader = new runtime.flash.display.Loader();
  iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
  iconLoader.load(new air.URLRequest('app:/assets/images/icon_tray_natural.png'));
};

/**
 * The main network loop handler
 * @param {Object} event The callback event
 */
Serebra.Network.MainLoop = function(event){
	switch (event.code) {
		case "Service.available":
			//we are online
			Serebra.Network.Online();
		break;
		case "Service.unavailable":
			Serebra.Network.Offline();
		break;
		default:
		break;
	}
};

Serebra.Network.CheckMessages = function() {
	Serebra.SOAP.GetUserAlerts({
		'authCode': authCode,
		'applicationCode': applicationCode
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
					'queryString': 'INSERT INTO serebra_user_alerts VALUES(' + id + ',"' + type + '","' + alertText + '","' + userLink[1] + '","' + objectLink[1] + '",0)'
				});
				unreadMessages = true;
			} else {
				if (existing.result.data[0].messageRead === 0) {
					unreadMessages = true;
				}
			}
			
		});
		
		if (unreadMessages) {
			function iconLoadComplete ( event ) {
				if (air.NativeApplication.supportsSystemTrayIcon) {
					air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
					air.NativeApplication.nativeApplication.icon.tooltip = 'Serebra Connect Desktop - You have unread messages';
				}
				Serebra.Messages.CreateMessageNotification({
					'type': 'new',
		  		'messageCount': unreadCount
		  	});
			}
			var iconLoader = new runtime.flash.display.Loader();
  		iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
  		iconLoader.load(new air.URLRequest('app:/assets/images/icon_tray_newalerts.png'));
		}
		
	});
};

Serebra.Network.Logout = function() {
	function iconLoadComplete ( event ) {
		if (air.NativeApplication.supportsSystemTrayIcon) {
			air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
			Serebra.Menu.CreateLoginMenu();
		}
	}
	
	var iconLoader = new runtime.flash.display.Loader();
	iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
	iconLoader.load(new air.URLRequest('app:/assets/images/icon_tray_natural.png'));
}
