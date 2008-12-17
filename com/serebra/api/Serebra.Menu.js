var Serebra;
if (!Serebra) Serebra = function(){};

Serebra.Menu = {};

/**
 * Initialises the main systray icon
 */
Serebra.Menu.Initialize = function(){
	function iconLoadComplete ( event ) {
		if (air.NativeApplication.supportsSystemTrayIcon) {
			air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
			Serebra.Menu.CreateSystrayMenu();
		}
	}
	
	var iconLoader = new runtime.flash.display.Loader();
	iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
	iconLoader.load(new air.URLRequest('app:/assets/icons/SerebraConnectOffline.png'));
};

/**
 * Adds items to the systray menu
 */
Serebra.Menu.CreateSystrayMenu = function(){
	air.NativeApplication.nativeApplication.icon.menu = new air.NativeMenu();
	air.NativeApplication.nativeApplication.icon.addEventListener('click', Serebra.Menu.SystrayClickHandler);
	
	var menuItems = {
		'serebraConnect': new air.NativeMenuItem("Serebra Connect", false),
		'messageCenter': new air.NativeMenuItem("Message Center", false),
		'fakeAlerts': new air.NativeMenuItem("Create Fake Alert", false),
		'updatesMenu': new air.NativeMenuItem("Check For Updates", false),
		'optionsMenu': new air.NativeMenuItem("Set Options", false),
		'closeMenu': new air.NativeMenuItem("Exit", false)
	}
		
	jQuery.each(menuItems, function(i, menuItem) {
		air.NativeApplication.nativeApplication.icon.menu.addItem(menuItem);
		menuItem.addEventListener(air.Event.SELECT, Serebra.Menu.MenuItemClickHandler);
	});
};

Serebra.Menu.SystrayClickHandler = function(event){

};

/**
 * Handles the click events from the systray menu and assigns functions
 * @param {Object} event The passed event
 */
Serebra.Menu.MenuItemClickHandler = function(event){
	switch (event.target.label) {
		case "Serebra Connect":
			air.navigateToURL(new air.URLRequest('https://www.serebraconnect.com/'));
		break;
		case "Message Center":
			Serebra.Messages.MessageCenter();
		break;
		case "Set Options":
			Serebra.Window.ShowOptionsWindow();
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
		case "Exit":
			air.NativeApplication.nativeApplication.exit();
		break;
	}
  return;
};