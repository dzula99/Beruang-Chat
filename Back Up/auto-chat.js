/**
 * Auto-Chat Idle System (150 Detik - Maksimal 5 Kali)
 * Otomatis reset kembali dari 0 jika tab di-refresh atau ditutup.
 */

// Variable global khusus timer idle
let idleTimer = null;

// Menggunakan variabel memori biasa (Otomatis reset ke 0 saat refresh / tutup tab)
let autoChatCount = 0; 

/**
 * Mereset timer idle ke 150 detik.
 * Akan otomatis BERHENTI jika sudah mencapai 5 kali.
 */
function resetIdleTimer() {
    // Selalu bersihkan timer lama jika ada
    if (idleTimer) clearTimeout(idleTimer);

    // Jika sudah 5 kali memicu chat otomatis, HENTIKAN timer
    if (autoChatCount >= 5) {
        console.log("Auto-chat idle telah mencapai batas maksimal (5 kali). Timer dihentikan.");
        return;
    }

    // Pasang timer baru untuk 150 detik (2.5 menit)
    idleTimer = setTimeout(() => {
        triggerAutoChat();
    }, 150000); // 150000 ms = 150 detik
}

/**
 * PANGGUL FUNGSI INI saat pengguna mengirim pesan manual!
 * Agar jika pengguna membalas, kuota auto-chat & timernya di-reset dari awal.
 */
function userSentMessage() {
    autoChatCount = 0; // Reset hitungan auto chat
    resetIdleTimer();  // Reset timer idle
}

/**
 * Memecut AI untuk mengirimkan obrolan otomatis saat sepi/idle
 */
async function triggerAutoChat() {
    // Jika AI sedang memproses pesan lain, batalkan & pasang ulang timer
    if (typeof isSending !== 'undefined' && isSending) {
        resetIdleTimer();
        return;
    }

    if (typeof isSending !== 'undefined') {
        isSending = true;
    }

    // Tambah penghitung pemanggilan auto-chat
    autoChatCount++;

    try {
        // Prompt variatif
        const autoPrompts = [
            "Sapa pengguna yang sedang diam saja dengan ramah dan tanyakan kabar atau kegiatannya.",
            "Pengguna tampak diam, tanyakan apakah dia butuh bantuan atau ingin membahas sesuatu.",
            "Sesi terasa sepi, lemparkan satu topik obrolan santai atau ajak pengguna mengobrol."
        ];
        const randomPrompt = autoPrompts[Math.floor(Math.random() * autoPrompts.length)];

        // Penanganan instruksi bahasa
        const langInstructions = {
            en: "Reply in English.",
            id: "Balas dalam Bahasa Indonesia.",
            ja: "日本語で返答してください。",
            zh: "请用中文回复。",
            es: "Responde en español."
        };

        const activeName = (typeof currentName !== 'undefined') ? currentName : 'AI';
        const activeLangKey = (typeof currentLang !== 'undefined' && langInstructions[currentLang]) ? currentLang : 'id';
        const activeLang = langInstructions[activeLangKey];
        
        let basePersona = "Roleplay as " + activeName + ". Emulate their accurate personality traits, speech patterns, and lore accurately.";
        let personaPrompt = (typeof currentPersonality !== 'undefined' && currentPersonality) 
            ? "Character Persona & Background Instructions: " + currentPersonality 
            : basePersona;

        let ageContext = (typeof detectedAge !== 'undefined' && detectedAge) ? "AGE CONTEXT: You are " + detectedAge + " years old in your universe." : "";
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeString = now.toLocaleTimeString([], { hour12: false });
        const timeContext = "CURRENT TIME & DATE: " + dateString + ", " + timeString;

        const sideInst = (typeof sideTabInstruction !== 'undefined') ? sideTabInstruction : "";

        // Menyusun system instruction dengan aturan maksimal 2 kalimat
        const systemInstruction = [
            "Instruction: You are " + activeName + ". " + personaPrompt,
            ageContext,
            timeContext,
            sideInst,
            "LANGUAGE: " + activeLang,
            "STRICT RULE: MAXIMUM 2 SENTENCES PER RESPONSE. Keep it extremely short and concise. Use emojis occasionally.",
            "SPECIAL INSTRUCTION: Prompt internal ini dipicu karena pengguna diam saja selama 150 detik. Sapa atau buka percakapan secara natural tanpa memberitahu bahwa ini adalah sistem otomatis."
        ].filter(Boolean).join("\n");

        const historyArray = (typeof chatHistory !== 'undefined') ? chatHistory : [];
        const tempHistory = [...historyArray, { role: "user", parts: [{ text: "[SYSTEM: " + randomPrompt + "]" }] }];

        const requestBody = {
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: tempHistory.slice(-10),
            generationConfig: { temperature: 0.85 }
        };

        // Memanggil API Gemini jika fungsi dasar tersedia
        if (typeof callGeminiApi === 'function') {
            const result = await callGeminiApi(requestBody);

            if (result && result.success) {
                let rawReply = result.data.candidates[0].content.parts[0].text.trim();

                // Pemrosesan tag download jika AI memunculkannya
                if (/\[DOWNLOAD_PC\]/i.test(rawReply)) {
                    const pcUrl = "https://www.dropbox.com/scl/fi/h8pk7cbcces31xnuw0v8f/Beruang-Chat-Setup-1.0.0.exe?rlkey=bk0hliocu3qhsqvo9sjyvqg2t&st=e75anqpi&dl=1";
                    const btnLabel = (typeof pcBtnText !== 'undefined') ? pcBtnText : 'Download PC';
                    const pcDownloadUI = '<div class="chat-pc-container" style="margin-top: 10px;"><a href="' + pcUrl + '" target="_blank" rel="noopener noreferrer" class="pc-download-link" style="display: inline-block; padding: 10px 15px; background: #4A90E2; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">' + btnLabel + '</a></div>';
                    rawReply = rawReply.replace(/\[DOWNLOAD_PC\]/gi, pcDownloadUI).trim();
                }

                if (/\[DOWNLOAD_APK\]/i.test(rawReply)) {
                    const apkUrl = "https://www.dropbox.com/scl/fi/0jrdk4icg0z2x6vn2d85k/Beruang-Chat.apk?rlkey=ahn831a0a65789jvkr69pb4bs&st=f0bxrl0p&dl=1";
                    const btnLabelApk = (typeof apkBtnText !== 'undefined') ? apkBtnText : 'Download APK';
                    const apkDownloadUI = '<div class="chat-apk-container" style="margin-top: 10px;"><a href="' + apkUrl + '" target="_blank" rel="noopener noreferrer" class="apk-download-link" style="display: inline-block; padding: 10px 15px; background: #28A745; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">' + btnLabelApk + '</a></div>';
                    rawReply = rawReply.replace(/\[DOWNLOAD_APK\]/gi, apkDownloadUI).trim();
                }

                // Tambahkan ke histori dan tampilkan ke UI
                if (typeof chatHistory !== 'undefined') {
                    chatHistory.push({ role: "model", parts: [{ text: rawReply }] });
                }
                if (typeof playSfxReceive === 'function') playSfxReceive();
                if (typeof appendMessage === 'function') appendMessage('ai', rawReply);
                if (typeof speakText === 'function') speakText(rawReply);
            }
        }
    } catch (e) {
        console.error("Error pada triggerAutoChat:", e);
    } finally {
        if (typeof isSending !== 'undefined') {
            isSending = false;
        }
        // Jalankan ulang timer idle
        resetIdleTimer();
    }
}

// Inisialisasi timer otomatis setelah halaman dimuat penuh
document.addEventListener('DOMContentLoaded', () => {
    resetIdleTimer();
});