require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");

// Cliente que gestiona servicio AWS
const { RekognitionClient, DetectLabelsCommand } = require("@aws-sdk/client-rekognition");
// Cliente y comando para Textract 
const { TextractClient, DetectDocumentTextCommand } = require("@aws-sdk/client-textract");

// OPCIONAL (considerarse cuando se realice pruebas con FLOCI / MOCK)
const { mockClient } = require("aws-sdk-client-mock");
// Se pasa la clase RekognitionClient SIN COMILLAS:
const rekognition = mockClient(RekognitionClient);

// Definir la respuesta personalizada
rekognition.on(DetectLabelsCommand).resolves({
  Labels: [
    { Name: 'Hombre', Confidence: 99.4 },
    { Name: 'Niño', Confidence: 95.2 },
    { Name: 'Perro', Confidence: 80.1 },
    { Name: 'Mujer', Confidence: 98.4 }
  ]
});
// Mock para Textract (PDF: flocy - 99.9%)
const textractMock = mockClient(TextractClient);
textractMock.on(DetectDocumentTextCommand).resolves({
  Blocks: [
    {
      BlockType: "LINE",
      Text: "flocy",
      Confidence: 99.9
    }
  ]
});
// Fin mockup

const app = express();
const port = process.env.PORT || 3000;

// Clientes hacia Floci (endpoint local)
const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: 'http://localhost:4566',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test'
  }
});

const textractClient = new TextractClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: 'http://localhost:4566',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test'
  }
});

// Subida de imágenes (Rekognition)
const uploadImage = multer({ storage: multer.memoryStorage() });

// Subida de PDF con límite menor a 5 MB (Textract)
const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos en formato PDF'));
    }
  }
});

// Servir frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Ruta 1: Rekognition (Imágenes)
app.post('/api/analizar', uploadImage.single('imagen'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No adjuntó una imagen válida' });
    }

    const command = new DetectLabelsCommand({
      Image: { Bytes: req.file.buffer },
      MaxLabels: 10,
      MinConfidence: 75
    });

    const response = await rekognitionClient.send(command);

    res.json({
      success: true,
      labels: response.Labels
    });
  } catch (error) {
    console.error('Error en AWS Rekognition:', error);
    res.status(500).json({
      error: 'No se concretó el análisis en AWS Rekognition',
      details: error.message,
      code: error.name
    });
  }
});

// Ruta 2: Textract (PDF < 5 MB)
app.post('/api/analizar-documento', (req, res) => {
  uploadPdf.single('documento')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'El archivo excede el límite permitido de 5 MB' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Debe subir un archivo PDF válido' });
    }

    try {
      const command = new DetectDocumentTextCommand({
        Document: { Bytes: req.file.buffer }
      });

      const response = await textractClient.send(command);

      const lineas = (response.Blocks || [])
        .filter(b => b.BlockType === 'LINE')
        .map(b => ({
          text: b.Text,
          confidence: b.Confidence
        }));

      res.json({
        success: true,
        blocks: lineas
      });
    } catch (error) {
      console.error('Error en AWS Textract:', error);
      res.status(500).json({
        error: 'No se concretó el análisis en AWS Textract',
        details: error.message,
        code: error.name
      });
    }
  });
});

// Iniciar servidor Web
app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});