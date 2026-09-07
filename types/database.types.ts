export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rejected"
  | "no_show";

export type BlogPostStatus = "draft" | "published" | "archived";
export type ServiceStatus = "draft" | "published" | "archived";

type Role = "admin" | "staff";

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
          date_of_birth: string | null;
          notes: string | null;
          is_active: boolean;
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
          date_of_birth?: string | null;
          notes?: string | null;
          is_active?: boolean;
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
          short_description: string | null;
          content: string | null;
          cover_image_url: string | null;
          suitable_for: string | null;
          benefits: string | null;
          process: string | null;
          preparation_notes: string | null;
          faq: Json;
          testimonials: Json;
          seo_title: string | null;
          seo_description: string | null;
          status: ServiceStatus;
          published_at: string | null;
          deleted_at: string | null;
          duration_minutes: number;
          price: number;
          is_active: boolean;
          slug: string;
          display_order: number;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          short_description?: string | null;
          content?: string | null;
          cover_image_url?: string | null;
          suitable_for?: string | null;
          benefits?: string | null;
          process?: string | null;
          preparation_notes?: string | null;
          faq?: Json;
          testimonials?: Json;
          seo_title?: string | null;
          seo_description?: string | null;
          status?: ServiceStatus;
          published_at?: string | null;
          deleted_at?: string | null;
          duration_minutes: number;
          price?: number;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string | null;
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
          staff_id: string | null;
          appointment_date: string;
          start_time: string;
          end_time: string;
          timezone: string;
          status: AppointmentStatus;
          source: "website" | "admin";
          customer_message: string | null;
          internal_note: string | null;
          cancellation_reason: string | null;
          confirmed_at: string | null;
          cancelled_at: string | null;
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
          staff_id?: string | null;
          appointment_date: string;
          start_time: string;
          end_time: string;
          timezone?: string;
          status?: AppointmentStatus;
          source?: "website" | "admin";
          customer_message?: string | null;
          internal_note?: string | null;
          cancellation_reason?: string | null;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
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
          staff_id: string | null;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          staff_id?: string | null;
          day_of_week: number;
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
          staff_id: string | null;
          blocked_date: string;
          start_time: string;
          end_time: string;
          reason: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          staff_id?: string | null;
          blocked_date: string;
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
          old_status: AppointmentStatus | null;
          new_status: AppointmentStatus;
          changed_by: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          old_status?: AppointmentStatus | null;
          new_status: AppointmentStatus;
          changed_by?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointment_status_history"]["Insert"]>;
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          cover_image_url: string | null;
          status: BlogPostStatus;
          author_id: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content: string;
          cover_image_url?: string | null;
          status?: BlogPostStatus;
          author_id?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      admin_change_appointment_status: {
        Args: {
          p_appointment_id: string;
          p_actor_id: string;
          p_expected_status: AppointmentStatus;
          p_new_status: AppointmentStatus;
          p_note?: string | null;
        };
        Returns: {
          appointment_id: string;
          old_status: AppointmentStatus;
          new_status: AppointmentStatus;
          updated_at: string;
        }[];
      };
    };
    Enums: {
      app_role: Role;
      appointment_source: "website" | "admin";
      appointment_status: AppointmentStatus;
      blog_post_status: BlogPostStatus;
      service_status: ServiceStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
