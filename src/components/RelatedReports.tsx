import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from 'lucide-react';
import { Post } from './PostCard';

interface RelatedReportsProps {
  currentTags: string[];
  allPosts: Post[];
  excludeId?: number;
}

const RelatedReports = ({ currentTags, allPosts, excludeId }: RelatedReportsProps) => {
  // Algorithm to find related reports based on tags and content similarity
  const findRelatedReports = () => {
    const related = allPosts
      .filter(post => post.id !== excludeId)
      .map(post => {
        let score = 0;
        
        // Calculate tag similarity score
        const commonTags = post.tags.filter(tag => 
          currentTags.some(currentTag => 
            currentTag.toLowerCase() === tag.toLowerCase()
          )
        );
        score += commonTags.length * 3; // Weight tag matches heavily
        
        // Calculate content similarity (basic keyword matching)
        const contentKeywords = currentTags.map(tag => tag.toLowerCase());
        const postContent = post.content.toLowerCase();
        const titleContent = post.title.toLowerCase();
        
        contentKeywords.forEach(keyword => {
          if (postContent.includes(keyword)) score += 1;
          if (titleContent.includes(keyword)) score += 2; // Title matches more important
        });
        
        return { ...post, similarityScore: score };
      })
      .filter(post => post.similarityScore > 0)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 3); // Show top 3 related reports
    
    return related;
  };

  const relatedReports = findRelatedReports();

  if (relatedReports.length === 0) {
    return null;
  }

  return (
    <Card className="w-full bg-card/30 backdrop-blur-sm border border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg text-primary">Related Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relatedReports.map((report) => (
            <div key={report.id} className="p-4 bg-background/50 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
              <h4 className="font-semibold text-sm mb-2 line-clamp-2">{report.title}</h4>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{report.content}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {report.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{report.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{report.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatedReports;