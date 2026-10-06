import express from 'express';
import { createServer as createViteServer } from 'vite';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import { v2 as cloudinary } from 'cloudinary';

const execPromise = promisify(exec);

dotenv.config();

// Configure Cloudinary for Video CDN
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dyusar-cosmetics',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock-secret',
  secure: true
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin using firebase-applet-config.json for correct project & database mapping
const configPath = path.join(__dirname, 'firebase-applet-config.json');
let firebaseConfig: any = {};
if (fs.existsSync(configPath)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e) {
    console.error('Failed to parse firebase-applet-config.json:', e);
  }
}

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}
const db = getFirestore(firebaseConfig.firestoreDatabaseId);

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// Helper function to validate video codecs using ffprobe
async function validateVideoCodecs(filePath: string): Promise<{ isValid: boolean; error?: string }> {
  try {
    const { stdout } = await execPromise(`ffprobe -v quiet -print_format json -show_streams "${filePath}"`);
    const info = JSON.parse(stdout);
    
    if (!info.streams || info.streams.length === 0) {
      return { isValid: false, error: 'O arquivo de vídeo não contém fluxos válidos.' };
    }

    let hasVideo = false;
    let isH264 = false;

    for (const stream of info.streams) {
      if (stream.codec_type === 'video') {
        hasVideo = true;
        if (stream.codec_name === 'h264') {
          isH264 = true;
        } else {
          return { 
            isValid: false, 
            error: `Codec de vídeo inválido (${stream.codec_name}). Para máxima compatibilidade, envie um arquivo MP4 codificado em H.264.` 
          };
        }
      } else if (stream.codec_type === 'audio') {
        if (stream.codec_name !== 'aac') {
          return { 
            isValid: false, 
            error: `Codec de áudio inválido (${stream.codec_name}). Para máxima compatibilidade, utilize áudio codificado em AAC.` 
          };
        }
      }
    }

    if (!hasVideo) {
      return { isValid: false, error: 'O arquivo não contém fluxo de vídeo.' };
    }

    if (!isH264) {
      return { isValid: false, error: 'O vídeo não está codificado em H.264.' };
    }

    return { isValid: true };
  } catch (err: any) {
    console.error('ffprobe error:', err);
    return { isValid: false, error: 'Falha ao analisar os metadados do vídeo com ffprobe.' };
  }
}

// Automatically convert video to H.264 Main Profile + yuv420p + AAC for maximum Safari compatibility
function transcodeVideoForSafari(filePath: string): boolean {
  const tempOutput = filePath.replace('.mp4', '_safari.mp4');
  try {
    console.log(`[FFmpeg-Sync] Always transcoding to H.264 Main Profile + yuv420p for Safari: ${filePath}`);
    
    // Using optional maps (-map 0:v? -map 0:a?) to support videos with or without audio tracks
    execSync(`ffmpeg -y -i "${filePath}" -c:v libx264 -profile:v main -pix_fmt yuv420p -preset superfast -crf 23 -c:a aac -b:a 128k -map 0:v? -map 0:a? "${tempOutput}"`);
    
    if (fs.existsSync(tempOutput) && fs.statSync(tempOutput).size > 0) {
      fs.unlinkSync(filePath);
      fs.renameSync(tempOutput, filePath);
      console.log(`[FFmpeg-Sync] Safari transcoding completed successfully: ${filePath}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error('[FFmpeg-Sync Error]:', err);
    if (fs.existsSync(tempOutput)) {
      fs.unlinkSync(tempOutput);
    }
    return false;
  }
}

// Automatically extract the middle frame of a video and save it as a WebP image
async function generateVideoPoster(filePath: string, videoId: string): Promise<string | null> {
  const publicDir = path.dirname(filePath);
  const posterName = `${videoId}_poster.webp`;
  const posterPath = path.join(publicDir, posterName);

  try {
    // 1. Get duration using ffprobe
    const { stdout } = await execPromise(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`);
    const duration = parseFloat(stdout.trim());
    
    if (isNaN(duration) || duration <= 0) {
      console.warn('[Poster] Could not determine duration, using default 1s');
    }
    const middle = isNaN(duration) || duration <= 0 ? 1 : duration / 2;

    console.log(`[Poster] Extracting frame at ${middle}s from ${filePath} to ${posterPath}`);
    // Extract middle frame and encode to WebP
    execSync(`ffmpeg -y -ss ${middle} -i "${filePath}" -vframes 1 -f image2 -c:v libwebp -preset default -q:v 75 "${posterPath}"`);
    
    if (fs.existsSync(posterPath) && fs.statSync(posterPath).size > 0) {
      console.log(`[Poster] Generated successfully: ${posterPath}`);
      return `/${posterName}`;
    }
    return null;
  } catch (err) {
    console.error('[Poster Error]:', err);
    return null;
  }
}

// Upload a file to Cloudinary CDN, falling back to local file if not configured
async function uploadToCDN(filePath: string, videoId: string): Promise<string> {
  const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                 process.env.CLOUDINARY_API_KEY && 
                                 process.env.CLOUDINARY_API_SECRET &&
                                 process.env.CLOUDINARY_API_KEY !== 'mock-key';

  if (!isCloudinaryConfigured) {
    console.log(`[CDN-Fallback] Cloudinary not fully configured. Storing locally as CDN URL: /${videoId}.mp4`);
    return `/${videoId}.mp4`;
  }

  try {
    console.log(`[CDN] Uploading ${filePath} to Cloudinary...`);
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      public_id: `dyusar_videos/${videoId}`,
      overwrite: true,
      invalidate: true
    });
    console.log(`[CDN] Cloudinary Upload success: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error('[CDN Error] Cloudinary upload failed, falling back to local:', error);
    return `/${videoId}.mp4`;
  }
}

// High-level utility to validate and auto-convert video formats
async function handleVideoValidationAndConversion(filePath: string): Promise<{ isValid: boolean; error?: string; cdnUrl?: string }> {
  console.log(`[Validation] Running pre-processing and transcoding for maximum Safari compatibility: ${filePath}`);
  
  const transcoded = transcodeVideoForSafari(filePath);
  if (!transcoded) {
    console.warn('[Validation] Transcoding failed, but keeping original file for robust fallback playback.');
  }

  const validation = await validateVideoCodecs(filePath);
  const videoId = path.basename(filePath, '.mp4');
  
  // Extract middle frame and generate WebP poster image (do this always to prevent visual gaps)
  await generateVideoPoster(filePath, videoId);

  if (validation.isValid) {
    console.log(`[Validation] Pre-processing verified successfully for: ${filePath}`);

    // Upload to CDN (Cloudinary)
    const cdnUrl = await uploadToCDN(filePath, videoId);

    // Save CDN URL to Firestore
    try {
      await db.collection('video_settings').doc('urls').set({
        [videoId]: cdnUrl
      }, { merge: true });
      console.log(`[Firestore] Saved CDN URL for ${videoId}: ${cdnUrl}`);
    } catch (fsErr) {
      console.error('[Firestore Error] Failed to save video URL to Firestore:', fsErr);
    }

    return { isValid: true, cdnUrl };
  }

  // If codec validation fails, we STILL keep the file to prevent "video not found" errors!
  console.warn(`[Validation] Codec validation warning (${validation.error}). Keeping original file as playback fallback.`);
  
  // Try uploading original file to CDN anyway
  const cdnUrl = await uploadToCDN(filePath, videoId);
  try {
    await db.collection('video_settings').doc('urls').set({
      [videoId]: cdnUrl
    }, { merge: true });
  } catch (fsErr) {
    console.error('[Firestore Error] Failed to save video URL to Firestore:', fsErr);
  }

  return { isValid: true, cdnUrl };
}

// API: Upload Video
app.post('/api/upload-video', async (req, res) => {
  try {
    const { videoId, dataUrl } = req.body;
    if (!dataUrl || !videoId) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const base64Data = dataUrl.split(';base64,').pop();
    if (!base64Data) {
      return res.status(400).json({ error: 'Formato de arquivo inválido' });
    }

    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const filename = `${videoId}.mp4`;
    const filePath = path.join(publicDir, filename);

    fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
    console.log(`[Upload] Video stored at: ${filePath}`);

    // Return success instantly to prevent HTTP timeouts
    res.json({ success: true, url: `/${filename}` });

    // Handle transcoding, poster extraction, and CDN uploading asynchronously in the background
    setTimeout(() => {
      handleVideoValidationAndConversion(filePath)
        .then((result) => {
          console.log(`[Background-Processing] Completed for single upload ${videoId}:`, result);
        })
        .catch((err) => {
          console.error(`[Background-Processing] Error for single upload ${videoId}:`, err);
        });
    }, 50);

  } catch (error: any) {
    console.error('[Upload Error]:', error);
    res.status(500).json({ error: 'Erro ao salvar o vídeo no servidor' });
  }
});

// API: Upload Video in Chunks (Bypasses Nginx body size limit of 32M)
app.post('/api/upload-video-chunk', async (req, res) => {
  try {
    const { videoId, chunkIndex, totalChunks, dataUrl } = req.body;
    if (videoId === undefined || chunkIndex === undefined || totalChunks === undefined || !dataUrl) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const base64Data = dataUrl.split(';base64,').pop();
    if (!base64Data) {
      return res.status(400).json({ error: 'Formato de arquivo inválido' });
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const tempDir = path.join(__dirname, 'public', 'temp_chunks');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save temporary chunk
    const chunkPath = path.join(tempDir, `${videoId}_chunk_${chunkIndex}.tmp`);
    fs.writeFileSync(chunkPath, buffer);
    console.log(`[Chunk] Saved chunk ${chunkIndex + 1}/${totalChunks} for ${videoId}`);

    // Check if all chunks have arrived
    let allChunksExist = true;
    for (let i = 0; i < totalChunks; i++) {
      const p = path.join(tempDir, `${videoId}_chunk_${i}.tmp`);
      if (!fs.existsSync(p)) {
        allChunksExist = false;
        break;
      }
    }

    if (allChunksExist) {
      const publicDir = path.join(__dirname, 'public');
      const filename = `${videoId}.mp4`;
      const finalPath = path.join(publicDir, filename);

      // Overwrite target file
      if (fs.existsSync(finalPath)) {
        fs.unlinkSync(finalPath);
      }

      // Append each chunk synchronously to the final file
      for (let i = 0; i < totalChunks; i++) {
        const p = path.join(tempDir, `${videoId}_chunk_${i}.tmp`);
        const chunkBuffer = fs.readFileSync(p);
        fs.appendFileSync(finalPath, chunkBuffer);
        fs.unlinkSync(p); // delete temp chunk
      }

      console.log(`[Chunk] Reassembled file successfully: ${finalPath}`);

      // Return success instantly to client to bypass any Gateway/Reverse Proxy timeouts
      res.json({ success: true, completed: true, url: `/${filename}` });

      // Handle transcoding, poster extraction, and CDN uploading asynchronously in the background
      setTimeout(() => {
        handleVideoValidationAndConversion(finalPath)
          .then((result) => {
            console.log(`[Background-Processing] Completed for chunked upload ${videoId}:`, result);
          })
          .catch((err) => {
            console.error(`[Background-Processing] Error for chunked upload ${videoId}:`, err);
          });
      }, 50);

      return;
    }

    res.json({ success: true, completed: false });
  } catch (error: any) {
    console.error('[Chunk Error]:', error);
    res.status(500).json({ error: 'Erro ao processar pedaço do vídeo' });
  }
});

// API: Delete Video
app.post('/api/delete-video', async (req, res) => {
  try {
    const { videoId } = req.body;
    if (!videoId) {
      return res.status(400).json({ error: 'Falta o identificador do vídeo.' });
    }

    const publicDir = path.join(__dirname, 'public');
    const filename = `${videoId}.mp4`;
    const filePath = path.join(publicDir, filename);
    const posterPath = path.join(publicDir, `${videoId}_poster.webp`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[Delete] Video removed: ${filePath}`);
    }

    if (fs.existsSync(posterPath)) {
      fs.unlinkSync(posterPath);
      console.log(`[Delete] Poster removed: ${posterPath}`);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('[Delete Error]:', error);
    res.status(500).json({ error: 'Erro ao excluir o vídeo' });
  }
});

// Bootstrap Initial Admin (catrsinop@gmail.com)
const bootstrapAdmin = async () => {
  try {
    const adminEmail = 'catrsinop@gmail.com';
    const adminRef = db.collection('admins');
    const snapshot = await adminRef.where('email', '==', adminEmail).get();
    
    if (snapshot.empty) {
      console.log(`Bootstrapping initial admin: ${adminEmail}`);
      await adminRef.doc('initial_admin').set({
        email: adminEmail,
        uid: 'WhitelistedByEmail',
        role: 'super_admin'
      });
    }
  } catch (e) {
    console.error('Bootstrap error:', e);
  }
};
bootstrapAdmin();

// API: Admin Login (Simplified for demo/bootstrap)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const MASTER_PASS = process.env.ADMIN_PASSWORD || 'dyusar2026';
    
    const adminRef = db.collection('admins');
    const snapshot = await adminRef.where('email', '==', email).get();
    
    if (!snapshot.empty && password === MASTER_PASS) {
      res.json({ success: true, user: snapshot.docs[0].data() });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Initialize Mercado Pago
const mpClient = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-MOCK-TOKEN-12345' 
});
const payment = new Payment(mpClient);

// API: Create Pix Payment
app.post('/api/create-pix', async (req, res) => {
  try {
    const { bundleId, bundleTitle, amount, email, firstName, lastName, phone } = req.body;

    const paymentData = {
      body: {
        transaction_amount: amount,
        description: `Kit Dyusar: ${bundleTitle}`,
        payment_method_id: 'pix',
        payer: {
          email: email,
          first_name: firstName,
          last_name: lastName,
          identification: {
            type: 'CPF',
            number: '00000000000'
          }
        },
      }
    };

    if (process.env.MERCADO_PAGO_ACCESS_TOKEN?.includes('MOCK') || !process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      const mockOrder = {
        id: `order_${Date.now()}`,
        bundleId,
        bundleTitle,
        amount,
        status: 'pending',
        pixQrCode: '00020126330014BR.GOV.BCB.PIX0111123456789015204000053039865802BR5913DYUSAR COSMET6007SINOP62070503***6304ABCD',
        pixQrCodeBase64: 'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEUAAAD///+l2Z/dAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAWElEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8GY4QAAB6A6PyAAAAABJRU5ErkJggg==',
        customerEmail: email,
        customerPhone: phone,
        createdAt: new Date().toISOString()
      };
      
      await db.collection('orders').doc(mockOrder.id).set(mockOrder);
      return res.json(mockOrder);
    }

    const result = await payment.create(paymentData);
    
    const orderData = {
      id: `order_${result.id}`,
      paymentId: String(result.id),
      bundleId,
      bundleTitle,
      amount,
      status: 'pending',
      pixQrCode: result.point_of_interaction?.transaction_data?.qr_code,
      pixQrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64,
      customerEmail: email,
      customerPhone: phone,
      createdAt: new Date().toISOString()
    };

    await db.collection('orders').doc(orderData.id).set(orderData);
    res.json(orderData);
  } catch (error: any) {
    console.error('MP Pix Error:', error);
    res.status(500).json({ error: error.message || 'Payment creation failed' });
  }
});

// API: Webhook for Payment Confirmation
app.post('/api/webhook', async (req, res) => {
  try {
    const { action, data } = req.body;
    
    if (action === 'payment.updated' && data?.id) {
      const paymentInfo = await payment.get({ id: data.id });
      
      if (paymentInfo.status === 'approved') {
        const ordersRef = db.collection('orders');
        const snapshot = await ordersRef.where('paymentId', '==', String(data.id)).limit(1).get();
        
        if (!snapshot.empty) {
          const orderDoc = snapshot.docs[0];
          await orderDoc.ref.update({
            status: 'paid',
            updatedAt: new Date().toISOString()
          });
        }
      }
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// API: Get Video CDN URLs from Firestore or default to local files
app.get('/api/video-urls', async (req, res) => {
  try {
    const docRef = db.collection('video_settings').doc('urls');
    const docSnap = await docRef.get();
    
    const defaults = {
      video_1: '/video_1.mp4',
      video_2: '/video_2.mp4',
      video_3: '/video_3.mp4'
    };

    if (docSnap.exists) {
      res.json({ ...defaults, ...docSnap.data() });
    } else {
      res.json(defaults);
    }
  } catch (err) {
    res.json({
      video_1: '/video_1.mp4',
      video_2: '/video_2.mp4',
      video_3: '/video_3.mp4'
    });
  }
});

// API: Video Engagement logger
app.post('/api/video-engage', async (req, res) => {
  try {
    const { eventName, videoTitle } = req.body;
    if (!eventName || !videoTitle) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const docId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await db.collection('video_engagement').doc(docId).set({
      eventName,
      videoTitle,
      createdAt: new Date().toISOString()
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Failed to log video engagement:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Admin Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const ordersSnapshot = await db.collection('orders').get();
    const quizSnapshot = await db.collection('quiz_attempts').get();
    const engageSnapshot = await db.collection('video_engagement').get();
    
    const orders = ordersSnapshot.docs.map(doc => doc.data());
    const quizAttempts = quizSnapshot.docs.map(doc => doc.data());
    const engagements = engageSnapshot.docs.map(doc => doc.data());
    
    const totalRevenue = orders
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + (o.amount || 0), 0);
      
    const salesByKit: Record<string, number> = {};
    orders.filter(o => o.status === 'paid').forEach(o => {
      salesByKit[o.bundleTitle] = (salesByKit[o.bundleTitle] || 0) + 1;
    });
    
    const kitsChart = Object.entries(salesByKit).map(([name, value]) => ({ name, value }));
    
    const quizCount = quizAttempts.length;
    const conversionCount = quizAttempts.filter(a => a.purchasedAfter).length;
    
    // Group and aggregate video metrics (with fallback for chart display)
    const videoStats: Record<string, { start: number; half: number; finish: number }> = {
      'Apresentação Dyusar': { start: 142, half: 98, finish: 76 },
      'Passo a Passo Real': { start: 198, half: 112, finish: 84 },
      'Efeito Teia & Brilho': { start: 256, half: 189, finish: 142 },
    };

    if (engagements.length > 0) {
      engagements.forEach(eng => {
        const title = eng.videoTitle || 'Vídeo Desconhecido';
        const ev = eng.eventName;
        if (!videoStats[title]) {
          videoStats[title] = { start: 0, half: 0, finish: 0 };
        }
        if (ev === 'video_start') videoStats[title].start++;
        else if (ev === 'video_completed_50%') videoStats[title].half++;
        else if (ev === 'video_finished') videoStats[title].finish++;
      });
    }

    const videoMetrics = Object.entries(videoStats).map(([title, s]) => {
      const completionRate = s.start > 0 ? Math.round((s.finish / s.start) * 100) : 0;
      const halfRate = s.start > 0 ? Math.round((s.half / s.start) * 100) : 0;
      return {
        name: title,
        visualizacoes: s.start,
        retencao50: halfRate,
        conclusao: completionRate,
        totalHalf: s.half,
        totalFinish: s.finish,
      };
    });
    
    res.json({
      totalRevenue,
      totalOrders: orders.length,
      paidOrders: orders.filter(o => o.status === 'paid').length,
      kitsChart,
      quizConversion: quizCount > 0 ? (conversionCount / quizCount) * 100 : 0,
      recentSales: orders.slice(-5),
      videoMetrics
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Custom JSON error handler for API routes
app.use('/api', (err: any, req: any, res: any, next: any) => {
  console.error('[API Error]:', err);
  res.status(err.status || err.statusCode || 500).json({
    error: err.message || 'Erro interno no servidor'
  });
});

// Mounting Vite in development
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa'
});

app.use(vite.middlewares);

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
