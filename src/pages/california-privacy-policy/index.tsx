import React from "react";

const CaliforniaPrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#151515] font-['Source_Sans_Pro',sans-serif] pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20 space-y-6">
          <h1 className="text-5xl md:text-7xl font-['Ivar_Headline',serif] font-medium leading-tight">
            California <span className="text-[#AA4528] italic">Privacy Policy</span>
          </h1>
          <p className="text-xl text-[#666] max-w-2xl mx-auto leading-relaxed">
            Protecting the privacy of California residents in accordance with CCPA and CPRA.
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-16">
          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <p>
              Hushh Technologies LLC and its affiliates (collectively, "Hushh") are committed to protecting the privacy of California residents ("California Residents," "you," or "your") in accordance with the California Consumer Privacy Act ("CCPA") as amended by the California Privacy Rights Act ("CPRA"). This California Privacy Policy explains how Hushh collects, uses, and safeguards your personal information, and it describes your rights under the CCPA/CPRA.
            </p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed text-right border-y border-black/5 py-8">
            <p className="font-bold uppercase tracking-widest text-[#666] text-sm">Last Updated</p>
            <p className="text-2xl font-['Ivar_Headline',serif] text-[#AA4528]">February 6, 2025</p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">California Investors</h2>
            <p>
              This section applies to California Residents who are individual investors, beneficial owners, shareholders, executive officers, directors, trustees, general partners, managing members, or persons acting in a similar capacity in connection with investments in private investment funds sponsored by Hushh.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Notice at Collection of Personal Information</h2>
            <p className="text-lg text-[#434343] mb-4">Hushh collects the following categories of personal information:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: '1. Identifiers', content: 'Name, alias, postal address, email address, driver’s license number, and online identifiers.' },
                { title: '2. Financial Information', content: 'Education, name, signature, address, telephone number, and investment details.' },
                { title: '3. Protected Characteristics', content: 'Gender, age, citizenship status, national origin, and marital status.' },
                { title: '4. Internet Activity', content: 'Website interactions and use of online tools.' },
                { title: '5. Professional Information', content: 'Employment details, compensation, and title.' },
                { title: '6. Sensitive Personal Information', content: 'Social security numbers and passport numbers.' }
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                  <h4 className="font-bold text-[#AA4528] mb-2">{item.title}</h4>
                  <p className="text-[#666]">{item.content}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">How Hushh Uses Your Personal Information</h2>
            <p>Hushh uses personal information for business purposes, including:</p>
            <ul className="space-y-4 pl-4 list-none">
              {[
                "Delivering requested products, services, and information.",
                "Managing investor accounts and processing transactions.",
                "Compliance with legal and regulatory obligations.",
                "Detecting and preventing fraud or illegal activity."
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-2 h-2 rounded-full bg-[#AA4528] shrink-0 mt-3"></span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Retention of Personal Information</h2>
            <p>
              Hushh retains personal information for as long as required to fulfill its business purposes or comply with legal and regulatory requirements.
            </p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Your California Rights</h2>
            <p>California Residents have the right to:</p>
            <ul className="space-y-4 pl-4 list-none">
              {[
                "Be informed about collected personal information and its purposes.",
                "Request deletion of personal information, subject to exceptions.",
                "Request details about categories and sources of collected personal information.",
                "Correct inaccuracies in personal information.",
                "Not be discriminated against for exercising privacy rights."
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <span className="text-[#AA4528] font-bold">{i + 1}.</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">California Job Candidates</h2>
            <p>
              This section applies to California Residents who are job candidates, interns, or independent contractors applying to Hushh.
            </p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Notice at Collection for Applicants</h2>
            <p>Hushh collects the following categories of personal information for job applicants:</p>
            <ul className="space-y-3 pl-4 list-none">
              {[
                { label: "Identifiers", text: "Name, alias, postal address, email address, driver’s license number." },
                { label: "Professional Information", text: "Employment history, previous job titles." },
                { label: "Sensitive Personal Information", text: "Social security numbers, passport numbers." }
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-bold text-[#AA4528] shrink-0 mt-[2px]">• {item.label}:</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Contact Information</h2>
            <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm space-y-4 text-lg">
              <p>If you have any questions about this California Privacy Policy, please contact:</p>
              <p className="flex items-center gap-3">
                <span className="font-bold text-[#AA4528] w-20 uppercase text-xs tracking-widest">Email:</span>
                ir@hushhtech.com
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

export default CaliforniaPrivacyPolicy;
