import React, { useState } from "react";
import { ChevronDown, ChevronRight, Play } from "lucide-react";
import Companion from "../../svg/companion.svg";

const Consumers = () => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const walletFeatures = [
    {
      title: "Unify your Scattered Data",
      description: "Collect your data from phones, apps, brands, and data giants creating a comprehensive digital profile."
    },
    {
      title: "Curate your Identity",
      description: "Manage and refine your digital identity to reflect your true self."
    },
    {
      title: "Unlock Personalized Experiences",
      description: "Share your data to receive tailored experiences and offers."
    },
    {
      title: "Get Rewarded",
      description: "Earn rewards for sharing your data with trusted partners."
    },
    {
      title: "Transparency and Control",
      description: "Maintain full control over who accesses your data and how it is used."
    }
  ];

  const companionFeatures = [
    {
      title: "Discover Your Digital Self",
      content: [
        "Track Your Browsing: Gain insights into your online behavior and interests.",
        "Evolving Interests: Watch how your preferences change over time.",
        "Data Control: Choose exactly what information you want to collect."
      ]
    },
    {
      title: "Shop Smarter, Not Harder",
      content: [
        "Cross-Brand Shopping Cart: Compare products across different websites with ease.",
        "Curated Collections: Save and organize products you love.",
        "Link Library: Keep all your favorite content just a click away."
      ]
    },
    {
      title: "Your Data, Your Way",
      content: [
        "Personal Insights: Understand your digital footprint like never before.",
        "Data Portability: Easily export your information for personal use.",
        "Future-Ready: Coming soon - Hushh Wallet for secure, consensual data monetization."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#151515] font-['Source_Sans_Pro',sans-serif]">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 max-w-7xl mx-auto text-center">
        <h1 className="text-[#AA4528] uppercase tracking-widest text-sm font-semibold mb-6">
          For Consumers
        </h1>
        <h2 className="text-5xl md:text-7xl font-['Ivar_Headline',serif] font-medium leading-tight mb-8">
          Own Your Data,<br />Unlock Its Value
        </h2>
        <p className="text-2xl font-semibold text-[#434343] mb-6">
          Your Data, Your Rules. Get Rewarded for What You Share.
        </p>
        <p className="text-lg text-[#666] max-w-3xl mx-auto leading-relaxed">
          Take control of your digital footprint and unlock personalized
          experiences and exclusive rewards with Hushh's suite of products.
        </p>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-[#151515] rounded-[2rem] overflow-hidden group">
            <img src="/gif/typing.gif" alt="Hushh Companion" className="w-full h-56 object-cover" />
            <div className="p-8 text-white">
              <span className="text-xs uppercase tracking-widest block mb-2 opacity-70">Hushh Companion</span>
              <h3 className="text-2xl font-['Ivar_Headline',serif] font-medium">Track Your Digital<br />Footprint</h3>
            </div>
          </div>

          <div className="bg-[#151515] rounded-[2rem] overflow-hidden group">
            <img src="/images/fendiCards.png" alt="Hushh Wallet" className="w-full h-80 object-cover" />
            <div className="p-8 text-white">
              <span className="text-xs uppercase tracking-widest block mb-2 opacity-70">Hushh Wallet</span>
              <h3 className="text-2xl font-['Ivar_Headline',serif] font-medium">Your Personal Data,<br />Your Powerhouse</h3>
            </div>
          </div>

          <div className="bg-[#151515] rounded-[2rem] overflow-hidden group">
            <img src="/images/dressImage.png" alt="Vibe Search" className="w-full h-56 object-cover" />
            <div className="p-8 text-white">
              <span className="text-xs uppercase tracking-widest block mb-2 opacity-70">Vibe Search</span>
              <h3 className="text-2xl font-['Ivar_Headline',serif] font-medium">Stop Scrolling,<br />Start Discovering!</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Video Intro Section */}
      <section className="bg-[#D9D2E9] py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center gap-12">
          <div className="w-full md:w-1/2 aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
            <iframe
              src="https://www.youtube.com/embed/igf1PYq1WOM"
              title="Hushh User Journey"
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
            ></iframe>
          </div>
          <div className="w-full md:w-1/2 text-left space-y-6">
            <h2 className="text-4xl font-['Ivar_Headline',serif] font-medium text-[#434343]">Imagine This</h2>
            <p className="text-lg text-[#666] leading-relaxed">
              You walk into your favorite store, and the sales agent understands
              your style, size, and even your vibe. They offer you personalized
              recommendations and exclusive discounts, all because you've chosen
              to share relevant information with them.
            </p>
            <p className="text-xl font-bold text-[#434343]">
              This is the power of Hushh Wallet.
            </p>
          </div>
        </div>
      </section>

      {/* Hushh Wallet Detail */}
      <section className="py-24 px-4 text-center">
        <h2 className="text-4xl font-['Ivar_Headline',serif] font-medium mb-4">Hushh Wallet</h2>
        <p className="text-xl font-medium text-[#434343] mb-12 max-w-3xl mx-auto">
          Take control of your digital identity and unlock a world of
          personalized experiences and rewards.
        </p>
        <img src="/images/mobile.png" alt="Hushh Wallet App" className="mx-auto max-w-full h-auto mb-12" />

        <div className="space-y-4 text-xl text-[#434343] mb-16">
          <p>We live in a <span className="font-semibold italic">data-driven world.</span></p>
          <p>Every online interaction, every purchase, every click leaves a digital footprint.</p>
          <p>Hushh Wallet empowers you to <span className="font-semibold text-[#AA4528]">take control</span> of that data and <span className="font-semibold text-[#AA4528]">use it to your advantage.</span></p>
        </div>

        {/* Wallet Accordion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-7xl mx-auto px-4">
          {walletFeatures.map((feature, index) => (
            <div
              key={index}
              className={`p-8 rounded-2xl text-left transition-all cursor-pointer ${openAccordion === index ? 'bg-white shadow-xl ring-2 ring-[#AA4528]/10' : 'bg-[#e5e7eb] hover:bg-white/50'
                }`}
              onClick={() => setOpenAccordion(openAccordion === index ? null : index)}
            >
              <h4 className="text-xl font-['Ivar_Headline',serif] font-medium mb-4">{feature.title}</h4>
              <div className={`overflow-hidden transition-all duration-300 ${openAccordion === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-sm text-[#666] leading-relaxed">{feature.description}</p>
              </div>
              <ChevronDown className={`mt-4 w-6 h-6 text-[#AA4528] transition-transform ${openAccordion === index ? 'rotate-180' : ''}`} />
            </div>
          ))}
        </div>
      </section>

      {/* Glimpse Section */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center gap-16">
          <h2 className="text-4xl font-['Ivar_Headline',serif] font-medium w-full md:w-1/3 text-left">Glimpse into Hushh Wallet</h2>
          <div className="w-full md:w-2/3 aspect-video bg-black rounded-2xl overflow-hidden shadow-xl">
            <iframe
              className="w-full h-full border-0"
              src="https://www.youtube.com/embed/WYppPoOSi7k?si=yMlu5PUzuZhueJZm"
              title="YouTube video player"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:row items-center gap-12 mt-20 p-12 bg-[#faf9f6] rounded-[2.5rem]">
          <div className="flex-1 text-left">
            <p className="text-2xl font-bold text-[#434343] leading-snug mb-8">
              Hushh Wallet is more than just an app; it's a movement.<br />
              Download and unlock the true power of your personal data.
            </p>
            <button
              onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSeIQF0GhLxmwEHrmOpMRQVlxuJBtQYUP2oT_GQt16h8oyw2Dg/viewform", "_blank")}
              className="bg-[#AA4528] text-white px-10 py-4 rounded-lg font-bold hover:bg-[#8e3a22] transition-colors"
            >
              Want to have Wallet capabilities in your brand?
            </button>
          </div>
          <img src="/images/QRWallet.png" alt="Hushh Wallet QR Code" className="w-64 h-64 shadow-lg rounded-2xl" />
        </div>
      </section>

      {/* Hushh Companion Section */}
      <section className="py-24 px-4 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-['Ivar_Headline',serif] font-medium mb-6">Hushh Companion</h2>
          <p className="text-xl font-medium text-[#434343] mb-16 max-w-4xl mx-auto leading-relaxed">
            More than just a Chrome extension – it's your personal companion for a
            smarter, more organized digital life.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {companionFeatures.map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[2rem] text-left shadow-md hover:shadow-xl transition-shadow group">
                <h4 className="text-2xl font-['Ivar_Headline',serif] font-medium mb-6 group-hover:text-[#AA4528] transition-colors">{f.title}</h4>
                <ul className="space-y-4">
                  {f.content.map((item, j) => (
                    <li key={j} className="flex gap-3 text-[#666] leading-relaxed">
                      <ChevronRight className="w-5 h-5 text-[#AA4528] shrink-0 mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-20 flex flex-col md:row items-center justify-center gap-12">
            <div className="w-full md:w-2/3 aspect-video bg-black rounded-2xl overflow-hidden shadow-xl">
              <iframe
                className="w-full h-full border-0"
                src="https://www.youtube.com/embed/371l4LVRcwo?si=RcUlPxi17GAUWJLS"
                title="Hushh Browser Companion"
                allowFullScreen
              ></iframe>
            </div>
            <div className="flex flex-col items-center gap-8">
              <img src={Companion} alt="Hushh Browser Companion" className="w-48 h-48 opacity-90" />
              <button
                onClick={() => window.open("https://chromewebstore.google.com/detail/hushh-browser-companion/glmkckchoggnebfiklpbiajpmjoagjgj?authuser=0&hl=en", "_blank")}
                className="bg-[#AA4528] text-white px-10 py-4 rounded-lg font-bold hover:bg-[#8e3a22] transition-colors"
              >
                Add to Chrome today
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Vibe Search Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-['Ivar_Headline',serif] font-medium mb-4">Vibe Search</h2>
          <p className="text-2xl font-['Ivar_Headline',serif] text-[#AA4528] mb-8">Stop Searching, Start Vibing.</p>
          <p className="text-xl text-[#434343] mb-16 max-w-2xl mx-auto leading-relaxed">
            Find your perfect outfit effortlessly with AI-powered fashion search.
          </p>

          <div className="flex flex-col lg:row items-center gap-16 mb-24">
            <div className="w-full lg:w-[400px] shrink-0">
              <iframe
                width="360"
                height="615"
                src="https://www.youtube.com/embed/gGFm5QVsJwg?si=LIBm-M3--HA10I7g"
                title="Vibe Search Demo"
                className="rounded-[2.5rem] shadow-2xl mx-auto border-[10px] border-[#151515]"
                allowFullScreen
              ></iframe>
            </div>
            <div className="flex-1 text-left space-y-12">
              <div className="space-y-4">
                <h4 className="text-3xl font-['Ivar_Headline',serif] font-medium">Unleash the Power of AI Search</h4>
                <p className="text-lg text-[#666] leading-relaxed">
                  Describe what you want using natural language - "boho summer
                  dress," "Dark academia aesthetic outfits for fall," "minimal
                  office outfit," – Vibe Search understands!
                </p>
              </div>

              <div className="bg-[#faf9f6] p-10 rounded-[2rem] border border-[#e5e7eb]">
                <h5 className="text-[#AA4528] font-bold uppercase tracking-widest text-sm mb-6">Try Vibe Search Now</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Boho Summer Dress", "Casual Summer Dress",
                    "Minimal Office Outfit", "Bold Office Outfits",
                    "Summer Beach Party", "Ball Dresses",
                    "Streetwear for Men", "Floral and Striped"
                  ].map((query, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-[#555] font-medium p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <Play className="w-4 h-4 text-[#AA4528] fill-[#AA4528]" />
                      {query}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:row-reverse items-center gap-16">
            <div className="w-full lg:w-[400px] shrink-0">
              <iframe
                width="360"
                height="615"
                src="https://www.youtube.com/embed/4tH9j6kIQ0Q?si=3kp9oBbXRdh7Ewab"
                title="Vibe Search Personalization"
                className="rounded-[2.5rem] shadow-2xl mx-auto border-[10px] border-[#151515]"
                allowFullScreen
              ></iframe>
            </div>
            <div className="flex-1 text-left space-y-10">
              <h4 className="text-3xl font-['Ivar_Headline',serif] font-medium">Personalization That Gets You</h4>
              <div className="space-y-8">
                <div>
                  <h6 className="text-xl font-bold mb-2">Your Style, Your Feed</h6>
                  <p className="text-lg text-[#666]">Vibe Search learns what you love. The more you interact, the more tailored your results become.</p>
                </div>
                <div>
                  <h6 className="text-xl font-bold mb-2">Effortless Discovery</h6>
                  <p className="text-lg text-[#666]">Just browse and like products – Vibe Search personalizes your experience automatically.</p>
                </div>
                <div>
                  <h6 className="text-xl font-bold mb-2">Control Your Style Journey</h6>
                  <p className="text-lg text-[#666]">Soon you'll be able to fine-tune your preferences for ultimate control.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 p-16 bg-[#151515] rounded-[3rem] text-white">
            <h4 className="text-3xl font-['Ivar_Headline',serif] font-medium mb-6">Ready to find your perfect fashion match?</h4>
            <p className="text-xl mb-10 opacity-80">Start vibing with Vibe Search today!</p>
            <button
              onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSeIQF0GhLxmwEHrmOpMRQVlxuJBtQYUP2oT_GQt16h8oyw2Dg/viewform", "_blank")}
              className="bg-[#AA4528] text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-[#C15438] hover:scale-105 transition-all"
            >
              Schedule a demo to know more
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Consumers;
