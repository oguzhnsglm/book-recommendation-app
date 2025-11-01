# Kitap Öneri Uygulaması

PyTorch gömlemeleri ile kitap benzerliği hesaplayan, Next.js tabanlı modern bir web arayüzüne sahip öneri ve katalog uygulaması. Veri akışı, Goodreads benzeri kaynaklardan Selenium ile kazıma (scraping), önişleme, gömme (embedding) çıkarımı ve web katmanında servis edilmesi aşamalarını içerir.

## İçindekiler
- Genel Bakış
- Mimari ve Teknolojiler
- Özellikler
- Veri Toplama (Scraping)
- Önişleme ve Gömlemeler
- Python CLI ve Öneri Mantığı
- Web Uygulaması (Next.js)
- API Uçları
- Kurulum ve Çalıştırma
- Geliştirme Notları
- Güvenlik, Etik ve Yasal Hususlar

## Genel Bakış
Bu depo iki ana parçadan oluşur:
- `book-recommendation-app/`: Veri, scraping, önişleme, gömme çıkarımı ve öneri mantığının yer aldığı Python tarafı.
- `book-recommendation-web/`: Next.js 14 App Router ile oluşturulmuş, API route’larının Python CLI’ı çağırdığı ve modern UI içeren web uygulaması.

## Mimari ve Teknolojiler
- Gömme/Benzerlik: PyTorch tensör (`embeddings.pt`) + kosinüs benzerliği (scikit-learn)
- Python veri işleme: `pandas`
- Web arayüzü: Next.js 14 (App Router), React 18
- API ↔ Python entegrasyonu: Node `child_process.spawn` ile `recommend.py` çağrısı, JSON çıktı
- Scraping: Selenium (+ undetected-chromedriver) ile dinamik sayfa gezme ve CSV’ye yazma

## Özellikler
- Öneri araması: Yazılabilir kutu, yazdıkça başıyla eşleşen öneriler; yön tuşları + Enter ile seçim
- Kitaplar sayfası: Kategoriye göre filtreleme, puana göre sıralama, başlık araması, rate eden kişi sayısı gösterimi
- Yazar sayfası: Yazara tıklayınca o yazara ait kitapların listesi
- Listelerim: “Okuyacaklarım” ve “Okuduklarım” (localStorage ile istemci tarafında saklanır)
- Açık renk tema, buton ve kartlarda hover/klik animasyonları

## Veri Toplama (Scraping)
- Dosya: `book-recommendation-app/scraping.py:1`
- Kullanım: Selenium + undetected-chromedriver ile siteye giriş yapar, seçili liste/katagorideki kitapların detaylarını gezerek aşağıdaki başlıklarla CSV’ye ekler:
  - `Genre`, `Book Name`, `Rating`, `Vote Count`, `Review Count`, `Summary`, `Author`
- Notlar:
  - Script örnek olarak bir roman listesi sayfasını dolaşacak şekilde yazılmıştır. Başlangıç URL’leri ve sayfa gezme mantığı (Next butonu) mevcuttur.
  - Kullanıcı adı/şifre alanları örnektir. Dışarıdan çevresel değişkenlerle alınması önerilir (örn. `GOODREADS_EMAIL`, `GOODREADS_PASSWORD`).
  - Büyük veri çekimlerinde hız/etik/dosya bütünlüğü için beklemeler, hata yakalama ve kısmi yazma (flush) uygulanmıştır.

## Önişleme ve Gömlemeler
- Önişleme: `book-recommendation-app/preprocessing.py:1`
  - Eksik alanlı ve Latin dışı karakterler içeren satırlar temizlenir
  - Yinelenen (Book Name + Rating) kayıtlar tekilleştirilir
  - Sonuç geri `books.csv` olarak yazılır
- Gömme çıkarımı: `book-recommendation-app/model.ipynb` (örnek çalışma defteri)
  - Çıktı: `embeddings.pt` (şu an 6091 x 384 boyutlu bir tensör)
  - Not: Embedding üretimi bu depoda offline yapılmış kabul edilir. Defteri açıp uygun bir cümle gömme modelinden (örn. başlık/özetlerden) embedding üretip `pt` olarak kaydedebilirsiniz.

## Python CLI ve Öneri Mantığı
- Dosya: `book-recommendation-app/recommend.py:1`
- Yetenekler:
  - `--list-books`: Sadece kitap adlarının listesi (JSON array)
  - `--list-all`: Tüm katalog kayıtları (JSON array). Kolonlara ek olarak aşağıdakileri türetir:
    - `RatingValue` (sayısal), `RatingsCount`, `ReviewsCount`
  - `--book "<başlık>" --top N`: Verilen kitaba benzer ilk N öneri
- Benzerlik: `cosine_similarity(emb[idx], emb)`; aynı kayıt filtrelenir, skorlar büyükten küçüğe sıralanır

## Web Uygulaması (Next.js)
- Klasör: `book-recommendation-web/`
- Sayfalar:
  - `app/recommend/page.jsx:1`: Öneri araması (dropdown/combobox deneyimi)
  - `app/books/page.jsx:1`: Katalog, filtre/sıralama ve rate sayısı
  - `app/author/[name]/page.jsx:1`: Yazarın kitapları
  - `app/my-books/page.jsx:1`: Okuyacaklarım ve Okuduklarım listeleri
  - `app/layout.jsx:1`: Navbar ve temel iskelet
  - `app/page.jsx:1`: `/recommend`’e yönlendirme
- Stil: `app/globals.css:1` (açık tema, animasyonlar, grid/kart tasarımı)
- Python entegrasyonu: `lib/runPython.js:1`
  - Next API, `child_process.spawn` ile `book-recommendation-app/recommend.py`’i çalıştırır; `PYTHONIOENCODING=utf-8` ile JSON okunur

## API Uçları
- `GET /api/books` → `--list-books` (sadece başlıklar)
- `GET /api/catalog` → `--list-all` (tüm alanlar + türetilen metrikler)
- `GET /api/recommend?book=…&top=…` → `--book`/`--top`

## Kurulum ve Çalıştırma
Önkoşullar: Python 3.9+ ve Node.js 18+

1) Python bağımlılıkları (öneri motoru):
- `pip install torch pandas scikit-learn`
- Scraping için: `pip install selenium undetected-chromedriver`

2) Veriler
- Katalog: `book-recommendation-app/books.csv`
- Gömlemeler: `book-recommendation-app/embeddings.pt`
- Doğrulama:
  - `python book-recommendation-app/recommend.py --book "1984" --top 5`

3) Web uygulaması
- `cd book-recommendation-web`
- `npm install`
- Geliştirme: `npm run dev` → `http://localhost:3000`
- Üretim: `npm run build && npm start`

## Geliştirme Notları
- Windows’ta Python komutu `python`, Unix’te `python3` olabilir; `lib/runPython.js` bu farkı ele alır.
- Serverless dağıtımlarda harici Python çalıştırmak zordur; klasik VM/Container üzerinde barındırma önerilir.
- “Listelerim” verisi istemci tarafında `localStorage` ile saklanır (oturumlar arası kalıcı, cihazlar arası senkron değildir).

## Güvenlik, Etik ve Yasal Hususlar
- Scraping yaparken hedef sitenin Kullanım Koşulları’na, robots.txt ve hız/istek sınırlarına uyun.
- Gerekirse yazılımı sadece kendi verileriniz veya açık lisanslı kaynaklarla kullanın.
- Kimlik bilgilerini kod içinde tutmayın; ortam değişkenleri ve gizli yönetimi kullanın.

---
Her türlü ek özellik (sunucu tarafı önbellekleme, sayfalama, gelişmiş filtreler, kullanıcı oturumu ile listelerin sunucuda saklanması) için yardımcı olabilirim.

