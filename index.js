/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
/* eslint-disable */

const { onRequest } = require("firebase-functions/v2/https");
const documentai = require("@google-cloud/documentai");
const Busboy = require('busboy'); // For parsing multipart/form-data

exports.processDocument = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("HTTP Method " + req.method + " not allowed");
  }

  let imageBuffer = Buffer.alloc(0);

  const busboy = new Busboy({ headers: req.headers });
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    let buffers = [];
    file.on('data', data => {
      buffers.push(data);
    });
    file.on('end', () => {
      imageBuffer = Buffer.concat(buffers);
    });
  });

  busboy.on('finish', async () => {
    const base64Image = imageBuffer.toString('base64');

    const projectId = "backend-a6b45";
    const location = "us";
    const processorId = "9f227b48a1f99ecb";
    const client = new documentai.v1.DocumentProcessorServiceClient();
    const name = client.processorPath(projectId, location, processorId);

    const request = {
      name: name,
      rawDocument: {
        content: base64Image,
        mimeType: "image/jpeg", // adjust as needed
      },
    };

    try {
      const [result] = await client.processDocument(request);
      res.status(200).send(result);
    } catch (error) {
      console.error("Error processing document:", error);
      res.status(500).send("Error processing document");
    }
  });

  busboy.end(req.rawBody);
});



// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
