Serebra.Network.CheckMessages = function() {
    Serebra.SOAP.GetUserAlerts({
        'authCode': Serebra.AuthCode,
        'applicationCode': Serebra.ApplicationCode
    },
    function(userAlerts) {
        var unreadCount = 0;
        jQuery('alert', userAlerts).each(function() {
            unreadCount = unreadCount + 1;
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
                Serebra.UnreadMessages = true;
            } else {
                if (existing.result.data[0].messageRead === 0) {
                    Serebra.UnreadMessages = true;
                }
            }

        });

        if (Serebra.UnreadMessages) {
            function iconLoadComplete(event) {
                if (air.NativeApplication.supportsSystemTrayIcon) {
                    air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
                    air.NativeApplication.nativeApplication.icon.tooltip = 'Serebra Connect Alerts - You have unread messages';
                }
                if (Serebra.DisplayPop === 'true') {
                    Serebra.Chrome.MessagePopup({
                        'messageCount': unreadCount
                    });
                }
            }
            var iconLoader = new runtime.flash.display.Loader();
            iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
            iconLoader.load(new air.URLRequest('app:/assets/images/icon_tray_newalerts.png'));
        }

    });
};
