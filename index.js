'use strict';

const express = require('express'),
	requestProxy = require('express-request-proxy'),
	basicAuth = require("express-basic-auth"),
	fs = require('fs'),
	https = require('https'),
	cfg = require('./config/config'),
	secrets = require('./config/config-secrets'),
	app = express();

const config = Object.assign({}, cfg, secrets);

function getUnauthorizedResponse(req) {
  return req.auth ?
    ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected.') :
    'No credentials provided.'
}

https.createServer({
  key: fs.readFileSync(config.keyFile),
  cert: fs.readFileSync(config.certFile)
}, app).listen(31313);

const users = {};
users[config.username] = config.password;

app.use(basicAuth({
    users: users,
		challenge: true,
		realm: config.realm,
		unauthorizedResponse: getUnauthorizedResponse
}))

app.get("/", requestProxy({
		url: config.proxyUrl + "/video",
}));

app.get("/controls", requestProxy({
		url: config.proxyUrl,
}));
