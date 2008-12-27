
Serebra.Messages.DeleteMessage = function(id, callback) {
	var deleted = false;
	
	var thisMessage = Serebra.Database.Query({
  	'queryString': 'SELECT * FROM serebra_user_alerts WHERE AlertID = ' + id
  });
	
	if (thisMessage.result.data) {
		if (!thisMessage.result.data[0].messageRead) {
			Serebra.SOAP.ConsumeAlert({
				'authCode': Serebra.AuthCode,
				'applicationCode': Serebra.ApplicationCode,
				'alertID': id
			}, function(soapDocument) {
				var errorCode = jQuery('errorFlag', soapDocument).text();
				var errorString = jQuery('errorString', soapDocument).text();
				var deleteRow;
				if (errorCode == "false") {
					deleteRow = Serebra.Database.Query({
						'queryString': 'DELETE FROM serebra_user_alerts WHERE AlertID = ' + id
					});
					if (deleteRow.success) {
						deleted = true;
					}
				} else if (errorString == "you don't own that alert") {
					deleteRow = Serebra.Database.Query({
						'queryString': 'DELETE FROM serebra_user_alerts WHERE AlertID = ' + id
					});
					if (deleteRow.success) {
						deleted = true;
					}
				}
				return callback(deleted);
			});
		} else {
			var deleteRow = Serebra.Database.Query({
				'queryString': 'DELETE FROM serebra_user_alerts WHERE AlertID = ' + id
			});
			
			if (deleteRow.result.complete) {
				deleted = true;
			}
		}
	}
		
	return callback(deleted);
};
