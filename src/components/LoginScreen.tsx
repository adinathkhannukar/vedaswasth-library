import React, { useState } from 'react';
import { Customer } from '../types';
import { getStoredCustomers, getSessionId, WHATSAPP_NUMBER, isAdminEmail } from '../lib/storage';
import { getSupabaseClient } from '../lib/supabaseConfig';
import { Lock, Mail, ArrowRight, ShieldCheck, MessageCircle, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (customer: Customer) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otp, setOtp] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [errorState, setErrorState] = useState<{ type: 'unauthorized' | 'invalid_otp' | null; message: string }>({
    type: null,
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorState({ type: 'invalid_otp', message: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    setErrorState({ type: null, message: '' });

    const trimmedEmail = email.trim().toLowerCase();
    let hasAccess = false;

    if (isAdminEmail(trimmedEmail)) {
      hasAccess = true;
    }

    const customers = getStoredCustomers();
    let customer = customers.find(c => c.email.toLowerCase() === trimmedEmail);
    if (customer) {
      hasAccess = true;
    }

    // Query Supabase table customers directly
    const supabase = getSupabaseClient();
    if (supabase && !hasAccess) {
      try {
        const { data: remoteCustomer } = await supabase
          .from('customers')
          .select('*')
          .ilike('email', trimmedEmail)
          .maybeSingle();

        if (remoteCustomer) {
          hasAccess = true;
          if (!customer) {
            customer = {
              id: remoteCustomer.id || 'cust_' + Date.now(),
              email: remoteCustomer.email,
              name: remoteCustomer.name || remoteCustomer.email.split('@')[0],
              notes: remoteCustomer.notes || 'Synced from Supabase',
              createdAt: remoteCustomer.created_at || new Date().toISOString()
            };
            customers.push(customer);
            localStorage.setItem('veda_swasth_customers', JSON.stringify(customers));
          }
        }
      } catch (err) {
        console.error('Supabase customer query error:', err);
      }
    }

    setLoading(false);

    if (!hasAccess) {
      setErrorState({
        type: 'unauthorized',
        message: 'Access not active for this email yet. Please contact us on WhatsApp with your payment screenshot to activate your library access.'
      });
      return;
    }

    // Generate 6 digit access code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(randomCode);
    setStep('otp');
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim() !== generatedCode && otp.trim() !== '123456') { // Allow 123456 as backup admin/test code
      setErrorState({ type: 'invalid_otp', message: 'Invalid access pass code. Please try again.' });
      return;
    }

    setLoading(true);
    const trimmedEmail = email.trim().toLowerCase();
    const customers = getStoredCustomers();
    let customer = customers.find(c => c.email.toLowerCase() === trimmedEmail);

    if (!customer && isAdminEmail(trimmedEmail)) {
      customer = {
        id: 'cust-admin-' + Date.now(),
        email: trimmedEmail,
        name: 'Adinath',
        activeSessionId: getSessionId(),
        notes: 'Platform Administrator',
        createdAt: new Date().toISOString()
      };
      customers.push(customer);
      localStorage.setItem('veda_swasth_customers', JSON.stringify(customers));
    }

    if (customer) {
      const currentSessionId = getSessionId();
      customer.activeSessionId = currentSessionId;
      
      const updated = customers.map(c => c.id === customer!.id ? customer! : c);
      localStorage.setItem('veda_swasth_customers', JSON.stringify(updated));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('customers').upsert({
            id: customer.id,
            email: customer.email,
            name: customer.name || '',
            active_session_id: currentSessionId,
            notes: customer.notes || '',
            created_at: customer.createdAt
          }, { onConflict: 'email' });
        } catch (err) {
          console.error('Supabase customer session upsert error:', err);
        }
      }

      setLoading(false);
      onLoginSuccess(customer);
    } else {
      setLoading(false);
      setErrorState({ type: 'unauthorized', message: 'Access denied. Email not found.' });
    }
  };

  const handleWhatsAppSupport = () => {
    const text = encodeURIComponent(`Namaste, I have purchased the eBook. Please grant me access to my library using my email address: ${email || 'N/A'}. Thank you!`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#f6f2e6] border border-[#dcd2bc] rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#047857]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center space-y-3 mb-8">
          <div className="w-16 h-16 bg-[#064e3b] text-[#fbbf24] rounded-2xl flex items-center justify-center mx-auto text-2xl font-serif shadow-md">
            ॐ
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#064e3b]">
            Veda Swasth Library
          </h2>
          <p className="text-sm text-[#526052]">
            Secure, instant gateway to your wellness wisdom
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleRequestCode} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">
                Your Registered Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#738479]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#d6ccb2] rounded-xl text-[#1c2d25] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#047857] focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            {errorState.type === 'unauthorized' && (
              <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-xl p-4 text-center space-y-3 animate-fade-in">
                <p className="text-xs sm:text-sm text-[#991b1b] font-medium leading-relaxed">
                  {errorState.message}
                </p>
                <button
                  type="button"
                  onClick={handleWhatsAppSupport}
                  className="w-full py-2.5 px-4 bg-[#25d366] text-white rounded-xl text-sm font-semibold hover:bg-[#20ba5a] transition-colors flex items-center justify-center space-x-2 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contact on WhatsApp</span>
                </button>
              </div>
            )}

            {errorState.type === 'invalid_otp' && (
              <p className="text-xs text-[#991b1b] bg-[#fee2e2] p-2.5 rounded-lg text-center">
                {errorState.message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#064e3b] text-[#f4ecd8] rounded-xl font-semibold hover:bg-[#043d2e] transition-colors flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
            >
              {loading ? (
                <span>Checking access...</span>
              ) : (
                <>
                  <span>Get Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-5">
            <div className="bg-[#ede7d3] p-4 rounded-2xl text-center space-y-3 border border-[#d6ccb2]">
              <p className="text-xs text-[#526052] font-medium leading-relaxed">
                Enter your 6-digit access pass code below to enter your library.
              </p>
              <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-xs border border-[#d6ccb2]">
                <Sparkles className="w-4 h-4 text-[#d97706]" />
                <span className="text-xs font-semibold text-[#36483e]">Your Access Code:</span>
                <span className="font-mono text-base font-bold text-[#064e3b] tracking-wider">{generatedCode}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">
                Enter 6-Digit Access Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#738479]" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#d6ccb2] rounded-xl text-[#1c2d25] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#047857] focus:border-transparent transition-all font-mono text-lg tracking-widest text-center"
                />
              </div>
            </div>

            {errorState.type === 'invalid_otp' && (
              <p className="text-xs text-[#991b1b] bg-[#fee2e2] p-2.5 rounded-lg text-center">
                {errorState.message}
              </p>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-1/3 py-3 bg-[#e5dec9] text-[#064e3b] rounded-xl font-medium text-sm hover:bg-[#d8ceb4] transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 bg-[#064e3b] text-[#f4ecd8] rounded-xl font-semibold hover:bg-[#043d2e] transition-colors shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <span>Verify & Login</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
