const functions = require('firebase-functions');
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const Cors = require("cors");
const express = require("express");
const fileUpload = require("./cloud-function-file-upload");

const api = express().use(Cors({ origin: true }));
fileUpload("/picture", api);

admin.initializeApp(functions.config().firebase);

api.post("/picture", function (req, response, next) {
    uploadImageToStorage(req.files.file[0])
    .then(metadata => {
        response.status(200).json(metadata[0]);
        next();
    })
    .catch(error => {
        console.error(error);
        response.status(500).json({ error });
        next();
    });
});

exports.api = functions.https.onRequest(api);

const uploadImageToStorage = file => {
    const storage = admin.storage();
    return new Promise((resolve, reject) => {
        const fileUpload = storage.bucket().file(file.originalname);
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: "image/jpg"
            }
        });

        blobStream.on("error", error => reject(error));

        blobStream.on("finish", () => {
            fileUpload.getMetadata()
            .then(metadata => resolve(metadata))
            .catch(error => reject(error));
        });

    blobStream.end(file.buffer);
  });
}


//New function below



const bodyParser = require("body-parser");
const Busboy = require("busboy");
const getRawBody = require("raw-body");
const contentType = require("content-type");

module.exports = (path, app) => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use((req, res, next) => {
        if (req.rawBody === undefined && req.method === "POST" && req.headers["content-type"].startsWith("multipart/form-data")) {
            getRawBody(req, {
                length: req.headers["content-length"],
                limit: "3mb",
                encoding: contentType.parse(req).parameters.charset
            }, function(err, string) {
                if (err) return next(err)
                req.rawBody = string;
                next();
            })
        } else {
            next();
        }
    })

    app.use((req, res, next) => {
        if (req.method === "POST" && req.headers["content-type"].startsWith("multipart/form-data")) {
            const busboy = new Busboy({
                headers: req.headers
            });
            let fileBuffer = new Buffer("");
            req.files = {
                file: []
            };

            busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
                file.on("data", (data) => {
                    fileBuffer = Buffer.concat([fileBuffer, data]);
                });

                file.on("end", () => {
                    const file_object = {
                        fieldname,
                        originalname: filename,
                        encoding,
                        mimetype,
                        buffer: fileBuffer
                    };

                    req.files.file.push(file_object);
                    next();
                });
            });

            busboy.end(req.rawBody);
        } else {
            next();
        }
    })
}
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
