Serebra.Chrome.WhatsThis = function(options) {

    this.Initialise = function() {
        var windowOptions = new air.NativeWindowInitOptions();
        windowOptions.systemChrome = air.NativeWindowSystemChrome.NONE;
        windowOptions.type = air.NativeWindowType.LIGHTWEIGHT;
        windowOptions.transparent = true;

        var windowBounds = new air.Rectangle(0, 0, 300, 300);

        var newHTMLLoader = air.HTMLLoader.createRootWindow(false, windowOptions, false, windowBounds);
        newHTMLLoader.paintsDefaultBackground = false;
        newHTMLLoader.stage.nativeWindow.alwaysInFront = true;
        newHTMLLoader.navigateInSystemBrowser = true;
        newHTMLLoader.addEventListener(air.Event.COMPLETE, this.CreateWindow);
        newHTMLLoader.load(new air.URLRequest('app:/assets/html/WhatsThis.html'));
    }

    this.CreateWindow = function(event) {
        var windowDom = jQuery('#message-popup', event.target.window.document).get(0);

        function closeWindow() {
            event.target.window.close();
            return false;
        }

        function moveWindow() {
            event.target.window.nativeWindow.startMove();
        }

        function setupDom() {
            jQuery('#window-handle', windowDom).bind('mousedown.move', moveWindow);
            jQuery('.close-button', windowDom).bind('click.close', closeWindow);
            jQuery('#ok-button', windowDom).bind('click.ok', closeWindow);
        }

        if (event.type === 'complete' && event.target.window.nativeWindow) {
            // Now we set up the window position
            event.target.window.nativeWindow.x = air.Screen.mainScreen.bounds.width - 300;
            event.target.window.nativeWindow.y = air.Screen.mainScreen.bounds.height - 240;
            setupDom();
            event.target.window.nativeWindow.visible = true;
        }

    }

    this.Initialise();
};