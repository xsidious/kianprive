import Script from "next/script";

/** Optional UserWay overlay when NEXT_PUBLIC_USERWAY_ACCOUNT_ID is set (from marketing package). */
export function UserWayScript() {
  const account = process.env.NEXT_PUBLIC_USERWAY_ACCOUNT_ID?.trim();
  if (!account) return null;

  return (
    <Script id="userway-widget" strategy="afterInteractive">
      {`(function(d){var s=d.createElement("script");s.setAttribute("data-account","${account.replace(/"/g, "")}");s.setAttribute("src","https://cdn.userway.org/widget.js");(d.body||d.head).appendChild(s);})(document);`}
    </Script>
  );
}
