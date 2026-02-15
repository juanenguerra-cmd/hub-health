import { useEffect } from 'react';

/**
 * Custom hook to set and restore document title
 * Important for screen reader users to know which page they're on
 * 
 * @param title - The title for the current page
 * @param appName - Optional app name suffix (defaults to "Hub Health")
 * 
 * @example
 * function DashboardPage() {
 *   usePageTitle('Dashboard');
 *   return <div>Dashboard content</div>;
 * }
 */
export function usePageTitle(title: string, appName: string = 'Hub Health') {
  useEffect(() => {
    // Store the previous title
    const previousTitle = document.title;
    
    // Set new title
    document.title = title ? `${title} | ${appName}` : appName;
    
    // Restore previous title on unmount
    return () => {
      document.title = previousTitle;
    };
  }, [title, appName]);
}
