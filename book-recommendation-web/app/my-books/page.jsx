"use client";
import { useEffect, useState } from "react";
import { getLists, toggleRead, toggleToRead } from "@/lib/lists";

export default function MyBooksPage() {
  const [lists, setLists] = useState({ toRead: [], read: [] });

  const refresh = () => setLists(getLists());
  useEffect(() => { refresh(); }, []);

  return (
    <div className="container">
      <div className="header" style={{ marginBottom: 12 }}>
        <div className="title">Listelerim</div>
        <div className="subtitle">Okuyacaklarım ve Okuduklarım</div>
      </div>

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="title" style={{ fontSize: 18 }}>Okuyacaklarım</div>
        <div className="grid">
          {lists.toRead.length === 0 && <div className="muted">Listeniz boş.</div>}
          {lists.toRead.map((r) => (
            <div className="card" key={(r["Book Name"]||"") + (r.Author||"")}>
              <div className="row">
                <h3>{r["Book Name"]}</h3>
                <div className="rating">{r.Rating ? `Puan ${r.Rating}` : "Puan yok"}</div>
              </div>
              <div className="muted">{r.Author}</div>
              <div className="row">
                <a className="button ghost" href="#" onClick={(e)=>{e.preventDefault(); toggleToRead(r); refresh();}}>Listeden çıkar</a>
                <a className="button ghost" href="#" onClick={(e)=>{e.preventDefault(); toggleRead(r); refresh();}}>Okudum</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="title" style={{ fontSize: 18 }}>Okuduklarım</div>
        <div className="grid">
          {lists.read.length === 0 && <div className="muted">Listeniz boş.</div>}
          {lists.read.map((r) => (
            <div className="card" key={(r["Book Name"]||"") + (r.Author||"")}>
              <div className="row">
                <h3>{r["Book Name"]}</h3>
                <div className="rating">{r.Rating ? `Puan ${r.Rating}` : "Puan yok"}</div>
              </div>
              <div className="muted">{r.Author}</div>
              <div className="row">
                <a className="button ghost" href="#" onClick={(e)=>{e.preventDefault(); toggleRead(r); refresh();}}>Listeden çıkar</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

