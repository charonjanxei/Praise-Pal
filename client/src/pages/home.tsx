import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Copy, Check, Quote, ArrowRight, MessageSquare, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Types & Schema ---

const formSchema = z.object({
  rawFeedback: z.string().min(10, {
    message: "Please enter at least 10 characters of feedback.",
  }),
  tone: z.string().default("professional"),
});

type FormValues = z.infer<typeof formSchema>;

// --- Components ---

const Header = ({ user, onLogin }: { user: any; onLogin: () => void }) => (
  <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <span className="font-heading font-bold text-xl tracking-tight">TestimonialAutomator</span>
      </div>
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">Features</a>
        <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
      </nav>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/20 overflow-hidden">
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            </div>
          </div>
        ) : (
          <>
            <Button variant="ghost" className="hidden sm:inline-flex" onClick={onLogin}>Sign In</Button>
            <Button onClick={onLogin}>Get Started</Button>
          </>
        )}
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="py-12 border-t border-border/40 bg-muted/20">
    <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
      <p>&copy; {new Date().getFullYear()} Testimonial Automator. All rights reserved.</p>
    </div>
  </footer>
);

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [generatedTestimonial, setGeneratedTestimonial] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const mockLogin = () => {
    setUser({
      id: "123",
      name: "Replit User",
      username: "replit_dev",
      profileImage: "https://replit.com/public/images/logo.png"
    });
    toast.success("Signed in with Replit (Simulated)");
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rawFeedback: "",
      tone: "professional",
    },
  });

  // Real Gemini Generation
  const onSubmit = async (values: FormValues) => {
    setIsGenerating(true);
    setGeneratedTestimonial(null);

    try {
      // Use the Replit secret
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey || apiKey === "REPLACE_WITH_YOUR_GEMINI_API_KEY") {
        throw new Error("Please add your GEMINI_API_KEY to Replit Secrets (Tools > Secrets).");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `Convert the following messy client feedback into a polished, professional testimonial with a ${values.tone} tone. 
      Output ONLY the testimonial text itself, no quotes around it, no extra fluff.
      
      Raw Feedback: "${values.rawFeedback}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setGeneratedTestimonial(text.trim());
      toast.success("Testimonial generated successfully!");
    } catch (error: any) {
      console.error("Gemini Error:", error);
      toast.error(error.message || "Failed to generate testimonial. Check your console and API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedTestimonial) {
      navigator.clipboard.writeText(generatedTestimonial);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header user={user} onLogin={mockLogin} />

      <main className="flex-1 pt-32 pb-20">
        <section className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight text-foreground mb-4">
                Turn Messy Feedback into <br />
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                  Professional Gold
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Stop pasting screenshots of Slack messages. Instantly refine casual client praise into polished, website-ready testimonials.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Input Column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-border/50 shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Input</span>
                  </div>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <FormField
                        control={form.control}
                        name="rawFeedback"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/90 font-semibold text-base">Client's Raw Feedback</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="e.g. 'Hey, just wanted to say the new website looks dope. The team loves it, especially the mobile view. Thanks for being so fast with the updates!'"
                                className="min-h-[250px] resize-none text-lg p-4 bg-background/50 focus:bg-background transition-all border-2 focus:border-primary/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/90 font-semibold text-base">Desired Tone</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {[
                                { id: "professional", label: "Professional" },
                                { id: "enthusiastic", label: "Enthusiastic" },
                                { id: "short", label: "Short" },
                              ].map((tone) => (
                                <Button
                                  key={tone.id}
                                  type="button"
                                  variant={field.value === tone.id ? "default" : "outline"}
                                  className={`h-16 text-lg font-semibold transition-all ${
                                    field.value === tone.id 
                                      ? "ring-2 ring-primary ring-offset-2 shadow-lg" 
                                      : "hover:border-primary/50"
                                  }`}
                                  onClick={() => field.onChange(tone.id)}
                                  data-testid={`button-tone-${tone.id}`}
                                >
                                  {tone.label}
                                </Button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full h-16 font-bold text-lg shadow-xl shadow-primary/30 transition-transform active:scale-[0.98]"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Sparkles className="mr-3 h-6 w-6 animate-spin" />
                            Polishing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-3 h-6 w-6" />
                            Generate Testimonial
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Output Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative h-full"
            >
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block text-muted-foreground/30">
                <ArrowRight className="w-10 h-10" />
              </div>

              <Card className="h-full border-border/50 shadow-xl shadow-purple-500/5 bg-card/50 backdrop-blur-sm flex flex-col">
                <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold uppercase tracking-widest">Polished Result</span>
                  </div>

                  <div className="flex-1 flex items-center justify-center min-h-[250px] bg-muted/30 rounded-2xl p-6 md:p-10 relative border-2 border-dashed border-border group transition-all duration-300 hover:border-primary/30 hover:bg-muted/50">
                    <AnimatePresence mode="wait">
                      {generatedTestimonial ? (
                        <motion.div
                          key="result"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-full"
                        >
                          <Quote className="w-10 h-10 text-primary/20 mb-6" />
                          <p className="text-xl md:text-2xl leading-relaxed text-foreground font-medium italic">
                            "{generatedTestimonial}"
                          </p>
                          <div className="mt-10 flex justify-end">
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={copyToClipboard}
                              className="h-14 px-8 gap-3 text-base border-2 transition-all hover:border-primary hover:text-primary active:scale-[0.98]"
                            >
                              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                              {copied ? "Copied" : "Copy to Clipboard"}
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center text-muted-foreground/60 max-w-xs"
                        >
                          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Sparkles className="w-10 h-10 text-muted-foreground/30" />
                          </div>
                          <p className="text-lg font-medium">Your polished testimonial will appear here ready to copy.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {generatedTestimonial && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-5 bg-primary/5 rounded-xl border-2 border-primary/10 flex gap-4"
                    >
                      <div className="shrink-0 mt-1">
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-primary tracking-tight">AI Enhancement Active</p>
                        <p className="text-sm text-muted-foreground leading-snug">
                          Grammar corrected, tone adjusted to <span className="text-foreground font-medium capitalize">{form.getValues("tone")}</span>, and flow improved for marketing impact.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
