Serebra.Chrome.Popup = function(options) {

    this.Initialise = function() {
        var windowOptions = new air.NativeWindowInitOptions();
        windowOptions.systemChrome = air.NativeWindowSystemChrome.NONE;
        windowOptions.type = air.NativeWindowType.LIGHTWEIGHT;
        windowOptions.transparent = true;

        var windowBounds = new air.Rectangle(0, 0, 255, 155);

        var newHTMLLoader = air.HTMLLoader.createRootWindow(false, windowOptions, false, windowBounds);
        newHTMLLoader.paintsDefaultBackground = false;
        newHTMLLoader.stage.nativeWindow.alwaysInFront = true;
        newHTMLLoader.navigateInSystemBrowser = true;
        newHTMLLoader.addEventListener(air.Event.COMPLETE, this.CreateWindow);
        newHTMLLoader.load(new air.URLRequest('app:/assets/html/MessagePopup.html'));
    }

    this.CreateWindow = function(event) {
        var windowDom = jQuery('#message-popup', event.target.window.document).get(0);
        var popupLife = new air.Timer(options.popupLife, 1);

        function closeWindow() {
            event.target.window.close();
            return false;
        }

        function moveWindow() {
            event.target.window.nativeWindow.startMove();
        }

        function playSound() {

            function onSoundLoaded(event) {
                var localSound = event.target;
                localSound.play();
            }

            var sound = new air.Sound();
            sound.addEventListener(air.Event.COMPLETE, onSoundLoaded);
            var req = new air.URLRequest("app:/assets/sounds/new_message.mp3");
            sound.load(req);
        }

        function openMessageCenter() {
            popupLife.stop();
            Serebra.Chrome.AlertCenter();
            closeWindow();
            return false;
        }

        function setupDom() {
            jQuery('#window-handle', windowDom).bind('mousedown.move', moveWindow);
            jQuery('.close-button', windowDom).bind('click.close', closeWindow);
            jQuery('.message', windowDom).html(options.message);
            if (options.showLink) {
                jQuery('.open-message-center', windowDom).css({
                    'display': 'block'
                })
                .bind('click.messageCenter', openMessageCenter);
            }
        }
        
        if (event.type === 'complete' && event.target.window.nativeWindow) {
            // Now we set up the window position
            event.target.window.nativeWindow.x = air.Screen.mainScreen.bounds.width - 255;
            event.target.window.nativeWindow.y = 0;
            event.target.window.nativeWindow.addEventListener(air.Event.ACTIVATE, setupDom);
            popupLife.addEventListener( air.TimerEvent.TIMER, closeWindow );
            event.target.window.nativeWindow.activate();
            if (Serebra.PlayPopupSound === 'true') {
              playSound();
            }
            event.target.window.nativeWindow.visible = true;
            popupLife.start();
        }

    }

    this.Initialise();
};