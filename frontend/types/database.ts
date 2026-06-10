export type LifeArea = 'health' | 'mind' | 'work' | 'creative' | 'finance';
export type CrewRole = 'member' | 'captain';
export type CheckInFormat = 'photo' | 'note' | 'mood';
export type Frequency = 'daily' | 'weekly';
export type SprintWeeks = 2 | 4 | 8;
export type ReactionEmoji = '❤️' | '💪' | '🔥' | '✨';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          avatar_color: string;
          life_area: LifeArea | null;
          why_statement: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'> & { created_at?: string };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      crews: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['crews']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['crews']['Insert']>;
      };
      crew_members: {
        Row: {
          crew_id: string;
          user_id: string;
          role: CrewRole;
          joined_at: string;
        };
        Insert: Omit<Database['public']['Tables']['crew_members']['Row'], 'joined_at'> & { joined_at?: string };
        Update: Partial<Database['public']['Tables']['crew_members']['Insert']>;
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          crew_id: string;
          title: string;
          life_area: LifeArea | null;
          frequency: Frequency;
          sprint_weeks: SprintWeeks;
          sprint_start: string;
          sprint_end: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['goals']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['goals']['Insert']>;
      };
      checkins: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          crew_id: string;
          format: CheckInFormat;
          photo_url: string | null;
          note_text: string | null;
          mood_effort: number | null;
          mood_feeling: number | null;
          checked_in_at: string;
        };
        Insert: Omit<Database['public']['Tables']['checkins']['Row'], 'id' | 'checked_in_at'> & { id?: string; checked_in_at?: string };
        Update: Partial<Database['public']['Tables']['checkins']['Insert']>;
      };
      reactions: {
        Row: {
          id: string;
          checkin_id: string;
          user_id: string;
          emoji: ReactionEmoji;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reactions']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['reactions']['Insert']>;
      };
      streaks: {
        Row: {
          user_id: string;
          crew_id: string;
          current_streak: number;
          longest_streak: number;
          shield_used: boolean;
          last_checkin_date: string | null;
        };
        Insert: Omit<Database['public']['Tables']['streaks']['Row'], 'current_streak' | 'longest_streak' | 'shield_used'> & {
          current_streak?: number;
          longest_streak?: number;
          shield_used?: boolean;
        };
        Update: Partial<Database['public']['Tables']['streaks']['Insert']>;
      };
      invites: {
        Row: {
          id: string;
          crew_id: string;
          invited_by: string;
          invite_token: string;
          expires_at: string;
          accepted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['invites']['Row'], 'id' | 'invite_token' | 'expires_at'> & {
          id?: string;
          invite_token?: string;
          expires_at?: string;
        };
        Update: Partial<Database['public']['Tables']['invites']['Insert']>;
      };
    };
  };
}
