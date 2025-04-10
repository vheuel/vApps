import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps = {}) {
  const { login, isLoading, user, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [_, navigate] = useLocation();
  
  // Mengambil data provider OAuth yang tersedia dari server
  const { data: oauthProviders, isLoading: isLoadingProviders } = useQuery({
    queryKey: ['/api/oauth/providers'],
    enabled: true, // Query ini akan selalu dijalankan
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Pantau perubahan user, jika berhasil login, tutup modal dan arahkan ke profil
  useEffect(() => {
    if (user && !isLoading) {
      // Jalankan callback onLoginSuccess jika disediakan (untuk menutup modal)
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      // Arahkan ke halaman profil
      navigate('/profile');
    }
  }, [user, isLoading, navigate, onLoginSuccess]);

  const onSubmit = async (values: LoginFormValues) => {
    await login(values.email, values.password);
  };
  
  // Fungsi untuk login dengan OAuth provider
  const handleOAuthLogin = (provider: string) => {
    setOauthLoading(provider);
    // Redirect ke URL login OAuth
    window.location.href = `/api/oauth/login/${provider}`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
            {error.message}
          </div>
        )}
      
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-medium">Remember me</FormLabel>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        <div className="flex justify-center gap-3 w-full">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full max-w-[120px]"
            onClick={() => handleOAuthLogin('google')}
            disabled={oauthLoading !== null}
            size="sm"
          >
            {oauthLoading === 'google' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25526 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                  fill="#EA4335"
                />
                <path
                  d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                  fill="#4285F4"
                />
                <path
                  d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25537 21.31 7.3104 24.0001 12.0004 24.0001Z"
                  fill="#34A853"
                />
              </svg>
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full max-w-[120px]"
            onClick={() => handleOAuthLogin('twitter')}
            disabled={oauthLoading !== null}
            size="sm"
          >
            {oauthLoading === 'twitter' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M13.3 10.8l5.2-5.7H17l-4.5 5-3.5-5H4.9l5.3 7.6-5.5 6h1.5l4.8-5.3 3.7 5.3h4.2L13.3 10.8zm-2.2 3.9l-.5-.8-4.4-6.3h2l3.6 5.1.5.8 4.6 6.6h-2.1l-3.7-5.4z"
                  fill="currentColor"
                />
              </svg>
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full max-w-[120px]"
            onClick={() => handleOAuthLogin('telegram')}
            disabled={oauthLoading !== null}
            size="sm"
          >
            {oauthLoading === 'telegram' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.16-.03-.23-.02-.1.03-1.77 1.13-5.01 3.31-.47.32-.9.48-1.29.47-.42-.01-1.23-.24-1.83-.44-.74-.24-1.33-.37-1.28-.79.03-.22.23-.44.61-.67 2.36-1.03 3.93-1.71 4.71-2.05 2.24-.99 2.71-1.16 3.02-1.17.07 0 .21.02.3.1.26.2.33.6.26.84z"
                  fill="#0088cc"
                />
              </svg>
            )}
          </Button>
        </div>

        <div className="text-center mt-4">
          <Button variant="link" className="text-primary text-sm p-0">
            Forgot password?
          </Button>
        </div>
      </form>
    </Form>
  );
}
