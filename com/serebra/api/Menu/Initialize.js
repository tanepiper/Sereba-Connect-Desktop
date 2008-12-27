
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
