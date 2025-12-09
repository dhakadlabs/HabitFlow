import React, { useState, useEffect } from 'react';
import { ChevronLeft, Heart, Code, Globe, Coffee, Star, Linkedin, Github, Twitter, ExternalLink, Mail } from 'lucide-react';

interface AboutViewProps {
  onBack: () => void;
}

const DLabsLogo = () => (
    <div className="w-24 h-24 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 rounded-xl rotate-6 opacity-80 blur-sm"></div>
        <div className="relative z-10 w-full h-full bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center shadow-xl">
             <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 tracking-tighter font-mono">
                 D-L
             </span>
             <div className="absolute -bottom-2 -right-2 bg-pink-500 w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-900">
                 <Heart className="w-3 h-3 text-white fill-current" />
             </div>
        </div>
    </div>
);

const SocialLink = ({ icon: Icon, label, href, colorClass }: { icon: any, label: string, href: string, colorClass: string }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group relative flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/20"
    >
        <div className={`p-3 rounded-full bg-slate-700/50 mb-3 group-hover:scale-110 transition-transform ${colorClass}`}>
            <Icon className="w-6 h-6" />
        </div>
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <ExternalLink className="absolute top-2 right-2 w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
);

const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header with Back Button */}
      <div className="flex items-center">
        <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors group px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-6">
          <DLabsLogo />
          
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Designing the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Future</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Dhakad Labs is a creative powerhouse dedicated to building tools that empower, inspire, and elevate your daily life.
            </p>
          </div>
      </div>

      {/* Connect Dock */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-4xl mx-auto">
          <SocialLink icon={Globe} label="Website" href="#" colorClass="text-emerald-400" />
          <SocialLink icon={Twitter} label="Twitter" href="#" colorClass="text-sky-400" />
          <SocialLink icon={Github} label="GitHub" href="#" colorClass="text-slate-200" />
          <SocialLink icon={Linkedin} label="LinkedIn" href="#" colorClass="text-blue-500" />
          <SocialLink icon={Mail} label="Mail Us" href="mailto:dhakadlabs@gmail.com" colorClass="text-red-500" />
      </div>

      {/* Mission & Vision Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative group p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                  <Code size={140} />
              </div>
              <div className="relative z-10">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
                      <Star className="w-6 h-6 fill-current" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Excellence in Code</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      We don't just write software; we craft digital experiences. Every pixel is polished, every interaction is smoothed, and every line of code is optimized for performance.
                  </p>
              </div>
          </div>

          <div className="relative group p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 transform -rotate-12 group-hover:scale-110 transition-transform duration-500">
                  <Heart size={140} />
              </div>
              <div className="relative z-10">
                   <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/50 rounded-2xl flex items-center justify-center mb-6 text-pink-500">
                      <Coffee className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">User-Centric Design</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      HabitFlow was born from a simple idea: self-improvement should be beautiful. We prioritize aesthetics and usability to make building habits a joy, not a chore.
                  </p>
              </div>
          </div>
      </div>

      {/* Footer Note */}
      <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Dhakad Labs Inc. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 mt-2">
              Made with React, Tailwind, and a lot of ☕
          </p>
      </div>
    </div>
  );
};

export default AboutView;