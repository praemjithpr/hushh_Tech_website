import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from "@emailjs/browser";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MapPin, Phone, Clock, Send } from "lucide-react";

const reasonOptions = [
  "Infrastructure Consultation",
  "Investment Information",
  "Technical Support",
  "Other"
];

emailjs.init("_TMzDc8Bfy6riSfzq");

export default function Contact() {
  const [num1, setNum1] = useState<number>(0);
  const [num2, setNum2] = useState<number>(0);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    reason: '',
    message: '',
    captcha: ''
  });

  const [captchaError, setCaptchaError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const generateRandomNumbers = () => {
    const randomNum1 = Math.floor(Math.random() * 100);
    const randomNum2 = Math.floor(Math.random() * 100);
    setNum1(randomNum1);
    setNum2(randomNum2);
  };

  useEffect(() => {
    generateRandomNumbers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userCaptcha = parseInt(formData.captcha, 10);
    const correctAnswer = num1 + num2;

    if (userCaptcha !== correctAnswer) {
      setCaptchaError('Incorrect sum. Please try again.');
      setLoading(false);
      return;
    } else {
      setCaptchaError('');
    }

    const serviceId = "service_tsuapx9";
    const templateId = "template_50ujflf";
    const userId = "DtG13YmoZDccI-GgA";

    const templateParams = {
      name: formData.name,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
      reason: formData.reason,
      message: formData.message,
    };

    emailjs.send(serviceId, templateId, templateParams, userId)
      .then((result) => {
        toast.success('Email sent successfully!');
        navigate('/');
      }, (error) => {
        toast.error('Failed to send email. Please try again later');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#151515] font-['Source_Sans_Pro',sans-serif] pt-32 pb-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-5xl md:text-7xl font-['Ivar_Headline',serif] font-medium leading-tight">
            Get in <span className="text-[#AA4528] italic">Touch</span>
          </h1>
          <p className="text-xl text-[#666] max-w-2xl mx-auto leading-relaxed">
            Ready to transform your investment strategy? We'd love to hear from you.
          </p>
          <p className="text-sm text-[#888]">
            For career-related inquiries, please visit our{' '}
            <a href="/career" className="text-[#AA4528] font-bold hover:underline">Jobs page</a>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Contact Information Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-10 rounded-[2rem] border border-black/5 shadow-sm space-y-10">
              <h2 className="text-2xl font-['Ivar_Headline',serif] font-medium">Contact Information</h2>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-[#AA4528]/10 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#AA4528]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-widest text-[#666] mb-1">Address</h4>
                    <p className="text-lg">1021 5th St W<br />Kirkland, WA 98033</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-[#AA4528]/10 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[#AA4528]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-widest text-[#666] mb-1">Phone</h4>
                    <p className="text-lg">(888) 462-1726</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-[#AA4528]/10 rounded-full flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[#AA4528]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-widest text-[#666] mb-1">Office Hours</h4>
                    <p className="text-lg">Monday – Friday<br />9:00 AM – 6:00 PM PST</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#151515] p-10 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                <h3 className="text-3xl font-['Ivar_Headline',serif] font-medium">Ready to Invest?</h3>
                <p className="opacity-70 leading-relaxed">
                  Join forward-thinking investors who are already benefiting from our
                  AI-driven approach to wealth creation.
                </p>
                <button
                  onClick={() => navigate('/about/leadership')}
                  className="bg-[#AA4528] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#C15438] transition-all"
                >
                  Learn Strategy
                </button>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-[#AA4528] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white p-10 md:p-16 rounded-[2.5rem] border border-black/5 shadow-sm">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium mb-10">Send us a Message</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#666]">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-14 px-6 border border-black/10 focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528] bg-[#faf9f6] outline-none transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#666]">Company (Optional)</label>
                <input
                  type="text"
                  name="company"
                  placeholder="Enter your company name"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full h-14 px-6 border border-black/10 focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528] bg-[#faf9f6] outline-none transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#666]">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-14 px-6 border border-black/10 focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528] bg-[#faf9f6] outline-none transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#666]">Phone Number (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full h-14 px-6 border border-black/10 focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528] bg-[#faf9f6] outline-none transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#666]">Reason for Contact</label>
                <select
                  name="reason"
                  required
                  value={formData.reason}
                  onChange={handleChange}
                  className="w-full h-14 px-6 border border-black/10 focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528] bg-[#faf9f6] outline-none transition-all"
                >
                  <option value="">Select a reason</option>
                  {reasonOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#666]">Message</label>
                <textarea
                  name="message"
                  required
                  placeholder="Tell us how we can help you..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-6 border border-black/10 focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528] bg-[#faf9f6] outline-none transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#666]">What is the sum of {num1} and {num2}?</label>
                <input
                  type="number"
                  name="captcha"
                  required
                  placeholder="Enter the answer"
                  value={formData.captcha}
                  onChange={handleChange}
                  className="w-full h-14 px-6 border border-black/10 focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528] bg-[#faf9f6] outline-none transition-all placeholder:text-gray-300"
                />
                {captchaError && <p className="text-red-600 text-xs font-bold mt-1 uppercase tracking-tight">{captchaError}</p>}
              </div>

              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-[#AA4528] text-white font-bold rounded-xl hover:bg-[#8e3a22] transition-all shadow-lg flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}