Serebra.Window = {};

/**
 * The function to create new windows.  Depending on the type, it will always return the NativeWindow and may also pass the HTMLLoader
 * @param {Object} options The object that contains the options for the window
 * @param {Object} callback The callback function that will contain the window as parameters
 */
Serebra.Window.CreateNewWindow = function(options, callback){
	
	/**
	 * Default options for creating a new window
	 * @param {Boolean} maximizable Determines if the window is maximizable or not
	 * @param {Boolean} minimizable Determines if the window is minimizable or not
	 * @param {Boolean} resizable Determines if the window is resizable or not
	 * @param {String} systemChrome Selects the system chrome to use (none or standard)
	 * @param {Boolean} transparent Determines if the window is transparent or not
	 * @param {String} type Determines the type of window
	 * @param {Array} position The X/Y co-ordinates of the window on the screen
	 * @param {Array} size The width/height of the window
	 * @param {Boolean} visible Determines if the window is visible or not
	 * @param {Boolean} scrollBarsVisible Determines if the window scrollbars are visible or not
	 * @param {Boolean} alwaysInFront Determines if the window is always in front (modal) or not
	 * @param {String} content Determines if the window has content or not (will use HTMLLoader if there is)
	 * @param {String} title Sets the window title for a NativeWindow
	 */
    function defaults(){
        return {
            'maximizable': true,
            'minimizable': true,
            'resizable': true,
            'systemChrome': 'standard',
            'transparent': false,
            'type': 'normal',
            'position': [200, 200],
            'size': [800, 600],
            'visible': true,
            'scrollBarsVisible': true,
            'alwaysInFront': false,
            'content': '',
            'title': 'New Serebra Connect Desktop Window'
        }
    }
    
    var options = jQuery.extend(defaults(), options);
    var windowOptions = new air.NativeWindowInitOptions();
    
    windowOptions.maximizable = options.maximizable;
    windowOptions.minimizable = options.minimizable;
    windowOptions.resizable = options.resizable
    windowOptions.systemChrome = options.systemChrome;
    windowOptions.transparent = options.transparent;
    windowOptions.type = options.type;
    
    var windowBounds = new air.Rectangle(options.position[0], options.position[1], options.size[0], options.size[1]);
    
    if (options.content === '') {
        var newWindow = new air.NativeWindow(windowOptions);
        newWindow.alwaysInFront = options.alwaysInFront;
        newWindow.bounds = windowBounds;
        newWindow.title = options.title;
        if (typeof callback === 'function') {
            return callback(newWindow);
        }
    }
    else {
        var newHTMLLoader = air.HTMLLoader.createRootWindow(options.visible, windowOptions, options.scrollBarsVisible, windowBounds);
        if (typeof callback === 'function') {
					newHTMLLoader.addEventListener(air.Event.COMPLETE, callback);
				}
        newHTMLLoader.load(new air.URLRequest(options.content));
    }
    
    
    return true;
};

/**
 * Allows control of a window by passing the title and state to show or hide
 * @param {Object} title The title of the window you want to control
 * @param {Object} state The state you want to place the window in (show/hide)
 */
Serebra.Window.ShowHideWindow = function( title, state ) {
	jQuery.each(air.NativeApplication.nativeApplication.openedWindows, function(i, thisWindow){
		if (thisWindow.title === title) {
			if (state === 'hide' && thisWindow.visible) {
				thisWindow.visible = false;
			} else if (state === 'show' && !thisWindow.visible) {
				thisWindow.visible = true;
			}	
		}
	});
};

/**
 * Controls the state of all windows to show or hide
 * @param {Object} state The state you want to place the windows in (show/hide)
 */
Serebra.Window.ShowHideAllWindows = function( state ) {
	jQuery.each(air.NativeApplication.nativeApplication.openedWindows, function(i, thisWindow){
		if (state === 'hide' && thisWindow.visible) {
			thisWindow.visible = false;
		} else if (state === 'show' && !thisWindow.visible) {
			if (thisWindow.title !== 'Never Show Me') {
				thisWindow.visible = true;
			}
		}
	});
};

Serebra.Window.ShowOptionsWindow = function() {
	var sizeWidth = air.Screen.mainScreen.visibleBounds.width - 800;
	var sizeHeight = air.Screen.mainScreen.visibleBounds.height - 600;
	
	Serebra.Window.CreateNewWindow({
		'content':'app:/assets/html/OptionsWindow.html',
		'maximizable': false,
		'minimizable': false,
		'resizable' : false,
		'systemChrome': 'none',
		'transparent': true,
		'scrollBarsVisible': false,
		'position': [sizeWidth, sizeHeight],
		'size': [640, 480]
	}, function ( event ){
			//air.Introspector.Console.log();
				var optionsWindow = jQuery('#options-container', event.target.window.document).get(0);
				jQuery('#handle', optionsWindow).bind('mousedown.move', function(){
						event.target.window.nativeWindow.startMove();
				});
				jQuery('.close-button', optionsWindow).click(function(){
						event.target.window.nativeWindow.close();
				});
	});
}
