Serebra.SOAP.ConsumeAlert = function(values, callback) {
    var output = [];
    output.push('<?xml version="1.0" encoding="UTF-8"?>' + "\n\n");
    output.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
    output.push('<soapenv:Body>');
    output.push('<consumeAlert xmlns="http://DefaultNamespace">');
    output.push('<authCode>' + values.authCode + '</authCode>');
    output.push('<applicationCode>' + values.applicationCode + '</applicationCode>');
    output.push('<alertID>' + values.alertID + '</alertID>');
    output.push('</consumeAlert>');
    output.push('</soapenv:Body>');
    output.push('</soapenv:Envelope>');
    Serebra.SOAP.GetResponse(output.join(''), callback);
};
