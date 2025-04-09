import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteSettings } from "@shared/schema";
import { AiOutlineLoading } from "react-icons/ai";
import { Paintbrush, Upload, X } from "lucide-react";

const siteSettingsFormSchema = z.object({
  siteName: z.string().min(1, {
    message: "Site name is required",
  }),
  siteDescription: z.string().min(10, {
    message: "Site description should be at least 10 characters",
  }),
  logoUrl: z.string().optional(),
  primaryColor: z.string().min(1, {
    message: "Primary color is required",
  }),
  footerText: z.string().min(1, {
    message: "Footer text is required",
  }),
  defaultProjectIcon: z.string().optional(),
});

type SiteSettingsFormValues = z.infer<typeof siteSettingsFormSchema>;

interface SiteSettingsFormProps {
  initialData: SiteSettings;
  onSettingsSaved: () => void;
}

export function SiteSettingsForm({ initialData, onSettingsSaved }: SiteSettingsFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logoUrl || null);
  const [defaultIconPreview, setDefaultIconPreview] = useState<string | null>(initialData?.defaultProjectIcon || null);

  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsFormSchema),
    defaultValues: {
      siteName: initialData?.siteName || "Web3 Project",
      siteDescription: initialData?.siteDescription || "The cutting-edge Web3 project discovery platform connecting blockchain innovators.",
      logoUrl: initialData?.logoUrl || "",
      primaryColor: initialData?.primaryColor || "#3B82F6",
      footerText: initialData?.footerText || "© 2025 Web3 Project. All Rights Reserved.",
      defaultProjectIcon: initialData?.defaultProjectIcon || "",
    },
  });

  const onSubmit = async (data: SiteSettingsFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("PUT", "/api/admin/site-settings", data);
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Site settings updated successfully",
        });
        onSettingsSaved();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update site settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating site settings:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Logo image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setLogoPreview(base64String);
      form.setValue("logoUrl", base64String);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    form.setValue("logoUrl", "");
  };
  
  const handleDefaultIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Icon image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setDefaultIconPreview(base64String);
      form.setValue("defaultProjectIcon", base64String);
    };
    reader.readAsDataURL(file);
  };
  
  const removeDefaultIcon = () => {
    setDefaultIconPreview(null);
    form.setValue("defaultProjectIcon", "");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="siteName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Name</FormLabel>
              <FormControl>
                <Input placeholder="My Web3 Project" {...field} />
              </FormControl>
              <FormDescription>
                This will be displayed in the header and browser tab.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="siteDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="The cutting-edge Web3 project discovery platform connecting blockchain innovators."
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                This description will be displayed in the footer and may be used for SEO.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo</FormLabel>
              <div className="space-y-2">
                {logoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={logoPreview}
                      alt="Site Logo"
                      className="max-h-16 rounded"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-16 w-32 border-2 border-dashed border-gray-300 rounded-md">
                    <p className="text-sm text-gray-500">No logo</p>
                  </div>
                )}
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("logo-upload")?.click()}
                    className="flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </div>
              </div>
              <FormDescription>
                Recommended size: 200x50px. Max file size: 2MB.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="primaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Color</FormLabel>
              <div className="flex space-x-2">
                <FormControl>
                  <Input type="text" placeholder="#3B82F6" {...field} />
                </FormControl>
                <div
                  className="w-10 h-10 rounded border"
                  style={{ backgroundColor: field.value }}
                />
                <FormControl>
                  <Input
                    type="color"
                    className="w-10 h-10 p-1 cursor-pointer"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
              </div>
              <FormDescription>
                This color will be used for buttons, links, and accent elements.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="footerText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Footer Text</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="© 2025 My Web3 Project. All Rights Reserved."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Copyright and legal text shown in the website footer.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="defaultProjectIcon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Project Icon</FormLabel>
              <div className="space-y-2">
                {defaultIconPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={defaultIconPreview}
                      alt="Default Project Icon"
                      className="w-16 h-16 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={removeDefaultIcon}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-16 w-16 border-2 border-dashed border-gray-300 rounded-md">
                    <p className="text-sm text-gray-500">No icon</p>
                  </div>
                )}
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("default-icon-upload")?.click()}
                    className="flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Default Icon
                  </Button>
                  <input
                    id="default-icon-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleDefaultIconUpload}
                  />
                </div>
              </div>
              <FormDescription>
                This icon will be used for projects without a custom icon. Recommended size: 60x60px. Max file size: 2MB.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <AiOutlineLoading className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Settings
          </Button>
        </div>
      </form>
    </Form>
  );
}