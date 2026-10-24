"use client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="link-btn"
      onClick={async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        window.location.href = "/admin/login";
      }}
    >
      Выйти
    </button>
  );
}
