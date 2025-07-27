
import PostCard, { Post } from './PostCard';
import RelatedReports from './RelatedReports';
import TrendingTopics from './TrendingTopics';

const mockPosts: Post[] = [
  {
    id: 1,
    title: "Embezzlement in Public Works Department",
    content: "An anonymous source has provided documents detailing a large-scale embezzlement scheme within the city's Public Works Department. Funds intended for infrastructure projects were allegedly diverted to private accounts over a period of three years. The attached documents show suspicious transactions and invoices.",
    timestamp: "4 hours ago",
    tags: ["Finance", "Government"],
    type: 'text',
    location: "Downtown",
  },
  {
    id: 2,
    title: "Illegal Land Acquisition by Real Estate Firm",
    content: "Evidence has surfaced showing a major real estate developer illegally acquiring protected land for a new luxury housing project. The photo evidence, submitted anonymously, shows construction activity in a designated conservation area.",
    timestamp: "1 day ago",
    tags: ["Real Estate", "Environment"],
    type: 'image',
    location: "Suburbs",
  },
  {
    id: 3,
    title: "Bribery Scandal in Licensing Office",
    content: "A source reports a systematic bribery operation at the municipal licensing office. Business owners are allegedly forced to pay 'expediting fees' to get their permits approved. The corruption is said to be widespread, affecting small businesses the most.",
    timestamp: "3 days ago",
    tags: ["Bribery", "Small Business"],
    type: 'text',
    location: "Financial District",
  },
];

const PostFeed = () => {
  // Extract all unique tags for trend analysis
  const allTags = [...new Set(mockPosts.flatMap(post => post.tags))];
  
  return (
    <div className="mt-16 w-full max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center mb-8">Exposed Reports</h2>
      
      {/* Trending Topics Section */}
      <TrendingTopics posts={mockPosts} />
      
      <div className="space-y-8">
        {mockPosts.map((post, index) => (
          <div key={post.id} className="space-y-6">
            <PostCard post={post} />
            
            {/* Show related reports after every 2nd post */}
            {(index + 1) % 2 === 0 && (
              <RelatedReports 
                currentTags={post.tags} 
                allPosts={mockPosts} 
                excludeId={post.id}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostFeed;
