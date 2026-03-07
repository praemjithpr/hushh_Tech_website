import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import config from '../../resources/config/config';
import OnboardingShell from '../../components/OnboardingShell';

// Types
interface TimeSlot { startTime: string; endTime: string; available: boolean; }
interface DayAvailability { date: string; slots: TimeSlot[]; }
interface CalendarData { ceo: { name: string; email: string }; timezone: string; meetingDuration: number; availability: DayAvailability[]; }
type PaymentState = 'loading' | 'not_paid' | 'verifying' | 'paid' | 'booked';
const VALID_COUPON = 'ILOVEHUSHH';

function MeetCeoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentState, setPaymentState] = useState<PaymentState>('loading');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hushhCoins, setHushhCoins] = useState(0);

  // Coupon state
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Calendar state
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  useEffect(() => { checkPaymentStatus(); }, []);

  // Handle Stripe callback
  useEffect(() => {
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');
    if (payment === 'success' && sessionId) verifyPayment(sessionId);
    else if (payment === 'cancel') { setError('Payment cancelled. Try again.'); setPaymentState('not_paid'); }
  }, [searchParams]);

  // Fetch calendar when paid
  useEffect(() => { if (paymentState === 'paid') fetchCalendarSlots(); }, [paymentState]);

  /* ── Send Hushh Coins credit email (fire-and-forget) ── */
  const sendCoinsEmail = async (email: string, name: string, coins: number) => {
    try {
      const { data: { session } } = await config.supabaseClient!.auth.getSession();
      if (!session) return;
      await fetch(`${config.SUPABASE_URL}/functions/v1/coins-credit-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ recipientEmail: email, recipientName: name, coinsAwarded: coins }),
      });
    } catch (err) { console.error('Coins email failed (non-blocking):', err); }
  };

  /* ── Send Hushh Coins deduction email when meeting is booked (fire-and-forget) ── */
  const sendCoinsDeductionEmail = async (email: string, name: string, coins: number, meetingDate: string, meetingTime: string) => {
    try {
      const { data: { session } } = await config.supabaseClient!.auth.getSession();
      if (!session) return;
      await fetch(`${config.SUPABASE_URL}/functions/v1/coins-deduction-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ recipientEmail: email, recipientName: name, coinsDeducted: coins, meetingDate, meetingTime }),
      });
    } catch (err) { console.error('Deduction email failed (non-blocking):', err); }
  };

  /* ── API Handlers ── */

  const checkPaymentStatus = async () => {
    if (!config.supabaseClient) { setPaymentState('not_paid'); return; }
    try {
      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const { data: payment } = await config.supabaseClient
        .from('ceo_meeting_payments').select('*').eq('user_id', user.id).maybeSingle();
      if (payment?.payment_status === 'completed') {
        setHushhCoins(payment.hushh_coins_awarded || 300000);
        setPaymentState(payment.calendly_booked ? 'booked' : 'paid');
      } else { setPaymentState('not_paid'); }
    } catch { setPaymentState('not_paid'); }
  };

  const verifyPayment = async (sessionId: string) => {
    setPaymentState('verifying'); setError(null);
    try {
      const { data: { session } } = await config.supabaseClient!.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const res = await fetch(`${config.SUPABASE_URL}/functions/v1/onboarding-verify-payment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ sessionId }),
      });
      const result = await res.json();
      if (result.success) {
        const coins = result.hushhCoinsAwarded || 300000;
        setHushhCoins(coins);
        setPaymentState('paid');
        window.history.replaceState({}, '', '/onboarding/meet-ceo');
        // Send coins credit email after Stripe payment
        const { data: { user } } = await config.supabaseClient!.auth.getUser();
        if (user) sendCoinsEmail(user.email || '', user.user_metadata?.full_name || 'Hushh User', coins);
      } else throw new Error(result.error || 'Verification failed');
    } catch (err: any) { setError(err.message); setPaymentState('not_paid'); }
  };

  const handlePayment = async () => {
    setLoading(true); setError(null);
    try {
      const { data: { session } } = await config.supabaseClient!.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const res = await fetch(`${config.SUPABASE_URL}/functions/v1/onboarding-create-checkout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({}),
      });
      const result = await res.json();
      if (result.alreadyPaid) { setPaymentState('paid'); return; }
      if (result.checkoutUrl) window.location.href = result.checkoutUrl;
      else throw new Error(result.error || 'Checkout failed');
    } catch (err: any) { setError(err.message); setLoading(false); }
  };

  const handleCouponRedeem = async () => {
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();
    if (!code) { setCouponError('Please enter a coupon code.'); return; }
    if (code !== VALID_COUPON) { setCouponError('Invalid coupon code. Please try again.'); return; }
    setCouponLoading(true);
    try {
      const { data: { user } } = await config.supabaseClient!.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      // Upsert payment record with coupon
      await config.supabaseClient!.from('ceo_meeting_payments').upsert({
        user_id: user.id, payment_status: 'completed', payment_method: 'coupon',
        coupon_code: code, hushh_coins_awarded: 300000, amount: 0, currency: 'usd',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      setHushhCoins(300000);
      setPaymentState('paid');
      // Send coins credit email notification
      sendCoinsEmail(user.email || '', user.user_metadata?.full_name || 'Hushh User', 300000);
    } catch (err: any) { setCouponError(err.message || 'Failed to redeem coupon'); }
    finally { setCouponLoading(false); }
  };

  const fetchCalendarSlots = async () => {
    setLoadingSlots(true);
    try {
      const { data: { session } } = await config.supabaseClient!.auth.getSession();
      if (!session) { setLoadingSlots(false); return; }
      const res = await fetch(`${config.SUPABASE_URL}/functions/v1/ceo-calendar-booking?days=14`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (data.success) { setCalendarData(data); if (data.availability?.length) setSelectedDate(data.availability[0].date); }
    } catch (err) { console.error('Calendar fetch error:', err); }
    finally { setLoadingSlots(false); }
  };

  const handleBookMeeting = async () => {
    if (!selectedSlot) return;
    setBookingInProgress(true); setError(null);
    try {
      const { data: { session } } = await config.supabaseClient!.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const { data: { user } } = await config.supabaseClient!.auth.getUser();
      const res = await fetch(`${config.SUPABASE_URL}/functions/v1/ceo-calendar-booking`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ startTime: selectedSlot.startTime, endTime: selectedSlot.endTime, attendeeName: user?.user_metadata?.full_name || 'Hushh User' }),
      });
      const result = await res.json();
      if (result.success) {
        setPaymentState('booked');
        // Send coins deduction email after successful booking
        const meetingDate = new Date(selectedSlot.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        const meetingTime = `${new Date(selectedSlot.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} – ${new Date(selectedSlot.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        sendCoinsDeductionEmail(user?.email || '', user?.user_metadata?.full_name || 'Hushh User', 300000, meetingDate, meetingTime);
      } else throw new Error(result.error || 'Booking failed');
    } catch (err: any) { setError(err.message); }
    finally { setBookingInProgress(false); }
  };

  const handleContinue = () => navigate('/hushh-user-profile');
  const handleBack = () => navigate('/onboarding/step-13');

  // Determine primary action for OnboardingShell
  const getContinueLabel = () => {
    if (paymentState === 'not_paid') return loading ? 'Redirecting...' : 'Verify & Unlock — $1';
    if (paymentState === 'paid') return bookingInProgress ? 'Booking...' : selectedSlot ? 'Confirm Booking' : 'Select a Time';
    return 'Continue to Profile';
  };

  const handlePrimaryAction = () => {
    if (paymentState === 'not_paid') handlePayment();
    else if (paymentState === 'paid') {
      if (selectedSlot) handleBookMeeting();
    }
    else if (paymentState === 'booked') handleContinue();
  };

  const isContinueDisabled = (paymentState === 'not_paid' && loading) ||
    (paymentState === 'paid' && (!selectedSlot || bookingInProgress));

  /* ── Shimmer Loader ── */
  if (paymentState === 'loading' || paymentState === 'verifying') {
    return (
      <OnboardingShell
        step={14}
        totalSteps={14}
        onBack={handleBack}
        onClose={() => navigate('/dashboard')}
        hideContinueBtn
      >
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-4 border-4 border-[#EEE9E0] border-t-[#AA4528] rounded-full animate-spin" />
            <p className="text-[14px] text-[#8C8479] font-medium">{paymentState === 'verifying' ? 'Verifying payment...' : 'Loading...'}</p>
          </div>
        </div>
      </OnboardingShell>
    );
  }

  /* ── RENDER ── */
  return (
    <OnboardingShell
      step={14}
      totalSteps={14}
      onBack={handleBack}
      onClose={() => navigate('/dashboard')}
      continueLabel={getContinueLabel()}
      onContinue={handlePrimaryAction}
      continueDisabled={isContinueDisabled}
      continueLoading={loading || bookingInProgress}
    >
      <div className="mb-6">
        <h3 className="text-[13px] tracking-wide text-[#AA4528] uppercase mb-2 font-semibold">Verification</h3>
        <h1 className="text-[2.2rem] md:text-[2.6rem] font-medium leading-tight text-[#151513] mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
          Meet your fund manager
        </h1>
        <p className="text-[15px] text-[#8C8479] leading-relaxed">
          Book a 1-on-1 session for personalized investment strategies.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-md bg-red-50 border border-red-100 text-[14px] text-red-700">
          {error}
        </div>
      )}

      {/* ═══ NOT PAID STATE ═══ */}
      {paymentState === 'not_paid' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 py-4 border-b border-[#EEE9E0]">
            <div className="w-14 h-14 rounded-full bg-[#AA4528] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>person</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[16px] font-semibold text-[#151513] block">Manish Sainani</span>
              <span className="text-[14px] text-[#8C8479]">Hedge Fund Manager · 1-hour session</span>
            </div>
          </div>

          <div className="bg-[#F7F5F0] rounded-md p-5 border border-[#EEE9E0]">
            <p className="text-[15px] text-[#151513] leading-relaxed mb-3">
              A personal consultation with Manish typically costs <span className="font-bold">$3,000</span> per session.
            </p>
            <p className="text-[15px] text-[#151513] leading-relaxed">
              Because you've completed the full Hushh KYC onboarding, you've unlocked this as an <span className="font-semibold text-[#AA4528]">exclusive benefit</span> — available for just <span className="font-bold">$1</span>.
            </p>
          </div>

          <section className="space-y-0">
            <h3 className="text-[13px] tracking-wide text-[#8C8479] uppercase font-semibold mb-2">What you unlock</h3>

            <div className="py-4 border-b border-[#EEE9E0] flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FDF9F7] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#AA4528] text-lg">calendar_month</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[15px] font-semibold text-[#151513] block">1-hour private consultation</span>
                <span className="text-[13px] text-[#8C8479]">With Manish Sainani</span>
              </div>
              <span className="text-[13px] font-medium text-[#8C8479] line-through">$3,000</span>
            </div>

            <div className="py-4 border-b border-[#EEE9E0] flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FDF9F7] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#AA4528] text-lg">monetization_on</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[15px] font-semibold text-[#151513] block">300,000 Hushh Coins</span>
                <span className="text-[13px] text-[#8C8479]">Credited instantly</span>
              </div>
            </div>

            <div className="py-4 border-b border-[#EEE9E0] flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FDF9F7] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#AA4528] text-lg">verified</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[15px] font-semibold text-[#151513] block">KYC Verified Badge</span>
                <span className="text-[13px] text-[#8C8479]">Identity verification complete</span>
              </div>
            </div>
          </section>

          <div className="bg-[#F7F5F0] rounded-md p-5 border border-[#EEE9E0] text-center">
            <span className="text-[13px] tracking-wide text-[#8C8479] uppercase font-semibold">Your price today</span>
            <div className="flex items-baseline justify-center gap-3 mt-1">
              <span className="text-3xl font-bold text-[#151513] tracking-tight">$1</span>
              <span className="text-[15px] text-[#8C8479] line-through">$3,000</span>
            </div>
          </div>

          <div>
            <button onClick={() => setShowCoupon(!showCoupon)} className="w-full flex items-center justify-center gap-1.5 py-2 text-[14px] text-[#AA4528] font-semibold hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-lg">confirmation_number</span>
              {showCoupon ? 'Hide coupon code' : 'Have a coupon code?'}
            </button>

            {showCoupon && (
              <div className="mt-3">
                <div className="flex gap-2">
                  <input
                    type="text" value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null); }}
                    placeholder="Enter coupon code"
                    className="flex-1 h-[50px] px-4 rounded-md bg-white border border-[#EEE9E0] text-[16px] text-[#151513] placeholder-[#8C8479] focus:outline-none focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528] transition-all font-mono tracking-widest uppercase"
                    autoCapitalize="characters" autoComplete="off"
                  />
                  <button onClick={handleCouponRedeem} disabled={couponLoading || !couponCode.trim()}
                    className="h-[50px] px-6 rounded-md bg-[#151513] text-white text-[15px] font-semibold disabled:bg-gray-300 transition-all cursor-pointer">
                    {couponLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-[13px] text-red-600 mt-2 font-medium">{couponError}</p>}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-2">
            <span className="material-symbols-outlined text-[14px] text-[#8C8479]">lock</span>
            <span className="text-[12px] text-[#8C8479] font-medium">Secure payment powered by Stripe</span>
          </div>
        </div>
      )}

      {/* ═══ PAID STATE ═══ */}
      {paymentState === 'paid' && (
        <div className="space-y-6">
          <div className="py-4 border-b border-[#EEE9E0] flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#E5F3ED] border border-[#B3DEC9] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#15803D] text-2xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>check_circle</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[16px] font-semibold text-[#151513] block">You're verified!</span>
              <span className="text-[14px] text-[#8C8479]"><span className="font-bold text-[#151513]">{hushhCoins.toLocaleString()} Hushh Coins</span> credited</span>
            </div>
          </div>

          <div className="bg-[#F7F5F0] rounded-md p-4 border border-[#EEE9E0] text-center">
            <span className="text-[15px] font-semibold text-[#151513] block mb-1">Schedule your consultation</span>
            <span className="text-[14px] text-[#8C8479]">Book a 1-hour session with {calendarData?.ceo.name || 'Manish Sainani'}</span>
            {calendarData?.timezone && <p className="text-[13px] text-[#8C8479] mt-2">{calendarData.timezone}</p>}
          </div>

          {loadingSlots && (
            <div className="flex flex-col items-center py-10">
              <div className="w-10 h-10 border-4 border-[#EEE9E0] border-t-[#AA4528] rounded-full animate-spin mb-4" />
              <p className="text-[14px] text-[#8C8479]">Loading available times...</p>
            </div>
          )}

          {!loadingSlots && calendarData && (
            <div className="space-y-6">
              <div className="overflow-x-auto pb-2 -mx-2 px-2" style={{ scrollbarWidth: 'none' }}>
                <div className="flex gap-2">
                  {calendarData.availability.map((day) => {
                    const d = new Date(day.date);
                    const sel = selectedDate === day.date;
                    const has = day.slots.some(s => s.available);
                    return (
                      <button key={day.date} onClick={() => { setSelectedDate(day.date); setSelectedSlot(null); }} disabled={!has}
                        className={`shrink-0 flex flex-col items-center p-3 rounded-md min-w-[68px] border-[1.5px] transition-all cursor-pointer ${sel ? 'border-[#AA4528] bg-[#FDF9F7]' : has ? 'border-[#EEE9E0] bg-white hover:border-[#AA4528]' : 'border-transparent opacity-40 bg-gray-50'}`}>
                        <span className={`text-[11px] font-medium uppercase ${sel ? 'text-[#AA4528]' : 'text-[#8C8479]'}`}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className={`text-[20px] font-bold ${sel ? 'text-[#AA4528]' : 'text-[#151513]'}`}>{d.getDate()}</span>
                        <span className={`text-[11px] ${sel ? 'text-[#AA4528]' : 'text-[#8C8479]'}`}>{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div className="rounded-md border border-[#EEE9E0] p-4 bg-white">
                  <p className="text-[14px] font-semibold text-[#151513] mb-3">Available Times</p>
                  <div className="grid grid-cols-3 gap-3">
                    {calendarData.availability.find(d => d.date === selectedDate)?.slots.filter(s => s.available).map(slot => {
                      const t = new Date(slot.startTime);
                      const sel = selectedSlot?.startTime === slot.startTime;
                      return (
                        <button key={slot.startTime} onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-2 rounded-md text-[13px] font-semibold transition-all cursor-pointer ${sel ? 'bg-[#151513] text-white border-[1.5px] border-[#151513]' : 'bg-[#F7F5F0] text-[#151513] border-[1.5px] border-transparent hover:border-[#AA4528]'}`}>
                          {t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </button>
                      );
                    })}
                  </div>
                  {calendarData.availability.find(d => d.date === selectedDate)?.slots.filter(s => s.available).length === 0 && (
                    <p className="text-[14px] text-[#8C8479] text-center py-6">No slots available on this date.</p>
                  )}
                </div>
              )}

              {selectedSlot && (
                <div className="py-4 border-t border-b border-[#EEE9E0] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FDF9F7] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#AA4528] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#151513]">{new Date(selectedSlot.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <p className="text-[14px] text-[#AA4528] font-medium">{new Date(selectedSlot.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} – {new Date(selectedSlot.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                  </div>
                </div>
              )}

              {!selectedSlot && (
                <div className="flex justify-center pt-2">
                  <button onClick={handleContinue} className="text-[14px] font-semibold text-[#AA4528] hover:underline cursor-pointer">
                    I'll schedule this later
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ BOOKED STATE ═══ */}
      {paymentState === 'booked' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#E5F3ED] border border-[#B3DEC9] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#15803D] text-[40px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>task_alt</span>
          </div>
          <h1 className="text-[2rem] font-medium text-[#151513] mb-3" style={{ fontFamily: 'var(--font-display)' }}>All Set!</h1>
          <p className="text-[15px] text-[#8C8479] mb-1">Your consultation is scheduled with</p>
          <p className="text-[18px] font-semibold text-[#151513] mb-3">Manish Sainani</p>
          <div className="inline-flex items-center gap-2 bg-[#F7F5F0] px-3 py-1.5 rounded-full border border-[#EEE9E0] mt-2">
            <span className="text-[16px]">🪙</span>
            <span className="text-[13px] font-semibold text-[#151513]">{hushhCoins.toLocaleString()} Hushh Coins earned</span>
          </div>
        </div>
      )}
    </OnboardingShell>
  );
}

export default MeetCeoPage;
