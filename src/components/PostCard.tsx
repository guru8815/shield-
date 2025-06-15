
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export interface Post {
  id: number;
  title: string;
  content: string;
  timestamp: string;
  tags: string[];
  type: 'text' | 'image' | 'video';
}

const PostCard = ({ post }: { post: Post }) => {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/20 hover:border-primary/20 transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
                <CardTitle>{post.title}</CardTitle>
                <CardDescription className="flex items-center text-sm mt-1">
                    <Clock className="h-4 w-4 mr-1.5" />
                    {post.timestamp}
                </CardDescription>
            </div>
            <div className="flex gap-2 flex-shrink-0">
                {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>
        {post.type === 'image' && (
          <div className="mt-4 rounded-lg overflow-hidden border border-border">
            <img src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=2069&auto=format&fit=crop" alt="Evidence" className="w-full h-auto object-cover" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;
