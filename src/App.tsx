import { Header } from "@/components/ui/header-1";
import { StackedCircularFooter } from "@/components/ui/stacked-circular-footer";
import { RadialBackground } from "@/components/ui/tailwind-css-background-snippet";
import { PageFrame } from "@/components/PageFrame";
import { PortraitHero } from "@/components/sections/PortraitHero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Credentials } from "@/components/sections/Credentials";
import { useCursorSplit } from "@/hooks/useCursorSplit";
import { useFaceLayout } from "@/hooks/useFaceLayout";
import { useViewportSize } from "@/hooks/useViewportSize";

export default function App() {
  useViewportSize();
  useFaceLayout();
  useCursorSplit();

  return (
    <>
      {/* One fixed backdrop for the whole document, so the gradient does not
          restart at every section boundary. */}
      <RadialBackground className="fixed" />
      <PageFrame />

      <Header />

      <main>
        <PortraitHero />
        <About />
        <Experience />
        <Credentials />
      </main>

      <StackedCircularFooter />
    </>
  );
}
