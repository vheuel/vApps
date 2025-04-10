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
  const [_, navigate] = useLocation();

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
        
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="w-full">
            <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden="true">
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
            Google
          </Button>
          
          <Button type="button" variant="outline" className="w-full">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 248 204" aria-hidden="true">
              <path
                d="M221.95 51.29c.15 2.17.15 4.34.15 6.53 0 66.73-50.8 143.69-143.69 143.69v-.04c-27.44.04-54.31-7.82-77.41-22.64 3.99.48 8 .72 12.02.73 22.74.02 44.83-7.61 62.72-21.66-21.61-.41-40.56-14.5-47.18-35.07 7.57 1.46 15.37 1.16 22.8-.87-23.56-4.76-40.51-25.46-40.51-49.5v-.64c7.02 3.91 14.88 6.08 22.92 6.32C11.58 63.31 4.74 33.79 18.14 10.71c25.64 31.55 63.47 50.73 104.08 52.76-4.07-17.54 1.49-35.92 14.61-48.25 20.34-19.12 52.33-18.14 71.45 2.19 11.31-2.23 22.15-6.38 32.07-12.26-3.77 11.69-11.66 21.62-22.2 27.93 10.01-1.18 19.79-3.86 29-7.95-6.78 10.16-15.32 19.01-25.2 26.16z"
                fill="#1DA1F2"
              />
            </svg>
            X 
          </Button>
          
          <Button type="button" variant="outline" className="w-full">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm0 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM2.24 7.92a5.76 5.76 0 0 1 11.52 0v.16c0 1.44-.54 2.47-1.29 3.19-.73.72-1.68 1.12-2.57 1.32-.89.2-1.78.23-2.4.2-.62-.04-1.1-.15-1.3-.22a.39.39 0 0 1-.24-.15.3.3 0 0 1-.02-.32c.03-.08.1-.13.19-.15.08-.03.23-.06.42-.11l.27-.07c.59-.18 1-.42 1.24-.7.13-.16.2-.3.22-.42a.55.55 0 0 0-.06-.38.97.97 0 0 0-.35-.35A1.89 1.89 0 0 0 7 10c-.16 0-.31.02-.47.03-.15.01-.3.02-.46.02a4.01 4.01 0 0 1-3.37-1.7A3.65 3.65 0 0 1 2 6.01c0-.6.2-1.15.66-1.57C3.15 4 3.84 3.87 4.5 4.17c.27.12.53.3.76.53a4.2 4.2 0 0 0 .8-1.47A.32.32 0 0 1 6.37 3a.4.4 0 0 1 .15.04l.08.04c.27.14.64.39 1 .78a5.53 5.53 0 0 1 .76.98c.08.14.15.28.2.42l.13.35a3.91 3.91 0 0 0 .16-.63c.07-.36.09-.77.07-1.13a.42.42 0 0 1 .18-.36.38.38 0 0 1 .4 0 .4.4 0 0 1 .18.30v.01c.03.14.1.49.1.86v.58a3.07 3.07 0 0 1-.1.66l-.02.07a5.52 5.52 0 0 0 .78-1.17c.24-.45.37-.82.44-1.04a.39.39 0 0 1 .21-.22.38.38 0 0 1 .35.04c.07.05.12.12.14.2.01.09 0 .18-.07.3-.1.2-.26.46-.46.72a7.58 7.58 0 0 1-.69.78v.03c.3.1.59.08.82-.2.12-.15.34-.47.53-.8a.4.4 0 0 1 .24-.18.38.38 0 0 1 .31.06c.1.07.16.17.16.27.01.07-.01.18-.16.27v.01l-.06.04a2.36 2.36 0 0 1-.69.33 2.39 2.39 0 0 1-1.24.06c-.05.16-.11.31-.18.46a5.73 5.73 0 0 1-1.3 1.94c.32.12.68.21 1.05.28.37.06.75.1 1.12.12a.4.4 0 0 1 .35.36c.01.13-.05.25-.16.32-.1.07-.24.08-.36.04-.19-.07-.38-.16-.56-.26v.09h.02Z"
                fill="#0088cc"
              />
            </svg>
            Telegram
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
