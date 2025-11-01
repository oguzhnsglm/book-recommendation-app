# Kitap Öneri Uygulaması 📚✨

Bu proje, “Şunu okudum, buna benzer ne önerirsin?” sorusuna teknik olarak cevap veren bir kitap öneri sistemi + web arayüzüdür.

Sistem iki parçadan oluşur:

* **`book-recommendation-app/` (Python tarafı)**
  Kitap verisini toplar, işler ve benzerlik hesabını yapar.

* **`book-recommendation-web/` (Next.js tarafı)**
  Kullanıcıya arama / filtreleme / öneri deneyimini sunar.

---

## 1. Projenin Amacı

* Kitap sitelerinden (Goodreads tarzı) kitapları otomatik çek (scraping).
* Her kitabı sayısal olarak temsil et (embedding).
* Kullanıcının seçtiği bir kitaba en çok benzeyen diğer kitapları sırala.
* Bunları modern bir web arayüzünde göster.

Yani:

> “1984”ü seviyorsan, en yakın his olarak ne okumak istersin?
> Bunu otomatik olarak cevaplıyoruz.

---

## 2. Mimari Nasıl Çalışıyor?

### 2.1 Veri Toplama (Scraping)

* `scraping.py` Selenium kullanarak kitap sayfalarını dolaşır.
* Şu bilgileri çeker:

  * Kitap adı
  * Yazar
  * Tür / kategori
  * Ortalama puan
  * Kaç kişi oy vermiş
  * Özet / açıklama
* Bu kayıtlar CSV olarak saklanır (`books.csv`).

> Bu kısım temel olarak küçük bir “mini Goodreads kazıyıcı” gibi çalışır.

---

### 2.2 Embedding ve Benzerlik

* Her kitap için bir vektör (embedding) üretiyoruz ve `embeddings.pt` adlı PyTorch tensörüne kaydediyoruz.

* Bu vektörler, kitabın içeriğini / tarzını sayısal olarak temsil ediyor.
  Benzer kitaplar = vektörü birbirine yakın olanlar.

* `recommend.py` komut satırından çalışıyor:

  * `--book "<isim>" --top 5` → En benzer 5 kitabı döndür
  * Çıktı JSON formatında

Teknik olarak benzerliği şöyle buluyoruz:

* `cosine_similarity(embedding[seçilen_kitap], embedding[tüm_kitaplar])`
* En yüksek skoru alanlar öneri olarak sunuluyor.

---

### 2.3 Web Arayüzü (Next.js)

* `book-recommendation-web/` klasöründeki Next.js uygulaması kullanıcı tarafını yönetir.

* Özellikler:

  * Arama kutusu: yazdıkça kitap başlıklarını önerir
  * “Benzerlerini göster” paneli
  * Kitap listesi sayfası: puana göre sıralama, türe göre filtreleme
  * Yazar sayfası: bir yazara ait tüm kitapları listeleme
  * “Okuyacağım / Okudum” listeleri (localStorage ile tutuluyor, hesap açmadan çalışır)

* Next.js tarafındaki API route’ları doğrudan Python scriptini çağırır.
  Yani frontend şunu yapar:

  1. `/api/recommend?book=1984&top=5` isteğini yollar
  2. Sunucu tarafında Node.js, `recommend.py`’i `child_process.spawn` ile çalıştırır
  3. Python JSON döndürür
  4. Bu JSON sayfada kullanıcıya gösterilir

Bu sayede canlı öneri alıyormuşsun gibi hissediyorsun, ama aslında arkada komut satırı scripti dönüyor 🙂

---

## 3. Klasör Yapısı

```text
kitap/
├─ book-recommendation-app/        # Python tarafı (scraping + öneri motoru)
│  ├─ scraping.py                  # Selenium ile veri çekme
│  ├─ preprocessing.py             # Temizlik, tekilleştirme, CSV hazırlama
│  ├─ recommend.py                 # Benzer kitap önerisi (CLI + JSON out)
│  ├─ books.csv                    # İşlenmiş kitap verisi
│  ├─ embeddings.pt                # Her kitabın embedding vektörü (PyTorch)
│  └─ model.ipynb                  # Embedding üretim süreci (notebook)
│
└─ book-recommendation-web/        # Next.js arayüzü
   ├─ app/                         # App Router sayfaları
   │  ├─ recommend/                # Kitap seç + benzerlerini göster
   │  ├─ books/                    # Katalog + filtre/sıralama
   │  ├─ author/[name]/            # Yazar detay sayfası
   │  └─ my-books/                 # Kullanıcının listeleri (localStorage)
   ├─ app/api/                     # API uçları (Python çağrıları buradan)
   └─ lib/runPython.js             # Python scriptini Node tarafında çalıştırır
```

---

## 4. Çalıştırma (Lokal Geliştirme)

### Python tarafı

```bash
cd book-recommendation-app
pip install torch pandas scikit-learn selenium undetected-chromedriver
python recommend.py --book "1984" --top 5
```

Bu komut, “1984” kitabına benzeyen diğer kitapları JSON olarak yazdırır.

### Web tarafı

```bash
cd book-recommendation-web
npm install
npm run dev
```

Tarayıcıda aç:
`http://localhost:3000`

* `/recommend` sayfasında kitap seçince anında önerileri görebilirsin.
* `/books` sayfasında katalogu gezebilirsin.

---
