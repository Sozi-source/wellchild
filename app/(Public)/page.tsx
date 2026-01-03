"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Stethoscope, 
  Shield, 
  Heart, 
  BarChart3, 
  Users, 
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Smartphone,
  Activity,
  ClipboardCheck,
  AlertTriangle,
  MessageSquare,
  Baby
} from 'lucide-react';
import { cn } from '@/app/lib/utils';

export default function LandingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'clinician' | 'guardian'>('clinician');

  const handleGetStarted = () => {
    router.push('/login');
  };

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "HIPAA Compliant Security",
      description: "End-to-end encrypted data storage with enterprise-grade security protocols",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "WHO-Standard Growth Charts",
      description: "Accurate growth monitoring with WHO and CDC reference percentiles",
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Clinic-Family Collaboration",
      description: "Secure sharing between clinicians, specialists, and guardians",
      color: "bg-violet-50 text-violet-600"
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Real-Time Growth Alerts",
      description: "Instant notifications for concerning growth patterns",
      color: "bg-amber-50 text-amber-600"
    },
    {
      icon: <ClipboardCheck className="h-6 w-6" />,
      title: "Milestone Tracking",
      description: "Comprehensive developmental milestone monitoring",
      color: "bg-cyan-50 text-cyan-600"
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile & Desktop Ready",
      description: "Fully responsive platform accessible on any device",
      color: "bg-indigo-50 text-indigo-600"
    }
  ];

  const benefits = {
    clinician: [
      "Streamlined patient management workflows",
      "Real-time growth tracking and alerts",
      "Integrated WHO-standard growth charts",
      "Comprehensive reporting and analytics",
      "Secure communication with families"
    ],
    guardian: [
      "24/7 access to child's health records",
      "Direct communication with healthcare team",
      "Growth milestone tracking",
      "Educational resources and guidance",
      "Peace of mind with continuous monitoring"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Baby className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold text-gray-900">GrowthWatch</span>
                <span className="hidden sm:inline text-sm text-blue-600 font-medium ml-2">Pro</span>
              </div>
            </div>
            <button
              onClick={handleGetStarted}
              className="hidden sm:inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-6 sm:mb-8">
              WHO-Standard Platform
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Child Growth
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 mt-2 sm:mt-3">
                Monitoring System
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl md:max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Monitor pediatric growth using WHO standards with real-time alerts for early intervention—connecting clinics and families.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-base sm:text-lg font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started Free <ArrowRight className="ml-3 h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button 
                onClick={() => router.push('/login')}
                className="sm:hidden inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 text-base font-semibold rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
              >
                Start Now <ArrowRight className="ml-3 h-4 w-4" />
              </button>
            </div>

            {/* Role Selection Tabs */}
            <div className="mb-12">
              <div className="inline-flex bg-gray-100 rounded-xl p-1 mb-6 sm:mb-8">
                <button
                  onClick={() => setActiveTab('clinician')}
                  className={cn(
                    "px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-all",
                    activeTab === 'clinician'
                      ? "bg-white text-blue-600 shadow-sm sm:shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">For Clinicians</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('guardian')}
                  className={cn(
                    "px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-all",
                    activeTab === 'guardian'
                      ? "bg-white text-blue-600 shadow-sm sm:shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">For Guardians</span>
                  </div>
                </button>
              </div>

              {/* Benefits Cards */}
              <div className="mt-6 sm:mt-8 bg-white rounded-2xl shadow-lg p-4 sm:p-6 max-w-2xl mx-auto border border-gray-100">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Benefits for {activeTab === 'clinician' ? 'Healthcare Professionals' : 'Parents & Guardians'}
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {benefits[activeTab].map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm sm:text-base">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Comprehensive Growth Monitoring
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need for modern pediatric care and family collaboration
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-100"
              >
                <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg ${feature.color.split(' ')[0]} flex items-center justify-center mb-3 sm:mb-4`}>
                  <div className={feature.color.split(' ')[1]}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-700 font-medium text-sm sm:text-base">Uptime Reliability</div>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Enterprise-grade infrastructure</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100">
              <div className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-2">5,000+</div>
              <div className="text-gray-700 font-medium text-sm sm:text-base">Children Monitored</div>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Across healthcare facilities</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-violet-50 to-white rounded-2xl border border-violet-100">
              <div className="text-3xl sm:text-4xl font-bold text-violet-600 mb-2">24/7</div>
              <div className="text-gray-700 font-medium text-sm sm:text-base">Support Available</div>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Dedicated customer success</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Ready to Transform Pediatric Care?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-8 sm:mb-10 leading-relaxed">
              Join healthcare professionals and families using our platform for better growth outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 text-base sm:text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started Free
                <ArrowRight className="ml-3 h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={handleGetStarted}
                className="sm:hidden inline-flex items-center justify-center px-6 py-3 bg-blue-800/30 text-white text-base font-semibold rounded-xl hover:bg-blue-800/40 transition-colors border border-blue-400/30"
              >
                Start Now
                <ArrowRight className="ml-3 h-4 w-4" />
              </button>
            </div>
            <p className="mt-6 text-blue-200 text-xs sm:text-sm">
              No credit card required • HIPAA-compliant • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-6 sm:mb-0 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center">
                  <Baby className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-bold">GrowthWatch</span>
                  <span className="text-blue-300 text-sm font-medium ml-2">Pro</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm max-w-md">
                WHO-standard child growth monitoring platform connecting clinics and families.
              </p>
            </div>
            <div className="text-center sm:text-right">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-400 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-500 transition-all text-sm sm:text-base"
              >
                Get Started Today
              </button>
              <p className="text-gray-400 text-xs sm:text-sm mt-3">
                © {new Date().getFullYear()} GrowthWatch Pro. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}