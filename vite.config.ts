import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { defineConfig } from 'vite';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 Megabytes
const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 Megabytes
const MIN_SQUARE_RATIO = 0.85;
const MAX_SQUARE_RATIO = 1.18;

function kitUploadPlugin() {
  return {
    name: 'kit-upload-endpoint',
    configureServer(server: any) {
      // Image Upload Endpoint
      server.middlewares.use('/api/upload-kit-image', (req: any, res: any) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', async () => {
            try {
              const { bundleId, dataUrl } = JSON.parse(body);

              if (!bundleId || !dataUrl || !dataUrl.startsWith('data:image/')) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  error: 'Formato de imagem inválido.' 
                }));
                return;
              }

              // Extract base64
              const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
              let buffer = Buffer.from(base64Data, 'base64');

              // Convert to WebP
              buffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();

              // 1. File size validation
              if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Imagem excede 10MB.' }));
                return;
              }

              // 2. Proportion validation
              const metadata = await sharp(buffer).metadata();
              const width = metadata.width || 0;
              const height = metadata.height || 0;
              const ratio = width / height;

              if (ratio < MIN_SQUARE_RATIO || ratio > MAX_SQUARE_RATIO) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'A imagem deve ser aproximadamente quadrada (1:1).' }));
                return;
              }

              // 3. Target file destination mapping
              const filenames: Record<string, string[]> = {
                'kit-home-care': ['Kit Home Care Reconstruçao.webp', 'kit-home-care-300ml.webp'],
                'kit-profissional-1litro': ['Kit Profissional 1 Litro.webp', 'kit-profissional-1litro.webp'],
                'kit-profissional-completo': ['Kit Profissional Completo.webp', 'kit-profissional-completo.webp'],
                'passo1': ['shampoo-reparador.webp'],
                'passo2': ['queratina-cauterizacao.webp'],
                'passo3': ['mascara-super-reconstrucao.webp'],
                'passo4': ['leave-in-selante.webp']
              };

              const targets = filenames[bundleId];
              if (!targets) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Kit desconhecido: ${bundleId}` }));
                return;
              }

              for (const name of targets) {
                const p1 = path.join(__dirname, 'public/images', name);
                const p2 = path.join(__dirname, 'public', name);
                fs.writeFileSync(p1, buffer);
                fs.writeFileSync(p2, buffer);
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                success: true, 
                message: 'Imagem convertida para WebP e salva com sucesso!'
              }));

            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: `Erro no servidor: ${err.message}` }));
            }
          });
        } else {
          res.writeHead(405);
          res.end();
        }
      });

      // Video Upload Endpoint
      server.middlewares.use('/api/upload-video', (req: any, res: any) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const { videoId, dataUrl } = JSON.parse(body);

              if (!videoId || !dataUrl || !dataUrl.startsWith('data:video/')) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  error: 'Formato de vídeo inválido. Certifique-se de enviar um arquivo MP4.' 
                }));
                return;
              }

              const base64Data = dataUrl.replace(/^data:video\/mp4;base64,/, '');
              const buffer = Buffer.from(base64Data, 'base64');

              if (buffer.length > MAX_VIDEO_SIZE_BYTES) {
                const sizeMB = (buffer.length / (1024 * 1024)).toFixed(1);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  error: `O vídeo excede o tamanho máximo permitido de 50MB (${sizeMB}MB enviado).` 
                }));
                return;
              }

              const filename = `${videoId}.mp4`;
              const p = path.join(__dirname, 'public', filename);
              fs.writeFileSync(p, buffer);

              const distP = path.join(__dirname, 'dist', filename);
              if (fs.existsSync(path.dirname(distP))) fs.writeFileSync(distP, buffer);

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                success: true, 
                url: `/${filename}?t=${Date.now()}`,
                message: 'Vídeo atualizado com sucesso!'
              }));

            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: `Erro no servidor: ${err.message}` }));
            }
          });
        } else {
          res.writeHead(405);
          res.end();
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), kitUploadPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
