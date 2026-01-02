import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Copy, Check, Quote, ArrowRight, MessageSquare, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner"; // Assuming sonner is installed/aliased, checking package.json it is.

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

const Header = () => (
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
        <a href="#" className="hover:text-foreground transition-colors">About</a>
      </nav>
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
        <Button>Get Started</Button>
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
  const [generatedTestimonial, setGeneratedTestimonial] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rawFeedback: "",
      tone: "professional",
    },
  });

  // Mock AI Generation
  const onSubmit = async (values: FormValues) => {
    setIsGenerating(true);
    setGeneratedTestimonial(null);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockResponses: Record<string, string> = {
      professional: "Working with this team has been an absolute pleasure. Their attention to detail and commitment to excellence significantly improved our project outcomes. They didn't just deliver on time; they exceeded our expectations in every way. Highly recommended for anyone seeking top-tier results.",
      casual: "Honestly, these guys are amazing! Super easy to work with and they just 'get it'. The project turned out way better than I imagined. If you're on the fence, just go for it—you won't regret it!",
      enthusiastic: "Wow! I am blown away by the results! The level of creativity and dedication shown was simply outstanding. It’s rare to find such talent combined with such great communication. I can't wait to work with them again on our next big idea!",
    };

    const response = mockResponses[values.tone as keyof typeof mockResponses] || mockResponses.professional;
    
    setGeneratedTestimonial(response);
    setIsGenerating(false);
    toast.success("Testimonial generated successfully!");
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
      <Header />

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
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wider">Input</span>
                  </div>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="rawFeedback"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/80">Client's Raw Feedback</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="e.g. 'Hey, just wanted to say the new website looks dope. The team loves it, especially the mobile view. Thanks for being so fast with the updates!'"
                                className="min-h-[200px] resize-none text-base bg-background/50 focus:bg-background transition-colors"
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
                            <FormLabel className="text-foreground/80">Desired Tone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue placeholder="Select a tone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="professional">Professional & Polished</SelectItem>
                                <SelectItem value="casual">Casual & Friendly</SelectItem>
                                <SelectItem value="enthusiastic">Enthusiastic & High Energy</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full font-semibold text-base shadow-lg shadow-primary/20"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                            Polishing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Professional Testimonial
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
                <ArrowRight className="w-8 h-8" />
              </div>

              <Card className="h-full border-border/50 shadow-xl shadow-purple-500/5 bg-card/50 backdrop-blur-sm flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium uppercase tracking-wider">Polished Result</span>
                  </div>

                  <div className="flex-1 flex items-center justify-center min-h-[200px] bg-muted/30 rounded-xl p-6 relative border border-dashed border-border group transition-all duration-300 hover:border-primary/20 hover:bg-muted/50">
                    <AnimatePresence mode="wait">
                      {generatedTestimonial ? (
                        <motion.div
                          key="result"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-full"
                        >
                          <Quote className="w-8 h-8 text-primary/20 mb-4" />
                          <p className="text-lg leading-relaxed text-foreground font-medium">
                            "{generatedTestimonial}"
                          </p>
                          <div className="mt-6 flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={copyToClipboard}
                              className="gap-2 transition-all hover:border-primary hover:text-primary"
                            >
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              {copied ? "Copied" : "Copy Text"}
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
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-muted-foreground/40" />
                          </div>
                          <p>Your polished testimonial will appear here ready to copy.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {generatedTestimonial && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10 flex gap-3"
                    >
                      <div className="shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-primary">AI Enhancement Note</p>
                        <p className="text-xs text-muted-foreground">
                          Grammar corrected, tone adjusted to {form.getValues("tone")}, and flow improved for marketing impact.
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
