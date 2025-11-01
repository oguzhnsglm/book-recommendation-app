import argparse
import json
import os
import sys
from typing import List

import pandas as pd
import torch
from sklearn.metrics.pairwise import cosine_similarity


def load_data(base_dir: str):
    books_path = os.path.join(base_dir, "books.csv")
    emb_path = os.path.join(base_dir, "embeddings.pt")

    df = pd.read_csv(books_path)
    embeddings = torch.load(emb_path, map_location="cpu")
    if isinstance(embeddings, torch.Tensor):
        emb = embeddings.numpy()
    else:
        # Fallback if saved as list/array
        emb = torch.tensor(embeddings).numpy()
    return df, emb


def list_books(df: pd.DataFrame) -> List[str]:
    return df["Book Name"].dropna().astype(str).unique().tolist()


def recommend(df: pd.DataFrame, emb, book_name: str, top_k: int = 10):
    # Build index by lowercase title
    indices = pd.Series(df.index, index=df["Book Name"].astype(str).str.lower())
    key = (book_name or "").strip().lower()
    if key not in indices:
        return []

    idx = int(indices[key])
    sim_row = cosine_similarity([emb[idx]], emb)[0]

    # Enumerate and sort, skipping the same book (index itself)
    ranked = sorted(((i, float(s)) for i, s in enumerate(sim_row)), key=lambda x: x[1], reverse=True)
    ranked = [(i, s) for i, s in ranked if i != idx][: top_k]

    out = []
    for i, score in ranked:
        row = df.iloc[i]
        out.append(
            {
                "Book Name": str(row.get("Book Name", "")),
                "Author": str(row.get("Author", "")),
                "Genre": str(row.get("Genre", "")),
                "Rating": str(row.get("Rating", "")),
                "Similarity": score,
            }
        )
    return out


def main():
    parser = argparse.ArgumentParser(description="Book recommendation CLI (JSON output)")
    parser.add_argument("--book", type=str, help="Book name to find similar ones", default=None)
    parser.add_argument("--top", type=int, help="Top-K recommendations", default=10)
    parser.add_argument("--list-books", action="store_true", help="List all book names (JSON array)")
    parser.add_argument("--list-all", action="store_true", help="List full catalog records (JSON array)")
    parser.add_argument(
        "--base-dir",
        type=str,
        default=os.path.dirname(os.path.abspath(__file__)),
        help="Directory containing books.csv and embeddings.pt",
    )

    args = parser.parse_args()

    try:
        df, emb = load_data(args.base_dir)
    except Exception as e:
        err = {"error": f"Failed to load data: {e}"}
        json.dump(err, sys.stdout, ensure_ascii=False)
        sys.exit(1)

    if args.list_books:
        json.dump(list_books(df), sys.stdout, ensure_ascii=False)
        return

    if args.list_all:
        cols = ["Book Name", "Author", "Genre", "Rating", "Summary", "Vote Count", "Review Count"]
        # Ensure columns exist; fill missing with empty strings
        out = []
        for _, row in df.iterrows():
            rec = {c: str(row.get(c, "")) for c in cols}
            # Add numeric rating if parsable
            try:
                rec["RatingValue"] = float(str(rec["Rating"]).replace(",", ".").strip())
            except Exception:
                rec["RatingValue"] = None
            # Extract numeric counts from textual fields like "5,004,555 ratings"
            def parse_count(val: str):
                s = str(val)
                digits = "".join(ch for ch in s if ch.isdigit())
                try:
                    return int(digits) if digits else None
                except Exception:
                    return None
            rec["RatingsCount"] = parse_count(rec.get("Vote Count", ""))
            rec["ReviewsCount"] = parse_count(rec.get("Review Count", ""))
            out.append(rec)
        json.dump(out, sys.stdout, ensure_ascii=False)
        return

    if not args.book:
        json.dump({"error": "--book is required unless --list-books is used"}, sys.stdout, ensure_ascii=False)
        sys.exit(2)

    recs = recommend(df, emb, args.book, top_k=args.top)
    json.dump(recs, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    # Ensure UTF-8 output
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass
    main()
