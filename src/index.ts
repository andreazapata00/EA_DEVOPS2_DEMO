import express from 'express';
import mongoose from "mongoose";
import cors from 'cors'; 
import usuarioRoutes from './routes/usuarioRoutes'; 
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import eventoRoutes from './routes/eventoRoutes';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 3000;

// Configuración CORS simple y efectiva
app.use(cors({
    origin: true, // Permite todos los orígenes en desarrollo
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Conexión a la base de datos
mongoose.connect('mongodb://localhost:27017/BBDD')
    .then(() => {
        console.log('CONEXION EXITOSA A LA BASE DE DATOS DE MONGODB'); 
        app.listen(PORT, () => {
            console.log(`URL DEL SERVIDOR http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('HAY ALGUN ERROR CON LA CONEXION', err);
    });

app.use('/api/user', usuarioRoutes);
app.use('/api/event', eventoRoutes);