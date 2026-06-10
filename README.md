# Achaar House — Pickle Shop

A clean e-commerce site for a homemade pickle brand. Customers pick jar sizes, add to cart, and place orders — with an admin panel for the shop owner to manage products and stock.

## Live Demo

<!-- Replace with your deployed URL after publishing -->
`https://prabhu007k-achar-house.netlify.app/`

## Features

- **Product grid** — mango, lemon, garlic, gongura, and more
- **Size variants** — 250g, 500g, 1kg with per-size pricing
- **Shopping cart & checkout** — order form with customer details
- **Admin panel** (`admin.html`) — CRUD products, stock, and order inbox
- **localStorage persistence** — runs entirely in the browser

## Tech Stack

- HTML5, CSS3
- Vanilla JavaScript (ES6+)
- Browser localStorage API

## Project Structure

```
├── index.html
├── admin.html
├── css/
│   ├── style.css
│   └── admin.css
├── js/
│   ├── store.js
│   ├── app.js
│   └── admin.js
├── description.txt
└── README.md
```

## Run Locally

No build step required.

```bash
python serve.py
```

Then visit `http://localhost:4003`

**Admin demo login:** password `achar2026` on `admin.html`

## Deploy to Netlify

1. Push this folder to GitHub or drag it to [Netlify Drop](https://app.netlify.com/drop).
2. **Build command:** leave empty  
3. **Publish directory:** `.` (project root)
4. Deploy to `https://<site-name>.netlify.app/`

Include `index.html`, `admin.html`, `css/`, and `js/`.

## Deploy to GitHub Pages

1. Push files to a GitHub repository root.
2. **Settings → Pages → Deploy from branch → main → / (root)**.

## Author

K Prabhu
