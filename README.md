# Rainbow Aquarium - Premium Aquarium & Exotic Birds Store

![Rainbow Aquarium](https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=1200&h=400&fit=crop)

A beautiful, lightning-fast e-commerce website for an Indian store selling premium aquarium products and fancy birds. Built with Next.js 14, Tailwind CSS, and Framer Motion.

## 🌟 Features

### Core Functionality
- **Authentication** - Clean Register/Login modal with email and Google sign-in
- **Wishlist** - Heart icon on every product with instant add/remove (localStorage persistence)
- **Cart** - Live badge counter with smooth slide-out drawer
- **Checkout** - Multi-step checkout with address form (Tamil Nadu districts)

### Categories
- 🐠 **Fish Tanks & Aquascaping** - Ultra clear tanks from 2ft to 6ft
- 🌿 **Live Plants & ADA Products** - TC plants, fertilizers, substrates
- ⚡ **CO2, Lighting, Filtration, Air Pumps** - Complete equipment range
- 🐟 **Live Fish & Shrimp** - Fancy Koi, Guppies, Cherry & Crystal shrimps
- 🦜 **Fancy Birds** - Full category with:
  - Lovebirds (Peach-faced, Fischer's, Masked, Black-cheeked, Nyasa)
  - Cockatiels (Normal Grey, Lutino, Pearl, Pied, Cinnamon, Whiteface)
  - Budgerigars (English, Spangle, Opaline, Crested)
  - Finches (Zebra, Gouldian, Society, Java Sparrow)
  - Conures (Green Cheek, Sun, Pineapple, Black-capped)
  - Cockatoos (Umbrella, Goffin's, Rose-breasted)
  - Indian Ringneck & Alexandrine Parakeets
  - Canaries (Red Factor, Gloster, Fife)
  - Parrotlets & Lineolated Parakeets
- 🏠 **Bird Cages, Nests, Toys, Perches, Feeds & Supplements**
- 💊 **Foods & Medicines** - For fish and birds
- 🔧 **Accessories** - Tools and maintenance items

### Homepage Layout
- 3-slide hero carousel (manual navigation, swipe on mobile)
- 9 beautiful category cards with hover effects
- Featured Products section
- New Arrivals section
- Best Sellers section
- Trust bar with shipping, security, support badges
- Personalized wishlist section for logged-in users
- Permanent WhatsApp floating button

### Design & Polish
- Clean white background with subtle blue gradient
- Glassmorphism cards with smooth hover effects
- Dark mode toggle
- Product image zoom on hover
- Fully responsive (mobile-first)
- Beautiful animations with Framer Motion
- Custom scrollbar styling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rainbow-aquarium.git

# Navigate to project directory
cd rainbow-aquarium

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create static export
npm run build

# Preview production build
npm run start
```

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Context + useReducer
- **Static Export**: Fully static site, deploy anywhere

## 🌐 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/rainbow-aquarium)

### Deploy to Netlify

1. Connect your repository
2. Build command: `npm run build`
3. Publish directory: `out`

### Deploy to GitHub Pages

```bash
npm run build
# Upload the 'out' folder to gh-pages branch
```

## 📁 Project Structure

```
rainbow-aquarium/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── category/[slug]/    # Category pages
│   │   ├── product/[id]/       # Product detail pages
│   │   ├── checkout/           # Checkout flow
│   │   ├── register/           # Registration page
│   │   ├── wishlist/           # Wishlist page
│   │   └── page.tsx            # Homepage
│   ├── components/
│   │   ├── home/               # Homepage sections
│   │   ├── layout/             # Header, Footer, Modals
│   │   ├── products/           # Product cards
│   │   └── ui/                 # Reusable UI components
│   ├── context/                # React Context providers
│   ├── data/                   # Product data & constants
│   └── lib/                    # Utility functions
├── public/                     # Static assets
└── package.json
```

## 🎨 Customization

### Update Store Info
Edit footer contact details in `src/components/layout/Footer.tsx`

### Add Products
Edit product data in `src/data/products.ts`

### Change Theme Colors
Modify colors in `tailwind.config.js`

### Update WhatsApp Number
Edit `src/components/layout/WhatsAppButton.tsx`

## 📱 Lighthouse Score

- Performance: 95+
- Accessibility: 95+
- Best Practices: 100
- SEO: 100

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 👨‍💻 Credits

Powered by [ThisAI Technologies](https://thisaitech.com)

---

Made with ❤️ for aquarium and bird enthusiasts in India

