
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyInputProps {
  defaultKey?: string;
  onSave: (key: string) => void;
}

export const ApiKeyInput = ({ defaultKey = '', onSave }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState(defaultKey);
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
      setIsEditing(false);
      toast({
        description: "API key saved successfully.",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setIsCopied(true);
    toast({
      description: "API key copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Masked display of API key
  const maskedKey = apiKey ? "•".repeat(Math.min(apiKey.length, 10)) : "No API key set";

  return (
    <div className="flex flex-col space-y-2 w-full max-w-md">
      <div className="flex items-center space-x-2">
        <div className="bg-black rounded p-2 text-white">
          <Key className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">Etherscan API Key:</span>
      </div>
      
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <Input 
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Etherscan API key..."
            className="flex-1"
          />
          <Button onClick={handleSave} variant="default" size="sm">
            Save
          </Button>
          <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-secondary/20 p-2 rounded">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-mono">{maskedKey}</span>
          </div>
          <div className="flex items-center space-x-2">
            {apiKey && (
              <Button onClick={copyToClipboard} variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
            <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm">
              {apiKey ? "Edit" : "Get API Key"}
            </Button>
          </div>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        An Etherscan API key is required for transaction data retrieval. 
        <a 
          href="https://etherscan.io/myapikey" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary ml-1 hover:underline"
        >
          Get a free API key here
        </a>
      </p>
    </div>
  );
};
