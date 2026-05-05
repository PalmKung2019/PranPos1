
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
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup
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

  const handleGoogleLogin = async () => {
    playClickSound();
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const newUser = result.user;
      
      const now = new Date().toISOString();
      const profileRef = doc(db, 'user_profiles', newUser.uid);
      setDocumentNonBlocking(profileRef, {
        id: newUser.uid,
        firebaseAuthUid: newUser.uid,
        firstName: newUser.displayName?.split(' ')[0] || '',
        lastName: newUser.displayName?.split(' ').slice(1).join(' ') || '',
        email: newUser.email || '',
        role: role || 'Customer',
        createdAt: now,
        updatedAt: now,
      }, { merge: true });

      const rolePath = role === 'Staff' ? 'roles_staff' : 'roles_customer';
      const roleRef = doc(db, rolePath, newUser.uid);
      setDocumentNonBlocking(roleRef, { assignedAt: now }, { merge: true });

      toast({ title: t.welcomeBack, description: t.successfullySignedIn });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Google Login Failed", description: error.message });
      setIsLoading(false);
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
          <span>{language === 'en' ? 'Back to Menu' : 'กลับสู่หน้าเมนู'}</span>
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
                      
                      <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-100"></div>
                        <span className="flex-shrink-0 mx-4 text-xs text-slate-400 font-bold uppercase tracking-widest">OR</span>
                        <div className="flex-grow border-t border-slate-100"></div>
                      </div>
                      
                      <Button type="button" onClick={handleGoogleLogin} variant="outline" className="w-full h-14 rounded-full text-base font-bold flex items-center justify-center gap-3 border-slate-200 hover:bg-slate-50" disabled={isLoading}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        {language === 'en' ? 'Continue with Google' : 'เข้าสู่ระบบด้วย Google'}
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
                        {loginMethod === 'Email' ? (language === 'en' ? 'Try Phone Login' : 'เข้าสู่ระบบด้วยเบอร์โทร') : (language === 'en' ? 'Try Email Login' : 'เข้าสู่ระบบด้วยอีเมล')}
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
