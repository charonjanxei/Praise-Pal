import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function Success() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full text-center shadow-2xl border-2 border-primary/20">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl font-bold">Payment Received!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Thank you for upgrading to Pro. Your AI Testimonial credits have been added to your account.
          </p>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm font-medium">Next Step:</p>
            <p className="text-sm text-muted-foreground">Check your inbox for your login details and a getting started guide.</p>
          </div>
          <Button className="w-full" onClick={() => window.location.href = '/'}>
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
