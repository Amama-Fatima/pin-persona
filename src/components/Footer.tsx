"use client";

import React from "react";
import { Github, BookOpen, ExternalLink, User } from "lucide-react";

// Pinterest Logo Component
const PinterestLogo = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 384 512" fill="currentColor">
    <path d="M204 6.5C101.4 6.5 0 74.9 0 185.6 0 256 39.6 296 63.6 296c9.9 0 15.6-27.6 15.6-35.4 0-9.3-23.7-29.1-23.7-67.8 0-80.4 61.2-137.4 140.4-137.4 68.1 0 118.5 38.7 118.5 109.8 0 53.1-21.3 152.7-90.3 152.7-24.9 0-46.2-18-46.2-43.8 0-37.8 26.4-74.4 26.4-113.4 0-66.2-93.9-54.2-93.9 25.8 0 16.8 2.1 35.4 9.6 50.7-13.8 59.4-42 147.9-42 209.1 0 18.9 2.7 37.5 4.5 56.4 3.4 3.8 1.7 3.4 6.9 1.5 50.4-69 48.6-82.5 71.4-172.8 12.3 23.4 44.1 36 69.3 36 106.2 0 153.9-103.5 153.9-196.8C384 71.3 298.2 6.5 204 6.5z" />
  </svg>
);
const personalityData = {
  personality_name: "Seneca",
  culture_region: "Roman",
  role: "Stoic Philosopher, Roman Statesman",
  time_period: "Roman Empire, 1st Century CE",
  bio: "Lucius Annaeus Seneca was a Roman Stoic philosopher, statesman, and advisor to Emperor Nero. He wrote on topics like ethics, virtue, and resilience. His writings include moral letters, tragedies, and philosophical treatises that influenced both ancient and modern thought.",
};
const callbackend = async () => {
  try {
    const response = await fetch("https://pin-persona.onrender.com/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keyword: "cats",
        limit: 3,
      }),
    });

    const data = await response.json();
    console.log("Response data:", data);

    if (!response.ok) {
      console.error("Error response:", data);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
};
const Footer = () => {
  const links = [
    {
      href: "https://github.com/Amama-Fatima/pin-persona",
      icon: Github,
      label: "View Repository",
      className:
        "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
    },
    {
      href: "https://github.com/Amama-Fatima/pin-persona/blob/main/notebooks/flan-t5-base-lora-finetuning.ipynb",
      icon: BookOpen,
      label: "Fine-tuning Code",
      className:
        "text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300",
    },
    {
      href: "https://github.com/Amama-Fatima",
      icon: User,
      label: "My GitHub",
      className:
        "text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300",
    },
  ];

  return (
    <footer className="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-background dark:to-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center space-y-8">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-500 text-white">
              <PinterestLogo />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Personality Pinterest Scraper
            </h3>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {links.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 text-base font-medium transition-all duration-200 hover:scale-105 group underline-offset-4 hover:underline ${link.className}`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{link.label}</span>
                  <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
              );
            })}
          </div>
          <button onClick={callbackend}>call backend</button>

          {/* Divider */}
          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
