import { createEvent } from 'ics';

export interface CalendarEvent {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  url?: string;
}

export const createCalendarEvent = (event: CalendarEvent): string | null => {
  try {
    const startDate = [
      event.start.getFullYear(),
      event.start.getMonth() + 1,
      event.start.getDate(),
      event.start.getHours(),
      event.start.getMinutes()
    ] as [number, number, number, number, number];

    const endDate = [
      event.end.getFullYear(),
      event.end.getMonth() + 1,
      event.end.getDate(),
      event.end.getHours(),
      event.end.getMinutes()
    ] as [number, number, number, number, number];

    const { error, value } = createEvent({
      title: event.title,
      description: event.description,
      start: startDate,
      end: endDate,
      location: event.location,
      url: event.url
    });

    if (error || !value) {
      console.error('Error creating calendar event:', error);
      return null;
    }

    return value;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
};

export const downloadCalendarEvent = (event: CalendarEvent, filename?: string) => {
  const icsContent = createCalendarEvent(event);
  if (!icsContent) return;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename || `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  link.click();
  window.URL.revokeObjectURL(link.href);
};

export const createGoogleCalendarUrl = (event: CalendarEvent): string => {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const startDate = event.start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endDate = event.end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const params = new URLSearchParams({
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: event.description || '',
    location: event.location || '',
    ctz: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  return `${baseUrl}&${params.toString()}`;
};

export const createOutlookCalendarUrl = (event: CalendarEvent): string => {
  const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
  const params = new URLSearchParams({
    subject: event.title,
    startdt: event.start.toISOString(),
    enddt: event.end.toISOString(),
    body: event.description || '',
    location: event.location || ''
  });

  return `${baseUrl}?${params.toString()}`;
};

export const createAppleCalendarUrl = (event: CalendarEvent): string => {
  const icsContent = createCalendarEvent(event);
  if (!icsContent) return '';
  
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  return window.URL.createObjectURL(blob);
};