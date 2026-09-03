import { computed, ref } from "vue";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "theme";

function readStored(): ThemeMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export const theme = ref<ThemeMode>("light");
export const isDark = computed(() => theme.value === "dark");

export function applyTheme(mode: ThemeMode) {
  theme.value = mode;
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", mode === "dark" ? "#0c0d0e" : "#f9fafb");
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore quota / private mode */
  }
}

export function setTheme(mode: ThemeMode) {
  applyTheme(mode);
}

export function toggleTheme() {
  applyTheme(theme.value === "dark" ? "light" : "dark");
}

export function initTheme() {
  applyTheme(readStored());
}

export function useTheme() {
  return { theme, isDark, setTheme, toggleTheme };
}
