const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Chatbot API",
      version: "1.0.0",
      description: "API documentation for MERN-based chatbot system",
    },
    servers: [
      {
        url: "chatbot-api-production-3932.up.railway.app",
      },
    ],
    components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },      
  },
  apis: ["./routes/*.js"], // scan semua route file
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
