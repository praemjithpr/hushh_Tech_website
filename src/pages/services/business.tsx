import React, { useState } from "react";
import { ChevronDown, Lock, Users, ShieldCheck, Play } from "lucide-react";
import MultiUserIcon from "../../svg/multiUser.svg";
import LockIcon from "../../svg/lockIcon.svg";

const Business = () => {
  const [openApiAccordion, setOpenApiAccordion] = useState<number | null>(0);
  const [openVibeAccordion, setOpenVibeAccordion] = useState<number | null>(null);

  const apiFeatures = [
    {
      title: "Consent-driven Data",
      icon: <Lock className="w-12 h-12 text-[#AA4528]" />,
      description: "Integrate Hushh APIs into your systems to access valuable, zero-party customer data with user consent, adhering to GDPR standards."
    },
    {
      title: "Personalized Experiences",
      icon: <Users className="w-12 h-12 text-[#AA4528]" />,
      description: "Leverage user preferences, purchase history, and behavior to deliver targeted marketing, personalized recommendations, and bespoke services."
    },
    {
      title: "Trust & Transparency",
      icon: <ShieldCheck className="w-12 h-12 text-[#AA4528]" />,
      description: "Empower your users to control their data and decide what they share, fostering a relationship built on transparency and trust."
    }
  ];

  const businessTypes = [
    {
      title: "Forward-thinking Businesses",
      description: "Across industries like fashion, retail, wellness, travel, electronics, luxury, and more, Hushh APIs empower you to personalize the customer journey."
    },
    {
      title: "Application Developers",
      description: "Integrate Hushh's powerful consent-driven data insights into your apps to create hyper-personalized user experiences that drive engagement."
    },
    {
      title: "CRM & Database Managers",
      description: "Enrich your customer profiles with valuable, consented data to power personalized marketing campaigns and data-driven decision-making."
    }
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#151515] font-['Source_Sans_Pro',sans-serif]">
      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 max-w-7xl mx-auto text-center">
        <h1 className="text-[#AA4528] uppercase tracking-widest text-sm font-semibold mb-6">
          For Businesses
        </h1>
        <h2 className="text-5xl md:text-7xl font-['Ivar_Headline',serif] font-medium leading-tight mb-8">
          Enable Customers. Enrich Data.<br />Enhance Business.
        </h2>
        <p className="text-2xl font-semibold text-[#434343] mb-8 max-w-4xl mx-auto">
          Revolutionize customer insights, Personalize commerce,<br />
          Build deeper connections with your customers’ consent and control.
        </p>
        <p className="text-lg text-[#666] max-w-3xl mx-auto leading-relaxed">
          Hushh's AI-first platform bridges the gap by empowering customers to
          control their data while brands unlock new possibilities for
          engagement, trust, and growth.
        </p>
      </section>

      {/* Ecosystem Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center gap-16">
          <div className="w-full md:w-1/2">
            <img
              src="/images/media.png"
              alt="Hushh Ecosystem"
              className="w-full h-auto rounded-[2rem] shadow-2xl"
            />
          </div>
          <div className="w-full md:w-1/2 text-left space-y-8">
            <h2 className="text-4xl font-['Ivar_Headline',serif] font-medium">Hushh Ecosystem</h2>
            <div className="space-y-6 text-lg text-[#666] leading-relaxed">
              <p>Hushh offers a suite of products designed to revolutionize how businesses interact with their customers in the age of personalized experiences.</p>
              <p>Forget generic marketing and one-size-fits-all approaches.</p>
              <p className="text-[#151515] font-medium italic">
                Hushh empowers you to create <span className="text-[#AA4528]">meaningful connections</span> built on <span className="text-[#AA4528]">trust</span> and <span className="text-[#AA4528]">tailored</span> interactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Developer APIs Section */}
      <section className="py-24 px-4 bg-[#f5f5f7]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-['Ivar_Headline',serif] font-medium mb-6">Hushh Developer APIs</h2>
          <p className="text-xl text-[#434343] mb-16 max-w-3xl mx-auto leading-relaxed">
            Unlock the power of <span className="font-bold">consent-driven data</span> to deliver personalized experiences by
            integrating our APIs seamlessly with your CRM and applications.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {apiFeatures.map((feature, idx) => (
              <div
                key={idx}
                className={`p-10 rounded-[2rem] text-left transition-all cursor-pointer ${openApiAccordion === idx ? 'bg-white shadow-xl translate-y-[-8px]' : 'bg-white/50 hover:bg-white'
                  }`}
                onClick={() => setOpenApiAccordion(idx)}
              >
                <div className="mb-8">{feature.icon}</div>
                <h4 className="text-2xl font-['Ivar_Headline',serif] font-medium mb-4">{feature.title}</h4>
                <p className="text-[#666] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="max-w-5xl mx-auto space-y-10">
            <h3 className="text-3xl font-['Ivar_Headline',serif] font-medium">Glimpse into Developer APIs</h3>
            <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
              <iframe
                className="w-full h-full border-0"
                src="https://www.youtube.com/embed/mXymL7IZBPg?si=ipvIGuTEY7eQlvJC"
                title="Hushh Developer APIs"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-24 px-4 bg-[#151515] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:row items-center gap-16">
            <h2 className="text-4xl font-['Ivar_Headline',serif] font-medium lg:w-1/3 text-left">
              Are you one of the following?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:w-2/3">
              {businessTypes.map((type, idx) => (
                <div key={idx} className="bg-[#252525] p-8 rounded-2xl border border-white/10 hover:border-[#AA4528] transition-colors group">
                  <h4 className="text-xl font-bold mb-4 group-hover:text-[#AA4528] transition-colors">{type.title}</h4>
                  <p className="text-sm opacity-70 leading-relaxed">{type.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 text-center">
            <button
              onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSeIQF0GhLxmwEHrmOpMRQVlxuJBtQYUP2oT_GQt16h8oyw2Dg/viewform", "_blank")}
              className="bg-[#AA4528] px-12 py-5 rounded-xl font-bold text-lg hover:bg-[#C15438] hover:scale-105 transition-all inline-block"
            >
              Want to know more about Hushh Companion?
            </button>
          </div>
        </div>
      </section>

      {/* Vibe Search API Section */}
      <section className="py-24 px-4 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-['Ivar_Headline',serif] font-medium">VIBE Search API</h2>
          <p className="text-xl text-[#434343] max-w-4xl mx-auto leading-relaxed">
            Delivers <span className="font-bold">highly personalized search results</span> using semantic analysis, image search,
            and implicit behavior understanding. Boosts <span className="font-bold text-[#AA4528]">customer satisfaction, engagement, and revenue.</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
            {[
              {
                title: "Semantic Understanding",
                description: "Go beyond keywords. Understand the intent and 'vibe' of user queries for more accurate results."
              },
              {
                title: "Visual Search",
                description: "Integrate powerful visual recognition to let users search using images and styles they admire."
              },
              {
                title: "Behavioral Insights",
                description: "Analyze how users interact with products to surface precisely what they are looking for."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[2rem] text-left shadow-md border border-black/5">
                <h4 className="text-2xl font-['Ivar_Headline',serif] font-medium mb-4 text-[#AA4528]">{item.title}</h4>
                <p className="text-[#666] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Business;
