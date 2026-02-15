import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = "gemini-2.5-flash-lite";

app.use(cors());
app.use(express.json());
app.use (express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;

    try {
        // apakah conversation adalah bukan array
        if (!Array.isArray(conversation)) throw new Error('Messages must be an array');

        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.9,
                systemInstruction: 'Anda adalah Customer Service Bank MajuAI yang profesional. JANGAN menjawab pertanyaan tentang percintaan, asmara, atau topik pribadi di luar perbankan. Fokus HANYA pada layanan perbankan, keuangan, dan fitur aplikasi Bank MajuAI. Jika pengguna bertanya ingin menabung, rekomendasikan produk berikut: 1. Tabungan Maju (Bunga 3%, bebas admin), 2. Tabungan Rencana (Bunga 5%, autodebet), 3. Deposito Maju (Bunga 7%, tenor fleksibel). Jika ditanya soal cinta atau topik lain, tolak dengan sopan dan arahkan kembali ke layanan bank.'
            }
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e.message);
        res.status(500).json({ error: e.message })
    }
});