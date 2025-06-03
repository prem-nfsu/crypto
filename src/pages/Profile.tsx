
import { useState, useEffect } from 'react';
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { getEtherscanApiKey, setEtherscanApiKey } from "@/utils/transactionFlowUtils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string>('');
  const [maxLevel, setMaxLevel] = useState<number>(3);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load the API key from localStorage
    const savedApiKey = getEtherscanApiKey();
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    
    // Fetch user's preferred max level from the database
    const fetchMaxLevel = async () => {
      if (!user) return;
      
      try {
        // Try to get the latest graph_data entry for this user
        const { data, error } = await supabase
          .from('graph_data')
          .select('max_level')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setMaxLevel(data[0].max_level);
        }
      } catch (error) {
        console.error('Error fetching max level:', error);
      }
    };
    
    fetchMaxLevel();
  }, [user]);
  
  const handleSaveApiKey = (newApiKey: string) => {
    setEtherscanApiKey(newApiKey);
    setApiKey(newApiKey);
  };
  
  const handleMaxLevelChange = async (newMaxLevel: number) => {
    if (newMaxLevel < 1 || newMaxLevel > 50) {
      toast({
        variant: "destructive",
        title: "Invalid Max Level",
        description: "Max level must be between 1 and 50",
      });
      return;
    }
    
    setMaxLevel(newMaxLevel);
    
    if (user) {
      try {
        // Update the user's preferred max level in the database
        const { error } = await supabase
          .from('graph_data')
          .upsert([
            {
              user_id: user.id,
              max_level: newMaxLevel,
              graph_json: {}, // Empty JSON as placeholder if it's a new entry
              address: 'default' // Placeholder address
            }
          ], {
            onConflict: 'user_id,address'
          });
        
        if (error) throw error;
        
        toast({
          description: `Maximum graph level updated to ${newMaxLevel}`,
        });
      } catch (error) {
        console.error('Error updating max level:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update maximum graph level",
        });
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-8">User Profile</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>
                Manage your Etherscan API key for transaction data retrieval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeyInput 
                defaultKey={apiKey} 
                onSave={handleSaveApiKey} 
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Graph Settings</CardTitle>
              <CardDescription>
                Configure your transaction graph visualization preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum Graph Level</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="number" 
                    min="1" 
                    max="50" 
                    value={maxLevel}
                    onChange={(e) => setMaxLevel(parseInt(e.target.value))}
                    className="w-20 px-3 py-2 bg-secondary/20 border border-border rounded"
                  />
                  <Button 
                    onClick={() => handleMaxLevelChange(maxLevel)}
                    size="sm"
                  >
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set the maximum depth for transaction graphs (1-50)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
