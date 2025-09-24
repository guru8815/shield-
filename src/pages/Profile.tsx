import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  MapPin, 
  Edit3, 
  Save, 
  X, 
  FileText, 
  Clock, 
  Shield, 
  Lock, 
  Eye,
  Bell,
  Database,
  Key,
  Search,
  UserPlus,
  UserMinus,
  Users
} from 'lucide-react';
import Header from '@/components/Header';
import ChatToggle from '@/components/ChatToggle';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
  is_banned: boolean;
  privacy_mode?: string;
}

interface UserPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  location?: string;
  media_urls?: string[];
  status: string;
}

interface SearchResult {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  privacy_mode?: string;
}

interface FollowData {
  followers_count: number;
  following_count: number;
  is_following: boolean;
}

const Profile = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [followData, setFollowData] = useState<FollowData>({ followers_count: 0, following_count: 0, is_following: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    username: '',
    privacy_mode: 'public'
  });
  
  // Settings state
  const [settings, setSettings] = useState({
    anonymousMode: false,
    notifications: true,
    dataSharing: false
  });

  const { user, loading: authLoading } = useAuth();

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setProfile(data);
        setEditForm({
          display_name: data.display_name || '',
          username: data.username || '',
          privacy_mode: data.privacy_mode || 'public'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    }
  };

  const fetchFollowData = async () => {
    if (!user) return;

    try {
      // Get followers count
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);

      // Get following count
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id);

      setFollowData({
        followers_count: followersCount || 0,
        following_count: followingCount || 0,
        is_following: false
      });
    } catch (error) {
      console.error('Error fetching follow data:', error);
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

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const updateProfile = async () => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editForm.display_name,
          username: editForm.username,
          privacy_mode: editForm.privacy_mode,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      
      setIsEditing(false);
      fetchUserProfile(); // Refresh profile data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim() || !user) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, privacy_mode')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .neq('id', user.id) // Exclude current user
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        return;
      }

      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
    setIsSearching(false);
  };

  const followUser = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) {
        console.error('Error following user:', error);
        toast({
          title: "Error",
          description: "Failed to follow user",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "User followed successfully"
      });
      
      fetchFollowData();
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) {
        console.error('Error unfollowing user:', error);
        toast({
          title: "Error",
          description: "Failed to unfollow user",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "User unfollowed successfully"
      });
      
      fetchFollowData();
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserPosts();
      fetchFollowData();
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/10 opacity-20 blur-[100px]"></div>
      </div>

      <Header />
      <ChatToggle isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                      value={editForm.display_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Enter your display name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editForm.username}
                      onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter your username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="privacy-mode">Profile Privacy</Label>
                    <Select
                      value={editForm.privacy_mode}
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, privacy_mode: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select privacy mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center space-x-2">
                            <Eye className="h-4 w-4" />
                            <div>
                              <div>Public</div>
                              <div className="text-xs text-muted-foreground">Everyone can see your posts and profile</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <div>
                              <div>Private</div>
                              <div className="text-xs text-muted-foreground">Only followers can see your posts</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="secure">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4" />
                            <div>
                              <div>Secure</div>
                              <div className="text-xs text-muted-foreground">Posts visible but personal details hidden</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={updateProfile} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.display_name} />
                      <AvatarFallback>
                        {profile?.display_name?.charAt(0)?.toUpperCase() || profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">{profile?.display_name || 'Anonymous User'}</h2>
                      <p className="text-muted-foreground">@{profile?.username}</p>
                      <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        Joined {profile ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="flex items-center mt-1">
                        {profile?.privacy_mode === 'public' && (
                          <Badge variant="secondary" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Public Profile
                          </Badge>
                        )}
                        {profile?.privacy_mode === 'private' && (
                          <Badge variant="secondary" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            Private Profile
                          </Badge>
                        )}
                        {profile?.privacy_mode === 'secure' && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Secure Profile
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                  
                  {/* Follow Stats */}
                  <div className="flex space-x-6 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{followData.followers_count}</div>
                      <div className="text-sm text-muted-foreground">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{followData.following_count}</div>
                      <div className="text-sm text-muted-foreground">Following</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search Users */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2 text-primary" />
                Find Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Search by username or display name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                
                {isSearching && (
                  <div className="text-center text-muted-foreground">Searching...</div>
                )}
                
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={result.avatar_url} alt={result.display_name} />
                            <AvatarFallback>
                              {result.display_name?.charAt(0)?.toUpperCase() || result.username?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{result.display_name || result.username}</div>
                            <div className="text-sm text-muted-foreground">@{result.username}</div>
                          </div>
                          {result.privacy_mode === 'private' && (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                          {result.privacy_mode === 'secure' && (
                            <Shield className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => followUser(result.id)}
                          className="flex items-center space-x-1"
                        >
                          <UserPlus className="h-4 w-4" />
                          <span>Follow</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {searchQuery && !isSearching && searchResults.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    No users found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Your Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="text-2xl font-bold text-primary">{posts.length}</div>
                  <div className="text-sm text-muted-foreground">Reports Submitted</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/20">
                  <div className="text-2xl font-bold text-secondary-foreground">
                    {profile ? Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Days Active</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Your Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reports submitted yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.slice(0, 5).map((post) => (
                    <div key={post.id} className="p-4 rounded-lg bg-background/50 border border-border/20">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">{post.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {post.content.substring(0, 100)}...
                          </p>
                          <div className="flex items-center mt-2 text-xs text-muted-foreground space-x-4">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                            {post.location && (
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {post.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant={post.status === 'active' ? 'default' : 'secondary'}>
                          {post.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy & Security Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Privacy Settings */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-primary" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Anonymous Mode</p>
                    <p className="text-xs text-muted-foreground">Hide your identity in reports</p>
                  </div>
                  <Switch
                    checked={settings.anonymousMode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, anonymousMode: checked }))}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Get updates about your reports</p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Sharing</p>
                    <p className="text-xs text-muted-foreground">Share data for analytics</p>
                  </div>
                  <Switch
                    checked={settings.dataSharing}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, dataSharing: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Status */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">End-to-End Encryption</p>
                      <p className="text-xs text-muted-foreground">Your data is encrypted</p>
                    </div>
                  </div>
                  <Shield className="h-4 w-4 text-green-500" />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Secure Storage</p>
                      <p className="text-xs text-muted-foreground">Data stored securely</p>
                    </div>
                  </div>
                  <Database className="h-4 w-4 text-green-500" />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">Recommended for security</p>
                    </div>
                  </div>
                  <Key className="h-4 w-4 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;