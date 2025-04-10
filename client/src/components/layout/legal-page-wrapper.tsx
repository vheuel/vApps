import { useEffect, PropsWithChildren } from "react";

interface LegalPageWrapperProps extends PropsWithChildren {
  title: string;
}

/**
 * A wrapper component for legal pages that ensures proper page layout and scroll handling
 * to prevent the common issue of footer appearing before content.
 */
export function LegalPageWrapper({ title, children }: LegalPageWrapperProps) {
  // Reset scroll position and force rendering priority
  useEffect(() => {
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    
    // Add a class to the body specifically for legal pages to enforce proper scrolling
    document.body.classList.add('legal-page-active');
    
    return () => {
      // Remove the class when component unmounts
      document.body.classList.remove('legal-page-active');
    };
  }, []);
  
  return (
    // Add min-height to ensure content takes full viewport height even if content is short
    <div className="container py-8 max-w-4xl mx-auto min-h-[90vh]" id="legal-page-container">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      {children}
    </div>
  );
}