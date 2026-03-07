import React, { useCallback, useMemo, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { X } from "lucide-react";

interface ApplicationFormProps {
  jobTitle: string;
  jobLocation: string;
  onClose: () => void;
}

type ApplicationFormState = {
  firstName: string;
  lastName: string;
  email: string;
  collegeEmail: string;
  officialEmail: string;
  phone: string;
  resumeLink: string;
  college: string;
};

const ALLOWED_COLLEGES = [
  { value: 'LPU', label: 'Lovely Professional University (LPU)' },
  { value: 'MIT', label: 'Manipal Institute of Technology (MIT)' },
];

const initialState: ApplicationFormState = {
  firstName: '', lastName: '', email: '',
  collegeEmail: '', officialEmail: '', phone: '',
  resumeLink: '', college: '',
};

const ApplicationForm = ({ jobTitle, jobLocation, onClose }: ApplicationFormProps) => {
  const [formData, setFormData] = useState<ApplicationFormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const allowedCollegeValues = useMemo(
    () => new Set(ALLOWED_COLLEGES.map(({ value }) => value)), []
  );

  const updateFormField = useCallback(
    <K extends keyof ApplicationFormState>(field: K, value: ApplicationFormState[K]) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setError(null);
    }, []
  );

  const isValidUrl = (url: string) => {
    try { new URL(url); return true; } catch { return false; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const sanitized: ApplicationFormState = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        collegeEmail: formData.collegeEmail.trim(),
        officialEmail: 'not required',
        phone: formData.phone.trim(),
        resumeLink: formData.resumeLink.trim(),
        college: formData.college.trim(),
      };

      if (!sanitized.firstName || !sanitized.lastName || !sanitized.email || !sanitized.collegeEmail || !sanitized.phone || !sanitized.resumeLink || !sanitized.college) {
        throw new Error('Please complete all required fields');
      }

      if (!allowedCollegeValues.has(sanitized.college)) {
        throw new Error('Please select a valid college option');
      }
      if (!isValidUrl(sanitized.resumeLink)) {
        throw new Error('Please enter a valid resume link');
      }

      const selectedCollege =
        ALLOWED_COLLEGES.find(({ value }) => value === sanitized.college)?.label ?? sanitized.college;

      const applicationData = {
        ...sanitized,
        college: selectedCollege,
        collegeValue: sanitized.college,
        jobTitle,
        jobLocation,
        submittedAt: new Date().toISOString(),
      };

      const appsScriptUrl = (import.meta as any).env.VITE_APPS_SCRIPT_URL as string;
      if (!appsScriptUrl) throw new Error('Apps Script URL not configured');

      const resp = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(applicationData),
      });

      const text = await resp.text();
      let data: any = null; try { data = text ? JSON.parse(text) : null; } catch { }

      if (!resp.ok || !data?.success) {
        throw new Error(data?.error || text || 'Submission failed');
      }

      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-hidden rounded-[2rem] shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-black/5 flex justify-between items-center bg-[#faf9f6]">
          <div>
            <h2 className="text-2xl font-['Ivar_Headline',serif] font-medium">Apply for {jobTitle}</h2>
            <p className="text-sm text-[#666] mt-1">{jobLocation}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {success ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-['Ivar_Headline',serif] font-medium text-green-800">Application Submitted!</h3>
              <p className="text-[#666]">Thank you for your interest. We'll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-700 text-sm font-medium border-l-4 border-red-500">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#666]">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => updateFormField('firstName', e.target.value)}
                    className="w-full h-12 px-4 border border-black/10 focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528] bg-[#faf9f6] outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#666]">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => updateFormField('lastName', e.target.value)}
                    className="w-full h-12 px-4 border border-black/10 focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528] bg-[#faf9f6] outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[#666]">Personal Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateFormField('email', e.target.value)}
                  className="w-full h-12 px-4 border border-black/10 focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528] bg-[#faf9f6] outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[#666]">College Email</label>
                <input
                  type="email"
                  required
                  value={formData.collegeEmail}
                  onChange={(e) => updateFormField('collegeEmail', e.target.value)}
                  className="w-full h-12 px-4 border border-black/10 focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528] bg-[#faf9f6] outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[#666]">Phone Number</label>
                <div className="phone-container-custom">
                  <PhoneInput
                    country={'in'}
                    value={formData.phone}
                    onChange={(phone) => updateFormField('phone', phone)}
                    containerClass="!w-full !h-12 border border-black/10 focus-within:border-[#AA4528] focus-within:ring-1 focus-within:ring-[#AA4528] bg-[#faf9f6] transition-all"
                    inputClass="!w-full !h-full !border-none !bg-transparent !pl-12 !text-base"
                    buttonClass="!bg-transparent !border-none !h-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[#666]">College</label>
                <select
                  required
                  value={formData.college}
                  onChange={(e) => updateFormField('college', e.target.value)}
                  className="w-full h-12 px-4 border border-black/10 focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528] bg-[#faf9f6] outline-none transition-all"
                >
                  <option value="">Select your college</option>
                  {ALLOWED_COLLEGES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[#666]">Resume Link</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/your-resume"
                  value={formData.resumeLink}
                  onChange={(e) => updateFormField('resumeLink', e.target.value)}
                  className="w-full h-12 px-4 border border-black/10 focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528] bg-[#faf9f6] outline-none transition-all"
                />
                <p className="text-[10px] text-[#999] mt-1 font-medium">MUST BE A PUBLIC LINK TO YOUR RESUME</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#AA4528] text-white font-bold rounded-lg hover:bg-[#8e3a22] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4 shadow-lg active:scale-95"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  'Submit Application'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
