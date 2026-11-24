# SPIDER AI — Starter Project

เว็บแอปผู้ช่วยส่วนตัวสำหรับ iPhone/iPad และ Windows

## สิ่งที่มีในเวอร์ชันเริ่มต้น
- AI chat ผ่าน OpenAI Responses API
- สลับเสียงอ่านไทย/อังกฤษด้วย Speech Synthesis ของเบราว์เซอร์
- รับเสียงพูดผ่าน Web Speech API (ขึ้นกับเบราว์เซอร์และสิทธิ์ไมโครโฟน)
- อัปโหลดภาพเพื่อให้ AI วิเคราะห์
- หน้าจอ HUD แบบ futuristic
- รองรับหน้าจอมือถือและติดตั้งเป็น PWA ได้ในเบราว์เซอร์ที่รองรับ

## ต้องติดตั้ง
- Node.js รุ่น LTS
- API key สำหรับ OpenAI API

## วิธีเปิดบน Windows
1. แตกไฟล์ ZIP
2. เปิดโฟลเดอร์ `spider-ai`
3. เปิด Terminal หรือ PowerShell ในโฟลเดอร์นี้
4. รัน `npm install`
5. คัดลอก `.env.example` เป็น `.env`
6. เปิด `.env` แล้วใส่ API key ของคุณใน `OPENAI_API_KEY`
7. รัน `npm run dev`
8. เปิด `http://localhost:5173`

ห้ามส่ง API key ให้คนอื่น ห้ามใส่ API key ลงในไฟล์ `src/main.jsx` หรือโค้ดฝั่งเบราว์เซอร์

## ใช้บน iPhone
สำหรับการทดสอบบน iPhone ให้เปิดเว็บจาก URL ที่โฮสต์ผ่าน HTTPS และอยู่บนเครือข่ายที่เข้าถึงได้ จากนั้นใช้ Share > Add to Home Screen ใน Safari
ไมโครโฟนและ Speech Recognition อาจรองรับไม่เท่ากันในแต่ละเวอร์ชัน iOS/Safari หากใช้ไม่ได้ให้พิมพ์ข้อความแทน

## หมายเหตุ
- ต้องมีอินเทอร์เน็ตและ API key ที่ใช้งานได้
- ค่าใช้ API ของ OpenAI แยกจาก ChatGPT subscription และอาจมีค่าใช้จ่ายตามการใช้งาน
- `OPENAI_MODEL` ใน `.env` สามารถเปลี่ยนเป็นโมเดลที่บัญชี API ของคุณมีสิทธิ์ใช้งานได้
- นี่คือ starter build: ยังไม่ได้เชื่อมควบคุมอุปกรณ์จริง, Siri wake word, หรือ always-on listening
- ก่อนนำไปใช้จริง ควรเพิ่มระบบล็อกอิน, จำกัดอัตราการเรียก API, นโยบายเก็บข้อมูล และ HTTPS
