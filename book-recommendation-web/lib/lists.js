export const STORE_KEY = "my-book-lists";

export function getLists() {
  if (typeof window === "undefined") return { toRead: [], read: [] };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { toRead: [], read: [] };
    const data = JSON.parse(raw);
    return {
      toRead: Array.isArray(data?.toRead) ? data.toRead : [],
      read: Array.isArray(data?.read) ? data.read : [],
    };
  } catch {
    return { toRead: [], read: [] };
  }
}

export function saveLists(lists) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(lists));
}

export function keyOf(item) {
  return `${item["Book Name"] || ""}__${item.Author || ""}`;
}

export function inList(list, item) {
  const k = keyOf(item);
  return list.some((x) => keyOf(x) === k);
}

export function toggleToRead(item) {
  const lists = getLists();
  const exists = inList(lists.toRead, item);
  lists.toRead = exists
    ? lists.toRead.filter((x) => keyOf(x) !== keyOf(item))
    : [item, ...lists.toRead];
  saveLists(lists);
  return lists;
}

export function toggleRead(item) {
  const lists = getLists();
  const exists = inList(lists.read, item);
  lists.read = exists
    ? lists.read.filter((x) => keyOf(x) !== keyOf(item))
    : [item, ...lists.read];
  saveLists(lists);
  return lists;
}

