Serebra.Network.CheckMessages = function() {
    Serebra.SOAP.GetUserAlerts({
        'authCode': Serebra.AuthCode,
        'applicationCode': Serebra.ApplicationCode
    },
    function(userAlerts) {
        var newMessages = 0;
		var totalIgnore = 0;
        jQuery('alert', userAlerts).each(function() {
            var id = jQuery(this).attr('id');
            var type = jQuery('type', this).text();
            var alertText = jQuery('alertText', this).text();
            var userLink = jQuery('userLink', this).text();
            var objectLink = jQuery('objectLink', this).text();
            var existing = Serebra.Database.Query({
                'queryString': 'SELECT * FROM ' + Serebra.UserTable + ' WHERE AlertID = ' + id
            });
            if (!existing.result.data) {
                Serebra.Database.Query({
                    'queryString': 'INSERT INTO ' + Serebra.UserTable + ' VALUES(' + id + ',"' + type + '","' + alertText + '","' + userLink + '","' + objectLink + '",0)'
                });
				
				jQuery.each(Serebra.IgnoreArray, function(i, ignore) {
					if (type === ignore[0] && ignore[1] === "true") {
						newMessages = newMessages + 1;
                		Serebra.UnreadMessages = true;		
					} else {
						totalIgnore = totalIgnore + 1;
					};
				});
            }

        });

		if (Serebra.DisplayPop === 'true') {
			
			var alertPlural = "alerts";
			var doPopup = false;
			if (newMessages == 1) {
				alertPlural = "alert";
			}
			
			if (newMessages == 0 && Serebra.JustLoaded && totalIgnore < 5) {
				newMessages = "no";
				doPopup = true;
			} else if (newMessages > 0) {
				doPopup = true;
			}
			
			if (doPopup) {
				Serebra.Chrome.Popup({
					'message': '<h2>You have <span class="green">' + newMessages + '</span> new ' + alertPlural + '!</h2>',
					'showLink': true,
					'popupLife': 6000
				});
			}
			Serebra.JustLoaded = false;
        }
		
		if (Serebra.UnreadMessages) {
			function iconLoadComplete(event) {
        		if (air.NativeApplication.supportsSystemTrayIcon) {
           			air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
            	    air.NativeApplication.nativeApplication.icon.tooltip = 'Serebra Connect Alerts - You have unread messages';
            	}
        	}
			
			var iconLoader = new runtime.flash.display.Loader();
			iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
			iconLoader.load(new air.URLRequest('app:/assets/images/icon_tray_new.png'));
		}
    });
};
