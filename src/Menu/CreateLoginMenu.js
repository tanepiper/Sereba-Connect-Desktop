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
