export type ToastTone = "success" | "error" | "info";
export type ToastItem = { id: string; message: string; tone: ToastTone };
type Listener = (toasts: ToastItem[]) => void;

let items: ToastItem[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => fn([...items]));
}

export function addToast(message: string, tone: ToastTone = "info", duration = 4000) {
  const id = Math.random().toString(36).slice(2, 9);
  items = [...items, { id, message, tone }];
  notify();
  setTimeout(() => removeToast(id), duration);
}

export function removeToast(id: string) {
  items = items.filter((t) => t.id !== id);
  notify();
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  fn([...items]);
  return () => { listeners.delete(fn); };
}
