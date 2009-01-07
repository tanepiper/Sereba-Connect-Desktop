Serebra.Network.CheckMessages = function() {
    Serebra.SOAP.GetUserAlerts({
        'authCode': Serebra.AuthCode,
        'applicationCode': Serebra.ApplicationCode
    },
    function(userAlerts) {
        var newMessages = 0;
        jQuery('alert', userAlerts).each(function() {
            var id = jQuery(this).attr('id');
            var type = jQuery('type', this).text();
            var alertText = jQuery('alertText', this).text();
            var userLink = jQuery('userLink', this).text();
            var objectLink = jQuery('objectLink', this).text();
            var existing = Serebra.Database.Query({
                'queryString': 'SELECT * FROM serebra_user_alerts WHERE AlertID = ' + id
            });
            if (!existing.result.data) {
                Serebra.Database.Query({
                    'queryString': 'INSERT INTO serebra_user_alerts VALUES(' + id + ',"' + type + '","' + alertText + '","' + userLink + '","' + objectLink + '",0)'
                });
				newMessages = newMessages + 1;
                Serebra.UnreadMessages = true;
            }

        });

		if (Serebra.DisplayPop === 'true') {
			
			var alertPlural = "alerts";
			var doPopup = false;
			if (newMessages == 1) {
				alertPlural = "alert";
			}
			
			if (newMessages == 0 && Serebra.JustLoaded) {
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
			iconLoader.load(new air.URLRequest('app:/assets/images/icon_tray_newalerts.png'));
		}
    });
};
