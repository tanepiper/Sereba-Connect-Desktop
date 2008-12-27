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
