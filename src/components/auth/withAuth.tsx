'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ComponentType } from 'react';

// Define a generic type for the props of the wrapped component
type WithAuthProps = {}; // Can be extended if wrapped components have common props

export default function withAuth<P extends WithAuthProps>(WrappedComponent: ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const { currentUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !currentUser) {
        router.replace('/login'); // Redirect to login if not authenticated
      }
    }, [currentUser, loading, router]);

    if (loading || !currentUser) {
      // You can render a loading spinner or null here
      return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>; 
    }

    return <WrappedComponent {...props} />;
  };
  
  // Set a display name for easier debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithAuthComponent.displayName = `WithAuth(${displayName})`;

  return WithAuthComponent;
}
