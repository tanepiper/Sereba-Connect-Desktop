Serebra.Messages = {};

Serebra.Messages.CreateMessage = function(options) {
	
	var sizeWidth = air.Screen.mainScreen.visibleBounds.width - 296;
	var sizeHeight = air.Screen.mainScreen.visibleBounds.height - 244;
	
	Serebra.Window.CreateNewWindow({
		'content':'app:/assets/html/Popup.html',
		'maximizable': false,
		'minimizable': false,
		'resizable' : false,
		'systemChrome': 'none',
		'transparent': true,
		'scrollBarsVisible': false,
		'position': [sizeWidth, sizeHeight],
		'size': [296, 244]
		}, function ( event ){
				var messageArea = jQuery('#message-area', event.target.window.document).get(0);
				jQuery('.title', messageArea).html('<strong>New '+options.Type+'</strong>');
				jQuery('.title', messageArea).click(function(){
					event.target.window.nativeWindow.close();
				});
				jQuery('.message', messageArea).html('<a class="alert-link" href="' + options.objectLink + '">' + options.alertText + '</a>').bind('click', function(){
					air.navigateToURL(new air.URLRequest(jQuery('.alert-link', messageArea).attr('href')));
				});
				jQuery('.user', messageArea).html('<a class="user-link" href="' + options.userLink + '">Click here to view the users profile.</a>').bind('click', function(){
					air.navigateToURL(new air.URLRequest(jQuery('.user-link', messageArea).attr('href')));
				});
		});
};