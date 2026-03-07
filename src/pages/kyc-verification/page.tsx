'use client'

import React from 'react'
import { Check, Shield, FileText, User, Info } from 'lucide-react'

const KYCVerificationPage = () => {
  const sections = [
    {
      num: 1,
      title: "Identity Verification",
      items: [
        "Government-issued photo identification (passport, driver's license, or national ID)",
        "Proof of address (utility bill, bank statement, or lease agreement dated within 3 months)",
        "Social Security Number or Tax Identification Number verification"
      ]
    },
    {
      num: 2,
      title: "Financial Background Verification",
      items: [
        "Bank statements from the last 3 months",
        "Tax returns for the previous 2 years",
        "Employment verification or business ownership documentation",
        "Source of funds documentation for investment capital"
      ]
    },
    {
      num: 3,
      title: "Investment Experience Documentation",
      items: [
        "Investment portfolio statements or history",
        "Accredited investor certification (if applicable)",
        "Professional qualifications in finance (if applicable)"
      ]
    },
    {
      num: 4,
      title: "Enhanced Due Diligence (High-Risk Categories)",
      items: [
        "Politically Exposed Persons (PEP) screening",
        "Sanctions list verification (OFAC, UN, EU, etc.)",
        "Additional documentation for high-risk jurisdictions"
      ]
    },
    {
      num: 5,
      title: "Corporate Entity Verification (Institutional)",
      items: [
        "Articles of incorporation or formation documents",
        "Board resolutions authorizing investment",
        "Beneficial ownership disclosure (25% threshold)",
        "Corporate structure chart"
      ]
    },
    {
      num: 6,
      title: "Ongoing Monitoring Requirements",
      items: [
        "Annual KYC refresh and document updates",
        "Transaction monitoring and suspicious activity reporting",
        "Periodic re-screening against sanctions lists"
      ]
    },
    {
      num: 7,
      title: "Prohibited Activities & Red Flags",
      items: [
        "Cash transactions above $10,000",
        "Funds from sanctioned countries or entities",
        "Structuring transactions to avoid reporting requirements",
        "Inconsistent or suspicious source of funds explanations"
      ]
    },
    {
      num: 8,
      title: "Documentation Timeline & Process",
      items: [
        "Initial KYC completion required before fund admission",
        "Standard processing time: 5-10 business days",
        "Enhanced due diligence may require additional 10-15 business days",
        "Incomplete documentation will delay the onboarding process"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[12px] font-bold tracking-[0.15em] text-[#AA4528] uppercase mb-4">Compliance Guide</p>
          <h1 className="text-[2.5rem] md:text-[3.5rem] font-medium leading-[1.1] text-[#151513] mb-6" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            AML & KYC <br />
            <span className="text-gray-400 italic">Documentation</span>
          </h1>
          <p className="text-[18px] text-[#8C8479] max-w-2xl mx-auto leading-relaxed font-body">
            Hushh Renaissance Alpha & Alpha Fund, LP maintains strict adherence to global financial regulations. Here's what we require for onboarding.
          </p>
        </div>

        {/* Requirements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {sections.map((section) => (
            <div key={section.num} className="bg-white border border-[#EEE9E0] p-8 rounded-sm hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-[#151513] text-white flex items-center justify-center rounded-sm font-bold text-[18px]">
                  {section.num}
                </div>
                <h3 className="text-[18px] font-bold text-[#151513] leading-snug">{section.title}</h3>
              </div>
              <ul className="space-y-4">
                {section.items.map((item, i) => (
                  <li key={i} className="flex gap-3 text-[15px] text-[#8C8479] leading-relaxed">
                    <Check className="w-4 h-4 text-[#AA4528] shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Info Cards */}
        <div className="space-y-6">
          <div className="bg-[#151513] text-white p-8 md:p-12 rounded-sm shadow-xl flex flex-col md:flex-row gap-8 items-center">
            <div className="w-16 h-16 bg-[#AA4528] rounded-full flex items-center justify-center shrink-0">
              <Info className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-[20px] font-bold mb-3">Important Notice</h3>
              <p className="text-[#C4BFB5] text-[16px] leading-relaxed">
                All documentation must be provided in English or accompanied by certified translations. Digital copies are acceptable for initial review, but original or certified copies may be required for final verification. Hushh Technology LLC reserves the right to request additional documentation as deemed necessary for compliance purposes.
              </p>
            </div>
          </div>

          <div className="bg-[#F7F5F0] border border-[#EEE9E0] p-8 md:p-12 rounded-sm flex flex-col md:flex-row gap-8 items-center">
            <div className="w-16 h-16 bg-white border border-[#EEE9E0] rounded-full flex items-center justify-center shrink-0">
              <Shield className="w-8 h-8 text-[#AA4528]" />
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-[#151513] mb-3">Data Protection & Privacy</h3>
              <p className="text-[#8C8479] text-[16px] leading-relaxed font-body">
                All personal and financial information provided during the KYC process is handled in strict accordance with applicable privacy laws and regulations. Your data is encrypted, secured, stored, and will only be shared with authorized third parties as required by law and/or compliance verification purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-16 pt-8 border-t border-[#EEE9E0]">
          <p className="text-[14px] text-[#8C8479] mb-4">Ready to start your investment journey?</p>
          <a href="/kyc-form" className="inline-flex items-center gap-2 text-[#AA4528] font-bold text-[16px] hover:underline">
            Complete KYC Form <User className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default KYCVerificationPage
