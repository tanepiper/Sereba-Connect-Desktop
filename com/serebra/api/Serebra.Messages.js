var Serebra;
if (!Serebra) Serebra = function(){};

Serebra.Messages = {};

Serebra.Messages.CreateMessageNotification = function(options) {
	
	var alreadyOpen = false;
	jQuery.each(air.NativeApplication.nativeApplication.openedWindows, function(i, win){
		if (win.title == 'Serebra Connect Desktop - Notification') {
			alreadyOpen = true;
		}
	});
	if (!alreadyOpen) {
  	var sizeWidth = air.Screen.mainScreen.visibleBounds.width - 350;
  	var sizeHeight = air.Screen.mainScreen.visibleBounds.height - 261;
  	
  	Serebra.Window.CreateNewWindow({
  		'content': 'app:/assets/html/Popup.html',
  		'maximizable': false,
  		'minimizable': false,
  		'resizable': false,
  		'systemChrome': 'none',
  		'transparent': true,
  		'scrollBarsVisible': false,
  		'position': [sizeWidth, sizeHeight],
  		'size': [250, 261]
  	}, function(event){
  		//event.target.window.nativeWindow.alwaysInFront = true;
				var messageArea = jQuery('#popup', event.target.window.document).get(0);
				
				jQuery('#window-handle', messageArea).bind('mousedown.move', function(){
					event.target.window.nativeWindow.startMove();
				});
				jQuery('.close-button', messageArea).click(function(){
					event.target.window.nativeWindow.close();
				});
				
				switch (options.type) {
					case 'new':
						jQuery('.message', messageArea).html('<h2>You have <span class="green">' + options.messageCount + '</span> new alerts!</h2>');
						break;
					default:
						jQuery('.message', messageArea).html('<p>You have ' + options.messageCount + ' unread messages!</p>');
					break;
				}
			});
	}
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
				var deleteRow;
				if (errorCode == "false") {
					deleteRow = Serebra.Database.Query({
						'queryString': 'DELETE FROM serebra_user_alerts WHERE AlertID = ' + id
					});
					if (deleteRow.success) {
						deleted = true;
					}
				} else if (errorString == "you don't own that alert") {
					deleteRow = Serebra.Database.Query({
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
};

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
  		'size': [640, 354]
  	}, function(event){
  			var messageCenter = jQuery('#message-center', event.target.window.document).get(0);
  			jQuery('#window-handle', messageCenter).bind('mousedown.move', function(){
  				event.target.window.nativeWindow.startMove();
  			});
				
  			jQuery('.close-button', messageCenter).click(function(){
  				event.target.window.nativeWindow.close();
  			});
				jQuery('.min-button', messageCenter).click(function(){
						event.target.window.nativeWindow.minimize();
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
							}
							jQuery('#outer-table-wrapper', messageCenter).append(output.join(''));
							
							jQuery('#message-table tbody tr', messageCenter).click(function(){
  							jQuery('#message-table tr', messageCenter).css({
  								'background-color': 'transparent'
  							});
  							jQuery(this).css({
  								'background-color': '#F4F7CD'
  							});
  						});
				
							jQuery('#message-table .delete', messageCenter).bind('click.delete', function(){
								var id = jQuery(this).attr('rel');
								Serebra.Messages.DeleteMessage(id, function(deleted){
									if (deleted) {
				   					jQuery('tr#' + id, messageCenter).fadeOut(function(){
											jQuery(this).remove();
											jQuery('#inner-table-wrapper', messageCenter).remove();
											createTable();
										});
			  					}
								});
							});
				
	  					jQuery('#message-table tbody tr', messageCenter).dblclick(function(){
								var row = this;
  							var id = jQuery(this).attr('id');
  							var thisMessage = Serebra.Database.Query({
  								'queryString': 'SELECT * FROM serebra_user_alerts WHERE AlertID = ' + id
  							});
								if (thisMessage.result.data) {
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
		  								jQuery('.unread', row).addClass('read').removeClass('unread');
		  								air.navigateToURL(new air.URLRequest(link));
		  							}
		  						});
		  					}
							});
							return;
				})();
			});
	 }
};