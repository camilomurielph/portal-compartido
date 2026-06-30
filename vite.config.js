import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/portal-compartido/", // Cambia por el nombre de tu repositorio
});
