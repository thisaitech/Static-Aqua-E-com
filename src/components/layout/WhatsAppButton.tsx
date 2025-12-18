'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const phoneNumber = '9188707 77420'; // Replace with actual WhatsApp number
  const message = encodeURIComponent('Hi! I\'m interested in your aquarium and bird products.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative">
        {/* Pulse ring */}
        <div className="absolute inset-0 bg-[#25D366] rounded-full whatsapp-pulse" />
        
        {/* Button */}
        <div className="relative w-16 h-16 bg-[#25D366] rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow">
          <MessageCircle className="w-8 h-8 text-white" fill="currentColor" />
        </div>

        {/* Tooltip */}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap hidden lg:block">
          <div className="bg-slate-800 text-white text-sm px-4 py-2 rounded-xl shadow-lg">
            Chat with us!
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-800 rotate-45" />
          </div>
        </div>
      </div>
    </motion.a>
  );
}

