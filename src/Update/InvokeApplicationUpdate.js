Serebra.Update.ShowFail = false;

Serebra.Update.InvokeApplicationUpdate = function(options) {
    function defaults() {
        return {
            'updateXML': ''
        };
    }
    options = jQuery.extend(defaults(), options);
    var request = new air.URLRequest(options.updateXML);
    var loader = new air.URLLoader();
    Serebra.Update.ShowFail = options.displayFail;
    loader.addEventListener(air.Event.COMPLETE, Serebra.Update.AppVersionCheck);
    loader.load(request);
};
