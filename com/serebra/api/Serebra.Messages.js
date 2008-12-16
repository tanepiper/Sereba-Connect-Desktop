Serebra.Messages = {};

Serebra.Messages.CreateMessageNotification = function(options) {
	
	var sizeWidth = air.Screen.mainScreen.visibleBounds.width - 350;
	var sizeHeight = air.Screen.mainScreen.visibleBounds.height - 261;
	
	Serebra.Window.CreateNewWindow({
		'content':'app:/assets/html/Popup.html',
		'maximizable': false,
		'minimizable': false,
		'resizable' : false,
		'systemChrome': 'none',
		'transparent': true,
		'scrollBarsVisible': false,
		'position': [sizeWidth, sizeHeight],
		'size': [350, 261]
		}, function ( event ){
				//event.target.window.nativeWindow.alwaysInFront = true;
				var messageArea = jQuery('#popup', event.target.window.document).get(0);
				
				jQuery('#window-handle', messageArea).bind('mousedown.move', function(){
						event.target.window.nativeWindow.startMove();
				});
				jQuery('.close-button', messageArea).click(function(){
						event.target.window.nativeWindow.close();
				});
				
				jQuery('.title', messageArea).html('<h3>Serebra Connect Desktop Alert</h3>');
				jQuery('.title', messageArea).click(function(){
					event.target.window.nativeWindow.close();
				});
				jQuery('.message', messageArea).html('<p>You have '+options.unreadCount+' unread messages!</p>');
/*			jQuery('.user', messageArea).html('<p><a class="user-link" href="#">Click Here to open the Message Center</a></p>').bind('click', function(){
					event.target.window.nativeWindow.addEventListener(air.Event.CLOSE, windowClose);
					event.target.window.nativeWindow.close();
				});*/
		});
};

Serebra.Messages.DeleteMessage = function(id, callback) {
	var deleted = false;
	
	var thisMessage = Serebra.Database.Query({
  	'queryString': 'SELECT * FROM serebra_user_alerts WHERE AlertID = ' + id
  });
	
	if (thisMessage.result.data) {
		if (!thisMessage.result.data[0].messageRead) {
			Serebra.SOAP.ConsumeAlert({
				'authCode': authCode,
				'applicationCode': applicationCode,
				'alertID': id
			}, function(soapDocument) {
				var errorCode = jQuery('errorFlag', soapDocument).text();
				var errorString = jQuery('errorString', soapDocument).text();
				if (errorCode == "false") {
					var deleteRow = Serebra.Database.Query({
						'queryString': 'DELETE FROM serebra_user_alerts WHERE AlertID = ' + id
					});
					if (deleteRow.success) {
						deleted = true;
					}
				} else if (errorString == "you don't own that alert") {
					var deleteRow = Serebra.Database.Query({
						'queryString': 'DELETE FROM serebra_user_alerts WHERE AlertID = ' + id
					});
					if (deleteRow.success) {
						deleted = true;
					}
				}
				return callback(deleted);
			});
		} else {
			var deleteRow = Serebra.Database.Query({
				'queryString': 'DELETE FROM serebra_user_alerts WHERE AlertID = ' + id
			});
			
			if (deleteRow.result.complete) {
				deleted = true;
			}
		}
	}
		
	return callback(deleted);
}

Serebra.Messages.MessageCenter = function(){
	var sizeWidth = air.Screen.mainScreen.visibleBounds.width - 800;
	var sizeHeight = air.Screen.mainScreen.visibleBounds.height - 600;
	
	var alreadyOpen = false;
	jQuery.each(air.NativeApplication.nativeApplication.openedWindows, function(i, win){
		if (win.title == 'Serebra Connect Desktop - Message Center') {
			alreadyOpen = true;
		}
	});
	if (!alreadyOpen) {
  	Serebra.Window.CreateNewWindow({
  		'content': 'app:/assets/html/MessageCenter.html',
  		'maximizable': false,
  		'minimizable': false,
  		'resizable': false,
  		'systemChrome': 'none',
  		'transparent': true,
  		'scrollBarsVisible': false,
  		'position': [sizeWidth, sizeHeight],
  		'size': [640, 480]
  	}, function(event){
  			var messageCenter = jQuery('#message-center', event.target.window.document).get(0);
  			jQuery('#window-handle', messageCenter).bind('mousedown.move', function(){
  				event.target.window.nativeWindow.startMove();
  			});
				
  			jQuery('.close-button', messageCenter).click(function(){
  				event.target.window.nativeWindow.close();
  			});
			 				
				(function createTable() {
					var allMessages = Serebra.Database.Query({
						'queryString': 'SELECT * FROM serebra_user_alerts ORDER BY AlertID DESC'
  				});
					var readMessages = [];
					var unreadMessages = [];
					var output = [];
				
					output.push('<div id="outer-table-wrapper">');
						output.push('<div id="inner-table-wrapper">');
	  					output.push('<table id="message-table" cellspacing="0" cellpadding="0" width="100%">');
	  						output.push('<thead>');
	  							output.push('<tr>');
	  								output.push('<th>ID</th>');
	  								output.push('<th>Type</th>');
	  								output.push('<th>Alert</th>');
	  								output.push('<th>Read</th>');
	  								output.push('<th>Delete</th>');
	  							output.push('</tr>');
	  						output.push('</thead>');
	  					output.push('<tbody>');
	  					if (allMessages.result.data != null) {
	  						jQuery.each(allMessages.result.data, function(i, item){
	  							switch (item.messageRead) {
	  								case 0:
	  									unreadMessages.push(item);
	  									output.push('<tr id="' + item.AlertID + '">');
	  										output.push('<td width="55">' + item.AlertID + '</td>');
	  										output.push('<td width="150">' + item.Type + '</td>');
	  										output.push('<td width="300">' + item.alertText + '</td>');
	  										output.push('<td width="55">No</td>');
	  										output.push('<td width="55"><a class="delete" href="#" rel="' + item.AlertID + '">X</a></td>');
	  										output.push('</tr>');
	  								break;
	  								case 1:
	  									readMessages.push(item);
	  									output.push('<tr id="' + item.AlertID + '">');
	  										output.push('<td>' + item.AlertID + '</td>');
	  										output.push('<td width="55">' + item.AlertID + '</td>');
	  										output.push('<td width="150">' + item.Type + '</td>');
	  										output.push('<td width="300">' + item.alertText + '</td>');
	  										output.push('<td width="55">Yes</td>');
	  										output.push('<td width="55"><a class="delete" href="#" rel="' + item.AlertID + '">X</a></td>');
	  									output.push('</tr>');
	  								break;
	  							}
	  						});
	  						output.push('</tbody>');
	  						output.push('</table>')
								output.push('</div>');
								output.push('</div>');
							} else {
								output.push('<tr width="100%"><td colspan="5" width="100%"><h3>You have No Messages</h3></td></tr>');
								output.push('</tbody>');
	  						output.push('</table>')
								output.push('</div>');
								output.push('</div>');
							}
							jQuery('#message-wrapper', messageCenter).append(output.join(''));
							jQuery('#message-table tbody tr', messageCenter).click(function(){
  							jQuery('#message-table tr', messageCenter).css({
  								'background-color': 'transparent'
  							});
  							jQuery(this).css({
  								'background-color': '#F29614'
  							});
  						});
				
							jQuery('#message-table .delete', messageCenter).bind('click.delete', function(){
								var id = jQuery(this).attr('rel');
								Serebra.Messages.DeleteMessage(id, function(deleted){
									if (deleted) {
				   					jQuery('tr#' + id, messageCenter).fadeOut(function(){
											jQuery(this).remove();
											jQuery('#outer-table-wrapper', messageCenter).remove();
											createTable();
										});
			  					}
								});
							});
				
	  					jQuery('#message-table tbody tr', messageCenter).dblclick(function(){
  							var id = jQuery(this).attr('id');
  			
  							var thisMessage = Serebra.Database.Query({
  								'queryString': 'SELECT * FROM serebra_user_alerts WHERE AlertID = ' + id
  							});
								
								if (thisMessage.result.data) {
								
	  							var id = thisMessage.result.data[0].AlertID;
		  						var link = thisMessage.result.data[0].objectLink;
	  				
		  						Serebra.SOAP.ConsumeAlert({
		  							'authCode': authCode,
		  							'applicationCode': applicationCode,
		  							'alertID': id
		  						}, function(response){
		  							var result = jQuery('consumedAlert', response).text();
		  							if (result == 'true') {
		  								Serebra.Database.Query({
		  									'queryString': 'UPDATE serebra_user_alerts SET messageRead = 1 WHERE AlertID = ' + id
		  								});
		  								jQuery('#' + id + ' td', messageCenter).eq(3).text('Yes');
		  								air.navigateToURL(new air.URLRequest(link));
		  							}
		  						});
		  					}
							});
							return;
				})();
			});
	 }
}