
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Heart, MessageCircle, Share2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { SocialPost } from '@/pages/Posts';

interface SocialPostCardProps {
  post: SocialPost;
}

const SocialPostCard = ({ post }: SocialPostCardProps) => {
  const [likes, setLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    "Great investigation work!",
    "This is very important for our community."
  ]);

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);
    }
  };

  const handleShare = () => {
    toast({
      title: "Shared!",
      description: "Post has been shared successfully.",
      duration: 3000,
    });
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments([...comments, newComment]);
      setNewComment('');
      toast({
        title: "Comment Added",
        description: "Your comment has been posted.",
        duration: 2000,
      });
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/20 hover:border-primary/20 transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{post.title}</CardTitle>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1.5" />
                {post.timestamp}
              </span>
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1.5" />
                {post.location}
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
            {post.tags.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground whitespace-pre-wrap mb-4">{post.content}</p>
        
        {/* Media Display */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="mb-4">
            {post.media_urls.length === 1 ? (
              // Single media item
              <div className="rounded-lg overflow-hidden border border-border">
                {post.media_urls[0].includes('evidence-images') || /\.(jpg|jpeg|png|gif|webp)$/i.test(post.media_urls[0]) ? (
                  <img 
                    src={post.media_urls[0]} 
                    alt="Evidence" 
                    className="w-full h-auto object-cover max-h-96"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : post.media_urls[0].includes('evidence-videos') || /\.(mp4|mpeg|mov|avi)$/i.test(post.media_urls[0]) ? (
                  <video 
                    src={post.media_urls[0]} 
                    controls 
                    className="w-full h-auto max-h-96"
                    onError={(e) => {
                      (e.target as HTMLVideoElement).style.display = 'none';
                    }}
                  />
                ) : null}
              </div>
            ) : (
              // Multiple media items - grid layout
              <div className="grid grid-cols-2 gap-2">
                {post.media_urls.slice(0, 4).map((url, index) => (
                  <div key={index} className="rounded-lg overflow-hidden border border-border aspect-square relative">
                    {url.includes('evidence-images') || /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? (
                      <img 
                        src={url} 
                        alt={`Evidence ${index + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : url.includes('evidence-videos') || /\.(mp4|mpeg|mov|avi)$/i.test(url) ? (
                      <video 
                        src={url} 
                        controls 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLVideoElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    {post.media_urls.length > 4 && index === 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                        +{post.media_urls.length - 4} more
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Fallback for old posts without media_urls but with type image */}
        {(!post.media_urls || post.media_urls.length === 0) && post.type === 'image' && (
          <div className="mb-4 rounded-lg overflow-hidden border border-border">
            <img 
              src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=2069&auto=format&fit=crop" 
              alt="Post content" 
              className="w-full h-auto object-cover" 
            />
          </div>
        )}

        {/* Social Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-muted-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments + comments.length - 2}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-2 text-muted-foreground"
            >
              <Share2 className="h-4 w-4" />
              <span>{post.shares}</span>
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="space-y-3 mb-4">
              {comments.map((comment, index) => (
                <div key={index} className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm">{comment}</p>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleComment} className="flex items-center space-x-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1"
              />
              <Button type="submit" size="icon" className="h-8 w-8">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialPostCard;
