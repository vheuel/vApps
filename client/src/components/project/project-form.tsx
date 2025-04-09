import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Project, insertProjectSchema, categoryEnum } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InfoIcon, Loader2, Globe, CheckIcon, Upload, X, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type ProjectFormValues = z.infer<typeof insertProjectSchema>;

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormValues>;
  onSubmit: (values: ProjectFormValues) => void;
  isSubmitting: boolean;
  mode: "create" | "edit";
}

export default function ProjectForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  mode,
}: ProjectFormProps) {
  const { toast } = useToast();
  const [charactersLeft, setCharactersLeft] = useState(
    200 - (defaultValues?.description?.length || 0)
  );
  const [iconPreview, setIconPreview] = useState<string | null>(defaultValues?.iconUrl || null);
  const [defaultIcon, setDefaultIcon] = useState<string | null>(null);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      websiteUrl: defaultValues?.websiteUrl || "",
      iconUrl: defaultValues?.iconUrl || "",
      category: defaultValues?.category || undefined,
    },
  });

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCharactersLeft(200 - value.length);
  };

  useEffect(() => {
    // Fetch default project icon from settings
    const fetchDefaultIcon = async () => {
      try {
        const response = await apiRequest("GET", "/api/site-settings");
        if (response.ok) {
          const data = await response.json();
          if (data.defaultProjectIcon) {
            setDefaultIcon(data.defaultProjectIcon);
          }
        }
      } catch (error) {
        console.error("Error fetching default icon:", error);
      }
    };
    
    fetchDefaultIcon();
  }, []);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setIconPreview(base64String);
      form.setValue("iconUrl", base64String);
    };
    reader.readAsDataURL(file);
  };

  const removeIcon = () => {
    setIconPreview(null);
    form.setValue("iconUrl", "");
  };

  const handleFormSubmit = (values: ProjectFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Project Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Web3 Project" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Description <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your project in a clear and concise way"
                  rows={4}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleDescriptionChange(e);
                  }}
                />
              </FormControl>
              <div className="text-right text-sm text-muted-foreground">
                {charactersLeft}/200
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Website URL <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="flex rounded-md">
                  <div className="relative flex items-center">
                    <Globe className="absolute left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      className="pl-10"
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Category <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoryEnum.options.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="iconUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Icon</FormLabel>
              <div className="space-y-2">
                {iconPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={iconPreview}
                      alt="Project Icon"
                      className="w-16 h-16 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={removeIcon}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : defaultIcon ? (
                  <div className="flex flex-col items-start gap-2">
                    <div className="text-sm text-muted-foreground">Current default icon:</div>
                    <img
                      src={defaultIcon}
                      alt="Default Project Icon"
                      className="w-16 h-16 object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-16 w-16 border-2 border-dashed border-gray-300 rounded-md">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => document.getElementById("project-icon-upload")?.click()}
                    className="flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Icon
                  </Button>
                  <input
                    id="project-icon-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleIconUpload}
                  />
                  <input
                    type="hidden"
                    {...field}
                    value={field.value || ""}
                  />
                </div>
              </div>
              <FormDescription>
                Upload a custom icon or leave empty to use the default icon. Recommended size: 60x60px.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Alert className="bg-muted/50">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Submission Guidelines</AlertTitle>
          <AlertDescription>
            <ul className="list-disc space-y-1 pl-5 text-sm mt-2">
              <li>All submissions will be reviewed by our team</li>
              <li>Project must be related to the platform</li>
              <li>Provide accurate and concise information</li>
              <li>Ensure your website is functioning and accessible</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "create" ? "Submitting..." : "Updating..."}
            </>
          ) : (
            <>
              <CheckIcon className="mr-2 h-4 w-4" />
              {mode === "create" ? "Submit Project" : "Update Project"}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
