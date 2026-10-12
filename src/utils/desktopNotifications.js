// Utility for native desktop system notifications and Web Push

const SEEN_NOTIFICATIONS_KEY = "annually_seen_desktop_notifications";

/**
 * Check if the browser supports desktop notifications
 */
export function isNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission() {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

/**
 * Register Service Worker for background push handling
 */
export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    return registration;
  } catch (err) {
    console.warn("[PUSH] Service Worker registration failed:", err);
    return null;
  }
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  try {
    const result = await Notification.requestPermission();
    return result === "granted";
  } catch (err) {
    console.error("[PUSH] Error requesting notification permission:", err);
    return false;
  }
}

/**
 * Play a subtle Web Audio chime for incoming notifications
 */
function playChimeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio context may be blocked by autoplay policies; fail silently
  }
}

/**
 * Get previously seen notification IDs from storage
 */
function getSeenNotificationIds() {
  try {
    const raw = sessionStorage.getItem(SEEN_NOTIFICATIONS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

/**
 * Mark notification ID as seen
 */
function markNotificationSeen(id) {
  try {
    const seen = getSeenNotificationIds();
    seen.add(String(id));
    // Keep max 200 IDs
    const arr = Array.from(seen).slice(-200);
    sessionStorage.setItem(SEEN_NOTIFICATIONS_KEY, JSON.stringify(arr));
  } catch {
    // Storage quota or error fallback
  }
}

/**
 * Display a desktop notification for a server notification
 */
export async function sendDesktopNotification({
  title = "Annually Rent Alert",
  message = "You have a new update.",
  payerName = "",
  id = null,
  tag = "",
  url = "/app",
}) {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return false;
  }

  const notificationKey = id ? String(id) : `${title}-${message}`;
  const seenSet = getSeenNotificationIds();

  // Don't show duplicate notifications
  if (seenSet.has(notificationKey)) {
    return false;
  }
  markNotificationSeen(notificationKey);

  // Play gentle sound
  playChimeSound();

  const bodyText = payerName
    ? `Paid by ${payerName}: ${message}`
    : message;

  const options = {
    body: bodyText,
    icon: "/favicon.png",
    badge: "/favicon.png",
    tag: tag || `notif-${notificationKey}`,
    renotify: true,
    data: { url },
  };

  try {
    // 1. Try displaying via ServiceWorkerRegistration if active
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && "showNotification" in registration) {
        await registration.showNotification(title, options);
        return true;
      }
    }

    // 2. Fall back to standard window Notification
    const notif = new Notification(title, options);
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return true;
  } catch (err) {
    console.warn("[PUSH] Could not show desktop notification:", err);
    return false;
  }
}
