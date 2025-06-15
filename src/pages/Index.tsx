
import Header from '@/components/Header';
import SubmissionForm from '@/components/SubmissionForm';
import PostFeed from '@/components/PostFeed';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground w-full relative overflow-x-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/10 opacity-20 blur-[100px]"></div>
      </div>
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <SubmissionForm />
        <PostFeed />
      </main>

      <footer className="text-center py-8 mt-8 text-muted-foreground text-sm border-t border-border">
        <p>Built for truth and transparency. Your security is our priority.</p>
        <p>&copy; {new Date().getFullYear()} Expose. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
