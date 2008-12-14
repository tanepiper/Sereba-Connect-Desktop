Serebra.Messages = {};

Serebra.Messages.CreateMessage = function(options) {
	
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
			
				function windowClose( event ) {
					Serebra.Messages.MessageCenter();
				}
			
				//event.target.window.nativeWindow.alwaysInFront = true;
				var messageArea = jQuery('#message-area', event.target.window.document).get(0);
				jQuery('.title', messageArea).html('<strong>New '+options.Type+'</strong>');
				jQuery('.title', messageArea).click(function(){
					event.target.window.nativeWindow.close();
				});
				jQuery('.message', messageArea).html('You have recieved a new message!');
				jQuery('.user', messageArea).html('<a class="user-link" href="#">Click Here to open the Message Center</a>').bind('click', function(){
					event.target.window.nativeWindow.addEventListener(air.Event.CLOSE, windowClose);
					event.target.window.nativeWindow.close();
				});
		});
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
  		'size': [640, 480]
  	}, function(event){
  		var messageCenter = jQuery('#message-center', event.target.window.document).get(0);
  		jQuery('#window-handle', messageCenter).bind('mousedown.move', function(){
  			event.target.window.nativeWindow.startMove();
  		});
  		jQuery('.close-button', messageCenter).click(function(){
  			event.target.window.nativeWindow.close();
  		});
  		
  		var allMessages = Serebra.Database.Query({
  			'queryString': 'SELECT * FROM serebra_user_alerts ORDER BY AlertID DESC'
  		});
  		
  		var readMessages = [];
  		var unreadMessages = [];
  		var output = [];
  		output.push('<table id="message-table" cellspacing="0" cellpadding="0">');
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
  						output.push('<td>' + item.AlertID + '</td>');
  						output.push('<td>' + item.Type + '</td>');
  						output.push('<td>' + item.alertText + '</td>');
  						output.push('<td>No</td>');
  						output.push('<td><a href="#" rel="' + item.AlertID + '">X</a></td>');
  						output.push('</tr>');
  						break;
  					case 1:
  						readMessages.push(item);
  						output.push('<tr id="' + item.AlertID + '">');
  						output.push('<td>' + item.AlertID + '</td>');
  						output.push('<td>' + item.Type + '</td>');
  						output.push('<td>' + item.alertText + '</td>');
  						output.push('<td>Yes</td>');
  						output.push('<td><a href="#" rel="' + item.AlertID + '">X</a></td>');
  						output.push('</tr>');
  						break;
  				}
  			});
  			output.push('</tbody>');
  			output.push('</table>')
  			
  			jQuery('#message-wrapper', messageCenter).append(output.join(''));
  			
  			jQuery('#message-table', messageCenter).grid({
  				'navigate': {
  					'maintainSelection': false
  				},
  				'scroll': {
  					'width': '620',
  					'height': '300',
  					'colWidths': [55, 150, 300, 55, 55]
  				},
  				'stripe': true,
  				'columnResize': false
  			});
				
				/*
				var tableBody = jQuery('.scrollableTableInnerWrapper');
				
				jQuery('#slider', messageCenter).slider({
						'range': 100,
						'axis':'vertical',
						'minValue': 0,
						'maxValue': 1800,
						'change' : function(event, ui) {
							tableBody.animate({ 'top' : '-' + ui.value + 'px' }, 500, 'linear');
						},
						'slide' : function (ev, ui) {
							tableBody.css('top', '-' + (ui.value) + 'px');
						},
						'stop': function (ev, ui) {
        			tableBody.animate({ 'top' : '-' + ui.value + 'px' }, 500, 'linear');
      			}
					});
  			*/
  			jQuery('#message-table tbody tr', messageCenter).click(function(){
  				jQuery('#message-table tr', messageCenter).css({
  					'background-color': 'transparent'
  				});
  				jQuery(this).css({
  					'background-color': '#F29614'
  				});
  			});
  			jQuery('#message-table tbody tr', messageCenter).dblclick(function(){
  				var id = jQuery(this).attr('id');
  				
  				var thisMessage = Serebra.Database.Query({
  					'queryString': 'SELECT * FROM serebra_user_alerts WHERE AlertID = ' + id
  				});
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
  			});
  			
  		}
  		else {
  			jQuery('#message-wrapper', messageCenter).html('<strong class="no-messages">You Have No Messages</strong>');
  		}
  	});
  }
}
