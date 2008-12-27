
Serebra.Chrome.Settings = function () {
	this.windowLoaded = function ( event ) {
		var thisWindow = event.target.window.nativeWindow;
		var thisDocument = event.target.window.document;
		
		if (thisWindow && thisDocument) {
			var centerX = air.Screen.mainScreen.bounds.width / 2;
			var centerY = air.Screen.mainScreen.bounds.height / 2;
			thisWindow.x = centerX - (thisWindow.width / 2);
			thisWindow.y = centerY - (thisWindow.height / 2);
		
			// Before we display the screen, we want to set it up
			var optionsDom = jQuery('#options-window', thisDocument).get(0);
			// Now lets set up the fields
			jQuery('#window-handle', optionsDom).bind('mousedown.move', function(){
				thisWindow.startMove();
			});
			jQuery('.close-button', optionsDom).click(function(){
				thisWindow.close();
				return false;
			});
			jQuery('.min-button', optionsDom).click(function(){
				thisWindow.minimize();
				return false;
			});

			jQuery('#autologin',  optionsDom).attr('checked', Serebra.AutoLogin);
			jQuery('#autostart',  optionsDom).attr('checked', Serebra.AutoStart);
			jQuery('#display-popup', optionsDom).attr('checked', Serebra.DisplayPopups);
			jQuery('#password',   optionsDom).val(Serebra.Password);
			jQuery('#popup-sound', optionsDom).attr('checked', Serebra.PlayPopupSound);
			jQuery('#rememberme', optionsDom).attr('checked', Serebra.RememberMe);
			jQuery('#username',   optionsDom).val(Serebra.Username);
			jQuery('#checktime option', optionsDom).each(function(){
				if (jQuery(this).val() == Serebra.MessageCheckTime) {
					jQuery(this).attr('selected', 'selected');
				}
			});
			
			jQuery('.save', optionsDom).bind('click.save', function(){
					Serebra.AutoLogin = jQuery('#autologin', optionsDom).attr('checked');
					Serebra.AutoStart = jQuery('#autostart', optionsDom).attr('checked');
					Serebra.DisplayPopups = jQuery('#display-popup', optionsDom).attr('checked');
					Serebra.Password = jQuery('#password', optionsDom).val();
					Serebra.PlayPopupSound = jQuery('#popup-sound', optionsDom).attr('checked');
					Serebra.RememberMe = jQuery('#rememberme', optionsDom).attr('checked');
					Serebra.Username = jQuery('#username', optionsDom).val();
					Serebra.MessageCheckTime = jQuery('#checktime', optionsDom).val();
					
					Serebra.Database.SaveOrCreateOption({'key':'username', 'value':Serebra.Username});
					Serebra.Database.SaveOrCreateOption({'key':'password', 'value':Serebra.Password});
					Serebra.Database.SaveOrCreateOption({'key':'autologin', 'value':Serebra.AutoLogin});
					Serebra.Database.SaveOrCreateOption({'key':'rememberme', 'value':Serebra.RememberMe});
					Serebra.Database.SaveOrCreateOption({'key':'autostart', 'value':Serebra.AutoStart});
					Serebra.Database.SaveOrCreateOption({'key':'checktime', 'value':Serebra.MessageCheckTime});
					Serebra.Database.SaveOrCreateOption({'key':'displaypopups', 'value':Serebra.DisplayPopups});
					Serebra.Database.SaveOrCreateOption({'key':'popupsound', 'value':Serebra.PlayPopupSound});
					
					if (!Serebra.DebugMode) {
		  				air.NativeApplication.nativeApplication.startAtLogin = Serebra.AutoStart;
		  			}
					
					Serebra.Network.MessageCheckTimer.stop();
					Serebra.Network.MessageCheckTimer.delay = Serebra.MessageCheckTime;
					Serebra.Network.MessageCheckTimer.start();
					
					thisWindow.close();
					return false;
				});

			thisWindow.orderToFront();
		}
	}
	
	var windowOptions = new air.NativeWindowInitOptions();
	windowOptions.systemChrome = air.NativeWindowSystemChrome.NONE;
	windowOptions.transparent = true;
	windowOptions.type = air.NativeWindowType.NORMAL;
	
	var windowBounds = new air.Rectangle(0, 0, 500, 435);
	var newHTMLLoader = air.HTMLLoader.createRootWindow(true, windowOptions, false, windowBounds);
	newHTMLLoader.paintsDefaultBackground = false;
  newHTMLLoader.stage.nativeWindow.alwaysInFront = false;
  newHTMLLoader.navigateInSystemBrowser = true;
	newHTMLLoader.addEventListener(air.Event.COMPLETE, this.windowLoaded);
	
	var alreadyOpen = false;
	jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(i, win){
		if (win.title === 'Serebra Connect Alerts - Settings') {
			alreadyOpen = true;
		}
	});
	if (!alreadyOpen) {
		newHTMLLoader.load(new air.URLRequest('app:/assets/html/OptionsWindow.html'));
	}
};
