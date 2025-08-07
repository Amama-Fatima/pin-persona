import { Header } from "../components/Header";
import PersonalityScraper from "../components/PersonalityScraper";
import { ThemeProvider } from "../components/ThemeProvider";

export default function Home() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Header />
        <PersonalityScraper />
      </div>
    </ThemeProvider>
  );
}
