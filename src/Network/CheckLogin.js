Serebra.Network.CheckLogin = function(options) {
    Serebra.SOAP.Authenticate({
        'username': Serebra.Username,
        'password': Serebra.Password,
        'applicationCode': Serebra.ApplicationCode
    },
    function(soapDocument) {
        var errorCode = jQuery('errorFlag', soapDocument).text();
        if (errorCode == "false") {
            Serebra.LoggedIn = true;
            Serebra.AuthCode = jQuery('authCode', soapDocument).text();
            Serebra.Menu.CreateSystrayMenu();
			
			Serebra.IgnoreArray.push(['ANSWER', Serebra.DisplayPopupsAnswers]);
			Serebra.IgnoreArray.push(['AWARD', Serebra.DisplayPopupsAwards]);
			Serebra.IgnoreArray.push(['BID', Serebra.DisplayPopupsBids]);
			Serebra.IgnoreArray.push(['MESSAGE', Serebra.DisplayPopupsMessages]);
			Serebra.IgnoreArray.push(['QUESTION', Serebra.DisplayPopupsQuestions]);
			
			Serebra.Database.UserTable(function() {
				Serebra.Network.Initialize(Serebra.MessageCheckTime);
            	Serebra.Chrome.AlertCenter();
			});
        } else {
            var errorMessage = jQuery('errorString', soapDocument).text();
            if (errorMessage === '') {
                errorMessage = 'Unknown Error';
            }
            Serebra.Errors.push('Login Error: ' + errorMessage);
            Serebra.Chrome.LoginWindow(function(results) {
                Serebra.Network.CheckLogin(results);
            });
        }
    });
};
