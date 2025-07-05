const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors');

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*",  // Tüm originlere izin ver
    methods: ["GET", "POST"]
  }
});

const aktifKullanicilar = new Set();

io.on('connection', (socket) => {
  console.log('Bir kullanıcı bağlandı');

  socket.on('kullaniciGirisi', (kullaniciAdi) => {
    aktifKullanicilar.add(kullaniciAdi);
    io.emit('kullaniciListesi', Array.from(aktifKullanicilar));
    io.emit('mesajAlindi', {
      kullanici: 'Sistem',
      mesaj: `${kullaniciAdi} sohbete katıldı`,
      zaman: new Date().toLocaleTimeString()
    });
  });

  socket.on('mesajGonder', (mesajVerisi) => {
    console.log('Alınan mesaj:', mesajVerisi);
    io.emit('mesajAlindi', mesajVerisi);
  });

  socket.on('disconnect', () => {
    const kullaniciAdi = Array.from(aktifKullanicilar)[aktifKullanicilar.size - 1];
    if (kullaniciAdi) {
      aktifKullanicilar.delete(kullaniciAdi);
      io.emit('kullaniciListesi', Array.from(aktifKullanicilar));
      io.emit('mesajAlindi', {
        kullanici: 'Sistem',
        mesaj: `${kullaniciAdi} sohbetten ayrıldı`,
        zaman: new Date().toLocaleTimeString()
      });
    }
    console.log('Bir kullanıcı ayrıldı');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});