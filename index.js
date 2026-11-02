require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');

// Inisialisasi client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// 1. Fungsi untuk menghubungkan ke MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🍃 Berhasil terhubung ke MongoDB!');
  } catch (error) {
    console.error('❌ Gagal terhubung ke MongoDB:', error);
  }
}

// 1.1. Skema Database MongoDB
// Membuat Schema Data Player
const playerSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // ID Discord player
  balance: { type: Number, default: 0 },                  // Koin/Uang player
  level: { type: Number, default: 1 },                    // Level player
  inventory: { type: Array, default: [] }                 // Daftar ikan tangkapan
});

// Membuat Model dari Schema di atas
const Player = mongoose.model('Player', playerSchema);

client.once('ready', () => {
  console.log(`🤖 Bot berhasil login sebagai ${client.user.tag}!`);
});

// Event pesan sederhana
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.toLowerCase();

  // !ping command
  if (args === '!ping') {
    message.reply('Pong dari bot berbasis MongoDB! 🏓🍃');
  }

  // !emoji command
  if (args === '!emoji') {
    message.reply('Here is a cool emoji! <:samuraipepe:1566824360277315664>');
  }

  //
  // Fitur Mancing Sederhana
  if (args === '!mancing') {
    const userId = message.author.id;

    try {
      // Cari player di database berdasarkan Discord ID
      let player = await Player.findOne({ userId });

      // Kalau player belum pernah main/terdaftar, buatkan data baru
      if (!player) {
        player = new Player({ userId, balance: 0, level: 1, inventory: [] });
      }

      // Daftar ikan random beserta harganya
      const listPepe = [
        { nama: '<:astronautpepe:1566824047474643054> Pepe Astronot', harga: 10 },
        { nama: '<:samuraipepe:1566824360277315664> Pepe Samurai', harga: 25 },
        { nama: '<:captainpepe:1566823967405113465> Pepe Captain', harga: 100 },
        { nama: '<:kingpepe:1566823734848000190> Pepe King', harga: 1000 }
      ];

      // Pilih ikan secara acak
      const pepeDapat = listPepe[Math.floor(Math.random() * listPepe.length)];

      // Masukkan ikan ke inventory player dan tambahkan koinnya
      player.inventory.push(pepeDapat.nama);
      player.balance += pepeDapat.harga;

      // Simpan perubahan ke database MongoDB
      await player.save();

      // Kirim pesan ke channel Discord
      message.reply(`🎣 Kamu melempar kail dan mendapatkan **${pepeDapat.nama}**!\n💰 Harga jual: ${pepeDapat.harga} koin\n💼 Total Koinmu sekarang: ${player.balance} koin`);

    } catch (error) {
      console.error('Gagal memproses mancing:', error);
      message.reply('❌ Terjadi kesalahan saat mencoba memancing.');
    }
  }

  // !profile command untuk melihat data player
  if (args === '!profile' || args === '!profil') {
    const userId = message.author.id;
    const player = await Player.findOne({ userId });

    if (!player) {
      return message.reply('Kamu belum punya data game! Ketik `!mancing` dulu untuk mulai.');
    }

    message.reply(`📊 **Profil Mancing ${message.author.username}**\n💰 Koin: ${player.balance}\n⭐ Level: ${player.level}\n🐟 Total Ikan di Inventory: ${player.inventory.length} ekor`);
  }
});

// 2. Jalankan koneksi database dulu, baru jalankan bot Discord
async function main() {
  await connectDB();
  client.login(process.env.DISCORD_TOKEN);
}

main();