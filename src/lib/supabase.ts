
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rardqyupfufwixtvzeke.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcmRxeXVwZnVmd2l4dHZ6ZWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5Mzg5MDMsImV4cCI6MjA2NDUxNDkwM30.Ygr0T3Ew-6W-9nfYvXOwytuA6Ty7B7IVhJNquFfvf5k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
