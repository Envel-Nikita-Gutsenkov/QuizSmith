'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; // Renamed User to FirebaseUser
import { auth } from '@/lib/firebaseConfig'; // Ensure this path is correct
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast'; // Assuming useToast is compatible with client components

// Prisma imports
// IMPORTANT: Instantiating PrismaClient directly in client-side components or contexts
// is generally NOT recommended for production applications due to potential issues with
// connection management and resource overuse. This approach is used here for simplicity
// in this specific step. A more robust solution involves API endpoints for database interactions.
import { PrismaClient, User as PrismaUser } from '@prisma/client'; 
const prisma = new PrismaClient();

interface AuthContextType {
  currentUser: FirebaseUser | null; // Firebase user object
  userProfile: PrismaUser | null;   // User profile from our DB
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<PrismaUser | null>(null); // State for Prisma user
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => { // Make async
      if (fbUser) {
        setCurrentUser(fbUser);
        try {
          let profile = await prisma.user.findUnique({
            where: { id: fbUser.uid },
          });
          if (!profile) {
            const userEmail = fbUser.email;
            if (!userEmail) {
              console.error("Firebase user has no email, cannot create Prisma profile without an email.");
              // Optionally, inform the user via toast if this is an unexpected state
              // toast({ title: "Profile Sync Error", description: "Firebase user email is missing.", variant: "destructive"});
              setUserProfile(null); 
            } else {
               profile = await prisma.user.create({
                data: {
                  id: fbUser.uid,
                  email: userEmail,
                  name: fbUser.displayName,
                },
              });
            }
          }
          setUserProfile(profile);
        } catch (dbError: any) {
          console.error("Error syncing user with DB:", dbError);
          toast({
            title: "Database Sync Error",
            description: "Could not sync user profile with the database: " + dbError.message,
            variant: "destructive",
          });
          setUserProfile(null); // Ensure profile is null if sync fails
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null); // Clear Prisma user profile on logout
      }
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencies: router and toast might be needed if used directly inside for navigation/feedback on initial auth state errors not related to async ops.

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // User sync and profile fetching will be handled by onAuthStateChanged
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
      throw error; // Re-throw to handle in component if needed
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      // setCurrentUser(null) and setUserProfile(null) are handled by onAuthStateChanged
      router.push('/login'); // Redirect to login after logout
    } catch (error: any) {
      console.error("Logout error:", error);
       toast({
        title: "Logout Failed",
        description: error.message || "Could not log out.",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for instructions to reset your password.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Password Reset Failed",
        description: error.message || "Could not send password reset email.",
        variant: "destructive",
      });
      throw error; // Re-throw to handle in component if needed
    }
  };

  const value = {
    currentUser,
    userProfile, // Provide Prisma user profile
    loading,
    login,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
