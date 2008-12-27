
Serebra.Database.SaveOrCreateOption = function(options) {
	/**
	 * Default options for a query
	 * @param {String} queryString The query string to be passed to the database
	 */
	function defaults(){
		return {
			'key': '',
			'value': '',
			'overwrite': true
		};
	}
	options = jQuery.extend(defaults(), options);
 	var exists = false;
	var result;
	
	//First we do a search for the item
	var checkExists = Serebra.Database.Query({
		'queryString': 'SELECT * FROM serebra_options WHERE key = "'+options.key+'"'
	});
	
	if (checkExists.result.data) {
		result = null;
		if (options.overwrite) {
			result = Serebra.Database.Query({
				'queryString': 'UPDATE serebra_options SET value = "'+options.value+'" WHERE key = "'+options.key+ '"'
			});
		}
		exists = true;
	} else {
		exists = false;
		result = Serebra.Database.Query({
			'queryString': 'INSERT INTO serebra_options (key, value) VALUES("' + options.key + '", "' + options.value + '")'
		});
	}
	return {'exists':exists, 'result':result};
};
