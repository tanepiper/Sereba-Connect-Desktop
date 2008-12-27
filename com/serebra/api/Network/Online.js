
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
