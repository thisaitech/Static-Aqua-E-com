'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, ArrowLeft, Package, Truck, CreditCard, RefreshCw, HelpCircle, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Ordering & Payment
  {
    category: 'Ordering & Payment',
    question: 'How do I place an order?',
    answer: 'Browse our products, add items to your cart, and proceed to checkout. Fill in your shipping details and choose your preferred payment method (UPI, Card, or Cash on Delivery).'
  },
  {
    category: 'Ordering & Payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept UPI payments, Credit/Debit Cards, and Cash on Delivery (COD) for orders across Tamil Nadu.'
  },
  {
    category: 'Ordering & Payment',
    question: 'Is it safe to use my card on your website?',
    answer: 'Yes, absolutely! We use secure payment gateways with SSL encryption to protect your payment information. We never store your card details.'
  },
  {
    category: 'Ordering & Payment',
    question: 'Can I cancel or modify my order?',
    answer: 'Yes, you can cancel or modify your order before it is packed. Please contact us immediately at [phone number] or through My Orders section.'
  },

  // Shipping & Delivery
  {
    category: 'Shipping & Delivery',
    question: 'Where do you deliver?',
    answer: 'We currently deliver across Tamil Nadu. Free delivery is available on orders above ₹2,000.'
  },
  {
    category: 'Shipping & Delivery',
    question: 'How long does delivery take?',
    answer: 'Delivery typically takes 3-7 business days depending on your location. Live fish and plants are shipped with priority to ensure freshness.'
  },
  {
    category: 'Shipping & Delivery',
    question: 'Do you charge for delivery?',
    answer: 'Delivery is FREE for orders above ₹2,000. For orders below ₹2,000, a nominal shipping charge applies based on your location.'
  },
  {
    category: 'Shipping & Delivery',
    question: 'How can I track my order?',
    answer: 'Once your order is shipped, you will receive a tracking number via SMS/Email. You can also track your order from the "My Orders" section.'
  },
  {
    category: 'Shipping & Delivery',
    question: 'What if I am not available during delivery?',
    answer: 'Our delivery partner will attempt delivery 2-3 times. Please ensure someone is available to receive the package, especially for live fish and plants.'
  },

  // Products - Fish & Aquarium
  {
    category: 'Products - Fish & Aquarium',
    question: 'Are your fish healthy and disease-free?',
    answer: 'Yes! All our fish are quarantined and health-checked before shipping. We follow strict quality standards to ensure you receive healthy fish.'
  },
  {
    category: 'Products - Fish & Aquarium',
    question: 'How are live fish shipped?',
    answer: 'Live fish are packed in oxygen-filled bags with temperature control. They are shipped via priority delivery to reach you within 24-48 hours.'
  },
  {
    category: 'Products - Fish & Aquarium',
    question: 'What size aquarium do I need?',
    answer: 'It depends on the type and number of fish. Generally, 2 feet tanks are suitable for small fish (5-10 fish), 3-4 feet tanks for medium setups, and 5+ feet for large or community tanks. Check product descriptions for specific requirements.'
  },
  {
    category: 'Products - Fish & Aquarium',
    question: 'Do you provide aquarium setup services?',
    answer: 'Currently, we sell products and provide guidance. For professional setup services in your area, please contact our support team for recommendations.'
  },
  {
    category: 'Products - Fish & Aquarium',
    question: 'How do I maintain my aquarium?',
    answer: 'Regular water changes (20-30% weekly), proper filtration, testing water parameters, and feeding quality food are essential. Check our care guides in the product sections for detailed instructions.'
  },

  // Products - Plants
  {
    category: 'Products - Plants',
    question: 'Are your plants suitable for beginners?',
    answer: 'Yes! We offer a range of easy-to-care-for plants perfect for beginners, as well as advanced species for experienced aquascapers. Each product has care level indicators.'
  },
  {
    category: 'Products - Plants',
    question: 'Do aquatic plants need CO2?',
    answer: 'Not all plants require CO2. Low-light plants like Java Fern, Anubias, and Java Moss grow well without CO2. High-light carpet plants benefit from CO2 supplementation.'
  },
  {
    category: 'Products - Plants',
    question: 'How are live plants shipped?',
    answer: 'Plants are carefully packed with moist wrapping to keep them fresh during transit. They typically arrive within 3-5 days in excellent condition.'
  },

  // Products - Birds
  {
    category: 'Products - Birds',
    question: 'Are your birds hand-raised?',
    answer: 'Yes, many of our fancy birds are hand-raised and tamed. Each bird listing specifies if it is hand-raised or parent-raised.'
  },
  {
    category: 'Products - Birds',
    question: 'Do you provide health certificates for birds?',
    answer: 'Yes, health certificates are provided for all birds upon request. All birds are vet-checked before sale.'
  },
  {
    category: 'Products - Birds',
    question: 'What supplies do I need for a new bird?',
    answer: 'You will need a suitable cage, perches, food bowls, water bowls, bird food, and toys. We offer complete starter kits for different bird species.'
  },

  // Returns & Refunds
  {
    category: 'Returns & Refunds',
    question: 'What is your return policy?',
    answer: 'For equipment and accessories, returns are accepted within 7 days if unopened and in original packaging. Live fish/plants/birds can only be returned if DOA (Dead on Arrival) with photographic proof within 24 hours of delivery.'
  },
  {
    category: 'Returns & Refunds',
    question: 'What if my fish/plant arrives dead?',
    answer: 'We offer DOA (Dead on Arrival) guarantee. Please send us a photo within 24 hours of delivery, and we will provide a full refund or replacement.'
  },
  {
    category: 'Returns & Refunds',
    question: 'How long does a refund take?',
    answer: 'Refunds are processed within 5-7 business days after we receive and verify the returned item. The amount will be credited to your original payment method.'
  },
  {
    category: 'Returns & Refunds',
    question: 'What if I receive a damaged product?',
    answer: 'Please contact us immediately with photos of the damage. We will arrange for a replacement or full refund at no extra cost to you.'
  },

  // Account & Support
  {
    category: 'Account & Support',
    question: 'Do I need an account to place an order?',
    answer: 'While guest checkout is available, we recommend creating an account to track orders, save addresses, and manage your wishlist easily.'
  },
  {
    category: 'Account & Support',
    question: 'How do I reset my password?',
    answer: 'Click on "Login" and then "Forgot Password". Enter your registered email, and you will receive a password reset link.'
  },
  {
    category: 'Account & Support',
    question: 'How can I contact customer support?',
    answer: 'You can reach us via phone at [phone number], email at [email], or through the Contact Us form. We provide 24/7 customer support.'
  },
  {
    category: 'Account & Support',
    question: 'Do you have a physical store?',
    answer: 'Yes, visit our store in [location]. Store hours: [timing]. You can also order online for home delivery across Tamil Nadu.'
  },
];

const categories = [
  'All',
  'Ordering & Payment',
  'Shipping & Delivery',
  'Products - Fish & Aquarium',
  'Products - Plants',
  'Products - Birds',
  'Returns & Refunds',
  'Account & Support'
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm mb-3 sm:mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
                Frequently Asked Questions
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
                Find answers to common questions about our products and services
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl">
              <p className="text-slate-600 dark:text-slate-400">No FAQs found matching your search.</p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1 block">
                      {faq.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

        {/* Contact Support Section */}
        <div className="mt-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 sm:p-8 text-white">
          <div className="text-center max-w-2xl mx-auto">
            <Phone className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Still have questions?</h2>
            <p className="text-white/90 mb-6">
              Our customer support team is available 24/7 to help you with any queries.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="tel:+919876543210"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Us
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border-2 border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
