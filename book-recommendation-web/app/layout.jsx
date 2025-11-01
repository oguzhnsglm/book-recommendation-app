import "./globals.css";

export const metadata = {
  title: "Kitap Öneri Sistemi",
  description: "PyTorch gömlemeleri ile kitap önerileri",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <nav className="navbar">
          <div className="nav-inner">
            <a className="brand" href="/recommend">Kitap Öneri</a>
            <div className="spacer" />
            <a className="navlink" href="/recommend">Öneri</a>
            <a className="navlink" href="/books">Kitaplar</a>
            <a className="navlink" href="/my-books">Listelerim</a>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
