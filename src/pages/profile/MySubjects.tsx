import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Search, DollarSign, Save, X } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface TutorSubject {
  id: string;
  subject_id: string;
  hourly_rate: number;
  subject?: Subject;
}

interface MySubjectsProps {
  user: any;
  onBack: () => void;
}

const MySubjects = ({ user, onBack }: MySubjectsProps) => {
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [tutorSubjects, setTutorSubjects] = useState<TutorSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRates, setEditingRates] = useState<{[key: string]: number}>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchSubjects();
    fetchTutorSubjects();
  }, [user]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      setAllSubjects(data || []);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      toast({
        title: "Error loading subjects",
        description: "Failed to load available subjects.",
        variant: "destructive",
      });
    }
  };

  const fetchTutorSubjects = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('tutor_subjects')
        .select(`
          *,
          subject:subjects(*)
        `)
        .eq('tutor_id', user.id);

      if (error) throw error;
      setTutorSubjects(data || []);
    } catch (error: any) {
      console.error('Error fetching tutor subjects:', error);
      toast({
        title: "Error loading your subjects",
        description: "Failed to load your teaching subjects.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSubject = async (subjectId: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('tutor_subjects')
        .insert({
          tutor_id: user.id,
          subject_id: subjectId,
          hourly_rate: 25
        })
        .select(`
          *,
          subject:subjects(*)
        `)
        .single();

      if (error) throw error;

      setTutorSubjects([...tutorSubjects, data]);
      toast({
        title: "Subject added!",
        description: "You can now tutor this subject. Don't forget to set your availability!",
      });
    } catch (error: any) {
      console.error('Error adding subject:', error);
      toast({
        title: "Failed to add subject",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeSubject = async (tutorSubjectId: string) => {
    try {
      const { error } = await supabase
        .from('tutor_subjects')
        .delete()
        .eq('id', tutorSubjectId);

      if (error) throw error;

      setTutorSubjects(tutorSubjects.filter(ts => ts.id !== tutorSubjectId));
      toast({
        title: "Subject removed",
        description: "You're no longer tutoring this subject.",
      });
    } catch (error: any) {
      console.error('Error removing subject:', error);
      toast({
        title: "Failed to remove subject",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateRate = async (tutorSubjectId: string, newRate: number) => {
    if (newRate < 10 || newRate > 100) {
      toast({
        title: "Invalid rate",
        description: "Hourly rate must be between $10 and $100.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('tutor_subjects')
        .update({ hourly_rate: newRate })
        .eq('id', tutorSubjectId);

      if (error) throw error;

      setTutorSubjects(tutorSubjects.map(ts => 
        ts.id === tutorSubjectId ? { ...ts, hourly_rate: newRate } : ts
      ));

      setEditingRates(prev => {
        const updated = { ...prev };
        delete updated[tutorSubjectId];
        return updated;
      });

      toast({
        title: "Rate updated!",
        description: `Hourly rate updated to $${newRate}`,
      });
    } catch (error: any) {
      console.error('Error updating rate:', error);
      toast({
        title: "Failed to update rate",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredSubjects = allSubjects.filter(subject => 
    !tutorSubjects.find(ts => ts.subject_id === subject.id) &&
    (subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     subject.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="animate-fade-in p-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20 p-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">My Subjects</h1>
            <p className="text-sm text-muted-foreground">
              Manage the courses you teach and your rates
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        {/* Current Subjects */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Subjects You Teach</h2>
          
          {tutorSubjects.length === 0 ? (
            <Card className="text-center p-8">
              <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No subjects added yet</h3>
              <p className="text-sm text-muted-foreground">
                Add subjects below to start tutoring and earning money!
              </p>
            </Card>
          ) : (
            tutorSubjects.map(tutorSubject => (
              <Card key={tutorSubject.id} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">
                        {tutorSubject.subject?.code} - {tutorSubject.subject?.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        Teaching this subject
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {editingRates[tutorSubject.id] !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">$</span>
                          <Input
                            type="number"
                            min="10"
                            max="100"
                            value={editingRates[tutorSubject.id]}
                            onChange={(e) => setEditingRates(prev => ({
                              ...prev,
                              [tutorSubject.id]: parseInt(e.target.value) || 0
                            }))}
                            className="w-20"
                          />
                          <span className="text-sm">/hr</span>
                          <Button
                            size="sm"
                            onClick={() => updateRate(tutorSubject.id, editingRates[tutorSubject.id])}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingRates(prev => ({
                              ...prev,
                              [tutorSubject.id]: tutorSubject.hourly_rate
                            }))}
                            className="flex items-center gap-1"
                          >
                            <DollarSign className="w-4 h-4" />
                            <span>${tutorSubject.hourly_rate}/hr</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSubject(tutorSubject.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add New Subject */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Subject
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for subjects to teach..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredSubjects.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchTerm ? 'No subjects found matching your search.' : 'All available subjects are already added.'}
                </p>
              ) : (
                filteredSubjects.map(subject => (
                  <Card key={subject.id} className="hover-scale cursor-pointer" onClick={() => addSubject(subject.id)}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">
                            {subject.code} - {subject.name}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rate Guidelines */}
        <Card className="glass-card border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-300">
              <DollarSign className="w-5 h-5" />
              Rate Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• Rates must be between $10 and $100 per hour</p>
              <p>• Consider your experience level and subject difficulty</p>
              <p>• Higher rates may reduce booking frequency but increase earnings per session</p>
              <p>• You can adjust rates anytime based on demand and feedback</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MySubjects;