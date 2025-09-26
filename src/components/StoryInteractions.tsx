import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { BarChart3, MessageSquare, MapPin, Music, Send } from 'lucide-react';

interface StoryInteraction {
  id: string;
  interaction_type: string;
  interaction_data: any;
  position_x: number;
  position_y: number;
}

interface StoryInteractionsProps {
  storyId: string;
}

const StoryInteractions = ({ storyId }: StoryInteractionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [interactions, setInteractions] = useState<StoryInteraction[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [questionResponse, setQuestionResponse] = useState('');
  const [selectedPollOptions, setSelectedPollOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchInteractions();
  }, [storyId]);

  const fetchInteractions = async () => {
    try {
      const { data, error } = await supabase
        .from('story_interactions')
        .select('*')
        .eq('story_id', storyId);

      if (error) throw error;
      setInteractions(data || []);
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };

  const submitPollResponse = async (interactionId: string, option: string) => {
    if (!user) return;

    try {
      await supabase
        .from('story_responses')
        .upsert({
          interaction_id: interactionId,
          user_id: user.id,
          response_data: { selected_option: option },
        });

      setSelectedPollOptions({ ...selectedPollOptions, [interactionId]: option });
      toast({
        title: "Vote recorded",
        description: "Your poll response has been saved!",
      });
    } catch (error) {
      console.error('Error submitting poll response:', error);
    }
  };

  const submitQuestionResponse = async (interactionId: string) => {
    if (!user || !questionResponse.trim()) return;

    try {
      await supabase
        .from('story_responses')
        .upsert({
          interaction_id: interactionId,
          user_id: user.id,
          response_data: { answer: questionResponse.trim() },
        });

      setQuestionResponse('');
      toast({
        title: "Response sent",
        description: "Your answer has been sent to the story owner!",
      });
    } catch (error) {
      console.error('Error submitting question response:', error);
    }
  };

  const renderInteraction = (interaction: StoryInteraction) => {
    const { interaction_type, interaction_data, position_x, position_y } = interaction;

    const commonStyles = {
      position: 'absolute' as const,
      left: `${position_x * 100}%`,
      top: `${position_y * 100}%`,
      transform: 'translate(-50%, -50%)',
    };

    switch (interaction_type) {
      case 'poll':
        return (
          <Card
            key={interaction.id}
            className="bg-black/70 text-white p-4 max-w-60 backdrop-blur-sm"
            style={commonStyles}
          >
            <div className="flex items-center mb-3">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Poll</span>
            </div>
            
            <p className="text-sm mb-3">{interaction_data.question}</p>
            
            <div className="space-y-2">
              {interaction_data.options?.map((option: string, index: number) => (
                <Button
                  key={index}
                  variant={selectedPollOptions[interaction.id] === option ? "default" : "outline"}
                  size="sm"
                  className="w-full text-xs justify-start"
                  onClick={() => submitPollResponse(interaction.id, option)}
                  disabled={!!selectedPollOptions[interaction.id]}
                >
                  {option}
                </Button>
              ))}
            </div>
          </Card>
        );

      case 'question':
        return (
          <Card
            key={interaction.id}
            className="bg-black/70 text-white p-4 max-w-60 backdrop-blur-sm"
            style={commonStyles}
          >
            <div className="flex items-center mb-3">
              <MessageSquare className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Ask a question</span>
            </div>
            
            <div className="flex space-x-2">
              <Input
                placeholder={interaction_data.placeholder}
                value={questionResponse}
                onChange={(e) => setQuestionResponse(e.target.value)}
                className="text-xs bg-white/20 border-white/30"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    submitQuestionResponse(interaction.id);
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => submitQuestionResponse(interaction.id)}
                disabled={!questionResponse.trim()}
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        );

      case 'location':
        return (
          <div
            key={interaction.id}
            className="bg-black/70 text-white px-3 py-2 rounded-full backdrop-blur-sm"
            style={commonStyles}
          >
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{interaction_data.name}</span>
            </div>
          </div>
        );

      case 'music':
        return (
          <div
            key={interaction.id}
            className="bg-black/70 text-white px-3 py-2 rounded-full backdrop-blur-sm"
            style={commonStyles}
          >
            <div className="flex items-center text-sm">
              <Music className="w-4 h-4 mr-2" />
              <div>
                <div className="font-medium">{interaction_data.title}</div>
                {interaction_data.artist && (
                  <div className="text-xs opacity-80">{interaction_data.artist}</div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {interactions.map(renderInteraction)}
    </>
  );
};

export default StoryInteractions;