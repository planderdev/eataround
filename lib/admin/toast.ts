export type AdminToastTone = "success" | "error" | "warning" | "info";

export type AdminToastEventDetail = {
  message: string;
  tone: AdminToastTone;
};

export const ADMIN_TOAST_EVENT = "admin:toast";

export function notifyAdminToast(message: string, tone: AdminToastTone = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AdminToastEventDetail>(ADMIN_TOAST_EVENT, {
      detail: { message, tone },
    }),
  );
}
