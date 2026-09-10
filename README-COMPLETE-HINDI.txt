SHREE BALA JI COLLECTION — FINAL V3

इस पैकेज में पूरा वेबसाइट सेटअप है:
- Premium royal maroon / gold / cream design
- Real hero model image + category images
- Home, Rajputi Suits, Designer Sarees, New Arrival, Best Seller, Contact
- Search Product
- Login / Sign Up UI
- Cart + quantity + Buy Now
- Checkout + COD / UPI option
- WhatsApp order/message
- Product details: image, name, price, quantity, description, rating, fabric, color, size, delivery
- Privacy Policy और Terms & Conditions working popup
- Admin Panel: Add / Edit / Delete product
- Admin Panel में photo, name, price, stock, category, fabric, color, rating, sold, size, delivery, description edit हो सकते हैं
- Orders / Notifications + order status
- Store Settings: WhatsApp number, UPI ID, address

CLOUDFLARE:
1. GitHub repository में इस पैकेज की 7 files रखें: index.html, admin.html, _worker.js, wrangler.jsonc, logo.png, hero-model.jpg, category-poshak.jpg, category-saree.jpg.
2. Cloudflare Workers & Pages में existing Worker project रखें; नया project न बनाएं.
3. Bindings में KV Namespace variable name SBC_DATA रखें.
4. GitHub commit के बाद Cloudflare deployment complete होने दें.
5. Website खोलकर Ctrl+F5 से hard refresh करें.
6. /admin खोलकर product add और Edit दोनों test करें.

नोट: Production में ADMIN_PASSWORD को Cloudflare secret/env variable से सुरक्षित password में बदलें.
