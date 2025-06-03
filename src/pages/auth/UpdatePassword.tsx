
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updatePassword, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Password validation state
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    length: true,
    uppercase: true,
    lowercase: true,
    number: true,
    special: true
  });

  useEffect(() => {
    // Check if we have a valid session for password reset
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Invalid or expired password reset link',
      });
      navigate('/auth/login');
    }
  }, [user, navigate, toast]);

  const validatePasswordOnChange = (password: string) => {
    setPasswordErrors({
      length: password.length < 8,
      uppercase: !/[A-Z]/.test(password),
      lowercase: !/[a-z]/.test(password),
      number: !/[0-9]/.test(password),
      special: !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePasswordOnChange(newPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check if any password validation errors exist
    const hasErrors = Object.values(passwordErrors).some(error => error);
    if (hasErrors) {
      setError('Password does not meet requirements');
      return;
    }

    setIsLoading(true);

    try {
      const { success, error } = await updatePassword(password);
      
      if (success) {
        toast({
          title: 'Password updated',
          description: 'Your password has been successfully updated',
        });
        navigate('/auth/login');
      } else if (error) {
        setError(error);
      }
    } catch (error) {
      console.error('Update password error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4 py-8">
      <Card className="w-full max-w-md animate-fade-in shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Update password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={handlePasswordChange}
                onFocus={() => setPasswordFocus(true)}
                onBlur={() => setPasswordFocus(false)}
                className="w-full"
              />
              
              {passwordFocus && (
                <div className="mt-2 text-sm space-y-1">
                  <p className={passwordErrors.length ? 'text-destructive' : 'text-green-500'}>
                    ✓ At least 8 characters
                  </p>
                  <p className={passwordErrors.uppercase ? 'text-destructive' : 'text-green-500'}>
                    ✓ At least one uppercase letter
                  </p>
                  <p className={passwordErrors.lowercase ? 'text-destructive' : 'text-green-500'}>
                    ✓ At least one lowercase letter
                  </p>
                  <p className={passwordErrors.number ? 'text-destructive' : 'text-green-500'}>
                    ✓ At least one number
                  </p>
                  <p className={passwordErrors.special ? 'text-destructive' : 'text-green-500'}>
                    ✓ At least one special character
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Updating password...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            <Link
              to="/auth/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Back to login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UpdatePassword;
