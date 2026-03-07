import React from "react";
import { Link } from "react-router-dom";
import {
  DollarSign, Heart, LifeBuoy, Clock, Star, Users, Check
} from "lucide-react";

const BenefitsPage: React.FC = () => {
  const benefitSections = [
    {
      title: "Compensation & Investment",
      icon: "💰",
      items: [
        "Competitive base salaries benchmarked to top-tier firms",
        "Access to proprietary investment strategies",
        "Performance-based bonuses tied to individual and company success",
        "401(k) with generous company matching",
        "Equity participation in company growth",
        "Financial planning and investment advisory services"
      ]
    },
    {
      title: "Health, Wellness & Family",
      icon: "🏥",
      items: [
        "Premium health, dental, and vision insurance (100% company paid)",
        "Generous parental leave policies",
        "Mental health and wellness programs",
        "Childcare assistance and family support services",
        "On-site fitness facilities and wellness stipend",
        "Comprehensive life and disability insurance"
      ]
    },
    {
      title: "Work-Life, Growth & Giving",
      icon: "🌱",
      items: [
        "Flexible work arrangements and remote work options",
        "Conference attendance and continuing education support",
        "Unlimited PTO policy with minimum usage requirements",
        "Internal mentorship and leadership development programs",
        "Sabbatical opportunities for long-term employees",
        "Charitable giving matching program",
        "Professional development budget ($10,000+ annually)",
        "Volunteer time off for community service"
      ]
    },
    {
      title: "Perks, Culture & Quality",
      icon: "🎯",
      items: [
        "State-of-the-art office spaces with premium amenities",
        "Team events, retreats, and cultural activities",
        "Catered meals and premium coffee/snacks",
        "Innovation time for personal projects"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#151515] font-['Source_Sans_Pro',sans-serif] pt-32 pb-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-24 space-y-6">
          <h1 className="text-5xl md:text-7xl font-['Ivar_Headline',serif] font-medium leading-tight">
            World-Class <span className="text-[#AA4528] italic">Benefits</span><br />
            for World-Class Talent
          </h1>
          <p className="text-xl text-[#666] max-w-3xl mx-auto leading-relaxed">
            We believe that exceptional people deserve exceptional benefits. Our comprehensive package is
            designed to support your professional growth, personal wellbeing, and financial future.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {benefitSections.map((section, idx) => (
            <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex items-center gap-4 mb-8">
                <span className="text-4xl">{section.icon}</span>
                <h2 className="text-2xl font-['Ivar_Headline',serif] font-medium group-hover:text-[#AA4528] transition-colors">
                  {section.title}
                </h2>
              </div>

              <ul className="space-y-4">
                {section.items.map((item, i) => (
                  <li key={i} className="flex gap-3 text-[#434343] leading-relaxed">
                    <Check className="w-5 h-5 text-[#AA4528] shrink-0 mt-1" />
                    <span className="font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Why Join Section */}
        <div className="bg-[#151515] p-12 md:p-20 rounded-[3rem] text-white text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl font-['Ivar_Headline',serif] font-medium">Why Join Hushh Technologies?</h2>
            <p className="text-xl opacity-70 max-w-4xl mx-auto leading-relaxed">
              At Hushh Technologies, you'll be part of a team that's revolutionizing the investment industry
              through cutting-edge AI and quantitative methods. You'll work alongside brilliant minds, solve
              complex challenges, and directly impact the future of finance.
            </p>
            <Link
              to="/career"
              className="inline-block bg-[#AA4528] text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-[#C15438] hover:scale-105 transition-all shadow-lg"
            >
              View Open Positions
            </Link>
          </div>
          {/* Subtle glow */}
          <div className="absolute bottom-[-50%] left-[-10%] w-[500px] h-[500px] bg-[#AA4528] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default BenefitsPage;
