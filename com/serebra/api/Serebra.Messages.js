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
				event.target.window.nativeWindow.alwaysInFront = true;
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

Serebra.Messages.MessageCenter = function(){
	var sizeWidth = air.Screen.mainScreen.visibleBounds.width - 800;
	var sizeHeight = air.Screen.mainScreen.visibleBounds.height - 600;
	
	Serebra.Window.CreateNewWindow({
		'content':'app:/assets/html/MessageCenter.html',
		'maximizable': false,
		'minimizable': false,
		'resizable' : false,
		'systemChrome': 'none',
		'transparent': true,
		'scrollBarsVisible': false,
		'position': [sizeWidth, sizeHeight],
		'size': [232, 474]
		}, function ( event ){
				var messageCenter = jQuery('#message-center', event.target.window.document).get(0);
				jQuery('#handle', messageCenter).bind('mousedown.move', function(){
						event.target.window.nativeWindow.startMove();
				});
				jQuery('.close-button', messageCenter).click(function(){
						event.target.window.nativeWindow.close();
				});
				
				var allMessages = Serebra.Database.Query(DatabaseFile, {
					'queryString': 'SELECT * FROM serebra_user_alerts ORDER BY AlertID DESC'
				});
				var output = []
				jQuery.each(allMessages.result.data, function(i, item){
					
					switch (item.messageRead) {
						case 0:
							var readStatus = "Unread";
							var readClass = 'unread';
						break;
						case 1:
							var readStatus = "Read";
							var readClass = 'read';
						break;
					}
					
					output.push('<li>');
						output.push('<div class="message" id="'+item.AlertID+'">');
							output.push('<strong>Message: <span class="'+readClass+'">' + readStatus + '</span></strong>');
							output.push('<p><a rel="'+item.AlertID+'" class="alert-link" href="' + item.objectLink + '">' + item.alertText+'</a></p>');
						output.push('</div>');
					output.push('</li>');
				});
				jQuery('#message-list', messageCenter).append(output.join(''));
				
				jQuery('.alert-link', messageCenter).bind('click', function(){
					air.navigateToURL(new air.URLRequest(jQuery('.alert-link', messageCenter).attr('href')));
					var id = jQuery(this).attr('rel');
					
					Serebra.SOAP.ConsumeAlert({
						'authCode': authCode,
						'applicationCode': applicationCode,
						'alertID': id
					}, function(response){
						Serebra.Database.Query(DatabaseFile, {
						'queryString': 'UPDATE serebra_user_alerts SET messageRead = 1 WHERE AlertID = ' + id
						});
					});
				});
		});
}
