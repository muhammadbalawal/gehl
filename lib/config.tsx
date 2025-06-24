import { Icons } from "@/components/icons";
import { FaTwitter } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa6";
import { RiInstagramFill } from "react-icons/ri";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: "Kinteli",
  description: "Smart CRM for Cold Calling",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: ["CRM", "Cold Calling", "Lead Management", "Sales Automation", "AI Assistant"],
  links: {
    email: "support@kinteli.com",
    twitter: "https://twitter.com/kinteli",
    discord: "https://discord.gg/kinteli",
    github: "https://github.com/kinteli",
    instagram: "https://instagram.com/kinteli/",
  },
  header: [
    {
      trigger: "Features",
      content: {
        main: {
          icon: <Icons.logo className="h-6 w-6" />,
          title: "Smart Lead Intelligence",
          description: "Automate lead research for better cold calling.",
          href: "#",
        },
        items: [
          {
            href: "#",
            title: "Lead Intelligence",
            description: "Automatic business research and opportunity scoring.",
          },
          {
            href: "#",
            title: "Power Dialer",
            description: "One-click calling with local presence and recording.",
          },
          {
            href: "#",
            title: "AI Call Assistant",
            description: "Real-time transcription and automatic note-taking.",
          },
        ],
      },
    },
    {
      trigger: "Solutions",
      content: {
        items: [
          {
            title: "Marketing Agencies",
            href: "#",
            description: "Scale local business outreach with automated research.",
          },
          {
            title: "Sales Teams",
            href: "#",
            description: "Maximize calling efficiency with lead intelligence.",
          },
          {
            title: "Business Development",
            href: "#",
            description: "Turn cold prospects into warm conversations.",
          },
          {
            title: "Real Estate",
            href: "#",
            description: "Connect with property owners and investors.",
          },
          {
            title: "Insurance",
            href: "#",
            description: "Reach local businesses with targeted outreach.",
          },
          {
            title: "Consultants",
            href: "#",
            description: "Research prospects faster, call more clients.",
          },
        ],
      },
    },
    {
      href: "/blog",
      label: "Blog",
    },
  ],
  pricing: [
    {
      name: "STARTER",
      href: "#",
      price: "$49",
      period: "month",
      yearlyPrice: "$39",
      features: [
        "1 User",
        "500 Leads/month",
        "Basic Lead Intelligence",
        "Call Recording",
        "Email Support",
      ],
      description: "Perfect for solo sales professionals",
      buttonText: "Start Free Trial",
      isPopular: false,
    },
    {
      name: "PROFESSIONAL",
      href: "#",
      price: "$149",
      period: "month",
      yearlyPrice: "$119",
      features: [
        "5 Users",
        "2,500 Leads/month",
        "Advanced Lead Intelligence",
        "AI Call Assistant",
        "Priority Support",
        "Chrome Extension",
        "CRM Integrations",
      ],
      description: "Ideal for growing sales teams",
      buttonText: "Start Free Trial",
      isPopular: true,
    },
    {
      name: "ENTERPRISE",
      href: "#",
      price: "$399",
      period: "month",
      yearlyPrice: "$319",
      features: [
        "Unlimited Users",
        "10,000+ Leads/month",
        "Custom Lead Scoring",
        "White-label Options",
        "24/7 Premium Support",
        "API Access",
        "Custom Integrations",
        "Dedicated Success Manager",
      ],
      description: "For large teams and agencies",
      buttonText: "Contact Sales",
      isPopular: false,
    },
  ],
  faqs: [
    {
      question: "What is Kinteli?",
      answer: (
        <span>
          Kinteli is a smart CRM designed specifically for cold calling teams. 
          We automatically research your leads so you can focus on making great calls and closing deals.
        </span>
      ),
    },
    {
      question: "How does the lead intelligence work?",
      answer: (
        <span>
          Our AI automatically researches each lead by analyzing their website, 
          reviews, social media, competitors, and technology stack. You get instant 
          business report cards with opportunity scores before you call.
        </span>
      ),
    },
    {
      question: "Can I use my existing leads?",
      answer: (
        <span>
          Yes! You can upload CSV files with your existing leads, or use our Chrome 
          extension to scrape new prospects from Google Maps. We'll automatically 
          research all of them.
        </span>
      ),
    },
    {
      question: "Do you integrate with other CRMs?",
      answer: (
        <span>
          Absolutely. Kinteli integrates with popular CRMs like HubSpot, Salesforce, 
          and Pipedrive. You can also use our API for custom integrations.
        </span>
      ),
    },
    {
      question: "How long is the free trial?",
      answer: (
        <span>
          We offer a 7-day free trial with full access to all features. No credit card 
          required to start. You can begin calling smarter leads in under 5 minutes.
        </span>
      ),
    },
  ],
  footer: [
    {
      title: "Product",
      links: [
        { href: "#", text: "Features", icon: null },
        { href: "#", text: "Pricing", icon: null },
        { href: "#", text: "Documentation", icon: null },
        { href: "#", text: "API", icon: null },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "#", text: "About Us", icon: null },
        { href: "#", text: "Careers", icon: null },
        { href: "#", text: "Blog", icon: null },
        { href: "#", text: "Press", icon: null },
        { href: "#", text: "Partners", icon: null },
      ],
    },
    {
      title: "Resources",
      links: [
        { href: "#", text: "Community", icon: null },
        { href: "#", text: "Contact", icon: null },
        { href: "#", text: "Support", icon: null },
        { href: "#", text: "Status", icon: null },
      ],
    },
    {
      title: "Social",
      links: [
        {
          href: "#",
          text: "Twitter",
          icon: <FaTwitter />,
        },
        {
          href: "#",
          text: "Instagram",
          icon: <RiInstagramFill />,
        },
        {
          href: "#",
          text: "Youtube",
          icon: <FaYoutube />,
        },
      ],
    },
  ],
};

export type SiteConfig = typeof siteConfig;
