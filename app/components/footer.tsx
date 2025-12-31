'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Download, 
  Apple, 
  Play,
  Shield,
  Heart,
  CheckCircle,
  Smartphone,
  Share2,
  AlertTriangle,
  Copyright,
  Copy,
  Check
} from 'lucide-react';

interface FooterProps {
  showNewsletter?: boolean;
  showAppDownload?: boolean;
  showHealthDisclaimer?: boolean;
  compact?: boolean;
  pwaInstallable?: boolean;
}

export default function Footer({ 
  showNewsletter = true,
  showAppDownload = true,
  showHealthDisclaimer = true,
  compact = false,
  pwaInstallable = true
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallHint, setShowInstallHint] = useState(false);
  const [touchActive, setTouchActive] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // Check for Web Share API support
  useEffect(() => {
    setCanShare('share' in navigator);
  }, []);

  // Detect PWA installation status and platform
  useEffect(() => {
    // Check if already installed
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }

      // Check if iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    }
  }, []);

  // Show install hint on scroll
  useEffect(() => {
    if (!pwaInstallable || isInstalled || typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show hint when user scrolls near bottom
      if (scrollPosition >= documentHeight - 500) {
        setShowInstallHint(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pwaInstallable, isInstalled]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      // Mobile-optimized feedback
      alert(`Thank you for subscribing with: ${email}\nWe'll send you growth tips and updates.`);
      setEmail("");
    }
  };

  const handleShare = async () => {
    try {
      // Check if Web Share API is available
      if (canShare) {
        await navigator.share({
          title: 'WellChild Clinic',
          text: 'Professional Child Growth Monitoring for Healthcare Providers',
          url: window.location.href,
        });
      } else {
        // Fallback for desktop - using modern clipboard API with proper error handling
        const url = window.location.href;
        
        try {
          // Check if clipboard API is available and we have permission
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            
            // Show success with haptic feedback
            if ('vibrate' in navigator) {
              navigator.vibrate(70);
            }
            
            // Reset after 2 seconds
            setTimeout(() => setCopied(false), 2000);
            
            // Mobile-friendly alert
            if (window.innerWidth < 768) {
              const toast = document.createElement('div');
              toast.className = 'fixed bottom-20 left-4 right-4 bg-green-600 text-white py-3 px-4 rounded-lg shadow-lg text-center z-50 animate-slide-up';
              toast.textContent = 'Link copied to clipboard!';
              document.body.appendChild(toast);
              
              setTimeout(() => {
                toast.classList.add('animate-slide-down');
                setTimeout(() => document.body.removeChild(toast), 300);
              }, 2000);
            } else {
              alert('Link copied to clipboard!');
            }
          } else {
            // Fallback for browsers without clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = url;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
              const successful = document.execCommand('copy');
              if (successful) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                alert('Link copied to clipboard!');
              } else {
                throw new Error('Copy failed');
              }
            } catch (err) {
              console.error('Copy failed:', err);
              // Last resort - show URL to copy manually
              alert(`Please copy this link: ${url}`);
            } finally {
              document.body.removeChild(textArea);
            }
          }
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
          // Show URL for manual copying
          alert(`Please copy this link manually:\n${url}`);
        }
      }
    } catch (shareError) {
      console.error('Share error:', shareError);
      // User cancelled share or error occurred
    }
  };

  const handleAppDownload = (store: 'ios' | 'android') => {
    if ('vibrate' in navigator) navigator.vibrate(30);
    
    // Open in new tab for better mobile experience
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      if (store === 'ios') {
        newWindow.location.href = 'https://apps.apple.com';
      } else {
        newWindow.location.href = 'https://play.google.com';
      }
    }
  };

  const handleTouchStart = (index: number) => {
    setTouchActive(index);
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleTouchEnd = () => {
    setTimeout(() => setTouchActive(null), 150);
  };

  const footerLinks = {
    Product: [
      { name: "Features", href: "/features" },
      { name: "WHO Standards", href: "/who-standards" },
      { name: "Growth Charts", href: "/growth-charts" },
      { name: "Reports", href: "/reports" },
      { name: "Pricing", href: "/pricing" },
    ],
    Resources: [
      { name: "Documentation", href: "/docs" },
      { name: "Help Center", href: "/help" },
      { name: "Community", href: "/community" },
      { name: "Blog", href: "/blog" },
      { name: "Research", href: "/research" },
    ],
    Company: [
      { name: "About", href: "/about" },
      { name: "Team", href: "/team" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "/careers" },
    ],
    Legal: [
      { name: "Terms of Service", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR Compliance", href: "/gdpr" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com", label: "Twitter", color: "hover:text-blue-400" },
    { icon: Facebook, href: "https://facebook.com", label: "Facebook", color: "hover:text-blue-600" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", color: "hover:text-blue-700" },
  ];

  if (compact) {
    return (
      <footer className="bg-gray-900 text-white pb-safe">
        <style jsx global>{`
          .pb-safe {
            padding-bottom: env(safe-area-inset-bottom, 16px);
          }
          .touch-target {
            min-height: 44px;
            min-width: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          @keyframes slide-up {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slide-down {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100%); opacity: 0; }
          }
          .animate-slide-up { animation: slide-up 0.3s ease-out; }
          .animate-slide-down { animation: slide-down 0.3s ease-out; }
        `}</style>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Brand - Touch Optimized */}
            <Link 
              href="/" 
              className="flex items-center space-x-3 active:scale-95 transition-transform touch-target"
              onTouchStart={() => handleTouchStart(0)}
              onTouchEnd={handleTouchEnd}
            >
              <div className="bg-blue-500 p-1.5 rounded-lg">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold">WellChild Clinic</h2>
                <p className="text-gray-400 text-xs">Child Growth Tracker</p>
              </div>
            </Link>
            
            {/* Links - Touch Optimized */}
            <div className="flex items-center space-x-4 md:space-x-6">
              <Link 
                href="/privacy" 
                className="text-gray-400 hover:text-white text-xs touch-target"
                onTouchStart={() => handleTouchStart(1)}
                onTouchEnd={handleTouchEnd}
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-400 hover:text-white text-xs touch-target"
                onTouchStart={() => handleTouchStart(2)}
                onTouchEnd={handleTouchEnd}
              >
                Terms
              </Link>
              <button
                onClick={handleShare}
                className="text-gray-400 hover:text-white text-xs touch-target flex items-center"
                aria-label="Share this page"
                onTouchStart={() => handleTouchStart(3)}
                onTouchEnd={handleTouchEnd}
              >
                {copied ? (
                  <Check className="h-3 w-3 mr-1 text-green-400" />
                ) : (
                  <Share2 className="h-3 w-3 mr-1" />
                )}
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>
            
            {/* Copyright */}
            <p className="text-gray-400 text-xs flex items-center touch-target">
              <Copyright className="h-3 w-3 mr-1" />
              {currentYear} WellChild Clinic
            </p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-white pb-safe">
      <style jsx global>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
        .touch-target {
          min-height: 44px;
          min-width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-down {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
        
        /* Prevent zoom on mobile inputs */
        @media screen and (max-width: 767px) {
          input[type="email"] {
            font-size: 16px !important;
          }
        }
      `}</style>

      {/* PWA Install Hint */}
      {pwaInstallable && showInstallHint && !isInstalled && (
        <div className="bg-blue-900/90 backdrop-blur-sm border-t border-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-blue-300 flex-shrink-0" />
                <p className="text-sm">
                  <span className="font-medium">Install our app</span>
                  <span className="text-blue-200 ml-2">for offline access & push notifications</span>
                </p>
              </div>
              <button
                onClick={() => {
                  // Trigger PWA install prompt
                  const event = new Event('show-install-prompt');
                  window.dispatchEvent(event);
                  setShowInstallHint(false);
                }}
                className="bg-white text-blue-900 px-4 py-2 rounded-lg text-sm font-medium active:scale-95 transition-transform touch-target w-full sm:w-auto"
                onTouchStart={() => handleTouchStart(99)}
                onTouchEnd={handleTouchEnd}
              >
                Install Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand and Description */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">WellChild Clinic</h2>
                  <p className="text-gray-400 text-sm">Child Growth & Nutrition Tracker</p>
                </div>
              </div>
              
              <p className="text-gray-400 mb-6 text-sm md:text-base leading-relaxed">
                Empowering parents and healthcare providers with WHO-standard growth tracking, 
                nutritional assessments, and data-driven insights for child development.
              </p>
              
              {/* Newsletter Subscription - Mobile Optimized */}
              {showNewsletter && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Stay Updated
                  </h3>
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-grow px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ fontSize: '16px' }}
                      required
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all active:scale-95 touch-target"
                      onTouchStart={() => handleTouchStart(100)}
                      onTouchEnd={handleTouchEnd}
                    >
                      Subscribe
                    </button>
                  </form>
                  <p className="text-gray-500 text-xs mt-2 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Subscribe to receive growth tips and updates
                  </p>
                </div>
              )}
            </div>

            {/* Footer Links - Responsive Grid */}
            {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-4">{category}</h3>
                <ul className="space-y-2">
                  {links.map((link, linkIndex) => {
                    const index = categoryIndex * 10 + linkIndex;
                    return (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className={`text-gray-400 hover:text-white transition-all flex items-center space-x-2 p-2 rounded-lg ${
                            touchActive === index ? 'bg-gray-800 scale-95' : ''
                          } touch-target`}
                          onTouchStart={() => handleTouchStart(index)}
                          onTouchEnd={handleTouchEnd}
                        >
                          <span className="text-sm md:text-base">{link.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            {/* Copyright and Links */}
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm flex items-center touch-target">
                <Copyright className="h-4 w-4 mr-1" />
                {currentYear} WellChild Clinic. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/privacy" 
                  className="text-gray-400 hover:text-white text-sm touch-target flex items-center"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Privacy Policy
                </Link>
                <Link 
                  href="/terms" 
                  className="text-gray-400 hover:text-white text-sm touch-target"
                >
                  Terms
                </Link>
                <button
                  onClick={handleShare}
                  className={`text-sm touch-target flex items-center ${
                    copied ? 'text-green-400' : 'text-gray-400 hover:text-white'
                  }`}
                  aria-label="Share this page"
                  onTouchStart={() => handleTouchStart(200)}
                  onTouchEnd={handleTouchEnd}
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Social Links and Download */}
            {showAppDownload && (
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Social Media - Touch Optimized */}
                <div className="flex items-center space-x-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    const socialIndex = 300 + index;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-gray-400 ${social.color} transition-all p-2 rounded-full touch-target ${
                          touchActive === socialIndex ? 'bg-gray-800 scale-95' : ''
                        }`}
                        aria-label={social.label}
                        onTouchStart={() => handleTouchStart(socialIndex)}
                        onTouchEnd={handleTouchEnd}
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    );
                  })}
                </div>

                {/* App Download Badge - Mobile Optimized */}
                {!isInstalled && (
                  <div className="border-l border-gray-700 pl-6">
                    <p className="text-sm text-gray-400 mb-2 flex items-center">
                      <Download className="h-3 w-3 mr-1" />
                      Get Our App
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAppDownload('ios')}
                        className="bg-gray-800 hover:bg-gray-700 px-4 py-2.5 rounded-lg text-sm flex items-center space-x-2 transition-all active:scale-95 touch-target"
                        onTouchStart={() => handleTouchStart(400)}
                        onTouchEnd={handleTouchEnd}
                      >
                        <Apple className="h-4 w-4" />
                        <span>App Store</span>
                      </button>
                      <button
                        onClick={() => handleAppDownload('android')}
                        className="bg-gray-800 hover:bg-gray-700 px-4 py-2.5 rounded-lg text-sm flex items-center space-x-2 transition-all active:scale-95 touch-target"
                        onTouchStart={() => handleTouchStart(401)}
                        onTouchEnd={handleTouchEnd}
                      >
                        <Play className="h-4 w-4" />
                        <span>Play Store</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Health Disclaimer - Mobile Optimized */}
          {showHealthDisclaimer && (
            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    <strong className="text-amber-400">Medical Disclaimer:</strong> WellChild Clinic is a growth tracking tool and does not provide medical advice. 
                    Always consult with a qualified healthcare professional for medical concerns and treatment.
                  </p>
                  <p className="text-gray-500 text-xs mt-2 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-400" />
                    Data follows WHO Child Growth Standards (2006) and is stored securely with end-to-end encryption.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Safe Area */}
      <div className="h-4 bg-gray-900 lg:hidden" />
    </footer>
  );
}