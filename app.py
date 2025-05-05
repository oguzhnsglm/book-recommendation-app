import streamlit as st
import pandas as pd
import torch
from sklearn.metrics.pairwise import cosine_similarity

# Sayfa ayarı
st.set_page_config(page_title="📚 Kitap Öneri Sistemi", layout="centered")

# Verileri yükle
@st.cache_data
def load_data():
    df = pd.read_csv("books.csv")
    embeddings = torch.load("embeddings.pt", map_location="cpu")
    return df, embeddings

df, embeddings = load_data()

# Kosinüs benzerliğini hesapla
@st.cache_data
def compute_similarity(_emb):
    return cosine_similarity(_emb, _emb)

cosine_sim = compute_similarity(embeddings)

# Kitap isimlerini küçük harfe çevirerek indeksleme
indices = pd.Series(df.index, index=df["Book Name"].str.lower())

# Öneri fonksiyonu
def öneri_al(kitap_adi, n=10):
    kitap_adi = kitap_adi.lower()
    if kitap_adi not in indices:
        return pd.DataFrame()

    idx = indices[kitap_adi]
    benzerlik_skorlari = list(enumerate(cosine_sim[idx]))
    benzerlik_skorlari = sorted(benzerlik_skorlari, key=lambda x: x[1], reverse=True)[1:n+1]

    kitap_indexleri = [i[0] for i in benzerlik_skorlari]
    skorlar = [i[1] for i in benzerlik_skorlari]

    önerilenler = df.iloc[kitap_indexleri][["Book Name", "Author", "Genre", "Rating"]].copy()
    önerilenler["Benzerlik Skoru"] = skorlar
    return önerilenler

# Arayüz
st.title("📚 Kitap Öneri Sistemi")
st.write("Bir kitap seçin, benzerlerini önerelim!")

# Kitap seçimi combobox (tüm kitaplar listelenir)
secilen_kitap = st.selectbox("Bir kitap seçin:", options=sorted(df["Book Name"].unique()))

if secilen_kitap:
    öneriler = öneri_al(secilen_kitap)
    if öneriler.empty:
        st.warning("❌ Bu kitap için öneri bulunamadı.")
    else:
        st.success(f"📖 '{secilen_kitap}' kitabına benzer öneriler:")
        st.dataframe(öneriler, use_container_width=True)
