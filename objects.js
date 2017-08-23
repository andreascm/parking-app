//
// Transitional wrapper for API service design
// - currently served via the same origin
// - to move towards being served via api origin

var db = require('./db')

//
// STANDARD API RESPONSES
//
// Either success, fail, or error.
//
var error = {

	// Standard JSON response
	error : function(res, http_status_code, message) {
		if (!res) throw new Error('Response object required');
		if (!http_status_code) http_status_code = 520;
		if (!message) message = "Unknown Error";
		res.status(http_status_code).json({
			"error"   : http_status_code,
			"message" : message
		});
	},

	// Use these functions for clarity
	BadRequest          : function(res, msg) { this.error(res, 400, msg ? msg : 'Bad Request') },
	Unauthorized        : function(res, msg) { this.error(res, 401, msg ? msg : 'Unauthorized') },
	Forbidden           : function(res, msg) { this.error(res, 403, msg ? msg : 'Forbidden') },
	NotFound            : function(res, msg) { this.error(res, 404, msg ? msg : 'Not Found') },
	InternalServerError : function(res, msg) { this.error(res, 500, msg ? msg : 'Internal Server Error') }
}

var success = (res, json) => {
	if (typeof json !== 'object') json = {}
	json.success = true
	res.json(json)
}

var fail = (res, reason, json) => {
	if (typeof json !== 'object') json = {}
	if (typeof reason !== 'string') reason = reason.toString()
	json.success = false
	json.reason = reason
	res.json(json)
}

module.exports = (app, server, log) => {
	app.post('/api/create_item', (req, res) => {
		let item = {
			name: 		req.body.name,
			quantity: 	req.body.quantity
		}

		// TODO: validate all inputs, return BadRequest if inputs no good

		db.items.createItem(item, (itemErr, itemResult) => {
			if (itemErr) {
				log.info('create_item error createItem: ', itemErr)
				return error.InternalServerError(res)
			}

			if (itemResult === 'WN') {
				return fail(res, 'Name taken, try another one')
			}

			return success(res, itemResult)
		})
	})

	app.get('/api/all_item', (req, res) => {
		db.items.getAllItems({}, (itemErr, itemResult) => {
			if (itemErr) {
				return error.InternalServerError(res)
			} else {
				return success(res, itemResult)
			}
		})
	})
}