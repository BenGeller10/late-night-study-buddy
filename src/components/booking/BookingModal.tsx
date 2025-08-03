import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Calendar, MapPin, Clock, BookOpen } from "lucide-react";

interface Tutor {
  id: string;
  name: string;
  profilePicture: string;
  classes: string[];
  hourlyRate: number;
  isFree: boolean;
  venmoHandle?: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: Tutor;
  onConfirm: (bookingDetails: any) => void;
}

const BookingModal = ({ isOpen, onClose, tutor, onConfirm }: BookingModalProps) => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass || !selectedDate || !selectedTime || !location) {
      return;
    }

    const cost = tutor.isFree ? 0 : (tutor.hourlyRate * (parseInt(duration) / 60));
    const dateTime = `${selectedDate} at ${selectedTime}`;
    
    const bookingDetails = {
      tutorId: tutor.id,
      tutorName: tutor.name,
      tutorVenmoHandle: tutor.venmoHandle || tutor.name.toLowerCase().replace(' ', '-'),
      className: selectedClass,
      time: dateTime,
      location,
      cost: Math.round(cost),
      duration: parseInt(duration),
      notes
    };

    onConfirm(bookingDetails);
  };

  // Generate some time slots
  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
    "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
  ];

  const commonLocations = [
    "The Library - Main Floor",
    "The Library - 2nd Floor",
    "Student Union - Study Rooms",
    "Coffee Shop on Campus",
    "Engineering Building - Study Area",
    "Business Building - Lounge",
    "Online (Zoom/Discord)",
    "Other (will coordinate)"
  ];

  const cost = tutor.isFree ? 0 : (tutor.hourlyRate * (parseInt(duration) / 60));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in">
      <div className="glass-card rounded-3xl shadow-2xl w-full max-w-lg text-foreground p-6 animate-bounce-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Book a Session 📚</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="btn-smooth"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6 p-3 bg-muted/20 rounded-xl">
          <img
            src={tutor.profilePicture}
            alt={tutor.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold">{tutor.name}</h3>
            <p className="text-sm text-muted-foreground">
              {tutor.isFree ? "Free tutoring" : `$${tutor.hourlyRate}/hour`}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="class" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Which class do you need help with?
            </Label>
            <Select value={selectedClass} onValueChange={setSelectedClass} required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent>
                {tutor.classes.map((className, index) => (
                  <SelectItem key={index} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time
              </Label>
              <Select value={selectedTime} onValueChange={setSelectedTime} required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pick a time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duration
            </Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Where should you meet?
            </Label>
            <Select value={location} onValueChange={setLocation} required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a location" />
              </SelectTrigger>
              <SelectContent>
                {commonLocations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Anything specific you want to work on?</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Chapter 5 problems, midterm prep, homework help..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="bg-muted/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {tutor.isFree ? "FREE! 🎉" : `$${Math.round(cost)}.00`}
            </div>
            <p className="text-sm text-muted-foreground">
              {tutor.isFree 
                ? "This awesome human is helping for free!" 
                : `${parseInt(duration)} minutes • Pay via Venmo`
              }
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 btn-smooth"
            >
              Not yet
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-haptic font-bold"
            >
              Let's do this! 🚀
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;