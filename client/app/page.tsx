import Hero from "../components/landing/hero";
import ProblemSolution from "../components/landing/problem-solution";
import HowItWorks from "../components/landing/how-it-works";
import WhyZkLend from "../components/landing/why-zklend";
import Footer from "../components/landing/footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <ProblemSolution />
        <HowItWorks />
        <WhyZkLend />
      </main>
      <Footer />
    </>
  );
}
