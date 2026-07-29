export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Difficulty = "Easy" | "Medium" | "Hard";
export type SubmissionStatus =
  | "accepted"
  | "runtime_error"
  | "compile_error"
  | "failed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          username: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          username?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      patterns: {
        Row: {
          id: number;
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          slug: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["patterns"]["Insert"]>;
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          title: string;
          slug: string;
          difficulty: Difficulty;
          pattern_id: number | null;
          topic: string;
          companies: string[];
          tags: string[];
          leetcode_url: string;
          hints: string[];
          estimated_time: number;
          starter_code: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          difficulty: Difficulty;
          pattern_id?: number | null;
          topic: string;
          companies?: string[];
          tags?: string[];
          leetcode_url: string;
          hints?: string[];
          estimated_time?: number;
          starter_code?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["questions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "questions_pattern_id_fkey";
            columns: ["pattern_id"];
            isOneToOne: false;
            referencedRelation: "patterns";
            referencedColumns: ["id"];
          },
        ];
      };
      submissions: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          language: string;
          code: string;
          status: SubmissionStatus;
          runtime_ms: number | null;
          memory_kb: number | null;
          stdout: string | null;
          stderr: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["submissions"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["submissions"]["Insert"]>;
        Relationships: [];
      };
      flashcards: {
        Row: {
          id: string;
          question_id: string;
          user_id: string;
          front: string;
          back: string;
          difficulty: number;
          review_date: string;
          ease_factor: number;
          interval: number;
          repetitions: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["flashcards"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["flashcards"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "flashcards_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          flashcard_id: string;
          user_id: string;
          quality: number;
          previous_interval: number;
          next_interval: number;
          previous_ease_factor: number;
          next_ease_factor: number;
          reviewed_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["reviews"]["Row"],
          "id" | "reviewed_at"
        > & { id?: string; reviewed_at?: string };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
        Relationships: [];
      };
      ai_feedback: {
        Row: {
          id: string;
          submission_id: string;
          user_id: string;
          feedback: string;
          mistakes: Json;
          better_solution: string;
          time_complexity: string;
          space_complexity: string;
          interview_tips: Json;
          similar_questions: Json;
          provider: string;
          model: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["ai_feedback"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["ai_feedback"]["Insert"]>;
        Relationships: [];
      };
      active_recall_questions: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          prompt: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["active_recall_questions"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<
          Database["public"]["Tables"]["active_recall_questions"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "active_recall_questions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      active_recall_answers: {
        Row: {
          id: string;
          recall_question_id: string;
          user_id: string;
          answer: string;
          confidence: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["active_recall_answers"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<
          Database["public"]["Tables"]["active_recall_answers"]["Insert"]
        >;
        Relationships: [];
      };
      pattern_progress: {
        Row: {
          id: string;
          user_id: string;
          pattern_id: number;
          solved_count: number;
          attempted_count: number;
          mastery_percentage: number;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["pattern_progress"]["Row"],
          "id" | "updated_at"
        > & { id?: string; updated_at?: string };
        Update: Partial<
          Database["public"]["Tables"]["pattern_progress"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "pattern_progress_pattern_id_fkey";
            columns: ["pattern_id"];
            isOneToOne: false;
            referencedRelation: "patterns";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_stats: {
        Row: {
          id: string;
          user_id: string;
          stat_date: string;
          problems_solved: number;
          reviews_completed: number;
          study_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["daily_stats"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["daily_stats"]["Insert"]>;
        Relationships: [];
      };
      question_tags: {
        Row: {
          question_id: string;
          tag: string;
          created_at: string;
        };
        Insert: {
          question_id: string;
          tag: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["question_tags"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_dashboard_stats: {
        Args: { target_user_id: string };
        Returns: Json;
      };
      submit_flashcard_review: {
        Args: { card_id: string; review_quality: number };
        Returns: Json;
      };
      store_learning_pack: {
        Args: {
          p_submission_id: string;
          p_pack: Json;
          p_provider: string;
          p_model: string;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Pattern = Database["public"]["Tables"]["patterns"]["Row"];
export type Question = Database["public"]["Tables"]["questions"]["Row"] & {
  patterns?: Pick<Pattern, "name" | "slug"> | null;
};
export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"] & {
  questions?: Pick<Question, "title" | "slug"> | null;
};
