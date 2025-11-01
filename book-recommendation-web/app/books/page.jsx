"use client";
import { useEffect, useMemo, useState } from "react";

export default function BooksPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [genre, setGenre] = useState("Tümü");
  const [order, setOrder] = useState("desc");
  const [q, setQ] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((d) => { setItems(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setItems([]); setLoading(false); setError("Veri alınamadı"); });
  }, []);

  const genres = useMemo(() => {
    const set = new Set();
    items.forEach((it) => { if (it?.Genre) set.add(it.Genre); });
    return ["Tümü", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (genre !== "Tümü") list = list.filter((it) => it.Genre === genre);
    const qe = q.trim().toLowerCase();
    if (qe) list = list.filter((it) => String(it["Book Name"]).toLowerCase().includes(qe));
    const getRating = (r) => {
      if (typeof r?.RatingValue === "number") return r.RatingValue;
      const t = String(r?.Rating || "").replace(",", ".");
      const v = parseFloat(t);
      return isNaN(v) ? -Infinity : v;
    };
    list = list.slice().sort((a, b) => (order === "desc" ? getRating(b) - getRating(a) : getRating(a) - getRating(b)));
    return list;
  }, [items, genre, order, q]);

  return (
    <div className="container">
      <div className="header" style={{ marginBottom: 12 }}>
        <div className="title">Kitaplar</div>
        <div className="subtitle">Kategorilere göre filtreleyin ve puana göre sıralayın</div>
      </div>

      <div className="panel" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input className="input" placeholder="Başlık ara" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, minWidth: 220 }} />
        <select className="input" value={genre} onChange={(e) => setGenre(e.target.value)} style={{ width: 220 }}>
          {genres.map((g) => (<option key={g} value={g}>{g}</option>))}
        </select>
        <select className="input" value={order} onChange={(e) => setOrder(e.target.value)} style={{ width: 220 }}>
          <option value="desc">Puan: yüksek → düşük</option>
          <option value="asc">Puan: düşük → yüksek</option>
        </select>
      </div>

      {loading ? (
        <div className="panel" style={{ marginTop: 14 }}>Yükleniyor...</div>
      ) : error ? (
        <div className="panel" style={{ marginTop: 14 }}>{error}</div>
      ) : (
        <div className="grid">
          {filtered.map((r) => (
            <div className="card" key={r["Book Name"] + r.Author}>
              <div className="row">
                <h3>{r["Book Name"]}</h3>
                <div className="rating">{r.Rating ? `Puan ${r.Rating}` : "Puan yok"}</div>
              </div>
              <div className="muted">
                <a href={`/author/${encodeURIComponent(r.Author)}`} className="link">{r.Author || "Bilinmeyen yazar"}</a>
              </div>
              <div className="tag">{r.Genre || "Tür Yok"}</div>
              <div className="muted" style={{ fontSize: 12 }}>{r["Vote Count"] ? `${r["Vote Count"]}` : (typeof r.RatingsCount === 'number' ? `${r.RatingsCount} ratings` : '')}</div>
              {r.Summary && <div className="muted" style={{ fontSize: 12 }}>{String(r.Summary).slice(0, 140)}{String(r.Summary).length > 140 ? '…' : ''}</div>}
              <div className="row">
                <a className="button ghost" href="#" onClick={(e) => { e.preventDefault(); import("@/lib/lists").then(m => m.toggleToRead(r)); }}>Okuyacaklarıma</a>
                <a className="button ghost" href="#" onClick={(e) => { e.preventDefault(); import("@/lib/lists").then(m => m.toggleRead(r)); }}>Okudum</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
