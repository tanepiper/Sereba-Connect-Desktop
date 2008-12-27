Serebra.Chrome.MessageCenter = function() {

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
        var windowOptions = new air.NativeWindowInitOptions();
        windowOptions.systemChrome = air.NativeWindowSystemChrome.NONE;
        windowOptions.transparent = true;
        windowOptions.type = air.NativeWindowType.NORMAL;

        var windowBounds = new air.Rectangle(0, 0, 640, 385);
        var newHTMLLoader = air.HTMLLoader.createRootWindow(false, windowOptions, false, windowBounds);
        newHTMLLoader.paintsDefaultBackground = false;
        newHTMLLoader.stage.nativeWindow.alwaysInFront = false;
        newHTMLLoader.navigateInSystemBrowser = true;
        newHTMLLoader.addEventListener(air.Event.COMPLETE, windowLoaded);
        newHTMLLoader.load(new air.URLRequest('app:/assets/html/MessageCenter.html'));
    }

    function windowLoaded(event) {
        var thisWindow = event.target.window.nativeWindow;
        var thisDocument = event.target.window.document;

        if (thisWindow && thisDocument) {
            thisWindow.addEventListener(air.Event.ACTIVATE, createTable);
            var centerX = air.Screen.mainScreen.bounds.width / 2;
            var centerY = air.Screen.mainScreen.bounds.height / 2;
            thisWindow.x = centerX - (thisWindow.width / 2);
            thisWindow.y = centerY - (thisWindow.height / 2);

            // Before we display the screen, we want to set it up
            var messageDom = jQuery('#message-center', thisDocument).get(0);

            function removeRow(id) {
                function deleteRow() {
                    jQuery('tr#' + id, messageDom).fadeOut(function() {
                        jQuery(this).remove();
                        createTable();
                    });
                }
                jQuery('tr#' + id, messageDom).css({
                    'background-color': '#f00'
                });
                var removeTimer = new air.Timer(1000, 1);
                removeTimer.addEventListener(air.TimerEvent.TIMER, deleteRow)
                removeTimer.start();
            }

            // Now lets set up the fields
            jQuery('#window-handle', messageDom).bind('mousedown.move',
            function() {
                thisWindow.startMove();
            });
            jQuery('.close-button', messageDom).click(function() {
                thisWindow.visible = false;
                return false;
            });
            jQuery('.min-button', messageDom).click(function() {
                thisWindow.minimize();
                return false;
            });

            function createTable() {
                jQuery('#inner-table-wrapper', messageDom).remove();
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
                    iconLoader.load(new air.URLRequest('app:/assets/images/icon_desktop_16.png'));

                }
                jQuery('#outer-table-wrapper', messageDom).append(output.join(''));

                jQuery('#message-table tbody tr', messageDom).unbind('click.hilight').bind('click.hilight',
                function() {
                    jQuery('#message-table tbody tr', messageDom).css({
                        'background-color': 'transparent'
                    });
                    jQuery(this).css({
                        'background-color': '#F4F7CD'
                    });
                    return false;
                });
                jQuery('#message-table .delete', messageDom).unbind('click.delete').bind('click.delete',
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

                jQuery('#delete-all', messageDom).unbind('click.deleteall').bind('click.deleteall',
                function() {
                    Serebra.Chrome.ConfirmPrompt("Are you sure you wish to delete all messages?",
                    function() {

                        var allMessages = Serebra.Database.Query({
                            'queryString': 'SELECT * FROM serebra_user_alerts'
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

                jQuery('#message-table tbody tr', messageDom).unbind('dblclick.open').bind('dblclick.open',
                function() {
                    var row = this;
                    var id = jQuery(this).attr('id');
                    var thisMessage = Serebra.Database.Query({
                        'queryString': 'SELECT * FROM serebra_user_alerts WHERE AlertID = ' + id
                    });
                    if (thisMessage.result.data) {
                        var link = thisMessage.result.data[0].objectLink;
                        Serebra.SOAP.ConsumeAlert({
                            'authCode': Serebra.AuthCode,
                            'applicationCode': Serebra.ApplicationCode,
                            'alertID': id
                        },
                        function(response) {
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
                    return false;
                });
            }
        }
    }
};
