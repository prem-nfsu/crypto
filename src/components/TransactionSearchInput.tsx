
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface TransactionSearchInputProps {
  onSearch: (value: string, isBlockNumber: boolean) => void;
  isLoading: boolean;
  value?: string;
  onChange?: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const TransactionSearchInput = ({ 
  onSearch, 
  isLoading, 
  value, 
  onChange,
  inputRef 
}: TransactionSearchInputProps) => {
  const [searchValue, setSearchValue] = useState("");
  const { user } = useAuth();

  // Sync local state with prop
  useEffect(() => {
    if (value !== undefined) {
      setSearchValue(value);
    }
  }, [value]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      const trimmedValue = searchValue.trim();
      
      // Check if the input is a block number (integer)
      const isBlockNumber = /^\d+$/.test(trimmedValue);
      
      // If it's a transaction hash and doesn't start with 0x, add the prefix
      const formattedValue = isBlockNumber 
        ? trimmedValue 
        : (!trimmedValue.startsWith('0x') ? `0x${trimmedValue}` : trimmedValue);
      
      // Determine search type
      let searchType = 'transaction';
      if (isBlockNumber) {
        searchType = 'block';
      } else if (formattedValue.length === 42) { // Ethereum address length with 0x prefix
        searchType = 'address';
      }
      
      // Save search to history if user is logged in
      if (user) {
        try {
          await supabase.from('search_history').insert({
            user_id: user.id,
            search_type: searchType,
            value: formattedValue
          });
        } catch (error) {
          console.error('Error saving search history:', error);
        }
      }
      
      onSearch(formattedValue, isBlockNumber);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative flex flex-col gap-2">
        <Input
          type="text"
          value={searchValue}
          onChange={handleValueChange}
          placeholder="Enter transaction hash, block number, or wallet address..."
          className="w-full pl-4 pr-20 py-6 text-lg bg-secondary/50 border-secondary-foreground/20 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
          ref={inputRef}
        />
        <Button
          type="submit"
          disabled={isLoading || !searchValue.trim()}
          className="absolute right-2 top-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2 transition-all duration-200"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-1">
          Search for transaction details, block information, or explore wallet addresses and their transactions
        </p>
      </div>
    </form>
  );
};
