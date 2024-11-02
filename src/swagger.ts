import swaggerJsDoc, { Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "User Management",
      description: "Node Service to manage users data of streaming platform",
      version: "1.0.0",
      contact: {
        name: "Prabhat",
        url: "Your Website URL",
        email: "prabhatjadhav.exe@gmail.com",
      },
      servers: [
        {
          url: "http://localhost:8080", // Change to server's URL
          description: "Development server",
        },
      ],
    },
  },
  apis: ["./src/routes/*.ts", "./src/models/*.ts"], // Paths to your API routes and models
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export { swaggerDocs };
