SHREE BALA JI COLLECTION - CLOUDFLARE VERSION

यह पैकेज Cloudflare Workers/Pages Direct Upload के लिए बनाया गया है।

मुख्य फाइलें:
- index.html = ग्राहक वेबसाइट
- admin.html = Admin Panel
- _worker.js = Cloudflare Worker API
- images/logo.png = दुकान का लोगो

Default Admin:
Username: admin
Password: SBC@2026

IMPORTANT:
1) Cloudflare Direct Upload में _worker.js समर्थित है।
2) Products/Orders/Settings को स्थायी रूप से रखने के लिए Cloudflare KV binding बनाना जरूरी है।
3) Cloudflare Dashboard में Workers & Pages > अपना project > Settings > Bindings में KV namespace जोड़ें और Variable name रखें: SBC_DATA
4) फिर नया deployment करें।
5) बिना KV binding के site testing के लिए चलेगी, लेकिन data स्थायी नहीं रहेगा।

API path: /api/store/...

UPI अभी optional है। Admin Settings में UPI ID बाद में डाली जा सकती है।
