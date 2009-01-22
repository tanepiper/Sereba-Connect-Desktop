Serebra.Network.CheckMessages = function() {
    Serebra.SOAP.GetUserAlerts({
        'authCode': Serebra.AuthCode,
        'applicationCode': Serebra.ApplicationCode
    },
    function(userAlerts) {
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
            }
        });

        var new_messages = 0;
        var all_existing = Serebra.Database.Query({
            'queryString': 'SELECT * FROM ' + Serebra.UserTable + ' WHERE messageRead = 0'
        });
        if (all_existing.result.data) {
            jQuery.each(all_existing.result.data,
            function(i, item) {
                new_messages++;
            });
        }

        if (new_messages) {

            var alertPlural = "alerts";
            if (new_messages === 1) {
                alertPlural = "alert"
            }

            if (Serebra.DisplayPopups) {
                Serebra.Chrome.Popup({
                    'message': '<h2>You have <span class="green">' + new_messages + '</span> new ' + alertPlural + '!</h2>',
                    'showLink': true,
                    'popupLife': 6000
                });
            }

            if (Serebra.PlayPopupSound) {
                function onSoundLoaded(event) {
                    var localSound = event.target;
                    localSound.play();
                }

                var sound = new air.Sound();
                sound.addEventListener(air.Event.COMPLETE, onSoundLoaded);
                var req = new air.URLRequest("app:/assets/sounds/new_message.mp3");
                sound.load(req);
            }

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
