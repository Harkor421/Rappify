<div align="center">

<img src="public/logo.png" alt="Rappify" width="120" />

# Rappify

### Encuentra los mejores descuentos de Rappi cerca de ti

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

[**🌐 Ver en vivo**](https://rappify.co) · [**📦 Repositorio**](https://github.com/Harkor421/Rappify)

</div>

---

## 📖 Sobre el proyecto

App 100% frontend, sin backend y open source, para descubrir ofertas de restaurantes y productos rebajados de Rappi cerca de tu dirección. El navegador habla directo con la API; no hay servidor intermedio guardando nada.

## ✨ Qué hace

- Sin backend: todo ocurre en el navegador
- Búsqueda por dirección con geocodificación
- Listas virtualizadas para recorrer miles de productos sin lag
- Caché local de resultados y credenciales
- TypeScript estricto · MIT · guía de contribución incluida

## 🧰 Stack

| | |
|---|---|
| **Lenguajes y runtime** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) |
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white) |

## 📂 Estructura

```
src/api         # Cliente de la API
src/components  # Componentes de interfaz
src/hooks       # Hooks de React reutilizables
src/styles      # Estilos
src/types       # Tipos de TypeScript
src/utils       # Funciones auxiliares
```

## 🚀 Empezar

```bash
git clone https://github.com/Harkor421/Rappify.git
cd Rappify
npm install
npm run dev
```

## ⚙️ Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

| Variable | Ejemplo / valor por defecto |
|---|---|
| `VITE_RAPPI_AUTH` | `Bearer YOUR_TOKEN_HERE` |
| `VITE_RAPPI_DEVICEID` | `your-deviceid-uuid` |
| `VITE_RAPPI_APP_VERSION` | `1.161.2` |
| `VITE_GIST_WRITE_TOKEN` | — |

## 📜 Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compila para producción |
| `npm run lint` | Revisa el estilo del código |
| `npm run format` | Formatea el código |
| `npm run typecheck` | Verifica los tipos de TypeScript |

---

<div align="center">

Hecho por [**Samir González**](https://github.com/Harkor421)

</div>
