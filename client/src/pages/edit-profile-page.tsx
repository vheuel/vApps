import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";

// Schema for profile edit
const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Please enter a valid email address"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  bio: z.string().max(200, "Bio should be less than 200 characters").optional(),
  location: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  avatarUrl: z.string().optional(),
  headerImage: z.string().optional(),
});

// Schema for password change
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function EditProfilePage() {
  const { user, update } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  const [isCompressing, setIsCompressing] = useState(false);

  // Form untuk edit profile
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      website: user?.website || "",
      bio: user?.bio || "",
      location: user?.location || "",
      company: user?.company || "",
      avatarUrl: user?.avatarUrl || "",
      headerImage: user?.headerImage || "",
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        username: user.username || "",
        email: user.email || "",
        website: user.website || "",
        bio: user.bio || "",
        location: user.location || "",
        company: user.company || "",
        avatarUrl: user.avatarUrl || "",
        headerImage: user.headerImage || "",
      });
    }
  }, [user, profileForm]);

  // Form untuk ganti password
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      // Log data being sent untuk debugging
      console.log("Sending profile update data:", data);
      
      // Jika avatarUrl adalah base64 dan sangat panjang, potong untuk logging
      const loggableData = {...data};
      if (loggableData.avatarUrl && loggableData.avatarUrl.length > 100) {
        loggableData.avatarUrl = loggableData.avatarUrl.substring(0, 100) + '...';
      }
      console.log("Profile update data (truncated):", loggableData);
      
      const res = await apiRequest("PUT", "/api/user/update", data);
      if (!res.ok) {
        // Mencoba mendapatkan informasi error dari response
        const errorData = await res.json();
        console.error("Profile update error:", errorData);
        throw new Error(errorData.message || "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      update(data);
      navigate("/profile");
    },
    onError: (error: Error) => {
      console.error("Profile update mutation error:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Password update mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { 
      currentPassword: string; 
      newPassword: string; 
    }) => {
      const res = await apiRequest("PUT", "/api/user/update", {
        password: data.newPassword,
        currentPassword: data.currentPassword,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      passwordForm.reset();
      navigate("/profile");
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    updatePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <button onClick={() => navigate("/profile")} className="text-gray-500 dark:text-gray-400 mr-4">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">Edit Profile</h1>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {/* User Avatar */}
          <div className="flex justify-center mb-6">
            <Avatar className="h-24 w-24 bg-gray-100 border-4 border-white dark:border-gray-800 shadow-lg">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
              <AvatarFallback className="bg-gray-200">
                <UserIcon className="h-12 w-12 text-gray-500" />
              </AvatarFallback>
            </Avatar>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="pt-4">
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your email address" type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Tell a little about yourself" 
                            className="resize-none"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Your location" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company/Organization</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Your company or organization" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={profileForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://yourwebsite.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar</FormLabel>
                        <div className="space-y-2">
                          {field.value && (
                            <div className="mt-2 mb-4 flex justify-center">
                              <Avatar className="h-24 w-24 border-2 border-primary">
                                <AvatarImage src={field.value} alt="Preview" />
                                <AvatarFallback>
                                  <UserIcon className="h-12 w-12 text-gray-400" />
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          )}
                          <div className="flex items-center gap-4">
                            <FormControl>
                              <Input 
                                type="file" 
                                accept="image/*"
                                className="hidden"
                                id="avatar-input"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setIsCompressing(true);
                                    try {
                                      // Kompresi gambar
                                      const options = {
                                        maxSizeMB: 0.5, // ukuran maksimal 500KB
                                        maxWidthOrHeight: 1200,
                                        useWebWorker: true
                                      };
                                      
                                      const compressedFile = await imageCompression(file, options);
                                      
                                      // Konversi ke base64
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        if (event.target?.result) {
                                          field.onChange(event.target.result as string);
                                          setIsCompressing(false);
                                        }
                                      };
                                      reader.readAsDataURL(compressedFile);
                                    } catch (error) {
                                      console.error("Gagal mengompresi gambar:", error);
                                      toast({
                                        title: "Error saat mengompresi gambar",
                                        description: "Silakan coba gambar yang lebih kecil.",
                                        variant: "destructive",
                                      });
                                      setIsCompressing(false);
                                    }
                                  }
                                }}
                              />
                            </FormControl>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => document.getElementById('avatar-input')?.click()}
                              disabled={isCompressing}
                            >
                              {isCompressing ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Mengompresi...
                                </>
                              ) : "Pilih Gambar dari Galeri"}
                            </Button>
                            {field.value && (
                              <Button 
                                type="button" 
                                variant="destructive" 
                                onClick={() => field.onChange('')}
                                disabled={isCompressing}
                              >
                                Hapus
                              </Button>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Unggah gambar avatar Anda. Format yang didukung: JPG, PNG, GIF.
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="headerImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Header Image</FormLabel>
                        <div className="space-y-2">
                          {field.value && (
                            <div className="mt-2 mb-4">
                              <div className="w-full h-32 rounded-lg overflow-hidden relative">
                                <img 
                                  src={field.value} 
                                  alt="Header Preview" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-4">
                            <FormControl>
                              <Input 
                                type="file" 
                                accept="image/*"
                                className="hidden"
                                id="header-input"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setIsCompressing(true);
                                    try {
                                      // Kompresi gambar
                                      const options = {
                                        maxSizeMB: 1, // ukuran maksimal 1MB
                                        maxWidthOrHeight: 1920,
                                        useWebWorker: true
                                      };
                                      
                                      const compressedFile = await imageCompression(file, options);
                                      
                                      // Konversi ke base64
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        if (event.target?.result) {
                                          field.onChange(event.target.result as string);
                                          setIsCompressing(false);
                                        }
                                      };
                                      reader.readAsDataURL(compressedFile);
                                    } catch (error) {
                                      console.error("Gagal mengompresi gambar:", error);
                                      toast({
                                        title: "Error saat mengompresi gambar",
                                        description: "Silakan coba gambar yang lebih kecil.",
                                        variant: "destructive",
                                      });
                                      setIsCompressing(false);
                                    }
                                  }
                                }}
                              />
                            </FormControl>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => document.getElementById('header-input')?.click()}
                              disabled={isCompressing}
                            >
                              {isCompressing ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Mengompresi...
                                </>
                              ) : "Pilih Gambar Header"}
                            </Button>
                            {field.value && (
                              <Button 
                                type="button" 
                                variant="destructive" 
                                onClick={() => field.onChange('')}
                                disabled={isCompressing}
                              >
                                Hapus
                              </Button>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Unggah gambar header untuk profil Anda. Ukuran yang direkomendasikan: 1500x500 piksel.
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-4 mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate("/profile")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="password" className="pt-4">
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Your current password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Your new password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Confirm new password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-4 mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate("/profile")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updatePasswordMutation.isPending}
                    >
                      {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}