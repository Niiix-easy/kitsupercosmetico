import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { defineConfig } from 'vite';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 Megabytes
const MIN_SQUARE_RATIO = 0.85;
const MAX_SQUARE_RATIO = 1.18;

function kitUploadPlugin() {
  return {
    name: 'kit-upload-endpoint',
    configureServer(server: any) {
      server.middlewares.use('/api/upload-kit-image', (req: any, res: any) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const { bundleId, dataUrl } = JSON.parse(body);

              if (!bundleId || !dataUrl || !dataUrl.startsWith('data:image/')) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  error: 'Formato de imagem inválido. Certifique-se de enviar uma imagem PNG, JPG ou WEBP.' 
                }));
                return;
              }

              // Extract base64 and mime
              const mimeMatch = dataUrl.match(/^data:image\/(\w+);base64,/);
              const extension = mimeMatch ? (mimeMatch[1] === 'jpeg' ? 'jpg' : mimeMatch[1]) : 'png';
              const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
              const buffer = Buffer.from(base64Data, 'base64');

              // 1. File size validation
              if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
                const sizeMB = (buffer.length / (1024 * 1024)).toFixed(1);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  error: `A imagem excede o tamanho máximo permitido de 10MB (${sizeMB}MB enviado). Por favor, reduza o tamanho do arquivo para continuar.` 
                }));
                return;
              }

              // 2. Proportion (aspect ratio) validation using ImageMagick identify
              const tempPath = path.join('/tmp', `validate_${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`);
              fs.writeFileSync(tempPath, buffer);

              let width = 0;
              let height = 0;
              try {
                const out = execSync(`identify -format "%w %h" "${tempPath}"`).toString().trim();
                const parts = out.split(/\s+/).map(Number);
                width = parts[0] || 0;
                height = parts[1] || 0;
              } catch (identErr: any) {
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  error: 'Não foi possível ler as dimensões da imagem enviada. Verifique se o arquivo não está corrompido.' 
                }));
                return;
              } finally {
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
              }

              if (width <= 0 || height <= 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  error: 'Dimensões inválidas da imagem.' 
                }));
                return;
              }

              const ratio = width / height;

              if (ratio < MIN_SQUARE_RATIO || ratio > MAX_SQUARE_RATIO) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  error: `A imagem enviada possui dimensões de ${width}x${height}px (proporção ${ratio.toFixed(2)}:1). Para manter o alinhamento visual dos kits e o padrão do layout, a imagem deve ser aproximadamente quadrada (proporção 1:1, tolerância aceita de 0.85 a 1.18). Por favor ajuste o corte da imagem.` 
                }));
                return;
              }

              // 3. Target file destination mapping
              const filenames: Record<string, string[]> = {
                'kit-home-care': ['Kit Home Care Reconstruçao.png', 'kit-home-care-300ml.png'],
                'kit-profissional-1litro': ['Kit Profissional 1 Litro.png', 'kit-profissional-1litro.png'],
                'kit-profissional-completo': ['Kit Profissional Completo.png', 'kit-profissional-completo.png'],
                'passo1': ['shampoo-reparador.jpg'],
                'passo2': ['queratina-cauterizacao.jpg'],
                'passo3': ['mascara-super-reconstrucao.jpg'],
                'passo4': ['leave-in-selante.jpg']
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

                const dist1 = path.join(__dirname, 'dist/images', name);
                const dist2 = path.join(__dirname, 'dist', name);
                if (fs.existsSync(path.dirname(dist1))) fs.writeFileSync(dist1, buffer);
                if (fs.existsSync(dist2)) fs.writeFileSync(dist2, buffer);
              }

              const primaryTarget = targets[0];
              const servedUrl = `/images/${encodeURIComponent(primaryTarget)}?t=${Date.now()}`;

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                success: true, 
                url: servedUrl,
                width,
                height,
                ratio: Number(ratio.toFixed(2)),
                message: `Foto do kit atualizada com sucesso (${width}x${height}px)!`
              }));
              return;

            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: `Erro no servidor: ${err.message}` }));
              return;
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
