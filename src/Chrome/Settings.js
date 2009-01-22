Serebra.Chrome.Settings = function(options) {

    this.Initialise = function() {
        var windowOptions = new air.NativeWindowInitOptions();
        windowOptions.systemChrome = air.NativeWindowSystemChrome.NONE;
        windowOptions.type = air.NativeWindowType.NORMAL;
        windowOptions.transparent = true;

        var windowBounds = new air.Rectangle(0, 0, 500, 435);

        var newHTMLLoader = air.HTMLLoader.createRootWindow(false, windowOptions, false, windowBounds);
        newHTMLLoader.paintsDefaultBackground = false;
        newHTMLLoader.stage.nativeWindow.alwaysInFront = true;
        newHTMLLoader.navigateInSystemBrowser = true;
        newHTMLLoader.addEventListener(air.Event.COMPLETE, this.CreateWindow);
        newHTMLLoader.load(new air.URLRequest('app:/assets/html/Settings.html'));
    }

    this.CreateWindow = function(event) {
        var windowDom = jQuery('#options-window', event.target.window.document).get(0);

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

        function setupDom() {
            jQuery('#window-handle', windowDom).bind('mousedown.move', moveWindow);
            jQuery('.close-button', windowDom).bind('click.close', closeWindow);
            jQuery('.min-button', windowDom).bind('click.min', minimiseWindow);

            jQuery('#autostart', windowDom).attr('checked', Serebra.AutoStart);
            //jQuery('#display-answers', windowDom).attr('checked', Serebra.DisplayPopupsAnswers);
            //jQuery('#display-awards', windowDom).attr('checked', Serebra.DisplayPopupsAwards);
            //jQuery('#display-bids', windowDom).attr('checked', Serebra.DisplayPopupsBids);
            //jQuery('#display-messages', windowDom).attr('checked', Serebra.DisplayPopupsMessages);
            jQuery('#display-popup', windowDom).attr('checked', Serebra.DisplayPopups);
            //jQuery('#display-questions', windowDom).attr('checked', Serebra.DisplayPopupsQuestions);
            jQuery('#popup-sound', windowDom).attr('checked', Serebra.PlayPopupSound);
            jQuery('#checktime option', windowDom).each(function() {
                if (jQuery(this).val() == Serebra.MessageCheckTime) {
                    jQuery(this).attr('selected', 'selected');
                }
            });

            jQuery('.save', windowDom).bind('click.save',
            function() {
                Serebra.AutoStart = jQuery('#autostart', windowDom).attr('checked');
                Serebra.DisplayPopups = jQuery('#display-popup', windowDom).attr('checked');
                //Serebra.DisplayPopupsAnswers = jQuery('#display-answers', windowDom).attr('checked');
                //Serebra.DisplayPopupsAwards = jQuery('#display-awards', windowDom).attr('checked');
                //Serebra.DisplayPopupsBids = jQuery('#display-bids', windowDom).attr('checked');
                //Serebra.DisplayPopupsMessages = jQuery('#display-messages', windowDom).attr('checked');
                //Serebra.DisplayPopupsQuestions = jQuery('#display-questions', windowDom).attr('checked');
                Serebra.PlayPopupSound = jQuery('#popup-sound', windowDom).attr('checked');
                Serebra.RememberMe = jQuery('#rememberme', windowDom).attr('checked');
                Serebra.MessageCheckTime = jQuery('#checktime', windowDom).val();

                Serebra.Database.SaveOrCreateOption({
                    'key': 'autostart',
                    'value': Serebra.AutoStart
                });
                Serebra.Database.SaveOrCreateOption({
                    'key': 'displaypopups',
                    'value': Serebra.DisplayPopups
                });

                /**
								Serebra.Database.SaveOrCreateOption({
                    'key': 'show_answers',
                    'value': Serebra.DisplayPopupsAnswers
                });
								Serebra.Database.SaveOrCreateOption({
                    'key': 'show_awards',
                    'value': Serebra.DisplayPopupsAwards
                });
								Serebra.Database.SaveOrCreateOption({
                    'key': 'show_bids',
                    'value': Serebra.DisplayPopupsBids
                });
								Serebra.Database.SaveOrCreateOption({
                    'key': 'show_messages',
                    'value': Serebra.DisplayPopupsMessages
                });
								Serebra.Database.SaveOrCreateOption({
                    'key': 'show_questions',
                    'value': Serebra.DisplayPopupsQuestions
                });
								*/

                Serebra.Database.SaveOrCreateOption({
                    'key': 'checktime',
                    'value': Serebra.MessageCheckTime
                });
                Serebra.Database.SaveOrCreateOption({
                    'key': 'popupsound',
                    'value': Serebra.PlayPopupSound
                });

                if (!Serebra.DebugMode) {
                    air.NativeApplication.nativeApplication.startAtLogin = Serebra.AutoStart;
                }

                Serebra.Network.MessageCheckTimer.stop();
                Serebra.Network.MessageCheckTimer.delay = Serebra.MessageCheckTime;
                Serebra.Network.MessageCheckTimer.start();

                /**
								Serebra.IgnoreArray = [];
								Serebra.IgnoreArray.push(['ANSWER', Serebra.DisplayPopupsAnswers]);
								Serebra.IgnoreArray.push(['AWARD', Serebra.DisplayPopupsAwards]);
								Serebra.IgnoreArray.push(['BID', Serebra.DisplayPopupsBids]);
								Serebra.IgnoreArray.push(['MESSAGE', Serebra.DisplayPopupsMessages]);
								Serebra.IgnoreArray.push(['QUESTION', Serebra.DisplayPopupsQuestions]);
								**/

                Serebra.Chrome.OKPrompt("Your settings will take affect the next time you log in.",
                function() {
                    event.target.window.close();
                });
                return false;
            });

            event.target.window.nativeWindow.orderToFront();
        }

        if (event.type === 'complete' && event.target.window.nativeWindow) {
            // Now we set up the window position
            var centerX = air.Screen.mainScreen.bounds.width / 2;
            var centerY = air.Screen.mainScreen.bounds.height / 2;
            event.target.window.nativeWindow.x = centerX - (event.target.window.nativeWindow.width / 2);
            event.target.window.nativeWindow.y = centerY - (event.target.window.nativeWindow.height / 2);
            setupDom();
            event.target.window.nativeWindow.visible = true;
        }

    }

    this.Initialise();
};