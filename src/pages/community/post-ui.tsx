/**
 * Community Post — UI / Presentation
 * Renders individual post (PDF or React component).
 * Matches profile + step design language.
 * Logic stays in post-logic.ts.
 */
import { useCommunityPostLogic } from "./post-logic";
import HushhTechBackHeader from "../../components/hushh-tech-back-header/HushhTechBackHeader";
import HushhTechCta, {
  HushhTechCtaVariant,
} from "../../components/hushh-tech-cta/HushhTechCta";

export default function CommunityPostPage() {
  const { post, loading, handleBack } = useCommunityPostLogic();

  /* loading state */
  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  const PostComponent = post.Component;

  /* ── PDF Post ── */
  if (post.pdfUrl) {
    return (
      <div className="bg-white text-gray-900 min-h-screen antialiased flex flex-col selection:bg-black selection:text-white">
        {/* Header */}
        <HushhTechBackHeader
          onBackClick={handleBack}
          rightType="hamburger"
        />

        {/* Desktop: Full-screen iframe */}
        <div className="hidden md:block flex-1">
          <iframe
            src={`${post.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
            className="w-full h-[calc(100vh-64px)] border-none"
            title={post.title}
          />
        </div>

        {/* Mobile: Clean card with open/download */}
        <main className="md:hidden px-6 flex-grow max-w-md mx-auto w-full pb-12">
          <section className="pt-8">
            {/* PDF icon */}
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-black !text-[1.8rem]">
                description
              </span>
            </div>

            {/* title */}
            <h1
              className="text-[22px] leading-[1.2] font-medium text-black tracking-tight lowercase mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {post.title}
            </h1>
            <p className="text-[13px] text-gray-400 font-light leading-relaxed lowercase mb-10">
              tap below to view the full pdf document in your browser.
            </p>

            {/* CTAs */}
            <div className="space-y-3">
              <HushhTechCta
                variant={HushhTechCtaVariant.BLACK}
                onClick={() => window.open(post.pdfUrl, "_blank")}
              >
                open pdf document
                <span className="material-symbols-outlined !text-[1.1rem]">
                  open_in_new
                </span>
              </HushhTechCta>

              <a href={post.pdfUrl} download className="block">
                <HushhTechCta variant={HushhTechCtaVariant.WHITE}>
                  download pdf
                  <span className="material-symbols-outlined !text-[1.1rem]">
                    download
                  </span>
                </HushhTechCta>
              </a>
            </div>
          </section>
        </main>
      </div>
    );
  }

  /* ── Regular Post (React component) ── */
  return (
    <div className="bg-white text-gray-900 min-h-screen antialiased flex flex-col selection:bg-black selection:text-white">
      {/* Header */}
      <HushhTechBackHeader
        onBackClick={handleBack}
        rightType="hamburger"
      />

      {/* Post content */}
      <main className="flex-1 max-w-[900px] mx-auto w-full px-4 md:px-8 py-6 md:py-10">
        <PostComponent />
      </main>
    </div>
  );
}
