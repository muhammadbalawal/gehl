import Features from "@/components/features-vertical";
import Section from "@/components/section";
import { Upload, Search, Phone } from "lucide-react";

const data = [
  {
    id: 1,
    title: "1. Import Your Leads",
    content:
      "Upload your lead list or use our Chrome extension to scrape prospects from Google Maps. We automatically start researching each lead immediately.",
    image: "/dashboard.png",
    icon: <Upload className="w-6 h-6 text-primary" />,
  },
  {
    id: 2,
    title: "2. Review Lead Intelligence",
    content:
      "See instant business report cards with website analysis, review data, competitor insights, and opportunity scores. Everything you need to know before you call.",
    image: "/dashboard.png",
    icon: <Search className="w-6 h-6 text-primary" />,
  },
  {
    id: 3,
    title: "3. Start Smart Calling",
    content:
      "Click to call with all prospect data on screen. AI transcribes, takes notes, and schedules follow-ups automatically while you focus on the conversation.",
    image: "/dashboard.png",
    icon: <Phone className="w-6 h-6 text-primary" />,
  },
];

export default function Component() {
  return (
    <Section title="How it works" subtitle="From leads to calls in under 5 minutes">
      <Features data={data} />
    </Section>
  );
}
