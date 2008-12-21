Serebra.Chrome = {};

Serebra.Chrome.LoginWindow = function( callback ) {
	
	var username; var password; var autologin; var rememberme;
	
	function windowLoaded( event ) {
		var thisWindow = event.target.window;
		
		if (thisWindow.nativeWindow) {
			var thisDocument = thisWindow.document;
			var centerX = air.Screen.mainScreen.bounds.width / 2;
			var centerY = air.Screen.mainScreen.bounds.height / 2;
			thisWindow.nativeWindow.x = centerX - (thisWindow.nativeWindow.width / 2);
			thisWindow.nativeWindow.y = centerY - (thisWindow.nativeWindow.height / 2);
			thisWindow.nativeWindow.alwaysInFront = false;
		
			// Before we display the screen, we want to set it up
			var loginDom = jQuery('#login-area', thisDocument).get(0);
			// Now lets set up the fields
			jQuery('#autologin', loginDom).attr('checked', Serebra.AutoLogin);
			jQuery('#password', loginDom).val(Serebra.Password);
			jQuery('#rememberme', loginDom).attr('checked', Serebra.RememberMe);
			jQuery('#username', loginDom).val(Serebra.Username);
			
			jQuery('#window-handle', loginDom).bind('mousedown.move', function(){
				thisWindow.nativeWindow.startMove();
			});
			jQuery('.close-button, #cancel', loginDom).click(function(){
				thisWindow.nativeWindow.close();
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
				thisWindow.nativeWindow.close();
				return callback();
			});
			
			jQuery('#create-account', loginDom).click(function(){
				var url = jQuery(this).attr('href');
				air.navigateToURL(new air.URLRequest(url));
			});
			
			thisWindow.nativeWindow.visible = true;
			thisWindow.nativeWindow.orderToFront();
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
	windowOptions.maximizable = false;
	windowOptions.minimizable = true;
	windowOptions.resizable = false;
	windowOptions.systemChrome = 'none';
	windowOptions.transparent = true;
	windowOptions.type = 'lightweight';
	
	var windowBounds = new air.Rectangle(0, 0, 318, 285);
	var newHTMLLoader = air.HTMLLoader.createRootWindow(false, windowOptions, false, windowBounds);
	newHTMLLoader.addEventListener(air.Event.COMPLETE, windowLoaded);
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

Serebra.Chrome.MessagePopup = function( options ) {
	function windowLoaded( event ) {
		var thisWindow = event.target.window.nativeWindow;
		
		if (thisWindow) {
			var thisDocument = event.target.window.document;
			thisWindow.x = air.Screen.mainScreen.bounds.width - 255;
			thisWindow.y = 0;
			thisWindow.alwaysInFront = true;
		
			// Before we display the screen, we want to set it up
			var popupDom = jQuery('#message-popup', thisDocument).get(0);
			// Now lets set up the fields
			jQuery('#window-handle', popupDom).bind('mousedown.move', function(){
				thisWindow.startMove();
			});
			jQuery('.close-button', popupDom).click(function(){
				thisWindow.close();
			});
			
			jQuery('.message', popupDom).html('<h2>You have <span class="green">' + options.messageCount + '</span> new alerts!</h2>');
				
			thisWindow.visible = true;
			thisWindow.orderToFront();
			
			function closeWindow() {
				thisWindow.close();
			}
			
			var closeTimer = new air.Timer(6000, 1);
			closeTimer.addEventListener(air.TimerEvent.TIMER_COMPLETE, closeWindow);
			closeTimer.start();
		}
	}
	
	var windowOptions = new air.NativeWindowInitOptions();
	windowOptions.maximizable = false;
	windowOptions.minimizable = true;
	windowOptions.resizable = false;
	windowOptions.systemChrome = 'none';
	windowOptions.transparent = true;
	windowOptions.type = 'lightweight';
	
	var windowBounds = new air.Rectangle(0, 0, 255, 155);
	var newHTMLLoader = air.HTMLLoader.createRootWindow(false, windowOptions, false, windowBounds);
	newHTMLLoader.addEventListener(air.Event.COMPLETE, windowLoaded);
	
	var alreadyOpen = false;
	jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(i, win){
		if (win.title === 'Serebra Connect Alerts - Notification') {
			alreadyOpen = true;
		}
	});
	if (!alreadyOpen) {
		newHTMLLoader.load(new air.URLRequest('app:/assets/html/Popup.html'));
	}
};

Serebra.Chrome.Settings = function () {
	function windowLoaded( event ) {
		var thisWindow = event.target.window.nativeWindow;
		
		if (thisWindow) {
			var thisDocument = event.target.window.document;
			var centerX = air.Screen.mainScreen.bounds.width / 2;
			var centerY = air.Screen.mainScreen.bounds.height / 2;
			thisWindow.x = centerX - (thisWindow.width / 2);
			thisWindow.y = centerY - (thisWindow.height / 2);
			thisWindow.alwaysInFront = false;
		
			// Before we display the screen, we want to set it up
			var optionsDom = jQuery('#options-window', thisDocument).get(0);
			// Now lets set up the fields
			jQuery('#window-handle', optionsDom).bind('mousedown.move', function(){
				thisWindow.startMove();
			});
			jQuery('.close-button', optionsDom).click(function(){
				thisWindow.close();
			});
			jQuery('.min-button', optionsDom).click(function(){
				thisWindow.minimize();
			});
			
			jQuery('#autologin',  optionsDom).attr('checked', Serebra.AutoLogin);
			jQuery('#autostart',  optionsDom).attr('checked', Serebra.AutoStart);
			jQuery('#password',   optionsDom).val(Serebra.Password);
			jQuery('#rememberme', optionsDom).attr('checked', Serebra.RememberMe);
			jQuery('#username',   optionsDom).val(Serebra.Username);
			jQuery('#checktime option', optionsDom).each(function(){
				if (jQuery(this).val() == Serebra.MessageCheckTime) {
					jQuery(this).attr('selected', 'selected');
				}
			});
			
			jQuery('#save', optionsDom).bind('click.save', function(){
					Serebra.AutoLogin = jQuery('#autologin', optionsDom).attr('checked');
					Serebra.AutoStart = jQuery('#autostart', optionsDom).attr('checked');
					Serebra.Password = jQuery('#password', optionsDom).val();
					Serebra.RememberMe = jQuery('#rememberme', optionsDom).attr('checked');
					Serebra.Username = jQuery('#username', optionsDom).val();
					Serebra.MessageCheckTime = jQuery('#checktime', optionsDom).val();
					
					Serebra.Database.SaveOrCreateOption({'key':'username', 'value':Serebra.Username});
					Serebra.Database.SaveOrCreateOption({'key':'password', 'value':Serebra.Password});
					Serebra.Database.SaveOrCreateOption({'key':'autologin', 'value':Serebra.AutoLogin});
					Serebra.Database.SaveOrCreateOption({'key':'rememberme', 'value':Serebra.RememberMe});
					Serebra.Database.SaveOrCreateOption({'key':'autostart', 'value':Serebra.AutoStart});
					Serebra.Database.SaveOrCreateOption({'key':'checktime', 'value':Serebra.MessageCheckTime});
					if (!Serebra.DebugMode) {
		  			air.NativeApplication.nativeApplication.startAtLogin = Serebra.AutoStart;
		  		}
					
					Serebra.Network.MessageCheckTimer.stop();
					Serebra.Network.MessageCheckTimer.delay = Serebra.MessageCheckTime;
					Serebra.Network.MessageCheckTimer.start();
					
					thisWindow.close();
				});
			
			thisWindow.visible = true;
			thisWindow.orderToFront();
		}
	}
	
	var windowOptions = new air.NativeWindowInitOptions();
	windowOptions.maximizable = false;
	windowOptions.minimizable = true;
	windowOptions.resizable = false;
	windowOptions.systemChrome = 'none';
	windowOptions.transparent = true;
	windowOptions.type = 'lightweight';
	
	var windowBounds = new air.Rectangle(0, 0, 305, 480);
	var newHTMLLoader = air.HTMLLoader.createRootWindow(false, windowOptions, false, windowBounds);
	newHTMLLoader.addEventListener(air.Event.COMPLETE, windowLoaded);
	
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

Serebra.Chrome.MessageCenter = function( options ) {
	function windowLoaded( event ) {
		var thisWindow = event.target.window.nativeWindow;
		
		if (thisWindow) {
			var thisDocument = event.target.window.document;
			var centerX = air.Screen.mainScreen.bounds.width / 2;
			var centerY = air.Screen.mainScreen.bounds.height / 2;
			thisWindow.x = centerX - (thisWindow.width / 2);
			thisWindow.y = centerY - (thisWindow.height / 2);
		
			// Before we display the screen, we want to set it up
			var messageDom = jQuery('#message-center', thisDocument).get(0);
			// Now lets set up the fields
			jQuery('#window-handle', messageDom).bind('mousedown.move', function(){
				thisWindow.startMove();
			});
			jQuery('.close-button', messageDom).click(function(){
				thisWindow.close();
			});
			jQuery('.min-button', messageDom).click(function(){
				thisWindow.minimize();
			});
			
			(function createTable() {
					var allMessages = Serebra.Database.Query({
						'queryString': 'SELECT * FROM serebra_user_alerts ORDER BY AlertID DESC'
  				});
					var output = [];
				
						output.push('<div id="inner-table-wrapper">');
	  					output.push('<table id="message-table" cellspacing="0" cellpadding="0" width="100%">');
	  						output.push('<thead>');
	  							output.push('<tr>');
	  								output.push('<th>&nbsp;</th>');
	  								output.push('<th>Type</th>');
	  								output.push('<th>Details</th>');
	  								output.push('<th>&nbsp;</th>');
	  							output.push('</tr>');
	  						output.push('</thead>');
	  					output.push('<tbody>');
	  					if (allMessages.result.data !== null) {
	  						jQuery.each(allMessages.result.data, function(i, item){
									output.push('<tr id="' + item.AlertID + '">');
	  								switch (item.messageRead) {
	  									case 0:
	  										output.push('<td width="55"><span class="unread">Unread</span></td>');
											break;
											case 1:
												output.push('<td width="55"><span class="read">Read</span></td>');
											break;
											default:
											break;
										}	
	  								output.push('<td width="55">' + item.Type + '</td>');
	  								output.push('<td width="450">' + item.alertText + '</td>');
	  								output.push('<td width="55"><a class="delete" href="#" rel="' + item.AlertID + '"><span>Delete</span<</a></td>');
	  							output.push('</tr>');
	  						});
	  						output.push('</tbody>');
	  						output.push('</table>');
								output.push('</div>');
							} else {
								output.push('<tr width="100%"><td colspan="5" width="100%"><h3>You have No Messages</h3></td></tr>');
								output.push('</tbody>');
	  						output.push('</table>');
								output.push('</div>');
								
								function iconLoadComplete( event ) {
									if (air.NativeApplication.supportsSystemTrayIcon) {
    								air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
							      air.NativeApplication.nativeApplication.icon.tooltip = 'Serebra Connect Alerts Is Online';
										return;
    							}
								}
								var iconLoader = new runtime.flash.display.Loader();
  							iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
								iconLoader.load(new air.URLRequest('app:/assets/images/icon_desktop_16.png'));
								
							}
							jQuery('#outer-table-wrapper', messageDom).append(output.join(''));
							
							jQuery('#message-table tbody tr', messageDom).click(function(){
  							jQuery('#message-table tbody tr', messageDom).css({
  								'background-color': 'transparent'
  							});
  							jQuery(this).css({
  								'background-color': '#F4F7CD'
  							});
  						});
				
							jQuery('#message-table .delete', messageDom).bind('click.delete', function(){
								var id = jQuery(this).attr('rel');
								Serebra.Messages.DeleteMessage(id, function(deleted){
									if (deleted) {
				   					jQuery('tr#' + id, messageDom).fadeOut(function(){
											jQuery(this).remove();
											jQuery('#inner-table-wrapper', messageDom).remove();
											createTable();
										});
			  					}
								});
							});
				
	  					jQuery('#message-table tbody tr', messageDom).dblclick(function(){
								var row = this;
  							var id = jQuery(this).attr('id');
  							var thisMessage = Serebra.Database.Query({
  								'queryString': 'SELECT * FROM serebra_user_alerts WHERE AlertID = ' + id
  							});
								if (thisMessage.result.data) {
		  						var link = thisMessage.result.data[0].objectLink;
	  				
		  						Serebra.SOAP.ConsumeAlert({
		  							'authCode': Serebra.AuthCode,
		  							'applicationCode': Serebra.ApplicationCode,
		  							'alertID': id
		  						}, function(response){
		  							var result = jQuery('consumedAlert', response).text();
		  							if (result == 'true') {
		  								Serebra.Database.Query({
		  									'queryString': 'UPDATE serebra_user_alerts SET messageRead = 1 WHERE AlertID = ' + id
		  								});
		  								jQuery('.unread', row).addClass('read').removeClass('unread');
		  								air.navigateToURL(new air.URLRequest(link));
		  							}
		  						});
		  					}
							});
							return;
				})();
			
			thisWindow.visible = true;
			thisWindow.orderToFront();
		}
	}
	
	var windowOptions = new air.NativeWindowInitOptions();
	windowOptions.maximizable = false;
	windowOptions.minimizable = true;
	windowOptions.resizable = false;
	windowOptions.systemChrome = 'none';
	windowOptions.transparent = true;
	windowOptions.type = 'normal';
	
	var windowBounds = new air.Rectangle(0, 0, 640, 354);
	var newHTMLLoader = air.HTMLLoader.createRootWindow(false, windowOptions, false, windowBounds);
	newHTMLLoader.addEventListener(air.Event.COMPLETE, windowLoaded);
	
	var alreadyOpen = false;
	jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(i, win){
		if (win.title === 'Serebra Connect Alerts - Alert Center') {
			alreadyOpen = true;
		}
	});
	if (!alreadyOpen) {
		newHTMLLoader.load(new air.URLRequest('app:/assets/html/MessageCenter.html'));
	}
};

