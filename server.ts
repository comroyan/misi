import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// ----------------------------------------------------------------------
// API ROUTES
// ----------------------------------------------------------------------

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'misiku-backend',
    time: new Date().toISOString(),
  });
});

// WhatsApp Cloud API Integration (Server-side proxy)
app.post('/api/whatsapp/notify', async (req: Request, res: Response) => {
  try {
    const {
      submissionCode,
      missionTitle,
      participantName,
      participantPhone,
      rewardAmount,
      totalSteps,
      submissionId,
    } = req.body;

    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const adminPhone = process.env.WHATSAPP_ADMIN_NUMBER || '6281234567890';
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v20.0';
    const appUrl = process.env.APP_URL || 'https://misiku.id';

    const formattedReward = 'Rp' + Number(rewardAmount || 0).toLocaleString('id-ID');
    const maskedPhone = participantPhone
      ? participantPhone.replace(/(\d{4})\d+(\d{4})/, '$1••••$2')
      : '0812••••7890';

    const messageText =
      `🔔 *Submission Baru Masuk!*\n\n` +
      `*Misi:* ${missionTitle}\n` +
      `*Nama:* ${participantName}\n` +
      `*WhatsApp:* ${maskedPhone}\n` +
      `*Reward:* ${formattedReward}\n` +
      `*Langkah Selesai:* ${totalSteps}/${totalSteps}\n` +
      `*Kode:* ${submissionCode}\n\n` +
      `*Tinjau Bukti:* ${appUrl}/admin/submissions/${submissionId}`;

    console.log('\n========================================');
    console.log('📱 [WHATSAPP ADMIN NOTIFICATION DISPATCH]');
    console.log(messageText);
    console.log('========================================\n');

    if (token && phoneId && adminPhone) {
      // Dispatch via Meta Graph API
      const response = await fetch(
        `https://graph.facebook.com/${apiVersion}/${phoneId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: adminPhone,
            type: 'text',
            text: { body: messageText },
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        console.error('WhatsApp API returned error response:', result);
        return res.json({
          success: false,
          status: 'FAILED',
          message: 'WhatsApp Cloud API call returned error, logged for admin.',
          details: result,
        });
      }

      return res.json({
        success: true,
        status: 'SENT',
        messageId: result.messages?.[0]?.id,
      });
    }

    // When token is not yet configured, log gracefully as SIMULATED
    return res.json({
      success: true,
      status: 'SIMULATED',
      message:
        'WhatsApp simulated dispatch successful. Configure WHATSAPP_ACCESS_TOKEN in .env to send live messages.',
    });
  } catch (error: any) {
    console.error('WhatsApp dispatch exception:', error);
    // Never crash submission on WhatsApp notification failure
    return res.status(200).json({
      success: false,
      status: 'FAILED',
      error: error.message,
    });
  }
});

// Visitor session creation/verification
app.get('/api/session/visitor', (req: Request, res: Response) => {
  const visitorId =
    req.headers['x-visitor-id'] || 'v_' + Math.random().toString(36).substring(2, 12);
  res.cookie('misiku_visitor_id', visitorId, {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    httpOnly: false,
    sameSite: 'lax',
  });
  res.json({ visitorId });
});

// ----------------------------------------------------------------------
// VITE / STATIC SERVING
// ----------------------------------------------------------------------

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MisiKu server running on http://0.0.0.0:${PORT}`);
  });
}

start();
