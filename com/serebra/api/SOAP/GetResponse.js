
Serebra.SOAP.GetResponse = function(output, callback) {
	
	jQuery.ajax({
		'type':'POST',
		'url': 'http://qa.serebracampus.com:8888/apiWebService.cfc?wsdl',
		'contentType': 'text/xml',
		'data':output,
		'dataType':'xml',
		'processData': false,
		'beforeSend': function(xhr) {
			xhr.setRequestHeader("SOAPAction","http://qa.serebracampus.com:8888/apiWebService.cfc?wsdl");
		},
		'success': function(data) {
			return callback(data);
		},
		'error': function (XMLHttpRequest, textStatus, errorThrown) {
			return callback();
		}
	});
};
