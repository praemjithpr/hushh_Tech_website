import React, { useState } from 'react';
import { ChevronDown, Plus, Minus } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "How does Hu$$h 🤫 Technologies ensure its investment strategies align with long-term value creation?",
    answer: "At Hu$$h, we’re playing the long game. Every strategy we deploy is designed with sustainability in mind. We don’t just focus on short-term gains or trendy assets. Instead, we ground ourselves in businesses with robust cash flows, a strong competitive advantage, and a clear path for compounding growth. Our approach is built on options income, volatility capture, and disciplined dividend reinvestment in market leaders. It’s about making smart, calculated moves that allow us to grow steadily over time, and all our models are built to withstand a variety of market conditions."
  },
  {
    question: "What are the key risk management protocols that Hu$$h has in place?",
    answer: "We manage risk with the same precision that we seek in returns. Every strategy is safeguarded by a few core principles: diversification, position limits, and stop-loss triggers. We never allow ourselves to be overexposed in a single sector or asset, and we’re relentless about preserving capital. Options, by nature, introduce leverage and exposure, so we’ve built guardrails to prevent excessive risk-taking. Think of it like an artist using the finest brushstrokes—controlled, intentional, and designed to minimize waste."
  },
  {
    question: "You talk about putting data to work for people. How does Hu$$h use data in a way that’s ethical and human-first?",
    answer: "This is the core of what Hu$$h stands for. Data is powerful, but only when it serves people, not exploits them. Every data-driven decision we make is built around empowering our users and investors. We’re not in the business of selling data or compromising privacy. Our AI models are designed to find inefficiencies, identify opportunities, and help us deliver consistent value—all while respecting user privacy. In essence, we use data as a tool to benefit our stakeholders, not as a product."
  },
  {
    question: "How does Hu$$h differentiate itself from traditional investment firms? What’s the “moat” here?",
    answer: "Our moat is threefold: our technology, our commitment to human-first principles, and our adaptability. Traditional firms are often tied to legacy systems and rigid structures, while we’re built for agility. We leverage cutting-edge AI and machine learning in ways that larger, more bureaucratic firms simply can’t match. Our focus on making data work for individuals—turning it into a genuine personal asset—isn’t just innovative; it’s transformative. Add to that our dedication to transparency and ethical business practices."
  },
  {
    question: "What types of assets do you invest in?",
    answer: "We maintain a diversified approach across multiple asset classes including equities, fixed income, alternatives, and derivatives. Our AI models are designed to identify opportunities across global markets and various sectors. The specific allocation depends on market conditions, risk parameters, and individual client objectives."
  },
  {
    question: "What’s the biggest challenge Hu$$h faces, and how do you plan to address it?",
    answer: "Our biggest challenge is managing growth without losing our soul. We’re gaining traction fast, and with that comes the risk of diluting our values as we scale. To address this, we’re committed to a few non-negotiables: transparency, ethical data use, and a human-centered approach. We’re building a strong core team that not only understands finance but is also deeply aligned with our vision. As we grow, we’ll be deliberate about who joins the Hu$$h family."
  },
  {
    question: "Why should investors trust that Hu$$h’s results are sustainable over time?",
    answer: "Trust comes from discipline, and our discipline is unbreakable. We’re not just achieving returns by chasing the latest market trends; we’re doing it through structured, data-driven strategies that have proven resilient over time. Our options income strategy, our focus on high-free-cash-flow stocks, and our conservative approach to volatility capture are built to endure. We’re not promising the moon—we’re focused on realistic, consistent growth."
  },
  {
    question: "How does Hu$$h plan to handle downturns or market corrections?",
    answer: "Market corrections are a given, and we don’t shy away from that reality. Our strategies are inherently defensive, with built-in risk management features that prioritize capital preservation. During downturns, we lean heavily on our dividend-compounding assets, which provide stability, and we adjust our options strategies to minimize exposure. The beauty of our approach is that we’re not reliant on bull markets to create value."
  },
  {
    question: "How do you ensure Hu$$h remains innovative and adaptable as it grows?",
    answer: "Adaptability is in our DNA. The key is to stay curious and never assume we have it all figured out. We’re constantly refining our models, experimenting with new data sources, and pushing the limits of what our AI can do. Like Steve Jobs always sought perfection through iteration, we’re obsessive about improvement. Innovation doesn’t mean adding complexity; sometimes, it means simplifying even further."
  },
  {
    question: "What does Hu$$h’s commitment to “human-first” actually look like in practice?",
    answer: "Being “human-first” isn’t a slogan for us—it’s a fundamental operational principle. Every decision we make has to answer the question: “Does this serve our users and investors?” For example, our privacy policies are designed to give users control over their data, not just because it’s compliant, but because it’s the right thing to do. In practical terms, “human-first” means transparency, simplicity, and a commitment to integrity."
  },
  {
    question: "How will Hu$$h continue to attract and retain top talent as it scales?",
    answer: "Talent is the backbone of any great company, and we’re committed to building a team of “learn-it-alls,” not “know-it-alls.” We look for people who are hungry, curious, and aligned with our mission. Our culture is built on transparency, accountability, and a love for innovation. We don’t just offer jobs; we offer a chance to be part of a movement that’s reshaping wealth creation."
  },
  {
    question: "If Hu$$h could only achieve one thing, what would it be?",
    answer: "To redefine wealth as something personal, empowering, and accessible. At the end of the day, we’re here to make sure that every person can see their data as an asset they own and control. If we can shift the world’s perspective—even a little—toward that vision, we’ll have succeeded beyond measure. We’re not just creating financial returns; we’re creating a legacy."
  }
];

const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#151515] font-['Source_Sans_Pro',sans-serif] pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20 space-y-6">
          <h1 className="text-5xl md:text-7xl font-['Ivar_Headline',serif] font-medium leading-tight">
            Frequently Asked<br />
            <span className="text-[#AA4528] italic">Questions</span>
          </h1>
          <p className="text-xl text-[#666] max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about our investment strategies, processes, and services.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl border border-black/5 overflow-hidden transition-all duration-300 ${openIndex === index ? 'shadow-xl ring-1 ring-[#AA4528]/10' : 'hover:bg-white/80'
                }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left p-8 flex justify-between items-center gap-6 group"
              >
                <span className={`text-xl font-['Ivar_Headline',serif] font-medium transition-colors ${openIndex === index ? 'text-[#AA4528]' : 'group-hover:text-[#AA4528]'
                  }`}>
                  {faq.question}
                </span>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${openIndex === index ? 'bg-[#AA4528] text-white rotate-180' : 'bg-black/5 text-[#999]'
                  }`}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0'
                }`}>
                <div className="px-8 text-lg text-[#666] leading-relaxed border-t border-black/5 pt-8">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Support CTA */}
        <div className="mt-20 text-center p-12 bg-[#151515] text-white rounded-[3rem] shadow-2xl">
          <h3 className="text-2xl font-['Ivar_Headline',serif] font-medium mb-4">Still have questions?</h3>
          <p className="opacity-70 mb-8">Out team is here to help you understand every aspect of our technology.</p>
          <a
            href="mailto:support@hushh.ai"
            className="inline-block bg-[#AA4528] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#C15438] transition-all"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;