
import { create } from 'zustand';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

interface MaxLevelState {
  maxLevel: number;
  setMaxLevel: (level: number) => void;
}

export const useGlobalMaxLevel = create<MaxLevelState>((set) => ({
  maxLevel: 1, // Default max level value
  setMaxLevel: (level: number) => {
    // Ensure level is within allowed range
    const safeLevel = Math.max(1, Math.min(50, level));
    set({ maxLevel: safeLevel });
    
    // The actual database update is done in the hook
  },
}));

// Hook to sync max level with database
export const useSyncMaxLevel = (address: string) => {
  const { maxLevel, setMaxLevel } = useGlobalMaxLevel();
  const { user } = useAuth();
  
  // Load max level from database when component mounts
  useEffect(() => {
    const loadMaxLevel = async () => {
      if (!user) return;
      
      try {
        // First try to get level for this specific address
        const { data: addressData, error: addressError } = await supabase
          .from('graph_data')
          .select('max_level')
          .eq('user_id', user.id)
          .eq('address', address.toLowerCase())
          .maybeSingle();
        
        if (addressError) throw addressError;
        
        if (addressData) {
          setMaxLevel(addressData.max_level);
          return;
        }
        
        // If not found, try to get default level
        const { data: defaultData, error: defaultError } = await supabase
          .from('graph_data')
          .select('max_level')
          .eq('user_id', user.id)
          .eq('address', 'default')
          .maybeSingle();
        
        if (defaultError) throw defaultError;
        
        if (defaultData) {
          setMaxLevel(defaultData.max_level);
        }
      } catch (error) {
        console.error('Error loading max level:', error);
      }
    };
    
    loadMaxLevel();
  }, [user, address, setMaxLevel]);
  
  // Save max level to database when it changes
  useEffect(() => {
    const saveMaxLevel = async () => {
      if (!user || !address) return;
      
      try {
        // Update or insert the max level for this address
        const { error } = await supabase
          .from('graph_data')
          .upsert({
            user_id: user.id,
            address: address.toLowerCase(),
            max_level: maxLevel,
            graph_json: {} // Empty placeholder, will be updated by graph storage functions
          }, {
            onConflict: 'user_id,address'
          });
        
        if (error) throw error;
      } catch (error) {
        console.error('Error saving max level:', error);
      }
    };
    
    saveMaxLevel();
  }, [maxLevel, user, address]);
  
  return { maxLevel, setMaxLevel };
};
