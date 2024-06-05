export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      broadcast: {
        Row: {
          broadcast_id: number
          content: string
          created_at: string
          likes: number
          user_id: string
        }
        Insert: {
          broadcast_id?: number
          content: string
          created_at?: string
          likes?: number
          user_id?: string
        }
        Update: {
          broadcast_id?: number
          content?: string
          created_at?: string
          likes?: number
          user_id?: string
        }
        Relationships: []
      }
      broadcast_comment: {
        Row: {
          broadcast_comment_id: number
          broadcast_id: number
          content: string
          created_at: string
          user_id: string
        }
        Insert: {
          broadcast_comment_id?: number
          broadcast_id: number
          content: string
          created_at?: string
          user_id?: string
        }
        Update: {
          broadcast_comment_id?: number
          broadcast_id?: number
          content?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_comment_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcast"
            referencedColumns: ["broadcast_id"]
          },
        ]
      }
      budget: {
        Row: {
          budget_amount: number | null
          budget_id: number
          created_at: string
          trip_id: number | null
        }
        Insert: {
          budget_amount?: number | null
          budget_id?: number
          created_at?: string
          trip_id?: number | null
        }
        Update: {
          budget_amount?: number | null
          budget_id?: number
          created_at?: string
          trip_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["trip_id"]
          },
        ]
      }
      expenses: {
        Row: {
          created_at: string
          expenses_amount: number
          expenses_category: string
          expenses_date: string
          expenses_description: string | null
          expenses_id: number
          trip_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          expenses_amount: number
          expenses_category: string
          expenses_date: string
          expenses_description?: string | null
          expenses_id?: number
          trip_id: number
          user_id?: string
        }
        Update: {
          created_at?: string
          expenses_amount?: number
          expenses_category?: string
          expenses_date?: string
          expenses_description?: string | null
          expenses_id?: number
          trip_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["trip_id"]
          },
        ]
      }
      expenses_participants: {
        Row: {
          expenses_id: number
          expenses_participant_id: number
          share_amount: number
          share_type: Database["public"]["Enums"]["expenses_share_type"]
          user_id: string
        }
        Insert: {
          expenses_id: number
          expenses_participant_id?: number
          share_amount: number
          share_type: Database["public"]["Enums"]["expenses_share_type"]
          user_id?: string
        }
        Update: {
          expenses_id?: number
          expenses_participant_id?: number
          share_amount?: number
          share_type?: Database["public"]["Enums"]["expenses_share_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_participants_expenses_id_fkey"
            columns: ["expenses_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["expenses_id"]
          },
        ]
      }
      itinerary: {
        Row: {
          created_at: string
          itinerary_date: string
          itinerary_id: number
          subheading: string | null
          trip_id: number
        }
        Insert: {
          created_at?: string
          itinerary_date: string
          itinerary_id?: number
          subheading?: string | null
          trip_id: number
        }
        Update: {
          created_at?: string
          itinerary_date?: string
          itinerary_id?: number
          subheading?: string | null
          trip_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["trip_id"]
          },
        ]
      }
      itinerary_poi: {
        Row: {
          created_at: string
          itinerary_id: number
          itinerary_poi_id: number
          note: string | null
          place_id: string
          sequence_num: number
          travel_method: string | null
        }
        Insert: {
          created_at?: string
          itinerary_id: number
          itinerary_poi_id?: number
          note?: string | null
          place_id: string
          sequence_num: number
          travel_method?: string | null
        }
        Update: {
          created_at?: string
          itinerary_id?: number
          itinerary_poi_id?: number
          note?: string | null
          place_id?: string
          sequence_num?: number
          travel_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_poi_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itinerary"
            referencedColumns: ["itinerary_id"]
          },
          {
            foreignKeyName: "itinerary_poi_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "POI"
            referencedColumns: ["place_id"]
          },
        ]
      }
      place_categories: {
        Row: {
          name: string
          place_categories_id: number
        }
        Insert: {
          name: string
          place_categories_id?: number
        }
        Update: {
          name?: string
          place_categories_id?: number
        }
        Relationships: []
      }
      POI: {
        Row: {
          address: string
          category: string[]
          created_at: string
          geometry: Json | null
          image_url: string
          name: string
          opening_hours: Json | null
          place_id: string
          rating: number | null
        }
        Insert: {
          address: string
          category: string[]
          created_at?: string
          geometry?: Json | null
          image_url: string
          name: string
          opening_hours?: Json | null
          place_id: string
          rating?: number | null
        }
        Update: {
          address?: string
          category?: string[]
          created_at?: string
          geometry?: Json | null
          image_url?: string
          name?: string
          opening_hours?: Json | null
          place_id?: string
          rating?: number | null
        }
        Relationships: []
      }
      POI_types: {
        Row: {
          id: number
          name: string | null
          place_categories_id: number | null
        }
        Insert: {
          id?: never
          name?: string | null
          place_categories_id?: number | null
        }
        Update: {
          id?: never
          name?: string | null
          place_categories_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "poi_types_place_categories_id_fkey"
            columns: ["place_categories_id"]
            isOneToOne: false
            referencedRelation: "place_categories"
            referencedColumns: ["place_categories_id"]
          },
        ]
      }
      poll_answer: {
        Row: {
          answer: string
          poll_answer_id: number
          poll_id: number
        }
        Insert: {
          answer: string
          poll_answer_id?: number
          poll_id: number
        }
        Update: {
          answer?: string
          poll_answer_id?: number
          poll_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_answer_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["poll_id"]
          },
        ]
      }
      poll_vote: {
        Row: {
          created_at: string
          poll_answer_id: number
          poll_vote_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          poll_answer_id: number
          poll_vote_id?: number
          user_id?: string
        }
        Update: {
          created_at?: string
          poll_answer_id?: number
          poll_vote_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_vote_poll_answer_id_fkey"
            columns: ["poll_answer_id"]
            isOneToOne: false
            referencedRelation: "poll_answer"
            referencedColumns: ["poll_answer_id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string
          poll_id: number
          question: string
        }
        Insert: {
          created_at?: string
          poll_id?: number
          question: string
        }
        Update: {
          created_at?: string
          poll_id?: number
          question?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      section: {
        Row: {
          created_at: string
          section_id: number
          section_title: string
          trip_id: number
        }
        Insert: {
          created_at?: string
          section_id?: number
          section_title: string
          trip_id: number
        }
        Update: {
          created_at?: string
          section_id?: number
          section_title?: string
          trip_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "section_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["trip_id"]
          },
        ]
      }
      section_poi: {
        Row: {
          created_at: string
          note: string | null
          place_id: string
          section_id: number
          section_poi_id: number
          sequence_num: number
        }
        Insert: {
          created_at?: string
          note?: string | null
          place_id: string
          section_id: number
          section_poi_id?: number
          sequence_num: number
        }
        Update: {
          created_at?: string
          note?: string | null
          place_id?: string
          section_id?: number
          section_poi_id?: number
          sequence_num?: number
        }
        Relationships: [
          {
            foreignKeyName: "section_poi_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "POI"
            referencedColumns: ["place_id"]
          },
          {
            foreignKeyName: "section_poi_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "section"
            referencedColumns: ["section_id"]
          },
        ]
      }
      trip_participants: {
        Row: {
          created_at: string
          trip_id: number
          trip_participant_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          trip_id: number
          trip_participant_id?: number
          user_id?: string
        }
        Update: {
          created_at?: string
          trip_id?: number
          trip_participant_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_participants_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "trip_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          place_id: string
          place_name: string
          start_date: string
          status: Database["public"]["Enums"]["privacy_status"]
          title: string
          trip_id: number
          types: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          place_id: string
          place_name: string
          start_date: string
          status: Database["public"]["Enums"]["privacy_status"]
          title: string
          trip_id?: number
          types: string[]
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          place_id?: string
          place_name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["privacy_status"]
          title?: string
          trip_id?: number
          types?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_trips: {
        Args: {
          user_id: string
        }
        Returns: {
          planning: number
          ongoing: number
          finished: number
        }[]
      }
      get_trip_details: {
        Args: {
          param_trip_id: number
        }
        Returns: {
          trip_id: number
          title: string
          start_date: string
          end_date: string
          description: string
          place_name: string
          types: string[]
          status: Database["public"]["Enums"]["privacy_status"]
          host_user_id: string
          host_email: string
          host_username: string
          host_full_name: string
          host_avatar_url: string
          host_website: string
          place_id: string
          participant_user_id: string
          participant_email: string
          participant_username: string
          participant_full_name: string
          participant_avatar_url: string
        }[]
      }
      get_trip_plans: {
        Args: {
          user_id: string
        }
        Returns: {
          trip_id: number
          title: string
          start_date: string
          end_date: string
          place_id: string
          total_days: number
          status: string
        }[]
      }
    }
    Enums: {
      expenses_share_type: "Individuals" | "Equal"
      privacy_status: "Friends" | "Private" | "Public"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
