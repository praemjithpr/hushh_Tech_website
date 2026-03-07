import React from "react";

const CareersPrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#151515] font-['Source_Sans_Pro',sans-serif] pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20 space-y-6">
          <h1 className="text-5xl md:text-7xl font-['Ivar_Headline',serif] font-medium leading-tight">
            Careers Site <span className="text-[#AA4528] italic">Privacy Policy</span>
          </h1>
          <p className="text-xl text-[#666] max-w-2xl mx-auto leading-relaxed">
            Responsible management, use, and protection of candidate information.
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-16">
          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Introduction</h2>
            <p>
              Hushh Technologies LLC and its affiliates (together, "Hushh") value your trust and are committed to the responsible management, use, and protection of personal information. This Careers Site Privacy Notice (the "Notice") applies to all information collected by Hushh from you during your use of our Careers site (the "Careers Site").
            </p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed text-right border-y border-black/5 py-8">
            <p className="font-bold uppercase tracking-widest text-[#666] text-sm">Last Updated</p>
            <p className="text-2xl font-['Ivar_Headline',serif] text-[#AA4528]">February 6, 2025</p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Your Consent</h2>
            <p>
              Submitting your personal information through the Careers Site is entirely voluntary. However, if you choose not to submit certain information, this may limit our ability to consider your candidacy. By agreeing to the terms of this Notice, you consent to the transfer of your personal information to Hushh and its service providers, which may be located in the United States or other jurisdictions.
            </p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Information You Provide</h2>
            <p>
              This Notice applies to any personal information you submit through the Careers Site as part of the job application or job search process, including:
            </p>
            <ul className="space-y-4 pl-4 list-none">
              <li className="flex gap-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#AA4528] shrink-0 mt-3"></span>
                Information provided in your resume, job application, or cover letter.
              </li>
              <li className="flex gap-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#AA4528] shrink-0 mt-3"></span>
                Any additional information shared during the recruitment process.
              </li>
            </ul>
            <p className="mt-4 italic text-gray-500">
              If you include personal information about a reference or any third party, you represent that you have obtained their consent before sharing their information with Hushh.
            </p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Use of Personal Information</h2>
            <p>Hushh operates the Careers Site to support its recruitment functions. Personal information collected through the Careers Site may be used for:</p>
            <ul className="space-y-4 pl-4 list-none">
              {[
                "Assessing your qualifications for employment.",
                "Managing the recruitment process.",
                "Planning for onboarding, management, and related activities.",
                "Any other related purposes as permitted by U.S. law."
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <span className="text-[#AA4528] font-bold">{i + 1}.</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Disclosure of Information</h2>
            <p>Your personal information may be accessed or reviewed by:</p>
            <ul className="space-y-3 pl-4 list-none">
              {["Human resources personnel.", "Technical services personnel.", "Hiring managers and their designees."].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-2 h-2 rounded-full border border-[#AA4528] shrink-0 mt-3"></span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Data Retention & Security</h2>
            <p>
              Hushh retains personal information as long as necessary to fulfill the purposes for which it was collected or for other legitimate business needs, including compliance with legal and regulatory obligations.
            </p>
            <p>
              Hushh has implemented reasonable measures to protect the personal information submitted through the Careers Site.
            </p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Notice of Changes</h2>
            <p>
              Hushh may update this Notice periodically to reflect changes in its information collection, use, or disclosure practices. Any changes will become effective upon posting the revised Notice on the Careers Site.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Contact Information</h2>
            <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm space-y-4 text-lg">
              <p>For additional questions about this Notice, please contact:</p>
              <p className="flex items-center gap-3">
                <span className="font-bold text-[#AA4528] w-20 uppercase text-xs tracking-widest">Email:</span>
                legalcompliance@hushhtech.com
              </p>
              <p className="flex items-center gap-3">
                <span className="font-bold text-[#AA4528] w-20 uppercase text-xs tracking-widest">Phone:</span>
                (888) 462-1726
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CareersPrivacyPolicy;
