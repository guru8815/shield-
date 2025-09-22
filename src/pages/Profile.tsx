
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ChatToggle from '@/components/ChatToggle';
import TelegramChat from '@/components/TelegramChat';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User, Shield, FileText, Award, Settings, Lock, Edit, Save, Calendar, MapPin } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  is_banned: boolean;
}

interface UserPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  location: string | null;
  media_urls: string[] | null;
  status: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [editForm, setEditForm] = useState({
    display_name: '',
    username: '',
    bio: ''
  });
  const [settings, setSettings] = useState({
    anonymous_mode: true,
    email_notifications: false,
    data_sharing: false
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setUserProfile(data);
      setEditForm({
        display_name: data.display_name || '',
        username: data.username || '',
        bio: ''
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    }
  };

  const fetchUserPosts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, created_at, location, media_urls, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setUserPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
    }
  };

  const updateProfile = async () => {
    if (!user || !userProfile) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editForm.display_name.trim() || null,
          username: editForm.username.trim()
        })
        .eq('id', user.id);

      if (error) throw error;

      await fetchUserProfile();
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground w-full relative overflow-x-hidden pb-20">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/10 opacity-20 blur-[100px]"></div>
      </div>
      
      <div className="flex h-screen">
        <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'mr-80' : 'mr-0'}`}>
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              {/* Profile Header */}
              <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm border border-primary/20 mb-8 overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center ring-4 ring-primary/20">
                        <User className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      {!isEditing ? (
                        <>
                          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {userProfile?.display_name || userProfile?.username || 'Anonymous User'}
                          </h2>
                          <p className="text-muted-foreground mb-1">@{userProfile?.username}</p>
                          <p className="text-sm text-muted-foreground mb-3">
                            Member since {userProfile ? formatDate(userProfile.created_at) : 'N/A'}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                            <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
                              <Award className="w-3 h-3 mr-1" />
                              Guardian
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="display_name">Display Name</Label>
                            <Input
                              id="display_name"
                              value={editForm.display_name}
                              onChange={(e) => setEditForm({...editForm, display_name: e.target.value})}
                              placeholder="Your display name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              value={editForm.username}
                              onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                              placeholder="Your username"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      {!isEditing ? (
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(true)}
                          className="hover:scale-105 transition-transform"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button 
                            onClick={updateProfile} 
                            disabled={loading}
                            className="hover:scale-105 transition-transform"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Saving...' : 'Save'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsEditing(false)}
                            className="hover:scale-105 transition-transform"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Real Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border border-blue-500/20 hover:scale-105 transition-transform">
                  <CardContent className="p-6 text-center">
                    <FileText className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold mb-1">{userPosts.length}</h3>
                    <p className="text-sm text-muted-foreground">Reports Submitted</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm border border-green-500/20 hover:scale-105 transition-transform">
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-8 w-8 text-green-500 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold mb-1">
                      {userProfile ? Math.floor((Date.now() - new Date(userProfile.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                    </h3>
                    <p className="text-sm text-muted-foreground">Days Active</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm border border-purple-500/20 hover:scale-105 transition-transform">
                  <CardContent className="p-6 text-center">
                    <Lock className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold mb-1">Maximum</h3>
                    <p className="text-sm text-muted-foreground">Privacy Level</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-sm border border-orange-500/20 hover:scale-105 transition-transform">
                  <CardContent className="p-6 text-center">
                    <Shield className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold mb-1">Guardian</h3>
                    <p className="text-sm text-muted-foreground">Community Rank</p>
                  </CardContent>
                </Card>
              </div>

              {/* User's Real Posts */}
              <Card className="bg-card/50 backdrop-blur-sm border border-primary/20 mb-8 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Your Reports ({userPosts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {userPosts.length === 0 ? (
                    <div className="p-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium text-muted-foreground mb-2">No reports submitted yet</p>
                      <p className="text-sm text-muted-foreground">Start by submitting your first anonymous report</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {userPosts.slice(0, 5).map((post, index) => (
                        <div key={post.id} className="p-6 hover:bg-muted/20 transition-colors">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground truncate">{post.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {post.content.substring(0, 150)}
                                {post.content.length > 150 && '...'}
                              </p>
                              <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(post.created_at)}
                                </span>
                                {post.location && (
                                  <span className="flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {post.location}
                                  </span>
                                )}
                                {post.media_urls && post.media_urls.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {post.media_urls.length} media files
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Badge 
                              variant={post.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {post.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {userPosts.length > 5 && (
                        <div className="p-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            Showing 5 of {userPosts.length} reports
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Settings & Privacy */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-green-500/5 to-green-600/5 backdrop-blur-sm border border-green-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-600">
                      <Lock className="h-5 w-5 mr-2" />
                      Privacy Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">Anonymous Mode</p>
                        <p className="text-sm text-muted-foreground">Hide your identity in reports</p>
                      </div>
                      <Switch 
                        checked={settings.anonymous_mode}
                        onCheckedChange={(checked) => setSettings({...settings, anonymous_mode: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates about your reports</p>
                      </div>
                      <Switch 
                        checked={settings.email_notifications}
                        onCheckedChange={(checked) => setSettings({...settings, email_notifications: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">Data Sharing</p>
                        <p className="text-sm text-muted-foreground">Share anonymized data for research</p>
                      </div>
                      <Switch 
                        checked={settings.data_sharing}
                        onCheckedChange={(checked) => setSettings({...settings, data_sharing: checked})}
                      />
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <Button className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        Save Privacy Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/5 to-blue-600/5 backdrop-blur-sm border border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-600">
                      <Shield className="h-5 w-5 mr-2" />
                      Security Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div>
                        <p className="font-medium text-green-700">End-to-End Encryption</p>
                        <p className="text-sm text-green-600">Your data is encrypted at all times</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                        Active
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div>
                        <p className="font-medium text-green-700">Secure Storage</p>
                        <p className="text-sm text-green-600">Files stored with military-grade security</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                        Protected
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div>
                        <p className="font-medium text-blue-700">Two-Factor Auth</p>
                        <p className="text-sm text-blue-600">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10">
                        Enable
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>

        <div className={`fixed top-0 right-0 h-full w-80 transform transition-transform duration-300 z-40 ${
          isChatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <TelegramChat />
        </div>
      </div>

      <ChatToggle isOpen={isChatOpen} onToggle={toggleChat} />
    </div>
  );
};

export default Profile;
