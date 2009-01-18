Serebra.Chrome.OKPrompt = function(message, callback) {

    this.windowLoaded = function(event) {
        var thisWindow = event.target.window;

        if (thisWindow.nativeWindow && thisWindow.document) {
            var centerX = air.Screen.mainScreen.bounds.width / 2;
            var centerY = air.Screen.mainScreen.bounds.height / 2;
            thisWindow.nativeWindow.x = centerX - (thisWindow.nativeWindow.width / 2);
            thisWindow.nativeWindow.y = centerY - (thisWindow.nativeWindow.height / 2);

            var thisDom = jQuery('#confirm-message', thisWindow.document).get(0);
            thisWindow.nativeWindow.height = jQuery('#confirm-message', thisWindow.document).height() + 100;
           
             // Now lets set up the fields
            jQuery('#window-handle', thisDom).bind('mousedown.move',
            function() {
                thisWindow.nativeWindow.startMove();
            });
            
            jQuery('.close-button', thisDom).click(function() {
                thisWindow.close();
                return false;
            });
            
            jQuery('.message', thisDom).html('<h2>' + message + '</h2>');

            jQuery('.confirm-button', thisDom).click(function() {
                var value = jQuery(this).val();
                var returnValue;
                if (value === 'OK') {
                  thisWindow.close();
                  return callback();
                }
                thisWindow.close();
                return false;
            });
        }
    }

    var windowOptions = new air.NativeWindowInitOptions();
    windowOptions.systemChrome = air.NativeWindowSystemChrome.NONE;
    windowOptions.transparent = true;
    windowOptions.type = air.NativeWindowType.LIGHTWEIGHT;

    var windowBounds = new air.Rectangle(0, 0, 255, 155);
    var newHTMLLoader = air.HTMLLoader.createRootWindow(true, windowOptions, false, windowBounds);
    newHTMLLoader.paintsDefaultBackground = false;
    newHTMLLoader.stage.nativeWindow.alwaysInFront = true;
    newHTMLLoader.navigateInSystemBrowser = true;
    newHTMLLoader.addEventListener(air.Event.COMPLETE, this.windowLoaded);

    var alreadyOpen = false;
    jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(i, win) {
        if (win.title === 'Serebra Connect Alerts - Confirm') {
            alreadyOpen = true;
        }
    });
    if (!alreadyOpen) {
        newHTMLLoader.load(new air.URLRequest('app:/assets/html/OKPrompt.html'));
    }
};