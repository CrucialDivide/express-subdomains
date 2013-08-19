/*!
 * express-subdomains
 * Copyright(c) Thomas Blobaum
 * MIT Licensed
 */

var domain = "",
	subs = [{ base: '.' }],
	_ = require("lodash"),
	Sequence = require('sequence');

module.exports = {
	use: function (base, options) {
		options = options || {}
		subs.unshift({
			"base": base,
			"options": options,
			"pathMatch": options.pathMatch || null
		});
		return this;
	},
	domain: function (url) {
		domain = url;
		return this;
	},
	init: function() {
		subs = _.sortBy(subs, "pathMatch");
	},
	middleware: function (req, res, next) {
		//subs = _.sortBy(subs, "pathMatch");

		var matched = _.find(subs,
			function(item) {
				console.log("find.1", item, req.url, RegExp("^"+item.pathMatch,"i"), RegExp("^"+item.pathMatch,"i").test(req.url));
				return (RegExp("^"+item.pathMatch,"i").test(req.url));
			}
		)

		if (!_.isEmpty(matched)) {
			console.warn("matched", req.url, matched);
			next();
		} else {
			console.error("not matched", req.url, matched);
			/*
			_.each(subs,
				function(item, i, arr){

					//= RegExp('^/(js|images|styles|mixins|components)/',i) - pathSkipRx.test(req.url)
					var regexp = item.base;
					if (regexp !== '.') { regexp = "^" + regexp + "\\."; }
					if (domain) { regexp = regexp + domain + "(:[0-9]*)?$"; }

					console.log("express-subdomains.1", regexp, req.headers.host, item);
					if (RegExp(regexp, "gi").test(req.headers.host)) {
						if (item.base !== '.') {
							if (req.url === '/') {
								req.url = '';
							}
							req.url = '/' + item.base + req.url;
						}
						console.log("express-subdomains.2", req.url);
						next();
					}

				}
			)
			next();
			*/

			forEachAsync(subs, function (fn, item, i, arr) {
				//= RegExp('^/(js|images|styles|mixins|components)/',i) - pathSkipRx.test(req.url)
				var regexp = item.base;
				if (regexp !== '.') { regexp = "^" + regexp + "\\."; }
				if (domain) { regexp = regexp + domain + "(:[0-9]*)?$"; }

				console.log("express-subdomains.1", regexp, req.headers.host, item);
				if (RegExp(regexp, "gi").test(req.headers.host)) {
					if (item.base !== '.') {
						if (req.url === '/') {
							req.url = '';
						}
						req.url = '/' + item.base + req.url;
					}
					console.log("express-subdomains.2", req.url);
					next();
				} else {
					console.log("express-subdomains.3");
					fn();
				}
			});

		}

	}
};

function forEachAsync(arr, callback) {
	var sequence = Sequence();
	function handleItem(item, i, arr) {
		sequence.then(function (next) {
			callback(next, item, i, arr);
		});
	}
	arr.forEach(handleItem);
	return sequence;
}
