export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "rescheduled"
  | "completed"
  | "cancelled"
  | "no_show";

type Role = "admin" | "staff" | "customer";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: Role;
          is_active: boolean;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: Role;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          auth_user_id: string | null;
          must_change_password: boolean;
          email: string | null;
          birth_date: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone: string;
          auth_user_id?: string | null;
          must_change_password?: boolean;
          email?: string | null;
          birth_date?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          price: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          duration_minutes: number;
          price?: number;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          booking_code: string;
          customer_id: string;
          service_id: string;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status: AppointmentStatus;
          source: "website" | "admin";
          customer_message: string | null;
          internal_note: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          booking_code?: string;
          customer_id: string;
          service_id: string;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status?: AppointmentStatus;
          source?: "website" | "admin";
          customer_message?: string | null;
          internal_note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
        Relationships: [];
      };
      working_hours: {
        Row: {
          id: string;
          weekday: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          weekday: number;
          start_time: string;
          end_time: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["working_hours"]["Insert"]>;
        Relationships: [];
      };
      blocked_times: {
        Row: {
          id: string;
          start_time: string;
          end_time: string;
          reason: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          start_time: string;
          end_time: string;
          reason?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["blocked_times"]["Insert"]>;
        Relationships: [];
      };
      appointment_status_history: {
        Row: {
          id: string;
          appointment_id: string;
          from_status: AppointmentStatus | null;
          to_status: AppointmentStatus;
          changed_by: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          from_status?: AppointmentStatus | null;
          to_status: AppointmentStatus;
          changed_by?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointment_status_history"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
