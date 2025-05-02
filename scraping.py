import os
from undetected_chromedriver import Chrome as uc_Chrome  # UC Driver import edildi
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import csv

# Kullanıcı bilgileri
email = "username@gmail.com"
password = "password"

# UC Driver başlatma
driver = uc_Chrome()  # UC Driver ile değiştirildi

# Sadece seçili kitap türüne odaklanıyoruz
genre = "romance"

# CSV dosyasının varlığını kontrol et
csv_file = f"romance_books.csv"
file_exists = os.path.isfile(csv_file)

# CSV dosyasını açma
output_file = open(csv_file, mode='a', newline='', encoding='utf-8')
csv_writer = csv.writer(output_file, quotechar='"', quoting=csv.QUOTE_ALL)

# Eğer dosya yeni oluşturuluyorsa, başlıkları yaz
if not file_exists:
    csv_writer.writerow(["Genre", "Book Name", "Rating", "Vote Count", "Review Count", "Summary", "Author"])
    print(f"✅ Yeni dosya oluşturuldu: {csv_file}")
else:
    print(f"✅ Mevcut dosyaya veriler eklenecek: {csv_file}")

# Giriş işlemi
driver.get(f"https://www.goodreads.com/list/show/10762.Best_Book_Boyfriends?page=7")

try:
    # "Sign In" linkine tıklama
    sign_in_link = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.LINK_TEXT, "Sign In"))
    )
    sign_in_link.click()
    print("✅ 'Sign In' linkine tıklandı.")

    # "Sign in with email" butonuna tıklama
    sign_in_email_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, 'button.authPortalSignInButton'))
    )
    sign_in_email_button.click()
    print("✅ 'Sign in with email' butonuna tıklandı.")

    # E-posta girme
    email_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ap_email"))
    )
    email_input.send_keys(email)
    print("✅ E-posta girildi.")

    # Şifre girme
    password_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ap_password"))
    )
    password_input.send_keys(password)
    print("✅ Şifre girildi.")

    # "Sign In" butonuna tıklama
    sign_in_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "signInSubmit"))
    )
    sign_in_button.click()
    print("✅ Giriş yapıldı.")
    time.sleep(2)  # Giriş sonrası sayfanın yüklenmesi için bekleme süresi

except Exception as e:
    print(f"🚨 Giriş işlemi sırasında hata oluştu: {e}")
    driver.quit()
    exit()

# Romance türüne ait kitaplar için işlemler
driver.get(f"https://www.goodreads.com/list/show/10762.Best_Book_Boyfriends?page=1")

time.sleep(2)  # Sayfanın yüklenmesi için bekleme süresi

# Kitapları işlemeye başla
while True:
    try:
        for i in range(1, 101):  # Her sayfada 100 kitabı kontrol et
            try:
                # Kitap detayına git
                book_link = driver.find_element(By.CSS_SELECTOR, f'#all_votes > table > tbody > tr:nth-child({i}) > td:nth-child(3) > a > span')
                book_link.click()
                time.sleep(1)  # Sayfanın yüklenmesini beklemek için ek süre

                # **Kitap bilgilerini çek ve CSV'ye kaydet**
                book_name, rating, vote_count, review_count, summary, author = None, None, None, None, None, None
                try:
                    book_name = driver.find_element(By.CSS_SELECTOR, 'h1[data-testid="bookTitle"]').text
                    print(f"📚 Kitap adı bulundu: {book_name}")
                except Exception:
                    print("❌ Kitap adı bulunamadı.")

                try:
                    rating = driver.find_element(By.CSS_SELECTOR, 'div.RatingStatistics__rating').text
                    print(f"⭐ Puan bilgisi bulundu: {rating}")
                except Exception:
                    print("❌ Puan bilgisi bulunamadı.")

                try:
                    vote_count = driver.find_element(By.CSS_SELECTOR, 'span[data-testid="ratingsCount"]').text
                    print(f"🗳️ Oy sayısı bulundu: {vote_count}")
                except Exception:
                    print("❌ Oy sayısı bulunamadı.")

                try:
                    review_count = driver.find_element(By.CSS_SELECTOR, 'span[data-testid="reviewsCount"]').text
                    print(f"✍️ Yorum sayısı bulundu: {review_count}")
                except Exception:
                    print("❌ Yorum sayısı bulunamadı.")

                try:
                    summary = driver.find_element(By.CSS_SELECTOR, 'div.DetailsLayoutRightParagraph span.Formatted').text
                    print(f"📄 Özet bilgisi bulundu: {summary}")
                except Exception:
                    print("❌ Özet bilgisi bulunamadı.")

                try:
                    author = driver.find_element(By.CSS_SELECTOR, 'span[data-testid="name"]').text
                    print(f"👨‍💻 Yazar bilgisi bulundu: {author}")
                except Exception:
                    print("❌ Yazar bilgisi bulunamadı.")

                # Eğer hiçbir veri alınamazsa driver.back() ÇALIŞMASIN
                if book_name and rating and vote_count and review_count and summary and author:
                    # **Verileri kaydet**
                    csv_writer.writerow([genre, book_name, rating, vote_count, review_count, summary, author])
                    print(f"✅ Veriler kaydedildi: {book_name}")
                    output_file.flush()  # Anında dosyaya yaz

                    # Geri dön (sadece başarılı veri alındıysa)
                    driver.back()
                    time.sleep(1)
                else:
                    print("⚠️ Eksik veri bulundu, driver.back() çalıştırılmadı!")

            except Exception as e:
                print(f"⚠️ Kitap işlenirken hata oluştu: {e}")
                continue  # Hata olursa sonraki kitaba geç

        # Sonraki sayfaya geçmek için 'Next' butonuna tıklama
        try:
            next_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, 'a.next_page[rel="next"]'))
            )
            next_button.click()
            print("✅ 'Next' butonuna tıklandı ve bir sonraki sayfaya geçildi.")
            time.sleep(2)
        except Exception:
            print("❌ 'Next' butonu bulunamadı. Tüm sayfalar işlendi.")
            break

    except Exception as e:
        print(f"🚨 İşleme sırasında hata oluştu: {e}")
        break

# CSV dosyasını kapat ve driver'ı kapat
output_file.close()
driver.quit()
