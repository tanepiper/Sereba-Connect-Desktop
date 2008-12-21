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
		/*'fakeAlerts': new air.NativeMenuItem("Create Fake Alert", false),*/
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
};