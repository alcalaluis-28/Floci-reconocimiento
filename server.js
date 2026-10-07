require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");

// Cliente que gestiona servicio AWS
const { RekognitionClient, DetectLabelsCommand } = require("@aws-sdk/client-rekognition");

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
// Fin mockup

const app = express();
const port = process.env.PORT || 3000;

// Iniciar el servicio reconocimiento
const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: 'http://localhost:4566',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Configuración multer (upload archivos imagen)
const upload = multer({ storage: multer.memoryStorage() });

// Servicios archivo .html
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Ruta para procesar la imagen
app.post('/api/analizar', upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No adjuntó una imagen válida' });
    }

    // El buffer de la imagen subida
    const imageBuffer = req.file.buffer;

    // Configurar el comando para detectar etiquetas
    const params = {
      Image: { Bytes: imageBuffer },
      MaxLabels: 10,
      MinConfidence: 75
    };

    // Instanciar el comando de detección
    const command = new DetectLabelsCommand(params);
    const response = await rekognitionClient.send(command);

    // Enviar la respuesta al front como JSON
    res.json({
      success: true,
      labels: response.Labels
    });

  } catch (error) {
    console.error(`Error en el servicio AWS:`, error);
    res.status(500).json({
      error: 'No se concretó el análisis en AWS Rekognition',
      details: error.message,
      code: error.name
    });
  }
});

// Iniciamos el servidor Web
app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});