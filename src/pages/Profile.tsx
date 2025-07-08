
import React, { useState } from 'react';
import Header from '@/components/Header';
import ChatToggle from '@/components/ChatToggle';
import TelegramChat from '@/components/TelegramChat';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Shield, FileText, Award, Settings, Lock } from 'lucide-react';

const Profile = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const userStats = [
    { label: "Reports Submitted", value: "12", icon: FileText },
    { label: "Impact Score", value: "856", icon: Award },
    { label: "Privacy Level", value: "Maximum", icon: Lock },
    { label: "Community Rank", value: "Guardian", icon: Shield }
  ];

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
              <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/10 mb-8">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">Anonymous Guardian</h2>
                      <p className="text-muted-foreground mb-3">
                        Protecting truth and transparency since joining SHIELD
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-500/10 text-green-500">Verified</Badge>
                        <Badge className="bg-blue-500/10 text-blue-500">Guardian Level</Badge>
                      </div>
                    </div>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {userStats.map((stat, index) => (
                  <Card key={index} className="bg-card/50 backdrop-blur-sm border-2 border-primary/10">
                    <CardContent className="p-6 text-center">
                      <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Activity */}
              <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/10 mb-8">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted/20">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium">Submitted anonymous report</p>
                      <p className="text-sm text-muted-foreground">Government transparency case #1247</p>
                    </div>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted/20">
                    <Award className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <p className="font-medium">Earned Guardian badge</p>
                      <p className="text-sm text-muted-foreground">For contributing to community safety</p>
                    </div>
                    <span className="text-sm text-muted-foreground">1 day ago</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted/20">
                    <Shield className="h-5 w-5 text-purple-500" />
                    <div className="flex-1">
                      <p className="font-medium">Security level upgraded</p>
                      <p className="text-sm text-muted-foreground">Enhanced encryption enabled</p>
                    </div>
                    <span className="text-sm text-muted-foreground">3 days ago</span>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy & Security */}
              <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                      <div>
                        <p className="font-medium">Anonymous Mode</p>
                        <p className="text-sm text-muted-foreground">All submissions are completely anonymous</p>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                      <div>
                        <p className="font-medium">End-to-End Encryption</p>
                        <p className="text-sm text-muted-foreground">Your data is encrypted at all times</p>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                      <div>
                        <p className="font-medium">Secure Communications</p>
                        <p className="text-sm text-muted-foreground">Protected chat channels</p>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500">Protected</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
