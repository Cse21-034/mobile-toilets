import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="hero-gradient on-dark flex min-h-screen flex-col items-center justify-center px-4 text-center text-white">
      <Logo variant="light" />
      <p className="mt-12 text-7xl font-extrabold text-cta">404</p>
      <h1 className="mt-3 text-2xl font-bold">We couldn&rsquo;t find that page</h1>
      <p className="mt-2 max-w-md text-white/80">
        The page you&rsquo;re looking for may have moved or no longer exists.
      </p>
      <a href="/" className="btn-cta mt-8 px-8 py-4">
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        Return to Home
      </a>
    </main>
  );
};

export default NotFound;
