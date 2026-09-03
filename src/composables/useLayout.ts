import { ref } from "vue";

const MOBILE_MQ = "(max-width: 575px)";

function phoneNow() {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_MQ).matches;
}

export const isPhone = ref(phoneNow());
export const menuOpen = ref(!phoneNow());
export const searchOpen = ref(false);
export const searchQuery = ref("");

export function closeMenu() {
  menuOpen.value = false;
}

export function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

export function openSearch() {
  searchOpen.value = true;
}

export function closeSearch() {
  searchOpen.value = false;
  searchQuery.value = "";
}

export function initLayoutViewport() {
  const mq = window.matchMedia(MOBILE_MQ);
  const sync = () => {
    const phone = mq.matches;
    if (phone === isPhone.value) return;
    isPhone.value = phone;
    menuOpen.value = !phone;
  };
  isPhone.value = mq.matches;
  menuOpen.value = !mq.matches;
  mq.addEventListener("change", sync);
  return () => mq.removeEventListener("change", sync);
}

export function useLayout() {
  return {
    isPhone,
    menuOpen,
    searchOpen,
    searchQuery,
    toggleMenu,
    closeMenu,
    openSearch,
    closeSearch,
  };
}
