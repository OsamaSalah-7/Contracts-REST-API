import Fastify from 'fastify';
import fastifySwagger from 'fastify-swagger';
import { AppDataSource } from './config/db';
import { authRoutes } from './routes/auth.routes';
import { contractRoutes } from './routes/contract.route';
import { jobRoutes } from "./routes/job.route";
import { balanceRoutes } from "./routes/balance.route";


const start = async () => {
     const app = Fastify();

    // Register Swagger
    app.register(fastifySwagger, {
        routePrefix: '/documentation',
        swagger: {
            info: {
                title: 'Contract API',
                description: 'API for managing contracts and jobs',
                version: '1.0.0'
            },
            externalDocs: {
                url: 'https://swagger.io',
                description: 'Find more info here'
            },
            host: 'localhost:3000',
            schemes: ['http'],
            consumes: ['application/json'],
            produces: ['application/json']
        },
        exposeRoute: true
    });

    try {
        await AppDataSource.initialize();
        console.log("Database connection established");
    } catch (error) {
        console.error("Error connecting to the database", error);
        process.exit(1);
    }

    // Register routes
    app.register(authRoutes, { prefix: "/api" });
    app.register(contractRoutes, { prefix: "/api" });
    app.register(jobRoutes, { prefix: "/api" });
    app.register(balanceRoutes, { prefix: "/api" }); // Add this line

    try {
        await app.listen({ port: 3001, host: '0.0.0.0' });
        console.log('Server is running on http://localhost:3001');
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};

start();