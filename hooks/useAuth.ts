import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/types/user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          const defaultProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role:
              (docSnap.exists()
                ? (docSnap.data() as UserProfile).role
                : null) || "partner", // Keep existing role if exists
            displayName:
              firebaseUser.displayName ||
              firebaseUser.email?.split("@")[0] ||
              "User",
          };

          // Auto-sync profile to DB if needed
          const { setDoc } = await import("firebase/firestore");
          await setDoc(docRef, defaultProfile, { merge: true });

          setProfile(defaultProfile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, profile, loading };
}
