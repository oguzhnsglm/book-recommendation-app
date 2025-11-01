"use client";
import { useEffect, useMemo, useState } from "react";

export default function AuthorPage({ params }) {
  const name = decodeURIComponent(params.name || "");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setItems(list.filter((it) => String(it.Author).toLowerCase() === name.toLowerCase()));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [name]);

  const title = useMemo(() => (name ? `${name} - Kitapları` : "Yazar"), [name]);

  return (
    <div className="container">
      <div className="header" style={{ marginBottom: 12 }}>
        <div className="title">{title}</div>
        <div className="subtitle">Yazara ait kitaplar</div>
      </div>
      {loading ? (
        <div className="panel">Yükleniyor...</div>
      ) : (
        <div className="grid">
          {items.map((r) => (
            <div className="card" key={r["Book Name"] + r.Author}>
              <div className="row">
                <h3>{r["Book Name"]}</h3>
                <div className="rating">{r.Rating ? `Puan ${r.Rating}` : "Puan yok"}</div>
              </div>
              <div className="muted">{r.Author}</div>
              <div className="tag">{r.Genre || "Tür Yok"}</div>
              <div className="muted" style={{ fontSize: 12 }}>{r["Vote Count"] ? `${r["Vote Count"]}` : (typeof r.RatingsCount === 'number' ? `${r.RatingsCount} ratings` : '')}</div>
              {r.Summary && <div className="muted" style={{ fontSize: 12 }}>{String(r.Summary).slice(0, 160)}{String(r.Summary).length > 160 ? '…' : ''}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

