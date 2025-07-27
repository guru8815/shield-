import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { Post } from './PostCard';

interface TrendingTopicsProps {
  posts: Post[];
}

const TrendingTopics = ({ posts }: TrendingTopicsProps) => {
  // Algorithm to identify trending topics based on frequency and recency
  const getTrendingTopics = () => {
    const tagFrequency: { [key: string]: { count: number; posts: Post[]; lastSeen: string } } = {};
    
    posts.forEach(post => {
      post.tags.forEach(tag => {
        if (!tagFrequency[tag]) {
          tagFrequency[tag] = { count: 0, posts: [], lastSeen: post.timestamp };
        }
        tagFrequency[tag].count++;
        tagFrequency[tag].posts.push(post);
        
        // Update last seen if this post is more recent
        if (isMoreRecent(post.timestamp, tagFrequency[tag].lastSeen)) {
          tagFrequency[tag].lastSeen = post.timestamp;
        }
      });
    });
    
    // Calculate trending score (frequency + recency)
    const trending = Object.entries(tagFrequency)
      .map(([tag, data]) => ({
        tag,
        count: data.count,
        posts: data.posts,
        lastSeen: data.lastSeen,
        trendingScore: data.count * getRecencyMultiplier(data.lastSeen)
      }))
      .filter(topic => topic.count >= 2) // Only show topics with at least 2 reports
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 5);
    
    return trending;
  };

  // Helper function to check if timestamp is more recent
  const isMoreRecent = (timestamp1: string, timestamp2: string): boolean => {
    const getHoursAgo = (timestamp: string): number => {
      if (timestamp.includes('hour')) return parseInt(timestamp);
      if (timestamp.includes('day')) return parseInt(timestamp) * 24;
      return 999; // Very old
    };
    
    return getHoursAgo(timestamp1) < getHoursAgo(timestamp2);
  };

  // Calculate recency multiplier for trending algorithm
  const getRecencyMultiplier = (timestamp: string): number => {
    if (timestamp.includes('hour')) {
      const hours = parseInt(timestamp);
      if (hours <= 6) return 3; // Very recent
      if (hours <= 24) return 2; // Recent
      return 1.5; // Somewhat recent
    }
    if (timestamp.includes('day')) {
      const days = parseInt(timestamp);
      if (days <= 1) return 1.2;
      if (days <= 3) return 1;
      return 0.8;
    }
    return 0.5; // Very old
  };

  const trendingTopics = getTrendingTopics();

  if (trendingTopics.length === 0) {
    return null;
  }

  return (
    <Card className="w-full bg-gradient-to-br from-orange-500/5 to-red-500/5 border border-orange-200/20 dark:border-orange-800/20">
      <CardHeader>
        <CardTitle className="flex items-center text-lg text-orange-700 dark:text-orange-300">
          <TrendingUp className="mr-2 h-5 w-5" />
          Trending Issues
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={topic.tag} className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/30">
              <div className="flex items-center gap-3">
                {index < 3 && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                <div>
                  <Badge variant="destructive" className="mb-1">
                    {topic.tag}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {topic.count} reports • Last seen {topic.lastSeen}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  #{index + 1}
                </div>
                <div className="text-xs text-muted-foreground">
                  Trending
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingTopics;