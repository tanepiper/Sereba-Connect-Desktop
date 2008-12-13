Serebra.SOAP = {};

Serebra.SOAP.GetResponse = function(output, callback) {
	var xmlhttp;
	var appXML;
	var url = "http://qa.serebracampus.com:8888/apiWebService.cfc?wsdl";
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", url, true);					
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4) {
			return callback(xmlhttp.responseText);
		}
	}
			
	xmlhttp.setRequestHeader("Content-Type", "text/xml");
	xmlhttp.setRequestHeader('SOAPAction','http://qa.serebracampus.com:8888/apiWebService.cfc?wsdl');
	
	xmlhttp.send(output);
}

Serebra.SOAP.Authenticate = function(values, callback) {
	var output = [];
	output.push('<?xml version="1.0" encoding="UTF-8"?>' + "\n\n");
	output.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
		output.push('<soapenv:Body>');
			output.push('<authenticate xmlns="http://DefaultNamespace">');
				output.push('<username>'+values.username+'</username>');
				output.push('<password>'+values.password+'</password>');
				output.push('<applicationCode>'+values.applicationCode+'</applicationCode>');
			output.push('</authenticate>');
		output.push('</soapenv:Body>');
	output.push('</soapenv:Envelope>');
	Serebra.SOAP.GetResponse(output.join(''), callback);
};

Serebra.SOAP.GetUserAlerts = function(values, callback) {
	var output = [];
	output.push('<?xml version="1.0" encoding="UTF-8"?>' + "\n\n");
	output.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
		output.push('<soapenv:Body>');
			output.push('<getUserAlerts xmlns="http://DefaultNamespace">');
				output.push('<authCode>'+values.authCode+'</authCode>');
				output.push('<applicationCode>'+values.applicationCode+'</applicationCode>');
			output.push('</getUserAlerts>');
		output.push('</soapenv:Body>');
	output.push('</soapenv:Envelope>');
	Serebra.SOAP.GetResponse(output.join(''), callback);
}

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
}