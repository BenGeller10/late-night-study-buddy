import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Clock, 
  ArrowLeft,
  Save,
  Plus,
  X
} from "lucide-react";

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const SetAvailability = () => {
  const navigate = useNavigate();
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
  ];

  // Initialize availability slots
  useEffect(() => {
    const mockAvailability: TimeSlot[] = [];
    
    // Mock some existing availability
    const existingSlots = [
      { day: 'Monday', startTime: '2:00 PM', endTime: '5:00 PM' },
      { day: 'Tuesday', startTime: '10:00 AM', endTime: '12:00 PM' },
      { day: 'Wednesday', startTime: '2:00 PM', endTime: '5:00 PM' },
      { day: 'Thursday', startTime: '3:00 PM', endTime: '6:00 PM' },
      { day: 'Friday', startTime: '10:00 AM', endTime: '2:00 PM' },
    ];

    existingSlots.forEach((slot, index) => {
      mockAvailability.push({
        id: `slot-${index}`,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: true
      });
    });

    setTimeout(() => {
      setAvailability(mockAvailability);
      setLoading(false);
    }, 1000);
  }, []);

  const addTimeSlot = (day: string) => {
    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      day,
      startTime: '9:00 AM',
      endTime: '10:00 AM',
      isAvailable: true
    };
    setAvailability(prev => [...prev, newSlot]);
  };

  const removeTimeSlot = (slotId: string) => {
    setAvailability(prev => prev.filter(slot => slot.id !== slotId));
  };

  const updateTimeSlot = (slotId: string, field: keyof TimeSlot, value: string | boolean) => {
    setAvailability(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, [field]: value } : slot
    ));
  };

  const toggleSlotAvailability = (slotId: string) => {
    setAvailability(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, isAvailable: !slot.isAvailable } : slot
    ));
  };

  const saveAvailability = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSaving(false);
    
    // Show success message and navigate back
    navigate('/home');
  };

  const getAvailabilityForDay = (day: string) => {
    return availability.filter(slot => slot.day === day);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center pb-20">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your availability...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-800 pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-700/80 backdrop-blur-lg border-b border-gray-600">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/home')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Set Availability
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your tutoring schedule
                </p>
              </div>
            </div>
            <Button 
              onClick={saveAvailability}
              disabled={saving}
              variant="blue"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Instructions */}
          <Card className="glass-card border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-700 dark:text-blue-300">
                    How to set your availability
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add time blocks when you're available for tutoring sessions. Students will be able to book sessions during these times.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Schedule */}
          <div className="space-y-4">
            {daysOfWeek.map((day) => {
              const daySlots = getAvailabilityForDay(day);
              
              return (
                <Card key={day} className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{day}</CardTitle>
                      <Button
                        size="sm"
                        variant="blue"
                        onClick={() => addTimeSlot(day)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Time
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {daySlots.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No availability set for {day}</p>
                      </div>
                    ) : (
                      daySlots.map((slot) => (
                        <div key={slot.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={slot.isAvailable}
                              onCheckedChange={() => toggleSlotAvailability(slot.id)}
                            />
                            <Label className="text-sm">
                              {slot.isAvailable ? 'Available' : 'Blocked'}
                            </Label>
                          </div>
                          
                          <div className="flex-1 flex items-center gap-2">
                            <select
                              value={slot.startTime}
                              onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                              className="px-3 py-1 rounded border border-border bg-background text-sm"
                              disabled={!slot.isAvailable}
                            >
                              {timeSlots.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                            
                            <span className="text-sm text-muted-foreground">to</span>
                            
                            <select
                              value={slot.endTime}
                              onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                              className="px-3 py-1 rounded border border-border bg-background text-sm"
                              disabled={!slot.isAvailable}
                            >
                              {timeSlots.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>
                          
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeTimeSlot(slot.id)}
                            className="h-8 w-8"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <Card className="glass-card border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">
                    {availability.filter(s => s.isAvailable).length} available time slots
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Students can book sessions during these times
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default SetAvailability;