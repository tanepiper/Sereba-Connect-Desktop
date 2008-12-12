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
				jQuery('.title', messageArea).html('<strong>Message Title</strong>');
				jQuery('.message', messageArea).html('This is where the messages will go.');
		});
};
