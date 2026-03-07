import React from "react";

const EUUKPrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#151515] font-['Source_Sans_Pro',sans-serif] pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20 space-y-6">
          <h1 className="text-5xl md:text-7xl font-['Ivar_Headline',serif] font-medium leading-tight">
            EU and UK <span className="text-[#AA4528] italic">Privacy Policy</span>
          </h1>
          <p className="text-xl text-[#666] max-w-2xl mx-auto leading-relaxed text-balance">
            Notice for Job Candidates regarding the confidentiality and security of personal information.
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-16">
          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <p>
              Hushh Technologies LLC and its affiliates (collectively, "Hushh") are committed to protecting your privacy and maintaining the confidentiality and security of the personal information you provide in connection with your application for a position at Hushh ("Your Personal Information"). Any personal information processed by Hushh is controlled by Hushh, and Hushh acts as the data controller.
            </p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed text-right border-y border-black/5 py-8">
            <p className="font-bold uppercase tracking-widest text-[#666] text-sm">Last Updated</p>
            <p className="text-2xl font-['Ivar_Headline',serif] text-[#AA4528]">February 5, 2025</p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Collection of Information</h2>
            <p>Hushh collects Your Personal Information from the following sources:</p>
            <ul className="space-y-4 pl-4 list-none">
              {[
                "The careers website hosted at www.hushhTech.com (the “Careers Site”)",
                "Application forms, resumes, or CVs submitted to Hushh",
                "Other interactions with Hushh, such as email or telephone communications"
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#AA4528] shrink-0 mt-3"></span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Your Personal Information May Include:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pl-4">
              {[
                "Identification data (name, address, etc.)",
                "Social insurance or national ID number",
                "Nationality and language proficiencies",
                "Educational / Professional qualifications",
                "Work experience and employment history",
                "Contact info of spouse/partner/dependents"
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-[#AA4528] font-bold">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Reasons for Collecting</h2>
            <p>Hushh collects and processes Your Personal Information for:</p>
            <ul className="space-y-4 pl-4 list-none">
              {[
                "Compliance with legal obligations, including employment laws.",
                "Performance of contractual obligations as a prospective employer.",
                "Legitimate business interests, including recruitment and administration purposes."
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-2 h-2 rounded-full border border-[#AA4528] shrink-0 mt-3"></span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Recipients of Information</h2>
            <p>Hushh may share Your Personal Information with:</p>
            <ul className="space-y-4 pl-4 list-none">
              {[
                "Affiliates and agents assisting with recruitment.",
                "Third-party service providers, such as background check providers.",
                "Law enforcement agencies, courts, or regulators for compliance."
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#AA4528] shrink-0 mt-3"></span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Storage & Your Rights</h2>
            <p>Hushh stores Your Personal Information in the United States and ensures appropriate safeguards are in place.</p>
            <p className="mt-4 font-bold uppercase tracking-widest text-[#AA4528] text-sm">Under applicable law, you have the right to:</p>
            <ul className="space-y-4 pl-4 list-none mt-4">
              {[
                "Be informed about data collection and usage.",
                "Access, correct, or erase Your Personal Information.",
                "Restrict or object to processing.",
                "Withdraw consent.",
                "Lodge complaints with data protection authorities."
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[#AA4528] font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Further Information</h2>
            <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm space-y-6 text-lg">
              <p>To exercise your rights, contact DataRep at <span className="font-bold">datarequest@datarep.com</span>, quoting “Hushh Technologies LLC.”</p>
              <div className="pt-6 border-t border-black/5">
                <p>For questions regarding this policy, contact:</p>
                <p className="font-bold text-[#AA4528] mt-2">legalcompliance@hushhTech.com</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EUUKPrivacyPolicy;
