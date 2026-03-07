import React from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { careers } from '../../data/career';
import JobDetails from './JobDetails';
import { MapPin, Clock, ChevronRight, Rocket, DollarSign, Star } from "lucide-react";

const CareerList = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#151515] font-['Source_Sans_Pro',sans-serif]">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-8xl font-['Ivar_Headline',serif] font-medium leading-tight mb-8">
          Hushh Jobs<br />
          <span className="font-light italic text-[#434343]">Join Our Team</span>
        </h1>

        <p className="text-xl md:text-2xl text-[#666] max-w-4xl mx-auto leading-relaxed font-light mb-16">
          Help us revolutionize the investment industry through cutting-edge AI and quantitative
          research. We're looking for brilliant minds who share our passion for innovation and
          excellence.
        </p>

        {/* Benefits Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto py-16 border-y border-black/5">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#AA4528]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-8 h-8 text-[#AA4528]" />
            </div>
            <h3 className="text-xl font-['Ivar_Headline',serif] font-medium">Cutting-Edge Tech</h3>
            <p className="text-[#666] text-sm leading-relaxed">Work with the latest AI and machine learning technologies at scale.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#AA4528]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <DollarSign className="w-8 h-8 text-[#AA4528]" />
            </div>
            <h3 className="text-xl font-['Ivar_Headline',serif] font-medium">Competitive Comp</h3>
            <p className="text-[#666] text-sm leading-relaxed">Top-tier salaries, equity, and comprehensive benefits package.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#AA4528]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-[#AA4528]" />
            </div>
            <h3 className="text-xl font-['Ivar_Headline',serif] font-medium">Growth Ops</h3>
            <p className="text-[#666] text-sm leading-relaxed">Learn from industry experts and advance your career rapidly.</p>
          </div>
        </div>
      </section>

      {/* Career Departments */}
      <section className="py-20 px-4 max-w-5xl mx-auto space-y-16">
        {Object.entries(careers).map(([department, jobs]) => (
          <div key={department} className="space-y-8">
            <h2 className="text-2xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">
              {department}
            </h2>

            <div className="space-y-4">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/career/${job.id}`}
                  className="block p-8 bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-xl hover:border-[#AA4528] transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-['Ivar_Headline',serif] font-medium group-hover:text-[#AA4528] transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-6 text-[#666] text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Full-time
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-8 h-8 text-[#ccc] group-hover:text-[#AA4528] group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Call to Action */}
      <section className="py-24 px-4 text-center pb-32">
        <div className="max-w-4xl mx-auto bg-[#151515] text-white p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-['Ivar_Headline',serif] font-medium mb-6">Didn't find the right role?</h2>
            <p className="text-xl opacity-70 mb-10 max-w-2xl mx-auto">
              We're always looking for exceptional talent. View our full benefits package to see what makes us different.
            </p>
            <Link
              to="/benefits"
              className="bg-[#AA4528] text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-[#C15438] hover:scale-105 transition-all inline-block"
            >
              View Full Benefits Package
            </Link>
          </div>
          {/* Subtle background element */}
          <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-[#AA4528] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
        </div>
      </section>
    </div>
  );
};

const Career = () => {
  const location = useLocation();

  // Only show the career list on the main career page
  if (location.pathname === '/career') {
    return <CareerList />;
  }

  return (
    <Routes>
      <Route path="/:jobId" element={<JobDetails />} />
    </Routes>
  );
};

export default Career;