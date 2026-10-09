
# 🚀 Integración de Servicios AWS: Rekognition y Textract

Aplicación web desarrollada con **Node.js** y **Express** para el análisis inteligente de imágenes y la extracción de texto de documentos PDF. Utiliza **AWS SDK v3**, una interfaz responsiva con **Bulma CSS** y simulación local de servicios mediante `aws-sdk-client-mock` sobre **LocalStack**.

---

## ⚙️ Clonación e instalación

### 1. Clonar el repositorio

```bash
git clone <https://github.com/alcalaluis-28/Floci-reconocimiento>
cd <Floci-reconocimiento>
```

### 2. Instalar las dependencias

```bash
npm install
```

Si todavía no están instaladas las dependencias necesarias, ejecuta:

```bash
npm install express multer dotenv
npm install @aws-sdk/client-rekognition @aws-sdk/client-textract
npm install --save-dev aws-sdk-client-mock
```

### 3. Configurar las variables de entorno

Crea un archivo `.env` en la raíz del proyecto y agrega la siguiente configuración:

```env
PORT=3000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_ENDPOINT=http://localhost:4566
```

**Importante:** Estas credenciales son de prueba. El endpoint `http://localhost:4566` corresponde al puerto predeterminado de LocalStack. Asegúrate de que el servicio esté instalado, configurado y en ejecución si tu aplicación lo utiliza.

### 4. Iniciar el servidor

```bash
node server.js
```

### 5. Abrir la aplicación

Abre tu navegador y accede a:

http://localhost:3000

---

## 🛠️ Tecnologías utilizadas

- **Node.js:** entorno de ejecución de JavaScript.
- **Express:** framework para desarrollar el servidor y las rutas de la API.
- **Multer:** middleware para recibir y procesar archivos mediante `multipart/form-data` en memoria.
- **AWS SDK v3:** integración con los servicios de AWS Rekognition y AWS Textract.
- **aws-sdk-client-mock:** biblioteca para simular las llamadas y respuestas de los clientes de AWS durante las pruebas.
- **LocalStack:** entorno local para simular determinados servicios de AWS, si está configurado en el proyecto.
- **Bulma CSS:** framework CSS para construir una interfaz web responsiva.

---

## 📋 Funcionalidades

### 1. 🖼️ Análisis de imágenes con AWS Rekognition

**Endpoint:** `/api/analizar`

- Permite subir imágenes para su análisis.
- Procesa los archivos en memoria mediante Multer.
- Valida los formatos de imagen admitidos por la aplicación: JPEG, PNG y WebP.
- Utiliza `DetectLabelsCommand` para identificar etiquetas y objetos en las imágenes.
- Permite simular respuestas con etiquetas personalizadas, como Hombre, Niño, Perro y Mujer, cuando se utilizan mocks configurados para ese propósito.

### 2. 📄 Extracción de texto con AWS Textract

**Endpoint:** `/api/analizar-documento`

- Permite cargar documentos en formato PDF.
- Aplica un límite de tamaño inferior a 5 MB, según la validación implementada.
- Utiliza `DetectDocumentTextCommand` para extraer texto de documentos.
- Permite simular respuestas de extracción de texto y valores de confianza, como `99.9%`, mediante mocks configurados para ese propósito.

**Nota:** Los resultados simulados son datos de prueba y no representan necesariamente el resultado real del análisis de AWS.

---

## 📂 Estructura del proyecto

```text
├── public/
│   └── index.html       # Interfaz web desarrollada con Bulma CSS
├── .env                 # Variables de entorno locales
├── .gitignore           # Archivos y carpetas excluidos de Git
├── package.json         # Dependencias y configuración del proyecto
├── package-lock.json    # Versiones bloqueadas de las dependencias
├── README.md            # Documentación del proyecto
└── server.js            # Servidor Express, clientes AWS y configuración de mocks
```

---

## 🔐 Seguridad

- No publiques el archivo `.env` en repositorios públicos.
- Agrega `.env` y `node_modules/` al archivo `.gitignore`.
- Utiliza credenciales de prueba únicamente en entornos locales.
- Para trabajar con servicios reales de AWS, configura las credenciales y los permisos correspondientes.
- Valida el tipo, el tamaño y el contenido de los archivos recibidos por el servidor.

---

## 📝 Notas importantes

- El servidor debe estar en ejecución para acceder a la aplicación web.
- LocalStack y `aws-sdk-client-mock` cumplen funciones diferentes: LocalStack simula servicios de AWS en un entorno local, mientras que `aws-sdk-client-mock` permite simular las respuestas de los clientes del SDK durante las pruebas.
- La disponibilidad de las funciones descritas depende de la configuración y del código implementado en `server.js`.