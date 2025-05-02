import pandas as pd
import re

# CSV dosyasını yükleyelim
df = pd.read_csv('books.csv')

# 1. Null satırları bul
null_rows = df[df.isnull().any(axis=1)]
print(f"Toplam null satır sayısı: {len(null_rows)}")
print(null_rows)

# Latin dışı karakterleri içeren satırları bulan fonksiyon
def non_latin_chars(text):
    # Latin alfabesi harfleri, rakamlar, boşluk ve temel noktalama işaretleri dışındaki her şey
    return bool(re.search(r'[^a-zA-Z0-9\s.,?!\'\":;\-]', str(text)))

# Latin olmayan satırları bul
non_latin_rows = df[df['Book Name'].apply(non_latin_chars)]
print(f"\nLatin alfabesi olmayan satır sayısı: {len(non_latin_rows)}")
print(non_latin_rows)

# İçerisinde 'http' geçen satırları bul
http_rows = df[df.apply(lambda row: row.astype(str).str.contains('http').any(), axis=1)]
print(f"\nHTTP içeren satır sayısı: {len(http_rows)}")
print(http_rows)

# Null değer içeren satırları tekrar kontrol et (güncel veri çerçevesi)
null_rows = df[df.isnull().any(axis=1)]
print(f"\nNull değer içeren satır sayısı: {len(null_rows)}")
print(null_rows)

# Tüm problemli satırları birleştir
all_problematic_rows = pd.concat([null_rows, non_latin_rows, http_rows]).drop_duplicates()

print(f"\nToplam problemli satır sayısı: {len(all_problematic_rows)}")
print(all_problematic_rows)

# Problemli satırları sil
clean_df = df.drop(all_problematic_rows.index)

# 🔁 Book Name + Rating aynı olan satırları teke indir
before = len(clean_df)
clean_df = clean_df.drop_duplicates(subset=['Book Name', 'Rating'])
after = len(clean_df)
print(f"\n📚 Book Name + Rating tekrarları kaldırıldı: {before - after} satır silindi. Kalan: {after}")

# Temiz veriyi aynı CSV dosyasına kaydet
clean_df.to_csv('books.csv', index=False)