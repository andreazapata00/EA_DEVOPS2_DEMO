# STAGE 1: Constructor (Per instal·lar dependències i compilar el codi)
FROM node:18-alpine AS builder

WORKDIR /app

# 1. Copiem només els fitxers essencials per instal·lar
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# 2. Instal·lem totes les dependències (incloent les de dev, necessàries per 'tsc')
RUN npm install

# 3. Copiem el codi font
COPY src/ ./src/

# 4. COMPILACIÓ
# El script 'build' compila TS a JS (normalment a la carpeta 'dist')
RUN npm run build

# STAGE 2: Producció (La imatge final, neta i lleugera)
FROM node:18-alpine AS production

# 1. Directori de treball
WORKDIR /app

# 2. Copiem només les dependències de producció de nou (molt més ràpid)
COPY package.json package-lock.json ./
RUN npm install --only=production

# 3. Copiem el codi compilat (dist) des de la fase 'builder'
COPY --from=builder /app/dist ./dist

# 4. Exposem el port de l'API
EXPOSE 3000

# 5. Comanda d'inici (Usant el script 'start' modificat)
CMD ["npm", "start"]