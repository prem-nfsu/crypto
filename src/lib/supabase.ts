
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqnzwljetuauwmbldhsx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxbnp3bGpldHVhdXdtYmxkaHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MzI5MTcsImV4cCI6MjA1NjMwODkxN30.R5ph1CuXEyoQTxIc6SFvStwjXMxX0wK9zTYdf71BhrA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
