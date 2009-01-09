Serebra.System.LoadDatabaseSettings = function(callback) {
    var dbValues = Serebra.Database.Query({
        'queryString': 'SELECT * FROM serebra_options'
    });
    if (dbValues.result.data) {
        jQuery.each(dbValues.result.data,
        function(i, item) {
            switch (item.key) {
            case "autologin":
                Serebra.AutoLogin = item.value;
                break;
            case "autostart":
                Serebra.AutoStart = item.value;
                break;
            case "checktime":
                Serebra.MessageCheckTime = parseInt(item.value, 10);
                break;
            case "password":
                Serebra.Password = item.value;
                break;
            case "rememberme":
                Serebra.RememberMe = item.value;
                break;
            case "username":
                Serebra.Username = item.value;
                break;
            case "displaypopups":
                Serebra.DisplayPop = item.value;
                break;
            case "popupsound":
                Serebra.PlayPopupSound = item.value;
                break;
			case "show_answers":
                Serebra.DisplayPopupsAnswers = item.value;
                break;
			case "show_awards":
                Serebra.DisplayPopupsAwards = item.value;
                break;
			case "show_bids":
                Serebra.DisplayPopupsBids = item.value;
                break;
			case "show_messages":
                Serebra.DisplayPopupsMessages = item.value;
                break;
			case "show_questions":
                Serebra.DisplayPopupsQuestions = item.value;
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
