import BlurFade from "@/components/magicui/blur-fade";
import Section from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Search, Phone } from "lucide-react";

const problems = [
  {
    title: "Hours Wasted on Research",
    description:
      "Sales teams spend 5-10 minutes researching every lead before calling - that's 83+ hours for 1,000 leads. Time that could be spent actually selling.",
    icon: Clock,
  },
  {
    title: "Manual Lead Investigation",
    description:
      "Switching between multiple browser tabs to check websites, reviews, social media, and competitors for each prospect slows down your calling process.",
    icon: Search,
  },
  {
    title: "Poor Call Preparation",
    description:
      "Without proper lead intelligence, calls feel generic and prospects can tell you don't know their business, leading to lower connection rates.",
    icon: Phone,
  },
];

export default function Component() {
  return (
    <Section
      title="The Cold Calling Problem"
      subtitle="Why most sales teams struggle with lead outreach."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {problems.map((problem, index) => (
          <BlurFade key={index} delay={0.2 + index * 0.2} inView>
            <Card className="bg-background border-none shadow-none">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <problem.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{problem.title}</h3>
                <p className="text-muted-foreground">{problem.description}</p>
              </CardContent>
            </Card>
          </BlurFade>
        ))}
      </div>
    </Section>
  );
}
