import { useState } from "react";
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
import { InfoIcon, Loader2, Globe, CheckIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { z } from "zod";

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
  const [charactersLeft, setCharactersLeft] = useState(
    200 - (defaultValues?.description?.length || 0)
  );

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
              <FormLabel>Icon URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="/placeholder.svg?height=60&width=60"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Leave empty to use the default icon
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Alert variant="outline" className="bg-muted/50">
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
