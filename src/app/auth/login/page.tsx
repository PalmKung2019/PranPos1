
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, Lock, UserCircle, Briefcase, ChevronLeft, Phone, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/brand/Logo';
import { playClickSound } from '@/lib/audio-utils';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  ConfirmationResult,
  signInAnonymously
} from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { translations } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { SavorLanguagesIcon } from '@/components/icons/SavorLanguagesIcon';
import { motion } from 'framer-motion';

type Language = 'en' | 'th';
type AuthRole = 'Staff' | 'Customer';
type LoginMethod = 'Email' | 'Phone';

export default function AuthPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [language, setLanguage] = useState<Language>('th');
  const [role, setRole] = useState<AuthRole | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('Email');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  // Stable redirect logic to prevent "bouncing"
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleGuestLogin = async () => {
    playClickSound();
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      toast({ title: language === 'en' ? "Welcome Guest!" : "ยินดีต้อนรับคุณลูกค้า!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: t.welcomeBack, description: t.successfullySignedIn });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        await updateProfile(newUser, {
          displayName: `${firstName} ${lastName}`
        });

        const now = new Date().toISOString();
        const profileRef = doc(db, 'user_profiles', newUser.uid);
        setDocumentNonBlocking(profileRef, {
          id: newUser.uid,
          firebaseAuthUid: newUser.uid,
          firstName,
          lastName,
          email,
          role: role || 'Customer',
          createdAt: now,
          updatedAt: now,
        }, { merge: true });

        // Lock roles in Firestore for RBAC
        const rolePath = role === 'Staff' ? 'roles_staff' : 'roles_customer';
        const roleRef = doc(db, rolePath, newUser.uid);
        setDocumentNonBlocking(roleRef, { assignedAt: now }, { merge: true });

        toast({ title: t.accountCreatedTitle });
      }
    } catch (error: any) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: isLogin ? t.loginFailed : t.signUpFailed,
        description: error.message || t.checkCredentials,
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setIsLoading(true);
    try {
      if (!recaptchaContainerRef.current) return;
      const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, { 'size': 'invisible' });
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(result);
      setIsOtpSent(true);
      toast({ title: "OTP Sent" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "OTP Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    if (!confirmationResult) return;
    setIsLoading(true);
    try {
      await confirmationResult.confirm(otpCode);
      toast({ title: t.welcomeBack });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Verification Failed" });
      setIsLoading(false);
    }
  };

  if (isUserLoading || user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-body">
      <div ref={recaptchaContainerRef}></div>
      
      {/* Top Navigation */}
      <div className="absolute top-8 left-8 right-8 z-50 flex justify-between items-center">
        <Button 
          variant="ghost" 
          className="rounded-full hover:bg-white/80 gap-2 h-12 px-6 font-bold text-primary group"
          onClick={() => { playClickSound(); router.push('/'); }}
        >
          <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>{t.backToMenu}</span>
        </Button>

        <Button 
          variant="ghost" 
          className="rounded-full hover:bg-white/80 gap-2 h-12 px-6 font-bold text-primary"
          onClick={() => { playClickSound(); setLanguage(prev => prev === 'en' ? 'th' : 'en'); }}
        >
          <SavorLanguagesIcon className="w-5 h-5" />
          <span className="uppercase">{language}</span>
        </Button>
      </div>

      <div className="w-full max-w-4xl flex flex-col items-center z-10">
        {!role ? (
          <div className="text-center w-full space-y-12">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
              <Logo className="h-24 lg:h-28 w-auto mx-auto mb-6" />
              <div className="space-y-2">
                <h2 className="text-4xl lg:text-5xl font-headline text-primary tracking-tight">{t.slogan}</h2>
                <p className="text-lg lg:text-xl text-accent font-body italic tracking-widest opacity-80 flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4 fill-accent" /> {t.tagline}
                </p>
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <motion.button 
                whileHover={{ y: -5 }}
                onClick={() => { playClickSound(); setRole('Customer'); }}
                className="rounded-[40px] p-12 bg-white border border-primary/5 text-center flex flex-col items-center shadow-xl"
              >
                <div className="w-20 h-20 rounded-full bg-accent/5 flex items-center justify-center mb-6"><UserCircle className="w-10 h-10 text-accent" /></div>
                <h3 className="text-2xl font-headline text-accent mb-2 uppercase tracking-wide">{t.customerPortal}</h3>
                <div className="mt-auto flex items-center gap-2 text-accent font-bold">{t.signIn} <ArrowRight className="w-5 h-5" /></div>
              </motion.button>

              <motion.button 
                whileHover={{ y: -5 }}
                onClick={() => { playClickSound(); setRole('Staff'); }}
                className="rounded-[40px] p-12 bg-white border border-primary/5 text-center flex flex-col items-center shadow-xl"
              >
                <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6"><Briefcase className="w-10 h-10 text-primary" /></div>
                <h3 className="text-2xl font-headline text-primary mb-2 uppercase tracking-wide">{t.staffPortal}</h3>
                <div className="mt-auto flex items-center gap-2 text-primary font-bold">{t.signIn} <ArrowRight className="w-5 h-5" /></div>
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md">
            <Card className="rounded-[48px] border-none shadow-2xl bg-white p-10 relative overflow-hidden">
              <div className={cn("absolute top-0 left-0 w-full h-1.5", role === 'Staff' ? "bg-primary" : "bg-accent")} />

              <CardHeader className="text-center pb-8 space-y-4">
                <Logo className="h-16 w-auto mx-auto" />
                <div>
                  <CardTitle className={cn("text-2xl font-headline mb-1", role === 'Staff' ? "text-primary" : "text-accent")}>
                    {isOtpSent ? t.verifyOtp : (isLogin ? t.signIn : t.createAccount)}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {role === 'Customer' && isLogin && (
                  <Button variant="outline" className="w-full h-14 rounded-full text-base font-bold mb-4" onClick={handleGuestLogin} disabled={isLoading}>
                    {t.continueAsGuest}
                  </Button>
                )}

                <div className="space-y-4">
                  {loginMethod === 'Email' ? (
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      {!isLogin && (
                        <div className="grid grid-cols-2 gap-3">
                          <Input placeholder={t.firstName} className="h-12 rounded-2xl bg-[#F8F7F4]" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                          <Input placeholder={t.lastName} className="h-12 rounded-2xl bg-[#F8F7F4]" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                      )}
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input type="email" placeholder={t.emailAddress} className="h-12 pl-12 rounded-2xl bg-[#F8F7F4]" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input type="password" placeholder={t.password} className="h-12 pl-12 rounded-2xl bg-[#F8F7F4]" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      </div>
                      <Button type="submit" className={cn("w-full h-14 rounded-full text-lg", role === 'Staff' ? "bg-primary" : "bg-accent")} disabled={isLoading}>
                        {isLoading ? t.processing : (isLogin ? t.signIn : t.createAccount)}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      {!isOtpSent ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                          <Input type="tel" placeholder={t.enterPhoneNumber} className="h-12 px-6 rounded-2xl bg-[#F8F7F4]" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                          <Button type="submit" className="w-full h-14 rounded-full bg-accent" disabled={isLoading}>{t.sendOtp}</Button>
                        </form>
                      ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                          <Input type="text" placeholder={t.enterOtp} className="h-12 px-6 rounded-2xl bg-[#F8F7F4] text-center font-bold" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required />
                          <Button type="submit" className="w-full h-14 rounded-full bg-accent" disabled={isLoading}>{t.verifyOtp}</Button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-8 text-center space-y-4">
                  {role === 'Customer' && (
                    <div className="flex flex-col gap-3">
                      <button onClick={() => { playClickSound(); setLoginMethod(prev => prev === 'Email' ? 'Phone' : 'Email'); }} className="text-sm font-bold text-primary">
                        {loginMethod === 'Email' ? t.tryPhoneLogin : t.tryEmailLogin}
                      </button>
                      <button onClick={() => { playClickSound(); setIsLogin(!isLogin); }} className="text-xs text-muted-foreground hover:underline">
                        {isLogin ? t.dontHaveAccount : t.alreadyHaveAccount}
                      </button>
                    </div>
                  )}
                  <button onClick={() => { playClickSound(); setRole(null); }} className="text-xs font-bold text-muted-foreground pt-2">
                    {t.back}
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
