"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const [listsVersion, setListsVersion] = useState(0);

  useEffect(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setBooks(d) : setBooks([])))
      .catch(() => setBooks([]));
  }, []);

  const suggestions = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const list = books.filter((b) => b.toLowerCase().startsWith(query));
    return list.slice(0, 20);
  }, [q, books]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  async function onSearch(e) {
    e.preventDefault();
    const title = selected || q;
    if (!title) return;
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const res = await fetch(
        `/api/recommend?book=${encodeURIComponent(title)}&top=12`
      );
      const data = await res.json();
      if (Array.isArray(data)) setResults(data);
      else setError(data?.error || "Bilinmeyen bir hata oluştu");
    } catch (e) {
      setError("Sunucuya erişilemedi");
    } finally {
      setLoading(false);
    }
  }

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && active >= 0 && active < suggestions.length) {
        e.preventDefault();
        setSelected(suggestions[active]);
        setQ(suggestions[active]);
        closeDropdown();
      }
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="title">Kitap Öneri Sistemi</div>
          <div className="subtitle">
            PyTorch gömlemeleri ile benzer kitapları keşfedin
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <form className="searchbar" onSubmit={onSearch} autoComplete="off">
          <div className="suggest" style={{ flex: 1 }}>
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded={open}
              aria-controls="book-suggest-list"
              aria-autocomplete="list"
              className="input select-input"
              placeholder="Yazın: Başlayan başlıklar altta listelensin (örn: a)"
              value={q}
              onFocus={() => setOpen(q.trim().length > 0)}
              onKeyDown={onKeyDown}
              onChange={(e) => {
                setSelected("");
                setQ(e.target.value);
                const val = e.target.value.trim();
                setOpen(val.length > 0);
                setActive(val.length > 0 ? 0 : -1);
              }}
              onBlur={() => setTimeout(() => closeDropdown(), 120)}
            />
            {open && suggestions.length > 0 && !selected && (
              <div id="book-suggest-list" role="listbox" className="suggest-list">
                {suggestions.map((s, i) => (
                  <div
                    key={s}
                    role="option"
                    aria-selected={i === active}
                    className={`suggest-item${i === active ? " active" : ""}`}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelected(s);
                      setQ(s);
                      closeDropdown();
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Aranıyor..." : "Öner"}
          </button>
          <button
            className="button secondary"
            type="button"
            onClick={() => {
              setQ("");
              setSelected("");
              setResults([]);
              setError("");
            }}
          >
            Temizle
          </button>
        </form>
        <div className="tags">
          <span className="tag">Toplam kitap: {books.length}</span>
          <span className="tag">Öneri kaynağı: embeddings.pt</span>
        </div>
      </div>

      {error && (
        <div
          className="panel"
          style={{ marginTop: 14, borderColor: "#5b2332", background: "#1a0f14" }}
        >
          {error}
        </div>
      )}

      <div className="grid">
        {results.map((r) => (
          <div className="card" key={r["Book Name"] + r.Similarity}>
            <div className="row">
              <h3>{r["Book Name"]}</h3>
              <div className="sim">Benzerlik {(r.Similarity * 100).toFixed(1)}%</div>
            </div>
            <div className="muted"><a className="link" href={`/author/${encodeURIComponent(r.Author)}`}>{r.Author || "Bilinmeyen yazar"}</a></div>
            <div className="row">
              <div className="tag">{r.Genre || "Tür Yok"}</div>
              <div className="rating">{r.Rating ? `Puan ${r.Rating}` : "Puan yok"}</div>
            </div>
            <div className="row">
              <a className="button ghost" href="#" onClick={(e) => { e.preventDefault(); import("@/lib/lists").then(m => { m.toggleToRead(r); setListsVersion(v=>v+1); }); }}>Okuyacaklarıma ekle</a>
              <a className="button ghost" href="#" onClick={(e) => { e.preventDefault(); import("@/lib/lists").then(m => { m.toggleRead(r); setListsVersion(v=>v+1); }); }}>Okudum</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
