import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './app.css';

// Socket.IO bağlantı URL'sini ortama göre ayarla
const SOCKET_URL = import.meta.env.PROD 
  ? 'https://chat-app-backend-yvqw.onrender.com' // Render.com'daki backend URL'iniz
  : 'http://localhost:3001';

const socket = io(SOCKET_URL);

function App() {
  const [mesaj, setMesaj] = useState('');
  const [alinanMesajlar, setAlinanMesajlar] = useState([]);
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [baglantiDurumu, setBaglantiDurumu] = useState('bağlanıyor');

  useEffect(() => {
    socket.on('connect', () => {
      setBaglantiDurumu('bağlandı');
    });

    socket.on('disconnect', () => {
      setBaglantiDurumu('bağlantı kesildi');
    });

    socket.on('mesajAlindi', (gelenVeri) => {
      setAlinanMesajlar((oncekiMesajlar) => [...oncekiMesajlar, gelenVeri]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('mesajAlindi');
    };
  }, []);

  const mesajGonder = (e) => {
    e.preventDefault();
    if (mesaj.trim()) {
      const mesajVerisi = {
        kullanici: kullaniciAdi,
        mesaj: mesaj,
        zaman: new Date().toLocaleTimeString()
      };
      socket.emit('mesajGonder', mesajVerisi);
      setMesaj('');
    }
  };

  const girisYap = (e) => {
    e.preventDefault();
    if (kullaniciAdi.trim()) {
      setGirisYapildi(true);
      socket.emit('kullaniciGirisi', kullaniciAdi);
    }
  };

  if (!girisYapildi) {
    return (
      <div className="app">
        <div className="login-container">
          <h2>Chat'e Hoşgeldiniz</h2>
          <p>Bağlantı durumu: {baglantiDurumu}</p>
          <form onSubmit={girisYap}>
            <input
              type="text"
              value={kullaniciAdi}
              onChange={(e) => setKullaniciAdi(e.target.value)}
              placeholder="Kullanıcı adınızı girin"
              required
            />
            <button type="submit">Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <div className="title">
          <h1>Chat App</h1>
          <span className="user-info">
            Kullanıcı: {kullaniciAdi} | {baglantiDurumu}
          </span>
        </div>
        <div className="messages">
          {alinanMesajlar.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.kullanici === kullaniciAdi ? 'sent' : 'received'}`}
            >
              <div className="message-info">
                <span className="username">{msg.kullanici}</span>
                <span className="time">{msg.zaman}</span>
              </div>
              <p className="message-content">{msg.mesaj}</p>
            </div>
          ))}
        </div>
        <form className="input-container" onSubmit={mesajGonder}>
          <input
            type="text"
            value={mesaj}
            onChange={(e) => setMesaj(e.target.value)}
            placeholder="Mesajınızı giriniz"
            required
          />
          <button type="submit">Gönder</button>
        </form>
      </div>
    </div>
  );
}

export default App;
