import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { UserProfile } from "@/types/user";

export function useUsers() {
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        if (!isMounted) return;

        const map: Record<string, string> = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data() as UserProfile;
          map[doc.id] = data.displayName || data.email || "User";
        });

        setUsersMap(map);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  return { usersMap, loading };
}
