'use strict';

const start = Date.now();
const express = require('express');
const bodyParser = require('body-parser');

const http = require('http');
const https = require('https');
const pem = require('pem');

require('./vulnerabilities/static');

const app = express();

app.use('/assets', express.static('public'));
//app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');

app.use('/xss_test', require('./vulnerabilities/xss/'));
app.use('/xss_objects', require('./vulnerabilities/xss/objects/'));
app.use('/sqli', require('./vulnerabilities/sqli/'));
app.use('/command_injection', require('./vulnerabilities/command_injection/'));
app.use('/unsafe_eval', require('./vulnerabilities/unsafe_eval/'));
app.use('/crypto', require('./vulnerabilities/crypto/'));
app.use('/parampollution', require('./vulnerabilities/parampollution/'));
app.use('/unvalidated-redirect', require('./vulnerabilities/unvalidated-redirect/'));
app.use('/path-traversal', require('./vulnerabilities/path-traversal/'));
app.use('/header-injection', require('./vulnerabilities/header-injection/'));
app.use('/csp-header-insecure', require('./vulnerabilities/csp-header-insecure'));
app.use('/config', require('./vulnerabilities/config/'));
app.use('/serialization', require('./vulnerabilities/serialization'));
app.use(require('./vulnerabilities/ssjs-injection')(app));

app.get('/', function (req, res) {
	res.render('pages/index');
});

app.get('/quit', function(req, res) {
	res.send('adieu, cherie');
	process.exit(); // eslint-disable-line
});

const port = process.env.PORT || 3000;
const isHttp = process.env.SSL !== '1' ? true : false;
const listener = ( ) => {
	var stop = Date.now();
	/* eslint-disable */
	console.log(`startup time: ${stop - start}`);
	console.log(`example app listening on port ${port}${isHttp ? '' : ', securely.'}`);
	/* eslint-enable */
};

/* Start Server based on protocol */
isHttp ?
	http.createServer(app).listen(port, listener) :
	pem.createCertificate({ days: 1, selfSigned: true }, ( err, keys ) => {
		if (err) { throw err; }
		https.createServer(
			{ key: keys.serviceKey, cert: keys.certificate },
			app).listen(port, listener);
	});
