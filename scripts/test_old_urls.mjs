const url = "https://nkyoszmtyrpdwfjxggmb.supabase.co/storage/v1/object/public/bridge-documents/freight_quotations/QT-1777264191569/2f2052bc-9628-4f57-9965-be2ac84fa32a-PKG-001,%20BOX-A3.jpeg";
const res = await fetch(url);
console.log("Status:", res.status);
console.log("Body:", await res.text());
