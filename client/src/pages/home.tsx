import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Copy, Check, Quote, ArrowRight, MessageSquare, Star, Zap, Shield, Globe } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
import { Badge } from "@/components/ui/badge";

import heroBg from '@assets/generated_images/abstract_premium_purple_silk_texture_background.png'

// --- Types & Schema ---

const formSchema = z.object({
  rawFeedback: z.string().min(10, {
    message: "Please enter at least 10 characters of feedback.",
  }),
  tone: z.string().default("professional"),
});

type FormValues = z.infer<typeof formSchema>;

// --- Components ---

const Header = ({ user, onLogin }: { user: any; onLogin: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? "bg-black/40 backdrop-blur-xl border-b border-white/5 py-3" : "bg-transparent py-8"}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          <div className="bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] p-2.5 rounded-2xl">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
            TESTIMONIAL<span className="text-primary">AI</span>
          </span>
        </motion.div>
        
        <nav className="hidden lg:flex items-center gap-12 text-[13px] font-black uppercase tracking-[0.2em] text-white/40">
          {["Features", "Showcase", "Pricing"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-primary transition-all relative group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 bg-white/5 pl-4 pr-1.5 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
              <span className="text-sm font-black tracking-tight uppercase">{user.name}</span>
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center overflow-hidden">
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="hidden sm:inline-flex font-black uppercase tracking-widest text-xs hover:bg-white/5" onClick={onLogin}>Sign In</Button>
              <Button className="font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 rounded-full px-10 h-12" onClick={onLogin}>Get Started</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="py-32 border-t border-white/5 bg-black relative overflow-hidden">
    <div className="container mx-auto px-6 relative z-10">
      <div className="grid md:grid-cols-4 gap-20 mb-24">
        <div className="col-span-2 space-y-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2.5 rounded-xl">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-black text-2xl tracking-tighter">TESTIMONIALAI</span>
          </div>
          <p className="text-white/40 max-w-sm text-xl leading-relaxed font-medium">
            Elevating client feedback into powerful brand assets with high-performance AI processing.
          </p>
        </div>
        <div>
          <h4 className="font-black uppercase tracking-[0.3em] text-xs mb-8 text-white">Platform</h4>
          <ul className="space-y-6 text-white/30 font-bold uppercase tracking-widest text-[11px]">
            <li><a href="#" className="hover:text-primary transition-colors">API Engine</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Enterprise</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black uppercase tracking-[0.3em] text-xs mb-8 text-white">Legal</h4>
          <ul className="space-y-6 text-white/30 font-bold uppercase tracking-widest text-[11px]">
            <li><a href="#" className="hover:text-primary transition-colors">Privacy Ops</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Terms of Use</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Security Audit</a></li>
          </ul>
        </div>
      </div>
      <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-white/20 text-[11px] font-black uppercase tracking-[0.3em]">
        <p>&copy; {new Date().getFullYear()} TestimonialAI. Engineered for excellence.</p>
        <div className="flex gap-8">
          <Globe className="w-5 h-5 hover:text-primary cursor-pointer transition-colors" />
          <Globe className="w-5 h-5 hover:text-primary cursor-pointer transition-colors" />
        </div>
      </div>
    </div>
  </footer>
);

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [generatedTestimonial, setGeneratedTestimonial] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const mockLogin = () => {
    setUser({
      id: "123",
      name: "Alex Rivera",
      username: "arivera",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      isPro: false
    });
    toast.success("Identity verified. Welcome back.");
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rawFeedback: "",
      tone: "professional",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsGenerating(true);
    setGeneratedTestimonial(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === "REPLACE_WITH_YOUR_GEMINI_API_KEY") {
        throw new Error("Missing API credentials. Check secure environment.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `Convert the following messy client feedback into a polished, professional testimonial with a ${values.tone} tone. Keep it concise but impactful. Output ONLY the testimonial text itself. Raw Feedback: "${values.rawFeedback}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setGeneratedTestimonial(text.trim());
      toast.success("Refinement complete.");
    } catch (error: any) {
      console.error("Gemini Error:", error);
      toast.error(error.message || "Refinement failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedTestimonial) {
      navigator.clipboard.writeText(generatedTestimonial);
      setCopied(true);
      toast.success("Asset secured to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/30 bg-[#050505] text-white overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-[0.03]" 
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[180px] rounded-full" />
        <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[140px] rounded-full animate-pulse [animation-delay:3s]" />
      </div>

      <Header user={user} onLogin={mockLogin} />

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="pt-56 pb-40 container mx-auto px-6 relative">
          <motion.div 
            style={{ opacity, scale }}
            className="text-center max-w-6xl mx-auto space-y-12"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full text-[10px] font-black tracking-[0.4em] uppercase mb-4 backdrop-blur-md"
            >
              <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
              Engineered with Gemini 2.0 Flash
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-7xl md:text-[9rem] font-heading font-black tracking-[-0.05em] leading-[0.85] text-white uppercase"
            >
              Refine your <br />
              <span className="text-primary italic font-serif lowercase tracking-tight">reputation.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl md:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-[1.3] tracking-tight"
            >
              Transform casual client praise into high-conversion marketing assets. Stop using raw feedback—start using refined testimonials.
            </motion.p>
          </motion.div>
        </section>

        {/* Generator App Section */}
        <section className="container mx-auto px-6 pb-60">
          <div className="grid lg:grid-cols-2 gap-12 items-stretch">
            {/* Input Side */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="h-full bg-white/[0.02] border-white/5 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group rounded-[3rem]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <CardContent className="p-14 relative z-10">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/10 shadow-inner">
                        <MessageSquare className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">Raw Transmission</span>
                    </div>
                  </div>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                      <FormField
                        control={form.control}
                        name="rawFeedback"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative group/textarea">
                                <Textarea
                                  placeholder="Capture the raw client feedback here..."
                                  className="min-h-[350px] bg-black/40 border-2 border-white/5 focus:border-primary/50 text-2xl p-10 rounded-[2.5rem] transition-all duration-500 resize-none shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)] placeholder:text-white/10 font-medium tracking-tight"
                                  {...field}
                                />
                                <div className="absolute inset-0 rounded-[2.5rem] bg-primary/5 opacity-0 group-focus-within/textarea:opacity-100 pointer-events-none transition-opacity duration-500" />
                              </div>
                            </FormControl>
                            <FormMessage className="font-black text-red-500/60 pl-6 uppercase text-[10px] tracking-[0.2em]" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-6 block">Refinement Parameter</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                              {[
                                { id: "professional", label: "Elite", icon: Shield },
                                { id: "enthusiastic", label: "High Energy", icon: Zap },
                                { id: "short", label: "Pure Impact", icon: Globe },
                              ].map((tone) => (
                                <button
                                  key={tone.id}
                                  type="button"
                                  className={`h-24 rounded-3xl flex flex-col items-center justify-center gap-3 border-2 transition-all duration-500 ${
                                    field.value === tone.id 
                                      ? "bg-primary border-primary text-primary-foreground shadow-[0_15px_30px_rgba(var(--primary-rgb),0.3)] scale-[1.03]" 
                                      : "bg-white/[0.03] border-white/5 hover:border-white/20 text-white/40"
                                  }`}
                                  onClick={() => field.onChange(tone.id)}
                                >
                                  <tone.icon className={`w-6 h-6 ${field.value === tone.id ? "text-primary-foreground" : "text-primary/50"}`} />
                                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">{tone.label}</span>
                                </button>
                              ))}
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full h-24 rounded-3xl font-black text-2xl uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(var(--primary-rgb),0.2)] transition-all active:scale-[0.96] relative overflow-hidden group"
                        disabled={isGenerating}
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {isGenerating ? (
                          <Sparkles className="mr-6 h-8 w-8 animate-spin" />
                        ) : (
                          <Sparkles className="mr-6 h-8 w-8 transition-transform group-hover:rotate-12" />
                        )}
                        {isGenerating ? "Processing..." : "Refine Now"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Output Side */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <Card className="h-full bg-gradient-to-b from-white/[0.04] to-transparent border-white/5 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col rounded-[3rem]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-[0.03] pointer-events-none" />
                <CardContent className="p-14 flex-1 flex flex-col relative z-10">
                  <div className="flex items-center gap-4 mb-12">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500 shadow-[0_0_25px_rgba(234,179,8,0.6)]" />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">Refined Output</span>
                  </div>

                  <div className="flex-1 flex flex-col justify-center min-h-[450px] bg-black/30 rounded-[3rem] p-14 relative border border-white/5 shadow-[inset_0_2px_40px_rgba(0,0,0,0.8)]">
                    <AnimatePresence mode="wait">
                      {generatedTestimonial ? (
                        <motion.div
                          key="result"
                          initial={{ opacity: 0, scale: 0.98, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98, y: -20 }}
                          transition={{ type: "spring", damping: 25, stiffness: 120 }}
                          className="w-full space-y-12"
                        >
                          <Quote className="w-20 h-20 text-primary/10 -ml-6" />
                          <p className="text-3xl md:text-5xl leading-[1.1] text-white font-heading font-black italic tracking-tighter">
                            "{generatedTestimonial}"
                          </p>
                          <div className="pt-12 flex justify-end">
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={copyToClipboard}
                              className="h-20 px-12 rounded-full gap-5 text-[11px] font-black uppercase tracking-[0.4em] border-2 border-white/10 hover:border-primary hover:bg-primary/5 transition-all active:scale-[0.94] group bg-white/[0.02]"
                            >
                              {copied ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6 transition-transform group-hover:-translate-y-1" />}
                              {copied ? "Secured" : "Capture Asset"}
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center space-y-10 max-w-md mx-auto"
                        >
                          <div className="w-32 h-32 rounded-[3rem] bg-white/[0.03] flex items-center justify-center mx-auto shadow-2xl relative group-hover:scale-110 transition-transform duration-700">
                            <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                            <div className="absolute inset-0 rounded-[3rem] border-2 border-primary/20 animate-ping" />
                          </div>
                          <p className="text-3xl font-heading font-black text-white/10 leading-none tracking-tighter uppercase italic">
                            Awaiting client transmission...
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container mx-auto px-6 py-60 border-t border-white/5 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-60 bg-gradient-to-b from-primary/50 to-transparent" />
          
          <div className="text-center mb-32 space-y-8">
            <h2 className="text-6xl md:text-[8rem] font-heading font-black tracking-[-0.06em] leading-[0.8] uppercase">Full System <br /><span className="text-primary italic font-serif lowercase tracking-tight">Access.</span></h2>
            <p className="text-white/30 text-2xl max-w-3xl mx-auto font-medium tracking-tight">Industrial-grade refinement capabilities for established builders.</p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <motion.div
              whileHover={{ y: -15 }}
              transition={{ type: "spring", damping: 15, stiffness: 100 }}
            >
              <Card className="relative overflow-hidden border-2 border-primary shadow-[0_0_80px_rgba(var(--primary-rgb),0.15)] bg-white/[0.02] backdrop-blur-3xl rounded-[4rem]">
                <div className="absolute top-12 right-12">
                  <Badge className="bg-primary text-primary-foreground font-black px-6 py-2 tracking-[0.3em] uppercase text-[9px] rounded-full shadow-[0_10px_20px_rgba(var(--primary-rgb),0.3)]">Ultimate Protocol</Badge>
                </div>
                <CardContent className="p-20">
                  <div className="mb-16">
                    <h3 className="text-[11px] font-black tracking-[0.5em] mb-6 uppercase text-white/30">License Level 01</h3>
                    <div className="flex items-baseline gap-4">
                      <span className="text-[9rem] font-black tracking-tighter leading-none">$9</span>
                      <span className="text-white/20 text-xl font-black tracking-[0.4em] uppercase">Permanent</span>
                    </div>
                  </div>
                  
                  <div className="grid gap-8 mb-20">
                    {[
                      "Unrestricted Refinement Throughput",
                      "All Stylized Profiles Unlocked",
                      "Priority Compute Latency",
                      "Commercial Exploitation Rights",
                      "Multi-Session Cloud Protocol"
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-6">
                        <div className="bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)] p-1.5 rounded-full">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="text-white/60 font-black uppercase tracking-widest text-xs">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full h-28 rounded-[2.5rem] text-2xl font-black uppercase tracking-[0.4em] shadow-[0_30px_60px_rgba(var(--primary-rgb),0.3)] group relative overflow-hidden"
                    onClick={() => {
                      toast.success("Protocol Initialized: Access Granted.", {
                        description: "Professional tier refinement is now active for this session.",
                      });
                      setUser((prev: any) => prev ? ({ ...prev, isPro: true }) : ({ id: 'demo', name: 'Elite Builder', isPro: true }));
                    }}
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                    Secure License
                  </Button>
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
