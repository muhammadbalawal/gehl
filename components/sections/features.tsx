import Features from "@/components/features-horizontal";
import Section from "@/components/section";
import { Phone, Search, MessageSquare, Calendar } from "lucide-react";

const data = [
  {
    id: 1,
    title: "Lead Intelligence Dashboard",
    content: "See website quality, reviews, competitors, and tech stack instantly.",
    image: "/dashboard.png",
    icon: <Search className="h-6 w-6 text-primary" />,
  },
  {
    id: 2,
    title: "Power Dialer & Call Recording",
    content: "One-click calling with local presence and automatic recording.",
    image: "/dashboard.png",
    icon: <Phone className="h-6 w-6 text-primary" />,
  },
  {
    id: 3,
    title: "AI Call Transcription",
    content: "Real-time notes, objection tracking, and sentiment analysis.",
    image: "/dashboard.png",
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
  },
  {
    id: 4,
    title: "Smart Follow-up Calendar",
    content: "AI-powered scheduling with context-aware reminders.",
    image: "/dashboard.png",
    icon: <Calendar className="h-6 w-6 text-primary" />,
  },
];

export default function Component() {
  return (
    <Section title="Features" subtitle="Everything you need for successful cold calling">
      <Features collapseDelay={5000} linePosition="bottom" data={data} />
    </Section>
  );
}
