// Our global variable that tells us were online
Serebra.Network = {};
Serebra.Network.monitorCheckURL = 'http://www.serebraconnect.com';
Serebra.Network.pollInterval = 300000; //for testing - 5000;

/**
 * The function to execute when we have a internet connection
 */
Serebra.Network.Online = function(){
	SerebraOnline = true;
	
	function iconLoadComplete( event ) {
		if (air.NativeApplication.supportsSystemTrayIcon) {
    	air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
      air.NativeApplication.nativeApplication.icon.tooltip = 'Serebra Connect Desktop Is Online';
			
			if (!DebugMode || ForceUpdate) {
	  		Serebra.Update.InvokeApplicationUpdate({
	  			'updateXML': 'http://jquery-api-browser.googlecode.com/svn/branches/update/update.xml'
	  		});
	  	}
    }
	}
	
  var iconLoader = new runtime.flash.display.Loader();
  iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
  iconLoader.load(new air.URLRequest('app:/assets/icons/SerebraConnectOnline.png'));
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
  iconLoader.load(new air.URLRequest('app:/assets/icons/SerebraConnectOffline.png'));
};

/**
 * The main network loop handler
 * @param {Object} event The callback event
 */
Serebra.Network.MainLoop = function(event){
	switch (event.code) {
		case "Service.available":
			//we are online
			if (DebugMode) air.trace('Serebra Connect Desktop Is Online');
			Serebra.Network.Online();
		break;
		case "Service.unavailable":
			if (DebugMode) air.trace('Serebra Connect Desktop Is Offline');
			Serebra.Network.Offline();
		break;
	}
};

/**
 * The main network initialization function
 */
Serebra.Network.Initialize = function(){
	if (!ForceOffline) {
  	if (DebugMode) 
  		air.trace('Starting Network Loop');
  	var url = new air.URLRequest(Serebra.Network.monitorCheckURL);
  	var monitor = new air.URLMonitor(url);
  	monitor.pollInterval = Serebra.Network.pollInterval;
  	monitor.addEventListener(air.StatusEvent.STATUS, Serebra.Network.MainLoop);
  	monitor.start();
  } else {
		if (DebugMode) air.trace('Serebra Desktop Connect Has Been Forced Offline');
		Serebra.Network.Offline();
	}
};
