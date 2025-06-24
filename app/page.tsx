import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Button asChild size="lg">
        <a href="/login">Login</a>
      </Button>
    </div>
  );
}
