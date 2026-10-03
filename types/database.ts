export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type JobStatus = 'draft' | 'published' | 'closed' | string
export type ContactStatus = 'pending' | 'reviewed' | 'contacted' | 'rejected' | string
export type UserRole = 'admin' | 'editor' | 'user'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          role: UserRole
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone?: string | null
          role?: UserRole
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          role?: UserRole
          created_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          type: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          type: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          type?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          id: string
          title: string
          slug: string
          thumbnail_url: string | null
          salary: string | null
          location: string | null
          working_hours: string | null
          requirements: string | null
          benefits: string | null
          content: string | null
          contact_info: string | null
          status: JobStatus
          is_featured: boolean
          category_id: string | null
          author_id: string | null
          views_count: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          thumbnail_url?: string | null
          salary?: string | null
          location?: string | null
          working_hours?: string | null
          requirements?: string | null
          benefits?: string | null
          content?: string | null
          contact_info?: string | null
          status?: JobStatus
          is_featured?: boolean
          category_id?: string | null
          author_id?: string | null
          views_count?: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          thumbnail_url?: string | null
          salary?: string | null
          location?: string | null
          working_hours?: string | null
          requirements?: string | null
          benefits?: string | null
          content?: string | null
          contact_info?: string | null
          status?: JobStatus
          is_featured?: boolean
          category_id?: string | null
          author_id?: string | null
          views_count?: number
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      contacts: {
        Row: {
          id: string
          full_name: string
          phone: string
          email: string | null
          note: string | null
          job_id: string | null
          assigned_to: string | null
          status: ContactStatus
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone: string
          email?: string | null
          note?: string | null
          job_id?: string | null
          assigned_to?: string | null
          status?: ContactStatus
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          email?: string | null
          note?: string | null
          job_id?: string | null
          assigned_to?: string | null
          status?: ContactStatus
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenient entity types for use in components & actions
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type Job = Database['public']['Tables']['jobs']['Row']
export type JobInsert = Database['public']['Tables']['jobs']['Insert']
export type JobUpdate = Database['public']['Tables']['jobs']['Update']

export type JobWithCategory = Job & {
  category?: Category | null
  author?: Profile | null
}

export type Contact = Database['public']['Tables']['contacts']['Row']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']
export type ContactWithRelations = Contact & {
  job?: Job | null
  assigned_staff?: Profile | null
}
