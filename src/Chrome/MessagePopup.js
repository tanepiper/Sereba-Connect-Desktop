Serebra.Chrome.MessagePopup = function(options) {
  this.windowLoaded = function(event) {
      var thisWindow = event.target.window.nativeWindow;
      var thisDocument = event.target.window.document;

      if (thisWindow && thisDocument) {
          thisWindow.x = air.Screen.mainScreen.bounds.width - 255;
          thisWindow.y = 0;

          function closeWindow() {
              thisWindow.close();
          }

          var closeTimer = new air.Timer(6000, 1);
          closeTimer.addEventListener(air.TimerEvent.TIMER_COMPLETE, closeWindow);

          // Before we display the screen, we want to set it up
          var popupDom = jQuery('#message-popup', thisDocument).get(0);
          // Now lets set up the fields
          jQuery('#window-handle', popupDom).bind('mousedown.move',
          function() {
              thisWindow.startMove();
          });
          jQuery('.close-button', popupDom).click(function() {
              thisWindow.close();
              return false;
          });

          jQuery('.open-message-center', popupDom).click(function() {
              closeTimer.stop();
              jQuery('#message-popup', thisDocument).remove();
              thisWindow.close();
              Serebra.Chrome.MessageCenter();
              return false;
          });

          if (Serebra.PlayPopupSound === 'true') {
              var sound = new air.Sound();
              sound.addEventListener(air.Event.COMPLETE, onSoundLoaded);
              var req = new air.URLRequest("app:/assets/sounds/new_message.mp3");
              sound.load(req);

              function onSoundLoaded(event) {
                  var localSound = event.target;
                  localSound.play();
              }
          }

          jQuery('.message', popupDom).html('<h2>You have <span class="green">' + options.messageCount + '</span> new alerts!</h2>');
          closeTimer.start();
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
      if (win.title === 'Serebra Connect Alerts - Notification') {
          alreadyOpen = true;
      }
  });
  if (!alreadyOpen) {
      newHTMLLoader.load(new air.URLRequest('app:/assets/html/MessagePopup.html'));
  }
};
