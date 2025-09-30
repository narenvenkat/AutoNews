import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { API } from "@/lib/api";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

const createJobSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(100, "Topic must be less than 100 characters"),
  language: z.string().default("en"),
  targetLength: z.number().min(30, "Minimum 30 seconds").max(300, "Maximum 300 seconds").default(90),
  autoPublish: z.boolean().default(false),
});

type CreateJobForm = z.infer<typeof createJobSchema>;

const predefinedTopics = [
  "Technology",
  "Artificial Intelligence", 
  "Climate Change",
  "Global Politics",
  "Economy",
  "Health & Medicine",
  "Science",
  "Sports",
  "Entertainment"
];

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
];

const targetLengths = [
  { value: 60, label: "1 minute (60s)" },
  { value: 90, label: "1.5 minutes (90s)" },
  { value: 120, label: "2 minutes (120s)" },
  { value: 180, label: "3 minutes (180s)" },
];

export default function CreateJob() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [customTopic, setCustomTopic] = useState(false);

  const form = useForm<CreateJobForm>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      topic: "",
      language: "en",
      targetLength: 90,
      autoPublish: false,
    },
  });

  const createJobMutation = useMutation({
    mutationFn: API.createJob,
    onSuccess: (job) => {
      toast({
        title: "Success",
        description: `Job ${job.id.slice(0, 8)}... created successfully`,
      });
      API.invalidateJobs();
      setLocation(`/jobs/${job.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to create job",
        variant: "destructive",
      });
      console.error("Create job error:", error);
    },
  });

  const onSubmit = (data: CreateJobForm) => {
    createJobMutation.mutate(data);
  };

  return (
    <div className="flex h-screen" data-testid="create-job-page">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4" data-testid="header">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900" data-testid="title">Create New Job</h2>
              <p className="text-slate-600" data-testid="subtitle">Configure a new automated news video job</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="border border-slate-200" data-testid="create-job-form">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Job Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Topic Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-900">Topic Selection</label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-600">Custom topic</span>
                          <Switch
                            checked={customTopic}
                            onCheckedChange={setCustomTopic}
                            data-testid="switch-custom-topic"
                          />
                        </div>
                      </div>
                      
                      {customTopic ? (
                        <FormField
                          control={form.control}
                          name="topic"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter your custom topic or keywords..."
                                  className="min-h-[100px]"
                                  data-testid="textarea-custom-topic"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Describe the topic you want to create a video about. Be specific for better results.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <FormField
                          control={form.control}
                          name="topic"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger data-testid="select-predefined-topic">
                                    <SelectValue placeholder="Select a topic" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {predefinedTopics.map((topic) => (
                                      <SelectItem key={topic} value={topic}>
                                        {topic}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormDescription>
                                Choose from our predefined topics for consistent results.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    {/* Language */}
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger data-testid="select-language">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {languages.map((lang) => (
                                  <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Language for both content fetching and TTS generation.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Target Length */}
                    <FormField
                      control={form.control}
                      name="targetLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Video Length</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value.toString()} 
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <SelectTrigger data-testid="select-target-length">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {targetLengths.map((length) => (
                                  <SelectItem key={length.value} value={length.value.toString()}>
                                    {length.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Target duration for the final video. Actual length may vary slightly.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Auto Publish */}
                    <FormField
                      control={form.control}
                      name="autoPublish"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Auto-publish to YouTube</FormLabel>
                            <FormDescription>
                              Automatically publish the video to YouTube when processing is complete.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-auto-publish"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Submit */}
                    <div className="flex items-center space-x-4 pt-6">
                      <Button
                        type="submit"
                        disabled={createJobMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                        data-testid="button-create-job"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {createJobMutation.isPending ? "Creating..." : "Create Job"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLocation("/")}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
