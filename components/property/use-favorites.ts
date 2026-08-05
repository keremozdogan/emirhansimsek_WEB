"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Favoriler ve karşılaştırma listesi — tarayıcının localStorage'ında tutulur.
 *
 * Sunucu tarafında kullanıcı hesabı olmadığı için kalıcılık cihaz bazlıdır.
 * `useSyncExternalStore` sayesinde aynı sayfadaki tüm bileşenler anında
 * güncellenir (sekmeler arası senkron için `storage` olayı da dinlenir).
 */

const FAVORITES_KEY = "es_favorites";
const COMPARE_KEY = "es_compare";
export const MAX_COMPARE = 3;

type Listener = () => void;

function createStore(key: string) {
  const listeners = new Set<Listener>();
  let snapshot: string[] = [];
  let initialized = false;

  function read(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
    } catch {
      return [];
    }
  }

  function emit() {
    listeners.forEach((listener) => listener());
  }

  return {
    subscribe(listener: Listener) {
      if (!initialized) {
        snapshot = read();
        initialized = true;
      }
      listeners.add(listener);

      const onStorage = (event: StorageEvent) => {
        if (event.key === key) {
          snapshot = read();
          emit();
        }
      };
      window.addEventListener("storage", onStorage);

      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot() {
      if (!initialized && typeof window !== "undefined") {
        snapshot = read();
        initialized = true;
      }
      return snapshot;
    },
    getServerSnapshot(): string[] {
      return EMPTY;
    },
    set(next: string[]) {
      snapshot = next;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Depolama kotası dolu veya gizli mod — sessizce geç
      }
      emit();
    },
  };
}

const EMPTY: string[] = [];

const favoritesStore = createStore(FAVORITES_KEY);
const compareStore = createStore(COMPARE_KEY);

function useStore(store: ReturnType<typeof createStore>) {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
}

export function useFavorites() {
  const ids = useStore(favoritesStore);

  const toggle = useCallback((id: string) => {
    const current = favoritesStore.getSnapshot();
    favoritesStore.set(
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }, []);

  const remove = useCallback((id: string) => {
    favoritesStore.set(
      favoritesStore.getSnapshot().filter((item) => item !== id),
    );
  }, []);

  const clear = useCallback(() => favoritesStore.set([]), []);

  return { ids, toggle, remove, clear, has: (id: string) => ids.includes(id) };
}

export function useCompare() {
  const ids = useStore(compareStore);

  /** Liste doluysa `false` döner; çağıran taraf kullanıcıyı uyarabilir. */
  const toggle = useCallback((id: string) => {
    const current = compareStore.getSnapshot();
    if (current.includes(id)) {
      compareStore.set(current.filter((item) => item !== id));
      return true;
    }
    if (current.length >= MAX_COMPARE) return false;
    compareStore.set([...current, id]);
    return true;
  }, []);

  const remove = useCallback((id: string) => {
    compareStore.set(compareStore.getSnapshot().filter((item) => item !== id));
  }, []);

  const clear = useCallback(() => compareStore.set([]), []);

  return { ids, toggle, remove, clear, has: (id: string) => ids.includes(id) };
}

const noopSubscribe = () => () => {};

/**
 * Hidrasyon uyuşmazlığını önlemek için: istemci tarafına geçildi mi?
 * Sunucuda `false`, istemcide `true` döner.
 */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
