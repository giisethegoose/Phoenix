"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Path_1 = require("../Path");
var RepoInfo_1 = require("../../RepoInfo");
var util_1 = require("../util");

function decodePath(pathString) {
    var pathStringDecoded = '';
    var pieces = pathString.split('/');
    for (var i = 0; i < pieces.length; i++) {
        if (pieces[i].length > 0) {
            var piece = pieces[i];
            try {
                piece = decodeURIComponent(piece.replace(/\+/g, ' '));
            } catch (e) {}
            pathStringDecoded += '/' + piece;
        }
    }
    return pathStringDecoded;
}

exports.parseRepoInfo = function (dataURL) {
    var parsedUrl = exports.parseURL(dataURL),
        namespace = parsedUrl.subdomain;
    if (parsedUrl.domain === 'firebase') {
        util_1.fatal(parsedUrl.host + ' is no longer supported. ' + 'Please use <YOUR FIREBASE>.firebaseio.com instead');
    }

    if (!namespace || namespace == 'undefined') {
        util_1.fatal('Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com');
    }
    if (!parsedUrl.secure) {
        util_1.warnIfPageIsSecure();
    }
    var webSocketOnly = parsedUrl.scheme === 'ws' || parsedUrl.scheme === 'wss';
    return {
        repoInfo: new RepoInfo_1.RepoInfo(parsedUrl.host, parsedUrl.secure, namespace, webSocketOnly),
        path: new Path_1.Path(parsedUrl.pathString)
    };
};

exports.parseURL = function (dataURL) {
    var host = '',
        domain = '',
        subdomain = '',
        pathString = '';

    var secure = true,
        scheme = 'https',
        port = 443;

    if (typeof dataURL === 'string') {
        var colonInd = dataURL.indexOf('//');
        if (colonInd >= 0) {
            scheme = dataURL.substring(0, colonInd - 1);
            dataURL = dataURL.substring(colonInd + 2);
        }

        var slashInd = dataURL.indexOf('/');
        if (slashInd === -1) {
            slashInd = dataURL.length;
        }
        host = dataURL.substring(0, slashInd);
        pathString = decodePath(dataURL.substring(slashInd));
        var parts = host.split('.');
        if (parts.length === 3) {
            domain = parts[1];
            subdomain = parts[0].toLowerCase();
        } else if (parts.length === 2) {
            domain = parts[0];
        }

        colonInd = host.indexOf(':');
        if (colonInd >= 0) {
            secure = scheme === 'https' || scheme === 'wss';
            port = parseInt(host.substring(colonInd + 1), 10);
        }
    }
    return {
        host: host,
        port: port,
        domain: domain,
        subdomain: subdomain,
        secure: secure,
        scheme: scheme,
        pathString: pathString
    };
};