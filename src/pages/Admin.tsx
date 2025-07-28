import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, FileText, Ban, Trash2, UserCheck } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  is_banned: boolean;
  ban_reason: string;
  created_at: string;
  last_seen: string;
  role?: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    display_name: string;
  } | null;
}

const Admin = () => {
  const { isAdmin, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchPosts();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.id)?.role || 'user'
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            username,
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data as any) || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive"
      });
    }
  };

  const banUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: true,
          ban_reason: banReason,
          banned_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User has been banned"
      });

      fetchUsers();
      setBanReason('');
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive"
      });
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: false,
          ban_reason: null,
          banned_at: null
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User has been unbanned"
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unban user",
        variant: "destructive"
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          status: 'deleted',
          deleted_reason: deleteReason
        })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post has been deleted"
      });

      fetchPosts();
      setDeleteReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole as 'admin' | 'moderator' | 'user'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated"
      });

      fetchUsers();
      setSelectedRole('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{posts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.is_banned).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Management */}
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.display_name || user.username}</span>
                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'moderator' ? 'secondary' : 'outline'}>
                          {user.role}
                        </Badge>
                        {user.is_banned && <Badge variant="destructive">Banned</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                      {user.ban_reason && (
                        <p className="text-sm text-destructive">Reason: {user.ban_reason}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update User Role</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Select onValueChange={setSelectedRole}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              onClick={() => updateUserRole(user.id, selectedRole)}
                              disabled={!selectedRole}
                            >
                              Update Role
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {user.is_banned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unbanUser(user.id)}
                        >
                          Unban
                        </Button>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Ban User</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Ban reason..."
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                              />
                              <Button
                                variant="destructive"
                                onClick={() => banUser(user.id)}
                              >
                                Ban User
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Posts Management */}
          <Card>
            <CardHeader>
              <CardTitle>Posts Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.filter(post => post.status === 'active').map((post) => (
                  <div key={post.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{post.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          by @{post.profiles?.username || 'Unknown'} • {new Date(post.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm mt-2">{post.content.substring(0, 100)}...</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Post</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Deletion reason..."
                              value={deleteReason}
                              onChange={(e) => setDeleteReason(e.target.value)}
                            />
                            <Button
                              variant="destructive"
                              onClick={() => deletePost(post.id)}
                            >
                              Delete Post
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;