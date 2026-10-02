import express from 'express';
import { createServer as createViteServer } from 'vite';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

const app = express();
app.use(express.json());

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

// API: Admin Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const ordersSnapshot = await db.collection('orders').get();
    const quizSnapshot = await db.collection('quiz_attempts').get();
    
    const orders = ordersSnapshot.docs.map(doc => doc.data());
    const quizAttempts = quizSnapshot.docs.map(doc => doc.data());
    
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
    
    res.json({
      totalRevenue,
      totalOrders: orders.length,
      paidOrders: orders.filter(o => o.status === 'paid').length,
      kitsChart,
      quizConversion: quizCount > 0 ? (conversionCount / quizCount) * 100 : 0,
      recentSales: orders.slice(-5)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
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
