
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trophy, Lock, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Please check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 basketball-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-600/10 to-transparent pointer-events-none" />
      
      <Card className="w-full max-w-md border-none shadow-2xl bg-white/95 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
        <div className="bg-orange-600 h-2 w-full" />
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center mt-4">
            <div className="bg-orange-600 p-4 rounded-[2rem] shadow-2xl shadow-orange-500/50">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-black text-slate-900 uppercase tracking-tight">Athlete Login</CardTitle>
            <CardDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest mt-1">Basketball AI Performance Portal</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase text-slate-500 ml-1">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@athlete.com" 
                  className="pl-11 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-orange-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" dangerouslySetInnerHTML={{ __html: 'Password' }} className="text-[10px] font-black uppercase text-slate-500 ml-1" />
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pl-11 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-orange-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 h-14 rounded-2xl font-black text-lg shadow-xl shadow-orange-200" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Enter Stadium'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center border-t border-slate-50 pt-8 mt-2 pb-10">
          <p className="text-sm font-bold text-slate-500">
            New Athlete?{' '}
            <Link href="/register" className="text-orange-600 font-black hover:underline">
              Create Account
            </Link>
          </p>
          <div className="flex items-center justify-center gap-2 opacity-20">
            <div className="h-px w-8 bg-slate-900" />
            <span className="text-[8px] font-black uppercase tracking-widest">Powered by AI</span>
            <div className="h-px w-8 bg-slate-900" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
