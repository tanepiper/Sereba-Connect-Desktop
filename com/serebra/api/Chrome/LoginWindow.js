
Serebra.Chrome.LoginWindow = function ( callback ) {

	this.windowLoaded = function ( event ) {
		var thisWindow = event.target.window.nativeWindow;
		var thisDocument = event.target.window.document;
		
		if (thisWindow && thisDocument) {
			var centerX = air.Screen.mainScreen.bounds.width / 2;
			var centerY = air.Screen.mainScreen.bounds.height / 2;
			thisWindow.x = centerX - (thisWindow.width / 2);
			thisWindow.y = centerY - (thisWindow.height / 2);
			thisWindow.alwaysInFront = false;
		
			// Before we display the screen, we want to set it up
			var loginDom = jQuery('#login-area', thisDocument).get(0);
			// Now lets set up the fields
			jQuery('#autologin', loginDom).attr('checked', Serebra.AutoLogin);
			jQuery('#password', loginDom).val(Serebra.Password);
			jQuery('#rememberme', loginDom).attr('checked', Serebra.RememberMe);
			jQuery('#username', loginDom).val(Serebra.Username);
			
			jQuery('#window-handle', loginDom).bind('mousedown.move', function(){
				thisWindow.startMove();
			});
			jQuery('.close-button, #cancel', loginDom).click(function(){
				thisWindow.close();
				return false;
			});
			jQuery('#login', loginDom).click(function(){
				Serebra.AutoLogin = jQuery('#autologin', loginDom).attr('checked');
				Serebra.Password = jQuery('#password', loginDom).val();
				Serebra.RememberMe = jQuery('#rememberme', loginDom).attr('checked');
				Serebra.Username = jQuery('#username', loginDom).val();
				if (Serebra.RememberMe === true) {
					Serebra.Database.SaveOrCreateOption({
						'key': 'autologin',
						'value': Serebra.AutoLogin
					});
					Serebra.Database.SaveOrCreateOption({
						'key': 'password',
						'value': Serebra.Password
					});
					Serebra.Database.SaveOrCreateOption({
						'key': 'rememberme',
						'value': Serebra.RememberMe
					});
					Serebra.Database.SaveOrCreateOption({
						'key': 'username',
						'value': Serebra.Username
					});
				}
				else {
					Serebra.Database.SaveOrCreateOption({
						'key': 'username',
						'value': ''
					});
					Serebra.Database.SaveOrCreateOption({
						'key': 'password',
						'value': ''
					});
					Serebra.Database.SaveOrCreateOption({
						'key': 'autologin',
						'value': ''
					});
					Serebra.Database.SaveOrCreateOption({
						'key': 'rememberme',
						'value': ''
					});
				}
				thisWindow.close();
				return callback();
			});
			
			jQuery('#create-account', loginDom).click(function(){
				var url = jQuery(this).attr('href');
				air.navigateToURL(new air.URLRequest(url));
				return false;
			});

			// Now we want to check for errors
			if (Serebra.Errors.length > 0) {
				var errorMessages = [];
				jQuery.each(Serebra.Errors, function(i, error){
					errorMessages.push('<li>' + error + '</li>');
				});
				Serebra.Errors = [];
				jQuery('#form-errors ul', loginDom).append(errorMessages.join(''));
				jQuery('#form-errors', loginDom).fadeIn();
			}
		}
	}
	
	var windowOptions = new air.NativeWindowInitOptions();
	windowOptions.systemChrome = air.NativeWindowSystemChrome.NONE;
	windowOptions.transparent = true;
	windowOptions.type = air.NativeWindowType.NORMAL;
	
	var windowBounds = new air.Rectangle(0, 0, 318, 285);
	var newHTMLLoader = air.HTMLLoader.createRootWindow(true, windowOptions, false, windowBounds);
	newHTMLLoader.paintsDefaultBackground = false;
  newHTMLLoader.stage.nativeWindow.alwaysInFront = true;
  newHTMLLoader.navigateInSystemBrowser = true;
	newHTMLLoader.addEventListener(air.Event.COMPLETE, this.windowLoaded);
	var alreadyOpen = false;
	jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(i, win){
		if (win.title === 'Serebra Connect Alerts - Log In') {
			alreadyOpen = true;
		}
	});
	if (!alreadyOpen) {
		newHTMLLoader.load(new air.URLRequest('app:/assets/html/LoginWindow.html'));	
	}
};
