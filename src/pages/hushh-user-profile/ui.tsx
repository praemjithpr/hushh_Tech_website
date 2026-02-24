/**
 * HushhUserProfile — All UI / Presentation
 * Pure presentation component importing hook from logic
 */
import React from 'react';
import { useHushhUserProfileLogic, FIELD_LABELS, VALUE_LABELS, SHADOW_FIELD_LABELS, formatPhoneContact } from './logic';
import type { FormState } from './logic';
import { User, TrendingUp, Shield, ChevronDown, Calendar, Brain, Target, Clock, Gauge, Droplets, Briefcase, Layers, Zap, Activity, Edit2, Share2, Link, Copy, Check, ExternalLink, Home, Search, Globe, Heart, Users, Newspaper } from 'lucide-react';
import { FaApple, FaWhatsapp, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiGooglepay } from 'react-icons/si';
import { HiMail } from 'react-icons/hi';
import HushhTechBackHeader from '../../components/hushh-tech-back-header/HushhTechBackHeader';
import HushhTechCta, { HushhTechCtaVariant } from '../../components/hushh-tech-cta/HushhTechCta';
import AIDetectedPreferences from '../../components/profile/AIDetectedPreferences';
import NWSScoreBadge from '../../components/profile/NWSScoreBadge';

const HushhUserProfilePage: React.FC = () => {
  const {
    form, userId, investorProfile, profileSlug,
    loading, hasOnboardingData, isApplePassLoading, isGooglePassLoading,
    editingField, setEditingField, shadowProfile, shadowLoading, nwsResult, nwsLoading,
    isFooterVisible, hasCopied, onCopy, profileUrl, navigate, toast,
    FIELD_OPTIONS, MULTI_SELECT_FIELDS, COUNTRIES,
    handleUpdateAIField, handleMultiSelectToggle, handleChange, handleSubmit,
    handleBack, handleSave, handleAppleWalletPass, handleGoogleWalletPass,
    handleShareWhatsApp, handleShareX, handleShareEmail, handleShareLinkedIn, handleOpenProfile,
    inputClassName, selectClassName, labelClassName, cardClassName,
    aiFieldCardTones, getConfidenceLabel, getConfidenceBadgeClass,
    shadowConfidenceLabel, shadowLifestyleTags, shadowBrandTags, shadowKnownForTags,
  } = useHushhUserProfileLogic();

  const shadowAssociates = shadowProfile?.associates || [];

  return (
    <div
      className="min-h-screen bg-white text-slate-900"
      style={{
        fontFamily:
          "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif",
      }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col bg-white pb-8 lg:border-x lg:border-slate-100 lg:shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
        <HushhTechBackHeader onBackClick={handleBack} />

        <form onSubmit={handleSubmit} className="flex-1 space-y-6 px-4 pb-44 pt-4 sm:px-6 lg:px-8 lg:pb-52">
          <section className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="mb-2 inline-block rounded-full border border-black/10 bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
                  premium member
                </span>
                <h2 className="mb-1 text-xl font-bold lowercase text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  welcome back, {form.name?.split(' ')[0] || 'investor'}
                </h2>
                <p className="text-sm leading-relaxed text-gray-500 lowercase">
                  complete your profile to unlock personalized investment insights.
                </p>
              </div>
              <div className="ml-3 shrink-0">
                <NWSScoreBadge result={nwsResult} loading={nwsLoading} size="sm" />
              </div>
            </div>
          </section>

          {/* Your Investor Profile - Share Section */}
          {profileSlug && (
            <section className="rounded-2xl bg-black p-5 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-white" />
                  <h3 className="text-lg font-semibold text-white">Your Investor Profile</h3>
                </div>
                <button
                  type="button"
                  onClick={handleOpenProfile}
                  className="rounded-lg bg-white/20 p-2 transition-colors hover:bg-white/30"
                  aria-label="Open profile"
                >
                  <ExternalLink className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="mb-4 text-sm text-white/90">
                Share this link to let others view your profile
              </p>

              {/* Profile URL Display */}
              <div className="mb-4 flex items-center gap-3 rounded-xl bg-white p-3">
                <Link className="w-5 h-5 flex-shrink-0 text-[#3A63B8]" />
                <span className="flex-1 truncate text-sm text-slate-700">
                  {profileUrl}
                </span>
                <button
                  type="button"
                  onClick={onCopy}
                  className="flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-slate-100"
                  aria-label="Copy link"
                >
                  {hasCopied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Share via Social */}
              <p className="mb-3 text-sm text-white/90">Share via</p>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
                  aria-label="Share on WhatsApp"
                >
                  <FaWhatsapp className="w-5 h-5 text-white" />
                </button>
                <button
                  type="button"
                  onClick={handleShareX}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
                  aria-label="Share on X"
                >
                  <FaXTwitter className="w-5 h-5 text-white" />
                </button>
                <button
                  type="button"
                  onClick={handleShareEmail}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
                  aria-label="Share via Email"
                >
                  <HiMail className="w-5 h-5 text-white" />
                </button>
                <button
                  type="button"
                  onClick={handleShareLinkedIn}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
                  aria-label="Share on LinkedIn"
                >
                  <FaLinkedin className="w-5 h-5 text-white" />
                </button>
                <button
                  type="button"
                  onClick={onCopy}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
                  aria-label="Copy link"
                >
                  {hasCopied ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Copy className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>

              {/* Wallet Pass Buttons */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleAppleWalletPass}
                  disabled={isApplePassLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-slate-900 transition-colors hover:bg-gray-50 disabled:opacity-70"
                >
                  <FaApple className="w-5 h-5" />
                  {isApplePassLoading ? "Generating..." : "Add to Apple Wallet"}
                </button>
                <button
                  type="button"
                  onClick={handleGoogleWalletPass}
                  disabled={isGooglePassLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 transition-colors hover:bg-gray-50 disabled:opacity-70"
                >
                  <SiGooglepay className="w-5 h-5" />
                  {isGooglePassLoading ? "Generating..." : "Add to Google Wallet"}
                </button>
              </div>
            </section>
          )}

          {/* Section Title */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold lowercase text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>your hushh profile</h2>
            <p className="text-sm text-gray-500 lowercase">
              review and update your details to keep your investor profile complete.
            </p>
            <div className="h-px w-full bg-slate-200" />
          </div>

          {/* Personal Information Section */}
          <section className={cardClassName}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#3A63B8]">
                <User className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClassName}>
                  Full Name <span className="text-[#3A63B8]">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Alex Smith"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>
                  Email <span className="text-[#3A63B8]">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="alex@example.com"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>
                  Age <span className="text-[#3A63B8]">*</span>
                </label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  placeholder="e.g. 34"
                  className={inputClassName}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className={labelClassName}>Code</label>
                  <div className="relative">
                    <select 
                      value={form.phoneCountryCode}
                      onChange={(e) => handleChange("phoneCountryCode", e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-900 outline-none transition-all focus:border-[#3A63B8] focus:ring-2 focus:ring-[#3A63B8]/20"
                    >
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+91">+91</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className={labelClassName}>Phone Number</label>
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    placeholder="Pre-filled from onboarding"
                    className={inputClassName}
                  />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Organisation (Optional)</label>
                <input
                  type="text"
                  value={form.organisation}
                  onChange={(e) => handleChange("organisation", e.target.value)}
                  placeholder="Company Name"
                  className={inputClassName}
                />
              </div>
            </div>
          </section>

          {/* Investment Profile Section */}
          <section className={cardClassName}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Investment Profile</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClassName}>Account Type</label>
                <div className="relative">
                  <select 
                    value={form.accountType}
                    onChange={(e) => handleChange("accountType", e.target.value)}
                    className={selectClassName}
                  >
                    <option value="" disabled>Select account type</option>
                    <option value="individual">Individual</option>
                    <option value="joint">Joint</option>
                    <option value="retirement">Retirement (IRA)</option>
                    <option value="trust">Trust</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Account Structure</label>
                <div className="relative">
                  <select 
                    value={form.accountStructure}
                    onChange={(e) => handleChange("accountStructure", e.target.value)}
                    className={selectClassName}
                  >
                    <option value="" disabled>Select structure</option>
                    <option value="discretionary">Discretionary</option>
                    <option value="non-discretionary">Non-Discretionary</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Selected Fund</label>
                <div className="relative">
                  <select 
                    value={form.selectedFund}
                    onChange={(e) => handleChange("selectedFund", e.target.value)}
                    className={selectClassName}
                  >
                    <option value="" disabled>Choose a fund</option>
                    <option value="hushh_fund_a">Hushh Growth Fund A</option>
                    <option value="hushh_fund_b">Hushh Balanced Fund B</option>
                    <option value="hushh_fund_c">Hushh Secure Yield C</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Initial Investment Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">$</span>
                  <input
                    type="number"
                    value={form.initialInvestmentAmount}
                    onChange={(e) => handleChange("initialInvestmentAmount", e.target.value)}
                    placeholder="5000000"
                    className={`${inputClassName} pl-8`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Referral Source</label>
                <div className="relative">
                  <select 
                    value={form.referralSource}
                    onChange={(e) => handleChange("referralSource", e.target.value)}
                    className={selectClassName}
                  >
                    <option value="" disabled>How did you hear about us?</option>
                    <option value="social_media">Social Media</option>
                    <option value="friend_family">Friend/Family</option>
                    <option value="financial_advisor">Financial Advisor</option>
                    <option value="news_article">News Article</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          {/* Legal & Residential Section */}
          <section className={cardClassName}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Legal &amp; Residential</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClassName}>Legal First Name</label>
                  <input
                    type="text"
                    value={form.legalFirstName}
                    onChange={(e) => handleChange("legalFirstName", e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName}>Legal Last Name</label>
                  <input
                    type="text"
                    value={form.legalLastName}
                    onChange={(e) => handleChange("legalLastName", e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                    className={inputClassName}
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Citizenship Country</label>
                <div className="relative">
                  <select 
                    value={form.citizenshipCountry}
                    onChange={(e) => handleChange("citizenshipCountry", e.target.value)}
                    className={selectClassName}
                  >
                    <option value="" disabled>Select country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Residence Country</label>
                <div className="relative">
                  <select 
                    value={form.residenceCountry}
                    onChange={(e) => handleChange("residenceCountry", e.target.value)}
                    className={selectClassName}
                  >
                    <option value="" disabled>Select country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Address Line 1</label>
                <input
                  type="text"
                  value={form.addressLine1}
                  onChange={(e) => handleChange("addressLine1", e.target.value)}
                  placeholder="Street address"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClassName}>State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName}>Zip Code</label>
                  <input
                    type="text"
                    value={form.zipCode}
                    onChange={(e) => handleChange("zipCode", e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* AI-Detected Preferences Section */}
          {userId && (
            <AIDetectedPreferences 
              userId={userId}
              onSave={(preferences) => {
                console.log('[Profile] AI preferences updated:', Object.keys(preferences).length);
                toast({
                  title: "Preferences Saved",
                  description: "Your preferences have been updated",
                  status: "success",
                  duration: 3000,
                });
              }}
            />
          )}

          {/* AI Generated Investor Profile Section */}
          {investorProfile && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <Brain className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">AI-Generated Investor Profile</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/investor-profile')}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#3A63B8] transition-colors hover:bg-blue-50"
                  aria-label="Edit profile"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              </div>

              <p className="mb-5 text-sm leading-snug text-slate-500">
                Based on your information, our AI has analyzed your investment preferences:
              </p>

              <div className="space-y-4">
                {Object.entries(investorProfile).map(([fieldName, fieldData]: [string, any], index) => {
                  const label = FIELD_LABELS[fieldName as keyof typeof FIELD_LABELS] || fieldName;
                  const valueText = Array.isArray(fieldData.value)
                    ? fieldData.value
                        .map((v: string) => VALUE_LABELS[v as keyof typeof VALUE_LABELS] || v)
                        .join(', ')
                    : VALUE_LABELS[fieldData.value as keyof typeof VALUE_LABELS] || fieldData.value || 'Not available';
                  const confidence = fieldData.confidence || 0;
                  const confidenceLabel = getConfidenceLabel(confidence);
                  const confidenceBadgeClass = getConfidenceBadgeClass(confidence);
                  const toneClass = aiFieldCardTones[index % aiFieldCardTones.length];
                  const isEditing = editingField === fieldName;
                  const isMultiSelect = MULTI_SELECT_FIELDS.includes(fieldName);
                  const fieldOptions = FIELD_OPTIONS[fieldName] || [];

                  const getIcon = () => {
                    switch (fieldName) {
                      case 'primary_goal':
                        return <Target className="w-5 h-5 text-[#3A63B8]" />;
                      case 'investment_horizon_years':
                        return <Clock className="w-5 h-5 text-[#3A63B8]" />;
                      case 'risk_tolerance':
                        return <Gauge className="w-5 h-5 text-[#3A63B8]" />;
                      case 'liquidity_need':
                        return <Droplets className="w-5 h-5 text-[#3A63B8]" />;
                      case 'experience_level':
                        return <Briefcase className="w-5 h-5 text-[#3A63B8]" />;
                      case 'asset_class_preference':
                        return <Layers className="w-5 h-5 text-[#3A63B8]" />;
                      case 'typical_ticket_size':
                        return <Zap className="w-5 h-5 text-[#3A63B8]" />;
                      case 'engagement_style':
                        return <Activity className="w-5 h-5 text-[#3A63B8]" />;
                      default:
                        return <TrendingUp className="w-5 h-5 text-[#3A63B8]" />;
                    }
                  };

                  const currentValues: string[] = Array.isArray(fieldData.value)
                    ? fieldData.value
                    : [fieldData.value];

                  return (
                    <div key={fieldName} className={`rounded-xl border p-4 shadow-sm ${toneClass}`}>
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-2.5">
                          {getIcon()}
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-medium ${confidenceBadgeClass}`}>
                            Confidence: {confidenceLabel}
                          </span>
                          {!isEditing && (
                            <button
                              type="button"
                              onClick={() => setEditingField(fieldName)}
                              className="rounded p-1 text-[#6B7280] transition-colors hover:bg-blue-50 hover:text-[#3A63B8]"
                              aria-label={`Edit ${label}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="mt-2">
                          {isMultiSelect ? (
                            <div className="space-y-2">
                              {fieldOptions.map((option) => (
                                <label key={option.value} className="flex cursor-pointer items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={currentValues.includes(option.value)}
                                    onChange={() => handleMultiSelectToggle(fieldName, option.value)}
                                    className="h-4 w-4 rounded border-gray-300 text-[#3A63B8] focus:ring-[#3A63B8]"
                                  />
                                  <span className="text-sm text-[#374151]">{option.label}</span>
                                </label>
                              ))}
                              <button
                                type="button"
                                onClick={() => setEditingField(null)}
                                className="mt-2 rounded-lg bg-[#3A63B8] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#2f539f]"
                              >
                                Done
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="relative">
                                <select
                                  value={fieldData.value}
                                  onChange={(e) => handleUpdateAIField(fieldName, e.target.value)}
                                  className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 pr-8 text-sm text-[#111827] outline-none focus:border-[#3A63B8] focus:ring-2 focus:ring-[#3A63B8]/20"
                                >
                                  {fieldOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingField(null)}
                                className="px-3 py-1.5 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#111827]"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <p className="mb-2 text-base font-bold text-slate-900">{valueText}</p>
                          {fieldData.rationale && (
                            <div className="rounded-lg border border-white/60 bg-white/65 p-3">
                              <p className="text-sm text-slate-600">
                                <span className="font-semibold text-[#3A63B8]">AI insight:</span> {fieldData.rationale}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Shadow Investigator Deep Profile Section */}
          {shadowProfile && (
            <section className="group relative overflow-hidden rounded-[2rem] border border-indigo-100/80 bg-white/70 p-6 shadow-[0_15px_40px_rgba(31,38,135,0.1)] backdrop-blur-xl">
              <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/20 to-blue-400/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />

              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/50 bg-white text-[#3A63B8] shadow-lg">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold leading-tight text-slate-900">Deep Profile Intelligence</h3>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#3A63B8]/90">
                      Powered by Shadow Investigator AI
                    </p>
                  </div>
                </div>
                <div className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                  {Math.round((shadowProfile.confidence || 0) * 100)}% Confidence
                </div>
              </div>

              <div className="relative z-10 mt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">Identity &amp; Demographics</h4>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      <Check className="h-3.5 w-3.5" />
                      {shadowConfidenceLabel}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="w-full max-w-[320px] rounded-2xl border border-indigo-100 bg-white/70 p-5 text-center shadow-sm">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600">
                        <User className="h-5 w-5" />
                      </div>
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-slate-500">Age</span>
                      <p className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-4xl font-bold text-transparent">
                        {shadowProfile.age || '--'}
                      </p>
                      {shadowProfile.ageContext && (
                        <div className="mt-3 border-t border-indigo-100 pt-3">
                          <p className="text-[12px] font-medium leading-relaxed text-slate-600">{shadowProfile.ageContext}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-white/60 p-3 text-center shadow-sm">
                        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Occupation</span>
                        <p className="text-[12px] font-bold text-slate-800">{shadowProfile.occupation || 'Not available'}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white/60 p-3 text-center shadow-sm">
                        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                          <Globe className="h-4 w-4" />
                        </div>
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Nationality</span>
                        <p className="text-[13px] font-bold text-slate-800">{shadowProfile.nationality || 'Not available'}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white/60 p-3 text-center shadow-sm">
                        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
                          <Heart className="h-4 w-4" />
                        </div>
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</span>
                        <p className="text-[13px] font-bold text-slate-800">{shadowProfile.maritalStatus || 'Not available'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {shadowProfile.netWorthScore > 0 && (
                  <div className="rounded-xl border-l-4 border-l-emerald-500 bg-white/65 p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wide text-slate-700">Wealth Analysis</h4>
                      <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                        Score: {shadowProfile.netWorthScore}/100
                      </span>
                    </div>
                    <div className="relative pt-1">
                      <div className="mb-2 flex justify-between px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span>Low</span>
                        <span>High</span>
                        <span className="text-emerald-600">Ultra High</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all"
                          style={{ width: `${Math.min(Math.max(shadowProfile.netWorthScore, 0), 100)}%` }}
                        />
                      </div>
                    </div>
                    {shadowProfile.netWorthContext && (
                      <p className="mt-3 rounded-lg bg-white/70 p-2 text-xs font-medium leading-relaxed text-slate-600">
                        <span className="font-bold text-emerald-700">Insight:</span> {shadowProfile.netWorthContext}
                      </p>
                    )}
                  </div>
                )}

                {shadowLifestyleTags.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="pl-1 text-xs font-bold uppercase tracking-widest text-slate-500">Lifestyle &amp; Preferences</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {shadowLifestyleTags.map((tag, idx) => (
                        <span
                          key={`${tag}-${idx}`}
                          className="rounded-2xl border border-white/60 bg-white/60 px-4 py-2 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-sm transition-transform hover:scale-[1.03]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {shadowBrandTags.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="pl-1 text-xs font-bold uppercase tracking-widest text-slate-500">Brands &amp; Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {shadowBrandTags.map((brand, idx) => (
                        <span
                          key={`${brand}-${idx}`}
                          className="rounded-xl border border-white/60 bg-white/60 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm"
                        >
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {shadowKnownForTags.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="pl-1 text-xs font-bold uppercase tracking-widest text-slate-500">Known For</h4>
                    <div className="flex flex-wrap gap-2">
                      {shadowKnownForTags.map((item, idx) => (
                        <span
                          key={`${item}-${idx}`}
                          className="rounded-xl border border-white/60 bg-white/60 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {shadowAssociates.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-indigo-500" />
                        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">Key Network</h4>
                      </div>
                      <span className="rounded-md bg-white/70 px-2 py-0.5 text-[10px] text-slate-500">High Value Connections</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        {shadowAssociates.slice(0, 3).map((associate, idx) => {
                          const initials = associate.name
                            .split(' ')
                            .filter(Boolean)
                            .map((part) => part.charAt(0))
                            .join('')
                            .slice(0, 3)
                            .toUpperCase();

                          return (
                            <div
                              key={`${associate.name}-${idx}`}
                              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-600 to-indigo-700 text-[10px] font-bold text-white shadow-md"
                            >
                              {initials || 'N/A'}
                            </div>
                          );
                        })}
                        {shadowProfile.associates.length > 3 && (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-500 shadow-sm">
                            +{shadowProfile.associates.length - 3}
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-bold leading-tight text-slate-800">
                        Strategic contacts and partners
                        <span className="block text-xs font-normal text-slate-500">Verified from public network signals</span>
                      </p>
                    </div>
                  </div>
                )}

                {shadowProfile.news && shadowProfile.news.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <Newspaper className="h-4 w-4 text-indigo-500" />
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-700">Recent News &amp; Media</span>
                    </div>
                    <div className="space-y-2">
                      {shadowProfile.news.slice(0, 3).map((news, idx) => (
                        <div key={idx} className="rounded-lg border border-slate-200 bg-white/70 p-3">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">{news.source}</span>
                            <span className="text-xs text-slate-400">{news.date}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800">{news.title}</p>
                          {news.summary && <p className="mt-1 text-xs text-slate-500">{news.summary}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {shadowProfile.socialMedia && shadowProfile.socialMedia.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-cyan-500" />
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-700">Social Profiles</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {shadowProfile.socialMedia.map((social, idx) => (
                        <a
                          key={idx}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
                        >
                          {social.platform}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Shadow Profile Loading State */}
          {shadowLoading && !shadowProfile && (
            <section className="relative overflow-hidden rounded-[2rem] border border-indigo-100/80 bg-white/70 p-6 shadow-[0_15px_40px_rgba(31,38,135,0.1)] backdrop-blur-xl">
              <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl" />
              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-3">
                  <div className="animate-spin text-[#3A63B8]">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Deep Profile Search</h3>
                    <p className="text-xs text-slate-500">Analyzing public data sources...</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 animate-pulse rounded bg-slate-200/80" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200/80" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200/80" />
                </div>
              </div>
            </section>
          )}
        </form>

        {/* Fixed Footer with HushhTechCta */}
        {!isFooterVisible && (
          <div 
            className="fixed bottom-0 left-1/2 z-20 w-full max-w-6xl -translate-x-1/2 border-t border-gray-200 bg-white px-4 pt-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:px-6"
            data-onboarding-footer
          >
            <HushhTechCta variant={HushhTechCtaVariant.BLACK} onClick={handleSave} disabled={loading}>
              {loading 
                ? "generating..." 
                : investorProfile 
                  ? "update profile" 
                  : hasOnboardingData 
                    ? "enhance with ai" 
                    : "generate investor profile"
              }
            </HushhTechCta>
            <p className="mt-2 text-center text-[11px] text-gray-400 lowercase">
              {investorProfile 
                ? "update your ai-generated investor profile."
                : hasOnboardingData
                  ? "generate an ai-powered profile from your data."
                  : "these details personalise your investor profile."
              }
            </p>
            <HushhTechCta variant={HushhTechCtaVariant.WHITE} onClick={() => navigate('/')}>
              go to home
            </HushhTechCta>
          </div>
        )}
      </div>
    </div>
  );
};


export default HushhUserProfilePage;