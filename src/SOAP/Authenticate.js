Serebra.SOAP.Authenticate = function(values, callback) {
    var output = [];
    output.push('<?xml version="1.0" encoding="UTF-8"?>' + "\n\n");
    output.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
    output.push('<soapenv:Body>');
    output.push('<authenticate xmlns="http://DefaultNamespace">');
    output.push('<username>' + values.username + '</username>');
    output.push('<password>' + values.password + '</password>');
    output.push('<applicationCode>' + values.applicationCode + '</applicationCode>');
    output.push('</authenticate>');
    output.push('</soapenv:Body>');
    output.push('</soapenv:Envelope>');
    Serebra.SOAP.GetResponse(output.join(''), callback);
};
