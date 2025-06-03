import { useState, useEffect } from 'react';
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Search, Cpu, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { formatRelativeTimestamp } from "@/utils/transactionFlowUtils";

type SearchEntry = {
  id: string;
  search_type: string;
  value: string;
  created_at: string;
};

const History = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<SearchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('search_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (error) throw error;
        
        setHistory(data || []);
      } catch (error) {
        console.error('Error fetching search history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [user]);
  
  const getSearchIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return <Search className="h-4 w-4" />;
      case 'block':
        return <Cpu className="h-4 w-4" />;
      case 'address':
        return <Wallet className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };
  
  const getRedirectUrl = (entry: SearchEntry) => {
    switch (entry.search_type) {
      case 'transaction':
        return `/transaction/${entry.value}`;
      case 'block':
        return `/block/${entry.value}`;
      case 'address':
        return `/view/graph?address=${entry.value}`;
      default:
        return '/';
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'transaction':
        return 'Transaction';
      case 'block':
        return 'Block';
      case 'address':
        return 'Address';
      default:
        return type;
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    const timestampAsNumber = new Date(timestamp).getTime() / 1000;
    const formatted = formatRelativeTimestamp(timestampAsNumber);
    return formatted;
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Search History</h1>
          <Link to="/profile">
            <Button variant="outline">Back to Profile</Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Searches</CardTitle>
            <CardDescription>
              Your recent search history for transactions, blocks, and addresses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No search history found. Start exploring the Ethereum blockchain!
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="p-4 border rounded-lg hover:bg-secondary/10 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/20 rounded-full">
                          {getSearchIcon(entry.search_type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {getTypeLabel(entry.search_type)}
                            </span>
                            <span className="text-xs bg-secondary/30 px-2 py-0.5 rounded">
                              {formatTimestamp(entry.created_at).timeAgo}
                            </span>
                          </div>
                          <div className="font-mono text-sm mt-1 break-all">
                            {entry.value}
                          </div>
                        </div>
                      </div>
                      
                      <Link to={getRedirectUrl(entry)}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default History;
