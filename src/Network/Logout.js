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
