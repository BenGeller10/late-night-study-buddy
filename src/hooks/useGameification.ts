import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SearchAnalytics {
  trackSearch: (query: string, campus?: string) => Promise<void>;
  getHotTopics: (campus?: string, limit?: number) => Promise<any[]>;
}

export const useSearchAnalytics = (): SearchAnalytics => {
  const trackSearch = async (query: string, campus?: string) => {
    try {
      // Get current user if available
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('search_queries')
        .insert({
          query_text: query.trim().toLowerCase(),
          user_id: user?.id || null,
          campus: campus || null,
        });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  };

  const getHotTopics = async (campus?: string, limit: number = 5) => {
    try {
      // Get searches from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      let query = supabase
        .from('search_queries')
        .select('query_text, campus')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (campus) {
        query = query.eq('campus', campus);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Aggregate search counts
      const searchCounts = data?.reduce((acc: Record<string, any>, item) => {
        const normalized = item.query_text;
        
        if (!acc[normalized]) {
          acc[normalized] = {
            query_text: item.query_text,
            search_count: 0,
            campus: item.campus
          };
        }
        
        acc[normalized].search_count++;
        return acc;
      }, {}) || {};

      // Convert to array and sort by count
      return Object.values(searchCounts)
        .sort((a: any, b: any) => b.search_count - a.search_count)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching hot topics:', error);
      return [];
    }
  };

  return { trackSearch, getHotTopics };
};

// Hook for real-time badge checking
export const useBadgeChecker = () => {
  const checkAndAwardBadges = async (userId: string) => {
    try {
      // Get user's session count
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id, status')
        .or(`student_id.eq.${userId},tutor_id.eq.${userId}`)
        .eq('status', 'completed');

      const sessionCount = sessions?.length || 0;

      // Get user's current badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId);

      const earnedBadgeIds = userBadges?.map(ub => ub.badge_id) || [];

      // Get all available badges
      const { data: availableBadges } = await supabase
        .from('badges')
        .select('*')
        .not('id', 'in', `(${earnedBadgeIds.join(',') || 'NULL'})`);

      // Check each badge requirement
      for (const badge of availableBadges || []) {
        let earned = false;

        switch (badge.requirement_type) {
          case 'sessions_completed':
            earned = sessionCount >= badge.requirement_value;
            break;
          // Add more requirement types as needed
        }

        if (earned) {
          await supabase
            .from('user_badges')
            .insert({
              user_id: userId,
              badge_id: badge.id
            });
          
          // Return the new badge for notification
          return badge;
        }
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
    return null;
  };

  return { checkAndAwardBadges };
};