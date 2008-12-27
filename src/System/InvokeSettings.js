Serebra.System.InvokeSettings = function(AppArguments, CurrentDir, callback) {

    var fileStream = new air.FileStream();
    var settingsFile = air.File.applicationDirectory.resolvePath('settings.xml');

    jQuery.each(AppArguments,
    function(i, argument) {
        switch (argument) {
        case "debug-mode":
            Serebra.DebugMode = true;
            break;
        case "force-update":
            Serebra.ForceUpdate = true;
            break;
        case "force-offline":
            Serebra.ForceOffline = true;
            break;
        default:
            // Do nothing
            break;
        }
    });

    jQuery.get(settingsFile.url, null,
    function(data, success) {

        Serebra.ApplicationName = jQuery('appname', data).text();
        Serebra.ApplicationCode = jQuery('appcode', data).text();
        Serebra.DatabaseFileName = jQuery('database', data).text();

        if (typeof callback === 'function') {
            return callback();
        } else {
            throw new Error('You must return a callback with this function');
        }
    },
    'xml');
};
