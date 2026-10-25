// 1. Daftar Tema CSS
const themePresets = [
  'deep-space',
  'ocean-breeze',
  'cyberpunk',
  'emerald',
  'minimal-dark'
];

// 2. Daftar Playlist Lagu (Sesuaikan dengan file audio Anda)
const playlist = [
  'audio/track1.mp3',
  'audio/track2.mp3',
  'audio/track3.mp3'
];

// Fungsi Acak Tema
function applyRandomTheme() {
  const randomIndex = Math.floor(Math.random() * themePresets.length);
  const selectedTheme = themePresets[randomIndex];
  document.body.setAttribute('data-theme', selectedTheme);
}

// Fungsi Pemutar Musik Acak
function playRandomMusic() {
  const audioPlayer = document.getElementById('bg-music');
  if (!audioPlayer || playlist.length === 0) return;

  const randomIndex = Math.floor(Math.random() * playlist.length);
  audioPlayer.src = playlist[randomIndex];
  audioPlayer.volume = 0.4; // Volume 40% agar tidak terlalu mengejutkan

  // Kebijakan browser modern mengharuskan interaksi sebelum audio diputar
  const startAudio = () => {
    audioPlayer.play().catch(err => console.log("Autoplay diblokir browser:", err));
    document.removeEventListener('click', startAudio);
  };

  // Jalankan saat ada klik pertama pengguna di halaman
  document.addEventListener('click', startAudio);
}

// Inisialisasi Event Listener
document.addEventListener('DOMContentLoaded', () => {
  // Set tema awal secara acak
  applyRandomTheme();

  // Jalankan musik acak
  playRandomMusic();

  // Event Listener Tombol Ganti Tema
  const themeBtn = document.getElementById('btn-change-bg');
  if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Mencegah pemicu ganda klik audio
      applyRandomTheme();
    });
  }
});