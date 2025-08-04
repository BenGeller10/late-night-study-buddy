import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X, DollarSign, Clock, BookOpen, User } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface TutorSubject {
  subject_id: string;
  hourly_rate: number;
  subject?: Subject;
}

interface TutorProfileProps {
  email: string;
  fullName: string;
  password: string;
  onNext: (tutorData: any) => void;
  onBack: () => void;
}

const TutorProfile = ({ email, fullName, password, onNext, onBack }: TutorProfileProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<TutorSubject[]>([]);
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [venmoHandle, setVenmoHandle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Availability state
  const [availability, setAvailability] = useState({
    monday: { available: false, start: "09:00", end: "17:00" },
    tuesday: { available: false, start: "09:00", end: "17:00" },
    wednesday: { available: false, start: "09:00", end: "17:00" },
    thursday: { available: false, start: "09:00", end: "17:00" },
    friday: { available: false, start: "09:00", end: "17:00" },
    saturday: { available: false, start: "10:00", end: "16:00" },
    sunday: { available: false, start: "10:00", end: "16:00" },
  });

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } else {
      setSubjects(data || []);
    }
  };

  const addSubject = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (subject && !selectedSubjects.find(s => s.subject_id === subjectId)) {
      setSelectedSubjects([...selectedSubjects, {
        subject_id: subjectId,
        hourly_rate: 25,
        subject
      }]);
    }
  };

  const removeSubject = (subjectId: string) => {
    setSelectedSubjects(selectedSubjects.filter(s => s.subject_id !== subjectId));
  };

  const updateSubjectRate = (subjectId: string, rate: number) => {
    setSelectedSubjects(selectedSubjects.map(s => 
      s.subject_id === subjectId ? { ...s, hourly_rate: rate } : s
    ));
  };

  const updateDayAvailability = (day: string, field: string, value: any) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSubmit = () => {
    if (selectedSubjects.length === 0) {
      toast.error('Please select at least one subject to tutor');
      return;
    }

    if (!bio.trim()) {
      toast.error('Please add a bio to tell students about yourself');
      return;
    }

    if (!venmoHandle.trim()) {
      toast.error('Please add your Venmo handle for receiving payments');
      return;
    }

    const availableDays = Object.keys(availability).filter(
      day => availability[day as keyof typeof availability].available
    );

    if (availableDays.length === 0) {
      toast.error('Please select at least one day when you\'re available');
      return;
    }

    // Prepare availability string
    const availabilityText = availableDays.map(day => {
      const dayData = availability[day as keyof typeof availability];
      return `${day}: ${dayData.start}-${dayData.end}`;
    }).join(', ');

    const tutorData = {
      email,
      fullName,
      password,
      bio: bio.trim(),
      experience: experience.trim(),
      venmoHandle: venmoHandle.trim(),
      subjects: selectedSubjects,
      availability: availabilityText,
      scheduleData: `Available: ${availabilityText}. ${bio}`
    };

    onNext(tutorData);
  };

  const availableSubjects = subjects.filter(
    subject => !selectedSubjects.find(s => s.subject_id === subject.id)
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-background via-background to-card">
      <div className="max-w-2xl mx-auto space-y-8 w-full">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">
            Set up your tutor profile 🧠
          </h1>
          <p className="text-muted-foreground text-lg">
            Let's get you ready to help students succeed!
          </p>
        </div>

        <div className="space-y-6">
          {/* Bio Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                About You
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio *</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell students about yourself! What makes you a great tutor? What's your teaching style?"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="min-h-24"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience">Experience (Optional)</Label>
                <Textarea
                  id="experience"
                  placeholder="What's your background? Previous tutoring experience, relevant coursework, achievements, etc."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venmo">Venmo Handle *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="venmo"
                    placeholder="@your-venmo-username"
                    value={venmoHandle}
                    onChange={(e) => setVenmoHandle(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subjects & Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Subjects & Hourly Rates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableSubjects.length > 0 && (
                <div className="space-y-2">
                  <Label>Add a subject</Label>
                  <Select onValueChange={addSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a subject to tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.code} - {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedSubjects.length > 0 && (
                <div className="space-y-3">
                  <Label>Your subjects</Label>
                  {selectedSubjects.map(tutorSubject => (
                    <div key={tutorSubject.subject_id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <Badge variant="secondary">
                          {tutorSubject.subject?.code} - {tutorSubject.subject?.name}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label>$</Label>
                        <Input
                          type="number"
                          min="10"
                          max="100"
                          value={tutorSubject.hourly_rate}
                          onChange={(e) => updateSubjectRate(tutorSubject.subject_id, parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                        <Label>/hr</Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSubject(tutorSubject.subject_id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {selectedSubjects.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Select subjects you can tutor above
                </p>
              )}
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Weekly Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {days.map(day => (
                <div key={day.key} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex items-center space-x-2 w-24">
                    <Checkbox
                      id={day.key}
                      checked={availability[day.key as keyof typeof availability].available}
                      onCheckedChange={(checked) => 
                        updateDayAvailability(day.key, 'available', checked)
                      }
                    />
                    <Label htmlFor={day.key} className="text-sm font-medium">
                      {day.label}
                    </Label>
                  </div>
                  
                  {availability[day.key as keyof typeof availability].available && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={availability[day.key as keyof typeof availability].start}
                        onChange={(e) => updateDayAvailability(day.key, 'start', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={availability[day.key as keyof typeof availability].end}
                        onChange={(e) => updateDayAvailability(day.key, 'end', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="lg"
              className="flex-1"
              onClick={onBack}
              disabled={isLoading}
            >
              Back
            </Button>
            
            <Button
              variant="campus"
              size="lg"
              className="flex-1"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              Complete Setup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;