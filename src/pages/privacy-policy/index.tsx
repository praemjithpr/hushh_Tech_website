import React from "react";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#151515] font-['Source_Sans_Pro',sans-serif] pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20 space-y-6">
          <h1 className="text-5xl md:text-7xl font-['Ivar_Headline',serif] font-medium leading-tight">
            Website <span className="text-[#AA4528] italic">Privacy Policy</span>
          </h1>
          <p className="text-xl text-[#666] max-w-2xl mx-auto leading-relaxed">
            How we manage, use, and protect your personal information on our website.
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-16">
          <section className="space-y-6">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Introduction</h2>
            <p className="text-lg text-[#434343] leading-relaxed">
              This website privacy policy (the "Policy") describes how Hushh Technologies LLC and its affiliates ("Hushh") treat personal information collected on the HushhTech.com website (the "Website"). This Policy does not apply to information that Hushh may collect through other means.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Information That Hushh Collects</h2>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold uppercase tracking-widest text-[#AA4528]">Personal Information</h3>
                <p className="text-lg text-[#434343] leading-relaxed">
                  When you visit the Website, Hushh may collect certain personal information about you, such as your name, address, and email address, as well as any other personal information that you may provide, for example, through submission of forms or other documents.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold uppercase tracking-widest text-[#AA4528]">Nonpersonal Information</h3>
                <p className="text-lg text-[#434343] leading-relaxed">
                  Hushh will also collect the following nonpersonal information about your visit(s):
                </p>
                <ul className="space-y-3 pl-4 list-none text-lg text-[#434343]">
                  <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#AA4528] shrink-0 mt-2.5"></span>
                    The IP address and domain name used (the IP address is a numerical identifier assigned either to your internet service provider or directly to your computer).
                  </li>
                  <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#AA4528] shrink-0 mt-2.5"></span>
                    The type of browser and operating system you use.
                  </li>
                  <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#AA4528] shrink-0 mt-2.5"></span>
                    The date, time, and duration for which you visit the Website, the number of times you have visited the Website, and where you come from.
                  </li>
                </ul>
              </div>

              <p className="text-lg text-[#434343] leading-relaxed border-t border-black/5 pt-6">
                For purposes of collecting some of the above-referenced information, Hushh uses tracking tools on its Website, such as browser cookies and web beacons. A cookie and a web beacon are pieces of data stored on your device containing information about your visit.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">How Hushh Uses Information</h2>
            <p className="text-lg text-[#434343] mb-4">Hushh uses information it collects in the following ways:</p>
            <ul className="space-y-4 pl-4 list-none text-lg text-[#434343]">
              {['To respond to your requests or questions', 'To inform you about Hushh', 'To communicate with you about your relationship with us', 'To improve the Website and the services provided', 'For security purposes'].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[#AA4528] font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-lg text-[#434343] leading-relaxed pt-4">
              In addition, Hushh may use your information as otherwise permitted by law.
            </p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Sharing of Information</h2>
            <p>
              Hushh may share your information with its employees, agents, or third-party service providers who need to know such information for purposes of performing their jobs, including to respond to requests or questions that you may have. In addition, Hushh may share your information with third parties for purposes of complying with legal requirements or to respond to legal requests, such as in the case of a court order or subpoena or in connection with a regulatory investigation. Finally, Hushh might also share information that it collects with others when it is investigating potential fraud or for other reasons as permitted by law.
            </p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Protection of Information</h2>
            <p>
              Hushh is strongly committed to protecting any personal information collected through the Website against unauthorized access, use, or disclosure. Hushh will not sell or otherwise disclose any personal information collected from the Website, other than as described herein.
            </p>
            <p>
              In addition, Hushh has implemented procedures to safeguard the integrity of its information technology assets, including but not limited to authentication, monitoring, auditing, and encryption. These security procedures have been integrated into the design, implementation, and day-to-day operations of the Website as part of a continuing commitment to the security of electronic content as well as the electronic transmission of information. However, no method of safeguarding information is completely secure. While Hushh uses measures designed to protect personal information, it cannot guarantee that our safeguards will be effective or sufficient.
            </p>
            <p>
              For security purposes, Hushh employs software to monitor traffic to identify unauthorized attempts to upload or change information or otherwise damage the Website. Any information that an individual provides to Hushh by visiting the Website will be stored within the United States. If you live outside of the United States, you understand and agree that Hushh may store your information in the United States. The Website is subject to United States laws, which may or may not afford the same level of protection as those in your country.
            </p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Retention of Personal Information</h2>
            <p>
              Hushh retains personal information to the extent Hushh deems necessary to carry out the processing activities described above, including but not limited to compliance with applicable laws, regulations, rules, and requests of relevant law enforcement and/or other governmental agencies, and to the extent Hushh reasonably deems necessary to protect its and its partners' rights, property, or safety and the rights, property, and safety of its users and other third parties.
            </p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Cookies and Tracking Tools</h2>
            <p>
              As indicated above, Hushh collects nonpersonal information on its Website through the use of tracking tools, such as browser cookies. These cookies are necessary to allow you to browse the Website and access certain pages. Necessary cookies are required for the functionality of the Website so that it works properly. Hushh does not use these cookies to collect personal information about you.
            </p>
            <p>
              Your browser may give you the ability to control cookies. Certain browsers can be set to reject cookies. Options you select are browser and device specific. If you block or delete cookies, not all of the tracking that we have described in this Policy will stop.
            </p>
            <p>
              Hushh does not engage in automated decision-making for the processing of any personal information it collects.
            </p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Children and the Website</h2>
            <p>
              The Website is meant for adults. Hushh does not knowingly collect personally identifiable information from children under age 16. If you are a parent or legal guardian of a child under 16 who believes that child may have visited the Website, please contact us at the address below. By using the services provided by the Website, you represent that you are 16 years of age or older.
            </p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Business Transfer</h2>
            <p>
              Hushh may, in the future, sell or otherwise transfer some or all of its business, operations, or assets to a third party, whether by merger, acquisition, or otherwise. Personal information Hushh obtains from or about you through the Website may be disclosed to any potential or actual third-party acquirers and may be among those assets transferred.
            </p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Links to Other Sites</h2>
            <p>
              If a link to a third-party site is included on the Website and you click on it, you will be taken to a website Hushh does not control. This Policy does not apply to the privacy practices of that website. Read the privacy policy of other websites carefully. Hushh is not responsible for these third-party sites.
            </p>
          </section>

          <section className="space-y-6 text-lg text-[#434343] leading-relaxed">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Disclaimer and Policy Updates</h2>
            <p>
              This Policy should not be construed as giving business, legal, or other advice or warranting as failproof the security of information provided through the Website. Hushh will notify you of any material changes in this Policy by posting an updated copy on the Website.
            </p>
            <p>
              This Policy replaces all previous disclosures. We reserve the right, at any time, to modify, alter, and/or update this Policy. Any such modifications will be effective upon our posting of the revised Policy.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Contact Information</h2>
            <p className="text-lg text-[#434343]">
              For questions regarding this Policy, please contact <span className="font-bold text-[#AA4528]">ir@hushh.ai</span>.
            </p>
          </section>

          <div className="pt-20 text-center border-t border-black/5">
            <p className="text-sm font-bold uppercase tracking-widest text-[#666]">Last Updated: February 5, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
