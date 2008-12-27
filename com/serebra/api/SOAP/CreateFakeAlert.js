
Serebra.SOAP.CreateFakeAlert = function(values, callback) {
	var output = [];
	output.push('<?xml version="1.0" encoding="UTF-8"?>' + "\n\n");
	output.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
		output.push('<soapenv:Body>');
			output.push('<fakeAlert xmlns="http://DefaultNamespace">');
				output.push('<taskID>100786</taskID>');
				output.push('<userID>100037</userID>');
				output.push('<alertTypeID>6</alertTypeID>');
				output.push('<msgSenderUserID>0</msgSenderUserID>');
				output.push('<questionUserID>100037</questionUserID>');
				output.push('<bidID>0</bidID>');
			output.push('</fakeAlert>');
		output.push('</soapenv:Body>');
	output.push('</soapenv:Envelope>');
	Serebra.SOAP.GetResponse(output.join(''), callback);
};
