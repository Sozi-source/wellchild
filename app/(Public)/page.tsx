"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Shield, 
  BarChart3, 
  Users, 
  Activity, 
  ClipboardCheck,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  Heart,
  Zap,
  Lock,
  Globe,
  Smartphone as Mobile,
  Baby,
  ChevronRight,
  FileText,
  Bell,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/app/lib/utils';

export default function LandingPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<'clinician' | 'parent'>('clinician');

  const handleGetStarted = () => {
    router.push('/signup');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "WHO Growth Charts",
      description: "Accurate percentile tracking with real-time visualization using WHO and CDC standards",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Compliant",
      description: "HIPAA-compliant data storage with enterprise-grade security protocols",
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Clinic-Family Collaboration",
      description: "Secure sharing and communication between clinicians, specialists, and guardians",
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-gradient-to-br from-violet-50 to-purple-50"
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Real-Time Growth Alerts",
      description: "Instant notifications for concerning growth patterns and milestones",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50"
    },
    {
      icon: <ClipboardCheck className="h-6 w-6" />,
      title: "Milestone Tracking",
      description: "Comprehensive developmental milestone monitoring with progress insights",
      color: "from-rose-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-rose-50 to-pink-50"
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile & Desktop Ready",
      description: "Fully responsive platform accessible on any device with full functionality",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-gradient-to-br from-indigo-50 to-blue-50"
    }
  ];

  const benefits = {
    clinician: [
      "Streamlined patient management workflows",
      "Real-time growth tracking and alerts",
      "Integrated WHO-standard growth charts",
      "Comprehensive reporting and analytics",
      "Secure communication with families",
      "Multi-patient dashboard views"
    ],
    parent: [
      "24/7 access to child's health records",
      "Direct messaging with healthcare team",
      "Growth milestone tracking and alerts",
      "Educational resources and guidance",
      "Peace of mind with continuous monitoring",
      "Progress visualization tools"
    ]
  };

  const howItWorks = [
    {
      step: "1",
      title: "Setup & Connect",
      description: "Create child profiles and connect with your healthcare providers",
      icon: <Users className="h-6 w-6" />
    },
    {
      step: "2",
      title: "Track Growth",
      description: "Input measurements and track growth against WHO percentiles",
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      step: "3",
      title: "Stay Informed",
      description: "Receive alerts and insights for better health decisions",
      icon: <Bell className="h-6 w-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md">
                  <Baby className="h-6 w-6 text-white" />
                </div>
                <div className="">
                  <span className="text-xl font-bold text-gray-900">GrowthWatch</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/features" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogin}
                className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-all shadow-md hover:shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Side by side on large screens, stacked on small */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-20 lg:pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Text Content - Takes 50% on large screens */}
            <div className="w-full lg:w-1/2">
              <div className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-6">
                <Zap className="h-4 w-4 mr-2" />
                WHO-Standard Platform
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Pediatric
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                  Growth Monitor
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                WHO-standard platform connecting healthcare providers and families for seamless child growth tracking, early intervention, and better outcomes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleGetStarted}
                  className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl hover:from-blue-600 hover:to-cyan-500 transition-all shadow-lg hover:shadow-xl"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-gray-700 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                  Schedule Demo
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  WHO Standards
                </div>
                <div className="flex items-center">
                  <Mobile className="h-4 w-4 mr-2" />
                  Mobile First
                </div>
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  HIPAA Compliant
                </div>
              </div>
            </div>
            
            {/* Image Content - Takes 50% on large screens */}
            <div className="w-full lg:w-1/2">
              <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/child.jpeg" 
                  alt="Child growth monitoring dashboard showing interactive growth charts"
                  fill
                  className="object-cover lg:object-contain"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-cyan-400/10"></div>
                
                {/* Floating card overlay */}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg max-w-xs hidden lg:block">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Growth Trend</div>
                      <div className="text-xs text-green-600">+15% in 3 months</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    Real-time tracking shows healthy development pattern
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Built for Everyone in the Care Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tailored experience for healthcare professionals and families
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-center gap-2 mb-8">
              <button
                onClick={() => setActiveRole('clinician')}
                className={cn(
                  "flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all",
                  activeRole === 'clinician'
                    ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <Stethoscope className="h-5 w-5 mr-2" />
                For Healthcare Professionals
              </button>
              <button
                onClick={() => setActiveRole('parent')}
                className={cn(
                  "flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all",
                  activeRole === 'parent'
                    ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <Heart className="h-5 w-5 mr-2" />
                For Parents & Guardians
              </button>
            </div>
            
            {/* Benefits Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                Benefits for {activeRole === 'clinician' ? 'Healthcare Professionals' : 'Parents & Guardians'}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits[activeRole].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need for modern pediatric growth monitoring
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-transparent"
              >
                <div className={`mb-4 h-12 w-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-md`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className={`h-1 w-8 rounded-full bg-gradient-to-r ${feature.color}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Simple & Effective Process
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three easy steps to better growth monitoring
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-400/10 flex items-center justify-center mx-auto mb-4">
                  <div className="text-blue-600">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Dashboard Showcase - Side by side layout */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Text Content */}
            <div className="w-full lg:w-1/2">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Interactive Growth Dashboard
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Visualize your child's growth journey with our intuitive dashboard that displays key metrics and trends at a glance.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900">Real-time Percentile Charts</span>
                    <p className="text-gray-600 text-sm mt-1">Track growth against WHO standards with interactive charts</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900">Milestone Tracking</span>
                    <p className="text-gray-600 text-sm mt-1">Monitor developmental milestones with visual progress indicators</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900">Health Insights</span>
                    <p className="text-gray-600 text-sm mt-1">Receive personalized insights and recommendations based on growth patterns</p>
                  </div>
                </li>
              </ul>
            </div>
            
            {/* Dashboard Image */}
            <div className="w-full lg:w-1/2">
              <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                <Image
                  src="/images/child.jpeg" 
                  alt="Interactive growth dashboard showing charts and metrics"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-400/5"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Ready to Transform Pediatric Care?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 leading-relaxed">
              Join healthcare professionals and families using GrowthWatch for better growth outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-blue-600 text-base sm:text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="ml-3 h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={handleLogin}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-blue-800/30 text-white text-base sm:text-lg font-semibold rounded-xl hover:bg-blue-800/40 transition-colors border border-blue-400/30"
              >
                Sign In
              </button>
            </div>
            <p className="mt-6 text-blue-200 text-sm">
              No credit card required • HIPAA-compliant • 14-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <Baby className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold">GrowthWatch</div>
                  <div className="text-xs text-cyan-300 font-medium">Pediatric Growth Monitor</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                WHO-standard child growth monitoring platform connecting clinics and families.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/security" className="text-gray-400 hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/hipaa" className="text-gray-400 hover:text-white transition-colors">HIPAA Compliance</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} GrowthWatch. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}