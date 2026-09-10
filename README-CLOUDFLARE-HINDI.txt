SHREE BALAJI COLLECTION — PREMIUM REDESIGN
===============================================

यह आपके मौजूदा Cloudflare Worker/Assets project का redesigned frontend है।

मुख्य बदलाव:
- Royal maroon + antique gold + ivory premium theme
- Header में supplied logo.png
- Top bar: Follow Us, Shipping All Over India, Online Shopping और ONLY WhatsApp 6261158338
- Facebook/Instagram/YouTube/अन्य social icons नहीं
- Premium search box और navigation
- Hero slider में center logo हटाया गया; royal fashion presentation और CTA रखा गया
- Shop by Category: ALL DESIGNER RAJPUTI POSHAK / ALL FANCY SAREES
- New Arrival, Rajputi Suits, Designer Sarees और Best Seller grids
- Product details, rating, stock, Buy Now, Add to Cart
- Cart + checkout + WhatsApp order flow
- Contact और footer Quick Links
- Footer Follow Us में केवल WhatsApp 6261158338
- Existing Admin Panel और Worker API को preserve किया गया है

IMPORTANT:
1. Product/order/settings API आपके मौजूदा _worker.js पर चलती है।
2. Permanent data के लिए Cloudflare KV binding SBC_DATA जरूरी है; README में इसका setup दिया गया है।
3. असली product/model photos Admin Panel से products में upload करें। Hero के decorative model को आप बाद में अपनी approved model/product hero photo से replace कर सकते हैं।
4. Production में admin password को बदलना जरूरी है।

FILES:
- index.html = premium customer website
- admin.html = existing admin panel
- _worker.js = existing API
- logo.png = आपका supplied logo
- wrangler.jsonc = Cloudflare config
