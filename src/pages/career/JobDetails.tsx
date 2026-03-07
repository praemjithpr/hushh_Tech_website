import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { careers } from "../../data/career";
import ApplicationForm from "./ApplicationForm";
import { MapPin, Clock, ChevronLeft, DollarSign } from "lucide-react";

const JobDetails = () => {
  const { jobId } = useParams();
  const [showForm, setShowForm] = useState(false);

  const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  const job = Object.values(careers)
    .flat()
    .find((j) => j.id === jobId);

  if (!job) return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4 font-['Source_Sans_Pro',sans-serif]">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-['Ivar_Headline',serif] font-medium">Position not found</h1>
        <Link
          to="/career"
          className="bg-[#AA4528] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#8e3a22] transition-colors inline-block"
        >
          Back to Careers
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#151515] font-['Source_Sans_Pro',sans-serif] pb-24">
      <div className="max-w-4xl mx-auto px-4 pt-32">
        {/* Back Button */}
        <Link
          to="/career"
          className="inline-flex items-center gap-2 text-[#666] hover:text-[#AA4528] transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm uppercase tracking-widest">Back to Careers</span>
        </Link>

        {/* Header Section */}
        <div className="bg-white p-10 md:p-16 rounded-[2.5rem] border border-black/5 shadow-sm mb-12">
          <h1 className="text-4xl md:text-6xl font-['Ivar_Headline',serif] font-medium mb-8 leading-tight">
            {job.title}
          </h1>

          <div className="flex flex-wrap gap-8 items-center text-[#666] mb-12 border-y border-black/5 py-8">
            {job.location && (
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-[#AA4528]" />
                <span className="font-medium">{job.location}</span>
              </div>
            )}

            {job.salary && (
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-5 h-5 text-[#AA4528]" />
                <span className="font-medium">{job.salary}</span>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[#AA4528]" />
              <span className="font-medium">Full-time</span>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="bg-[#AA4528] text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-[#8e3a22] hover:scale-105 transition-all shadow-lg"
          >
            Apply Now
          </button>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* About Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">About Hushh Technologies</h2>
            <div className="space-y-4 text-lg text-[#434343] leading-relaxed max-w-3xl">
              <p>Hushh Technologies LLC is a cutting-edge investment technology firm that leverages artificial intelligence and advanced mathematical models to generate superior risk-adjusted returns.</p>
              <p>We combine the precision of quantitative analysis with the power of machine learning to identify market opportunities that traditional investment approaches miss.</p>
            </div>
          </div>

          {/* Responsibilities Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Responsibilities</h2>
            <ul className="space-y-4 text-lg text-[#434343] leading-relaxed max-w-3xl list-none">
              {job.responsibilities.map((resp, index) => (
                <li key={index} className="flex gap-4">
                  <span className="w-2 h-2 rounded-full bg-[#AA4528] shrink-0 mt-3"></span>
                  {resp}
                </li>
              ))}
            </ul>
          </div>

          {/* Qualifications Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Skills & Experience</h2>
            <ul className="space-y-4 text-lg text-[#434343] leading-relaxed max-w-3xl list-none">
              {job.qualifications.map((qual, index) => (
                <li key={index} className="flex gap-4">
                  <span className="w-2 h-2 rounded-full bg-[#AA4528] shrink-0 mt-3"></span>
                  {qual}
                </li>
              ))}
            </ul>
          </div>

          {/* Leadership Principles Section */}
          {job.leadershipPrinciples && job.leadershipPrinciples.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">Leadership Principles</h2>
              <ul className="space-y-4 text-lg text-[#434343] leading-relaxed max-w-3xl list-none">
                {job.leadershipPrinciples.map((principle, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="w-2 h-2 rounded-full border border-[#AA4528] shrink-0 mt-3"></span>
                    {principle}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Extra Info (Procedures, etc) */}
          {[
            { title: "Hiring Procedure", items: job.hiringProcedure },
            { title: "Compensation Procedure", items: job.compensationProcedure }
          ].map((sec, i) => (
            sec.items && sec.items.length > 0 && (
              <div key={i} className="space-y-6">
                <h2 className="text-2xl font-['Ivar_Headline',serif] font-medium border-b border-black/10 pb-4">{sec.title}</h2>
                <ul className="space-y-4 text-lg text-[#434343] leading-relaxed max-w-3xl list-none">
                  {sec.items.map((it, idx) => (
                    <li key={idx} className="flex gap-4">
                      <span className="text-[#AA4528] font-bold mt-[-2px]">{idx + 1}.</span>
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            )
          ))}

          {/* Salary Details */}
          {job.salaryDetails && (
            <div className="space-y-8 bg-white p-12 rounded-[2rem] border border-black/5 shadow-sm">
              <h2 className="text-3xl font-['Ivar_Headline',serif] font-medium mb-8">Salary & Packages</h2>
              <div className="space-y-12">
                {Object.entries(job.salaryDetails).map(([role, details], index) => (
                  <div key={index} className="space-y-4">
                    <h4 className="text-xl font-bold text-[#AA4528] uppercase tracking-wider">
                      {toTitleCase(role.replace(/([A-Z])/g, ' $1').trim())}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-black/5">
                      {details.averageSalary && (
                        <div>
                          <span className="block text-xs uppercase tracking-widest text-[#666] mb-1">Average Salary</span>
                          <span className="text-2xl font-['Ivar_Headline',serif]">{details.averageSalary}</span>
                        </div>
                      )}
                      {details.range && (
                        <div>
                          <span className="block text-xs uppercase tracking-widest text-[#666] mb-1">Range</span>
                          <span className="text-2xl font-['Ivar_Headline',serif]">{details.range}</span>
                        </div>
                      )}
                    </div>
                    {details.competitiveSalaryRange && (
                      <div className="mt-8 pt-8 border-t border-black/5">
                        <h5 className="text-sm font-bold uppercase tracking-widest text-[#666] mb-6">Competitive Benchmarks</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {Object.entries(details.competitiveSalaryRange).map(([level, range], idx) => (
                            <div key={idx} className="bg-[#faf9f6] p-6 rounded-xl border border-black/5">
                              <span className="block text-[10px] font-bold uppercase tracking-tighter text-[#AA4528] mb-2">{level}</span>
                              <span className="text-lg font-medium">{range}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <ApplicationForm
          jobTitle={job.title}
          jobLocation={job.location}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default JobDetails;
