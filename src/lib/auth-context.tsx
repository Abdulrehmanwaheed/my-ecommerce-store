'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { Customer, CustomerAddress } from '@/types/database';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  profile: Customer | null;
  addresses: CustomerAddress[];
  refreshAddresses: () => Promise<void>;
  reloadUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  profile: null,
  addresses: [],
  refreshAddresses: async () => {},
  reloadUser: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);

  const refreshAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });
    if (!error && data) {
      setAddresses(data as CustomerAddress[]);
    }
  }, [user]);

  const loadProfile = useCallback(async (uid: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('auth_user_id', uid)
      .maybeSingle();
    if (data) {
      setProfile(data as Customer);
    }
  }, []);

  const reloadUser = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user ?? null);
    if (user) {
      await loadProfile(user.id);
      setLoading(false);
    }
  }, [loadProfile]);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
      if (data.user) {
        loadProfile(data.user.id);
        // fetch addresses via RLS
        supabase
          .from('customer_addresses')
          .select('*')
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: true })
          .then(({ data: addr, error }) => {
            if (!error && addr) setAddresses(addr as CustomerAddress[]);
          });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        supabase
          .from('customer_addresses')
          .select('*')
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: true })
          .then(({ data: addr, error }) => {
            if (!error && addr) setAddresses(addr as CustomerAddress[]);
          });
      } else {
        setProfile(null);
        setAddresses([]);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setAddresses([]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profile,
        addresses,
        refreshAddresses,
        reloadUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
