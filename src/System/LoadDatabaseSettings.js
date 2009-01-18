Serebra.System.LoadDatabaseSettings = function(callback) {
    var dbValues = Serebra.Database.Query({
        'queryString': 'SELECT * FROM serebra_options'
    });
    if (dbValues.result.data) {
        jQuery.each(dbValues.result.data,
        function(i, item) {
            switch (item.key) {
            case "autostart":
                Serebra.AutoStart = ((item.value === "true") ? true : false);
                break;
            case "checktime":
                Serebra.MessageCheckTime = parseInt(item.value, 10);
                break;
            case "password":
                Serebra.Password = item.value;
                break;
            case "rememberme":
                Serebra.RememberMe = ((item.value === "true") ? true : false);
                break;
            case "username":
                Serebra.Username = item.value;
                break;
            case "displaypopups":
                Serebra.DisplayPop = ((item.value === "true") ? true : false);
                break;
            case "popupsound":
                Serebra.PlayPopupSound = ((item.value === "true") ? true : false);
                break;
			case "show_answers":
                Serebra.DisplayPopupsAnswers = ((item.value === "true") ? true : false);
                break;
			case "show_awards":
                Serebra.DisplayPopupsAwards = ((item.value === "true") ? true : false);
                break;
			case "show_bids":
                Serebra.DisplayPopupsBids = ((item.value === "true") ? true : false);
                break;
			case "show_messages":
                Serebra.DisplayPopupsMessages = ((item.value === "true") ? true : false);
                break;
			case "show_questions":
                Serebra.DisplayPopupsQuestions = ((item.value === "true") ? true : false);
                break;
            default:
                //Do nothing
                break;
            }
        });
    }
    if (typeof callback === 'function') {
        return callback();
    } else {
        throw new Error('You must return a callback with this function');
    }
};
