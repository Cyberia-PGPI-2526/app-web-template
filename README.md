# Guía de inicialización del proyecto

A continuación se describen los pasos para poner en marcha **backend** y **frontend** del proyecto usando la terminal.

---

##  Requisitos previos

- Tener instalado **Node.js**.
- Tener instalado **npm**.

---

# Backend 

### 1. Ir a la carpeta del backend

```bash
cd backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Generar el cliente de Prisma

```bash
npm run generate
```

### 4. Aplicar migraciones en desarrollo

```bash
npm run migrate:dev
```

_(Ejecuta internamente `npx prisma migrate dev --name auto`)_


### 5. (Opcional) Ejecutar seed

```bash
npm run seed
```

### 6. Levantar el servidor en modo desarrollo

```bash
npm run dev
```

### 7. Levantar el servidor en modo producción

```bash
npm start
```

---

#  Frontend 

### 1. Ir a la carpeta del frontend

```bash
cd frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Levantar servidor de desarrollo

```bash
npm run dev
```

### 4. Abrir en el navegador

```
http://localhost:5173/
```
