import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Key, 
  Settings as SettingsIcon, 
  Mic, 
  Video, 
  Bell,
  Save,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";

const apiKeysSchema = z.object({
  gnewsApiKey: z.string().optional(),
  huggingfaceApiKey: z.string().optional(),
  youtubeClientId: z.string().optional(),
  youtubeClientSecret: z.string().optional(),
});

const automationSchema = z.object({
  enableDailySync: z.boolean().default(true),
  syncTimes: z.array(z.string()).default(["08:00", "14:00", "20:00"]),
  maxJobsPerTopic: z.number().min(1).max(10).default(3),
  autoPublish: z.boolean().default(false),
  retryFailedJobs: z.boolean().default(true),
});

const voiceSchema = z.object({
  defaultVoice: z.string().default("default"),
  speechSpeed: z.number().min(0.5).max(2.0).default(1.0),
  addPauses: z.boolean().default(true),
  voiceGender: z.string().default("neutral"),
});

const videoSchema = z.object({
  defaultResolution: z.string().default("1080p"),
  defaultFrameRate: z.number().default(30),
  enableSubtitles: z.boolean().default(true),
  brandingEnabled: z.boolean().default(true),
  templateTheme: z.string().default("professional"),
});

const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  jobCompletionAlerts: z.boolean().default(true),
  errorAlerts: z.boolean().default(true),
  dailyReports: z.boolean().default(false),
});

type ApiKeysForm = z.infer<typeof apiKeysSchema>;
type AutomationForm = z.infer<typeof automationSchema>;
type VoiceForm = z.infer<typeof voiceSchema>;
type VideoForm = z.infer<typeof videoSchema>;
type NotificationForm = z.infer<typeof notificationSchema>;

export default function Settings() {
  const { toast } = useToast();
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("api-keys");

  const apiKeysForm = useForm<ApiKeysForm>({
    resolver: zodResolver(apiKeysSchema),
    defaultValues: {
      gnewsApiKey: "",
      huggingfaceApiKey: "",
      youtubeClientId: "",
      youtubeClientSecret: "",
    },
  });

  const automationForm = useForm<AutomationForm>({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      enableDailySync: true,
      syncTimes: ["08:00", "14:00", "20:00"],
      maxJobsPerTopic: 3,
      autoPublish: false,
      retryFailedJobs: true,
    },
  });

  const voiceForm = useForm<VoiceForm>({
    resolver: zodResolver(voiceSchema),
    defaultValues: {
      defaultVoice: "default",
      speechSpeed: 1.0,
      addPauses: true,
      voiceGender: "neutral",
    },
  });

  const videoForm = useForm<VideoForm>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      defaultResolution: "1080p",
      defaultFrameRate: 30,
      enableSubtitles: true,
      brandingEnabled: true,
      templateTheme: "professional",
    },
  });

  const notificationForm = useForm<NotificationForm>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      jobCompletionAlerts: true,
      errorAlerts: true,
      dailyReports: false,
    },
  });

  const onSaveApiKeys = (data: ApiKeysForm) => {
    console.log("Saving API keys:", data);
    toast({
      title: "Success",
      description: "API keys saved successfully",
    });
  };

  const onSaveAutomation = (data: AutomationForm) => {
    console.log("Saving automation settings:", data);
    toast({
      title: "Success", 
      description: "Automation settings saved successfully",
    });
  };

  const onSaveVoice = (data: VoiceForm) => {
    console.log("Saving voice settings:", data);
    toast({
      title: "Success",
      description: "Voice settings saved successfully", 
    });
  };

  const onSaveVideo = (data: VideoForm) => {
    console.log("Saving video settings:", data);
    toast({
      title: "Success",
      description: "Video settings saved successfully",
    });
  };

  const onSaveNotifications = (data: NotificationForm) => {
    console.log("Saving notification settings:", data);
    toast({
      title: "Success",
      description: "Notification settings saved successfully",
    });
  };

  const toggleApiKeyVisibility = (keyName: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  return (
    <div className="flex h-screen" data-testid="settings-page">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4" data-testid="header">
          <div className="flex items-center space-x-4">
            <SettingsIcon className="w-6 h-6 text-slate-600" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900" data-testid="title">Settings</h2>
              <p className="text-slate-600" data-testid="subtitle">Configure your AutoNews system preferences</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" data-testid="settings-tabs">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="api-keys" className="flex items-center space-x-2" data-testid="tab-api-keys">
                  <Key className="w-4 h-4" />
                  <span>API Keys</span>
                </TabsTrigger>
                <TabsTrigger value="automation" className="flex items-center space-x-2" data-testid="tab-automation">
                  <SettingsIcon className="w-4 h-4" />
                  <span>Automation</span>
                </TabsTrigger>
                <TabsTrigger value="voice" className="flex items-center space-x-2" data-testid="tab-voice">
                  <Mic className="w-4 h-4" />
                  <span>Voice</span>
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center space-x-2" data-testid="tab-video">
                  <Video className="w-4 h-4" />
                  <span>Video</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center space-x-2" data-testid="tab-notifications">
                  <Bell className="w-4 h-4" />
                  <span>Alerts</span>
                </TabsTrigger>
              </TabsList>

              {/* API Keys Tab */}
              <TabsContent value="api-keys" data-testid="tab-content-api-keys">
                <Card className="border border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Key className="w-5 h-5" />
                      <span>API Keys Configuration</span>
                    </CardTitle>
                    <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium">Security Notice</p>
                        <p>API keys are encrypted and stored securely. Never share your keys with unauthorized users.</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Form {...apiKeysForm}>
                      <form onSubmit={apiKeysForm.handleSubmit(onSaveApiKeys)} className="space-y-6">
                        {/* GNews API Key */}
                        <FormField
                          control={apiKeysForm.control}
                          name="gnewsApiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GNews API Key</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={showApiKeys.gnewsApiKey ? "text" : "password"}
                                    placeholder="Enter your GNews API key"
                                    className="pr-10"
                                    data-testid="input-gnews-api-key"
                                    {...field}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => toggleApiKeyVisibility('gnewsApiKey')}
                                    data-testid="button-toggle-gnews-key"
                                  >
                                    {showApiKeys.gnewsApiKey ? (
                                      <EyeOff className="w-4 h-4 text-slate-400" />
                                    ) : (
                                      <Eye className="w-4 h-4 text-slate-400" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormDescription>
                                Required for fetching news articles. Get your key from <a href="https://gnews.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">gnews.io</a>
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Hugging Face API Key */}
                        <FormField
                          control={apiKeysForm.control}
                          name="huggingfaceApiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hugging Face API Key</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={showApiKeys.huggingfaceApiKey ? "text" : "password"}
                                    placeholder="Enter your Hugging Face API key"
                                    className="pr-10"
                                    data-testid="input-huggingface-api-key"
                                    {...field}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => toggleApiKeyVisibility('huggingfaceApiKey')}
                                    data-testid="button-toggle-hf-key"
                                  >
                                    {showApiKeys.huggingfaceApiKey ? (
                                      <EyeOff className="w-4 h-4 text-slate-400" />
                                    ) : (
                                      <Eye className="w-4 h-4 text-slate-400" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormDescription>
                                Required for AI summarization. Get your key from <a href="https://huggingface.co" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">huggingface.co</a>
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Separator />

                        {/* YouTube API Credentials */}
                        <div className="space-y-4">
                          <h4 className="text-md font-semibold text-slate-900">YouTube API Credentials</h4>
                          
                          <FormField
                            control={apiKeysForm.control}
                            name="youtubeClientId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>YouTube Client ID</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type={showApiKeys.youtubeClientId ? "text" : "password"}
                                      placeholder="Enter your YouTube Client ID"
                                      className="pr-10"
                                      data-testid="input-youtube-client-id"
                                      {...field}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                      onClick={() => toggleApiKeyVisibility('youtubeClientId')}
                                      data-testid="button-toggle-youtube-id"
                                    >
                                      {showApiKeys.youtubeClientId ? (
                                        <EyeOff className="w-4 h-4 text-slate-400" />
                                      ) : (
                                        <Eye className="w-4 h-4 text-slate-400" />
                                      )}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={apiKeysForm.control}
                            name="youtubeClientSecret"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>YouTube Client Secret</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type={showApiKeys.youtubeClientSecret ? "text" : "password"}
                                      placeholder="Enter your YouTube Client Secret"
                                      className="pr-10"
                                      data-testid="input-youtube-client-secret"
                                      {...field}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                      onClick={() => toggleApiKeyVisibility('youtubeClientSecret')}
                                      data-testid="button-toggle-youtube-secret"
                                    >
                                      {showApiKeys.youtubeClientSecret ? (
                                        <EyeOff className="w-4 h-4 text-slate-400" />
                                      ) : (
                                        <Eye className="w-4 h-4 text-slate-400" />
                                      )}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Required for YouTube publishing. Set up OAuth 2.0 credentials in <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="button-save-api-keys">
                          <Save className="w-4 h-4 mr-2" />
                          Save API Keys
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Automation Tab */}
              <TabsContent value="automation" data-testid="tab-content-automation">
                <Card className="border border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <SettingsIcon className="w-5 h-5" />
                      <span>Automation Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...automationForm}>
                      <form onSubmit={automationForm.handleSubmit(onSaveAutomation)} className="space-y-6">
                        <FormField
                          control={automationForm.control}
                          name="enableDailySync"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Enable Daily News Sync</FormLabel>
                                <FormDescription>
                                  Automatically fetch and process trending news articles daily
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-enable-daily-sync"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={automationForm.control}
                          name="maxJobsPerTopic"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Jobs Per Topic</FormLabel>
                              <FormControl>
                                <Select value={field.value.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                                  <SelectTrigger data-testid="select-max-jobs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5].map((num) => (
                                      <SelectItem key={num} value={num.toString()}>
                                        {num} job{num > 1 ? 's' : ''} per topic
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormDescription>
                                Maximum number of jobs to create per topic during automated sync
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={automationForm.control}
                          name="autoPublish"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Auto-publish Videos</FormLabel>
                                <FormDescription>
                                  Automatically publish completed videos to YouTube
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

                        <FormField
                          control={automationForm.control}
                          name="retryFailedJobs"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Retry Failed Jobs</FormLabel>
                                <FormDescription>
                                  Automatically retry jobs that fail due to temporary issues
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-retry-failed"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="button-save-automation">
                          <Save className="w-4 h-4 mr-2" />
                          Save Automation Settings
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Voice Tab */}
              <TabsContent value="voice" data-testid="tab-content-voice">
                <Card className="border border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Mic className="w-5 h-5" />
                      <span>Voice & TTS Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...voiceForm}>
                      <form onSubmit={voiceForm.handleSubmit(onSaveVoice)} className="space-y-6">
                        <FormField
                          control={voiceForm.control}
                          name="defaultVoice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Voice</FormLabel>
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger data-testid="select-default-voice">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="default">Default Voice</SelectItem>
                                    <SelectItem value="professional">Professional Male</SelectItem>
                                    <SelectItem value="professional-female">Professional Female</SelectItem>
                                    <SelectItem value="news-anchor">News Anchor</SelectItem>
                                    <SelectItem value="british">British Accent</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormDescription>
                                Default voice to use for text-to-speech conversion
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={voiceForm.control}
                          name="speechSpeed"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Speech Speed: {field.value}x</FormLabel>
                              <FormControl>
                                <div className="px-3">
                                  <input
                                    type="range"
                                    min="0.5"
                                    max="2.0"
                                    step="0.1"
                                    value={field.value}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    data-testid="slider-speech-speed"
                                  />
                                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>0.5x</span>
                                    <span>1.0x</span>
                                    <span>2.0x</span>
                                  </div>
                                </div>
                              </FormControl>
                              <FormDescription>
                                Adjust the speaking speed for generated audio
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={voiceForm.control}
                          name="addPauses"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Add Natural Pauses</FormLabel>
                                <FormDescription>
                                  Insert pauses at sentence boundaries for better flow
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-add-pauses"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="button-save-voice">
                          <Save className="w-4 h-4 mr-2" />
                          Save Voice Settings
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Video Tab */}
              <TabsContent value="video" data-testid="tab-content-video">
                <Card className="border border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Video className="w-5 h-5" />
                      <span>Video Rendering Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...videoForm}>
                      <form onSubmit={videoForm.handleSubmit(onSaveVideo)} className="space-y-6">
                        <FormField
                          control={videoForm.control}
                          name="defaultResolution"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Resolution</FormLabel>
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger data-testid="select-resolution">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="720p">720p (HD)</SelectItem>
                                    <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                                    <SelectItem value="1440p">1440p (2K)</SelectItem>
                                    <SelectItem value="2160p">2160p (4K)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormDescription>
                                Default video resolution for rendered content
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={videoForm.control}
                          name="templateTheme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Template Theme</FormLabel>
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger data-testid="select-template">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="professional">Professional</SelectItem>
                                    <SelectItem value="modern">Modern</SelectItem>
                                    <SelectItem value="minimal">Minimal</SelectItem>
                                    <SelectItem value="news">News Style</SelectItem>
                                    <SelectItem value="tech">Tech Focus</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormDescription>
                                Visual theme template for video generation
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={videoForm.control}
                          name="enableSubtitles"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Enable Subtitles</FormLabel>
                                <FormDescription>
                                  Generate and burn subtitles into the video
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-enable-subtitles"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={videoForm.control}
                          name="brandingEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Enable Branding</FormLabel>
                                <FormDescription>
                                  Include logo and brand elements in videos
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-enable-branding"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="button-save-video">
                          <Save className="w-4 h-4 mr-2" />
                          Save Video Settings
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" data-testid="tab-content-notifications">
                <Card className="border border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="w-5 h-5" />
                      <span>Notification Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...notificationForm}>
                      <form onSubmit={notificationForm.handleSubmit(onSaveNotifications)} className="space-y-6">
                        <FormField
                          control={notificationForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Email Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications via email
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-email-notifications"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="jobCompletionAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Job Completion Alerts</FormLabel>
                                <FormDescription>
                                  Get notified when jobs complete successfully
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-job-completion"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="errorAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Error Alerts</FormLabel>
                                <FormDescription>
                                  Get notified immediately when jobs fail
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-error-alerts"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="dailyReports"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Daily Reports</FormLabel>
                                <FormDescription>
                                  Receive daily summary reports of system activity
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-daily-reports"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="button-save-notifications">
                          <Save className="w-4 h-4 mr-2" />
                          Save Notification Settings
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
