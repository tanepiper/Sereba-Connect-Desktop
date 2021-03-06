Serebra.Chrome.AlertCenter = function() {
    this.Initialise = function() {
        var windowOptions = new air.NativeWindowInitOptions();
        windowOptions.systemChrome = air.NativeWindowSystemChrome.NONE;
        windowOptions.type = air.NativeWindowType.NORMAL;
        windowOptions.transparent = true;

        var windowBounds = new air.Rectangle(0, 0, 640, 385);

        var newHTMLLoader = air.HTMLLoader.createRootWindow(false, windowOptions, false, windowBounds);
        newHTMLLoader.paintsDefaultBackground = false;
        newHTMLLoader.stage.nativeWindow.alwaysInFront = false;
        newHTMLLoader.navigateInSystemBrowser = true;
        newHTMLLoader.addEventListener(air.Event.COMPLETE, this.CreateWindow);
        try {
            newHTMLLoader.load(new air.URLRequest('app:/assets/html/MessageCenter.html'));
        } catch(error) {
            air.Introspector.Console.log(error);
        }

    }
    this.CreateWindow = function(event) {
        //alert('AlertCenter Loaded')
        var windowDom = jQuery('#message-center', event.target.window.document).get(0);

        function closeWindow() {
            event.target.window.nativeWindow.visible = false;
            return false;
        }

        function minimiseWindow() {
            event.target.window.nativeWindow.minimize();
            return false;
        }

        function moveWindow() {
            event.target.window.nativeWindow.startMove();
        }

        function removeRow(id) {
            jQuery('tr#' + id, windowDom).remove();
            setupDom();
        }

        function setupDom() {
            jQuery('#window-handle', windowDom).unbind('mousedown.move').bind('mousedown.move', moveWindow);
            jQuery('.close-button', windowDom).unbind('click.close').bind('click.close', closeWindow);
            jQuery('.min-button', windowDom).unbind('click.min').bind('click.min', minimiseWindow);
            jQuery('#inner-table-wrapper', windowDom).remove();
            var allMessages = Serebra.Database.Query({
                'queryString': 'SELECT * FROM ' + Serebra.UserTable + ' ORDER BY AlertID DESC'
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
                jQuery.each(allMessages.result.data,
                function(i, item) {
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

                function iconLoadComplete(event) {
                    if (air.NativeApplication.supportsSystemTrayIcon) {
                        air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
                        air.NativeApplication.nativeApplication.icon.tooltip = 'Serebra Connect Alerts Is Online';
                        return;
                    }
                }
                var iconLoader = new runtime.flash.display.Loader();
                iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
                iconLoader.load(new air.URLRequest('app:/assets/images/icon_tray_on.png'));

            }
            jQuery('#outer-table-wrapper', windowDom).append(output.join(''));

            jQuery('#message-table tbody tr', windowDom).unbind('click.hilight').bind('click.hilight',
            function() {
                jQuery('#message-table tbody tr', windowDom).css({
                    'background-color': 'transparent'
                });
                jQuery(this).css({
                    'background-color': '#F4F7CD'
                });
                return false;
            });
            jQuery('#message-table .delete', windowDom).unbind('click.delete').bind('click.delete',
            function() {
                var id = jQuery(this).attr('rel');
                Serebra.Chrome.ConfirmPrompt("Are you sure you wish to delete this message?",
                function() {
                    Serebra.Messages.DeleteMessage(id,
                    function(deleted) {
                        if (deleted) {
                            removeRow(id);
                        }
                    });
                });
                return false;
            });

            jQuery('#delete-all', windowDom).unbind('click.deleteall').bind('click.deleteall',
            function() {
                Serebra.Chrome.ConfirmPrompt("Are you sure you wish to delete all messages?",
                function() {

                    var allMessages = Serebra.Database.Query({
                        'queryString': 'SELECT * FROM ' + Serebra.UserTable
                    });

                    if (allMessages.result.data) {
                        jQuery.each(allMessages.result.data,
                        function(i, item) {
                            var id = item.AlertID;
                            Serebra.Messages.DeleteMessage(item.AlertID,
                            function(deleted) {
                                if (deleted) {
                                    removeRow(id);
                                }
                            });
                        });
                    }

                });
                return false;
            });

            jQuery('#message-table tbody tr', windowDom).unbind('dblclick.open').bind('dblclick.open',
            function() {
                var row = this;
                var id = jQuery(this).attr('id');
                var thisMessage = Serebra.Database.Query({
                    'queryString': 'SELECT * FROM ' + Serebra.UserTable + ' WHERE AlertID = ' + id
                });
                if (thisMessage.result.data) {
                    var link = thisMessage.result.data[0].objectLink;
                    air.navigateToURL(new air.URLRequest(link));
                    Serebra.SOAP.ConsumeAlert({
                        'authCode': Serebra.AuthCode,
                        'applicationCode': Serebra.ApplicationCode,
                        'alertID': id
                    },
                    function(response) {
                        var result = jQuery('consumedAlert', response).text();
                        if (result == 'true') {
                            Serebra.Database.Query({
                                'queryString': 'UPDATE ' + Serebra.UserTable + ' SET messageRead = 1 WHERE AlertID = ' + id
                            });
                            jQuery('.unread', row).addClass('read').removeClass('unread');

                            function iconLoadComplete(event) {
                                if (air.NativeApplication.supportsSystemTrayIcon) {
                                    air.NativeApplication.nativeApplication.icon.bitmaps = new Array(event.target.content.bitmapData);
                                    air.NativeApplication.nativeApplication.icon.tooltip = 'Serebra Connect Alerts Is Online';
                                }
                            }

                            var all_existing = Serebra.Database.Query({
                                'queryString': 'SELECT * FROM ' + Serebra.UserTable + ' WHERE messageRead = 0'
                            });
                            if (!all_existing.result.data) {
                                var iconLoader = new runtime.flash.display.Loader();
                                iconLoader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
                                iconLoader.load(new air.URLRequest('app:/assets/images/icon_tray_on.png'));
                            }
                        }
                    });
                }
                return false;
            });
        }

        if (event.type === 'complete' && event.target.window.nativeWindow) {
            // Now we set up the window position
            var centerX = air.Screen.mainScreen.bounds.width / 2;
            var centerY = air.Screen.mainScreen.bounds.height / 2;
            event.target.window.nativeWindow.x = centerX - (event.target.window.nativeWindow.width / 2);
            event.target.window.nativeWindow.y = centerY - (event.target.window.nativeWindow.height / 2);
            event.target.window.nativeWindow.addEventListener(air.Event.ACTIVATE, setupDom);
        }
    }

    var alreadyOpen = false;
    jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(i, win) {
        if (win.title === 'Serebra Connect Alerts - Alert Center') {
            alreadyOpen = true;
            win.visible = true;
            win.activate();
            win.orderToFront();
        }
    });
    if (!alreadyOpen) {
        this.Initialise();
    }
};