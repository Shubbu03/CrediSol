import Hero from "../components/landing/hero";
import ProblemSolution from "../components/landing/problem-solution";
import HowItWorks from "../components/landing/how-it-works";
import TrustSocialProof from "../components/landing/trust-social-proof";
import TechnicalDifferentiators from "../components/landing/technical-differentiators";
import Footer from "../components/landing/footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <ProblemSolution />
        <HowItWorks />
        <TrustSocialProof />
        <TechnicalDifferentiators />
      </main>
      <Footer />
    </>
  );
}
