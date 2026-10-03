// Generated from the migrated PostgreSQL test engine. Do not edit manually.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          slug: string;
          description: string;
          image_url: string | null;
          display_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          slug: string;
          description?: string;
          image_url?: string | null;
          display_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          slug?: string;
          description?: string;
          image_url?: string | null;
          display_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      checkout_requests: {
        Row: {
          id: string;
          session_hash: string;
          idempotency_key: string;
          payload_hash: string;
          order_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_hash: string;
          idempotency_key: string;
          payload_hash: string;
          order_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_hash?: string;
          idempotency_key?: string;
          payload_hash?: string;
          order_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      customer_addresses: {
        Row: {
          id: string;
          customer_id: string;
          cep: string;
          street: string;
          number: string;
          complement: string;
          neighborhood: string;
          city: string;
          state: string;
          reference: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          cep: string;
          street: string;
          number: string;
          complement?: string;
          neighborhood: string;
          city: string;
          state: string;
          reference?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          cep?: string;
          street?: string;
          number?: string;
          complement?: string;
          neighborhood?: string;
          city?: string;
          state?: string;
          reference?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          auth_user_id: string | null;
          name: string;
          phone: string;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          name: string;
          phone: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          name?: string;
          phone?: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      delivery_zones: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          cep_start: string;
          cep_end: string;
          city: string;
          state: string;
          fee_cents: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          cep_start: string;
          cep_end: string;
          city: string;
          state: string;
          fee_cents: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          cep_start?: string;
          cep_end?: string;
          city?: string;
          state?: string;
          fee_cents?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      option_groups: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          kind: string;
          min_selections: number;
          max_selections: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          kind: string;
          min_selections?: number;
          max_selections?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          kind?: string;
          min_selections?: number;
          max_selections?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_access_tokens: {
        Row: {
          id: string;
          order_id: string;
          token_hash: string;
          expires_at: string;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          token_hash: string;
          expires_at: string;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          token_hash?: string;
          expires_at?: string;
          revoked_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      order_events: {
        Row: {
          id: number;
          order_id: string;
          event_type: string;
          actor_id: string | null;
          public_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          order_id: string;
          event_type: string;
          actor_id?: string | null;
          public_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          order_id?: string;
          event_type?: string;
          actor_id?: string | null;
          public_message?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      order_item_options: {
        Row: {
          id: string;
          order_item_id: string;
          option_id: string | null;
          group_name: string;
          option_name: string;
          quantity: number;
          price_cents: number;
        };
        Insert: {
          id?: string;
          order_item_id: string;
          option_id?: string | null;
          group_name: string;
          option_name: string;
          quantity?: number;
          price_cents: number;
        };
        Update: {
          id?: string;
          order_item_id?: string;
          option_id?: string | null;
          group_name?: string;
          option_name?: string;
          quantity?: number;
          price_cents?: number;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          size_name: string | null;
          quantity: number;
          unit_price_cents: number;
          total_price_cents: number;
          notes: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          size_name?: string | null;
          quantity: number;
          unit_price_cents: number;
          total_price_cents: number;
          notes?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          size_name?: string | null;
          quantity?: number;
          unit_price_cents?: number;
          total_price_cents?: number;
          notes?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          store_id: string;
          public_order_number: number;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          order_type: string;
          address_snapshot: Json | null;
          subtotal_cents: number;
          delivery_fee_cents: number;
          discount_cents: number;
          total_cents: number;
          currency: string;
          payment_method: string;
          payment_status: string;
          order_status: string;
          customer_notes: string;
          internal_notes: string;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          public_order_number?: never;
          customer_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          order_type: string;
          address_snapshot?: Json | null;
          subtotal_cents: number;
          delivery_fee_cents?: number;
          discount_cents?: number;
          total_cents: number;
          currency?: string;
          payment_method: string;
          payment_status?: string;
          order_status?: string;
          customer_notes?: string;
          internal_notes?: string;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          public_order_number?: never;
          customer_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          order_type?: string;
          address_snapshot?: Json | null;
          subtotal_cents?: number;
          delivery_fee_cents?: number;
          discount_cents?: number;
          total_cents?: number;
          currency?: string;
          payment_method?: string;
          payment_status?: string;
          order_status?: string;
          customer_notes?: string;
          internal_notes?: string;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          provider: string;
          provider_order_id: string | null;
          provider_payment_id: string | null;
          idempotency_key: string;
          attempt: number;
          amount_cents: number;
          currency: string;
          status: string;
          payment_method: string;
          external_reference: string;
          provider_status: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          provider: string;
          provider_order_id?: string | null;
          provider_payment_id?: string | null;
          idempotency_key: string;
          attempt: number;
          amount_cents: number;
          currency?: string;
          status?: string;
          payment_method: string;
          external_reference: string;
          provider_status?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          provider?: string;
          provider_order_id?: string | null;
          provider_payment_id?: string | null;
          idempotency_key?: string;
          attempt?: number;
          amount_cents?: number;
          currency?: string;
          status?: string;
          payment_method?: string;
          external_reference?: string;
          provider_status?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_option_relations: {
        Row: { product_id: string; option_id: string; store_id: string };
        Insert: { product_id: string; option_id: string; store_id: string };
        Update: { product_id?: string; option_id?: string; store_id?: string };
        Relationships: [];
      };
      product_options: {
        Row: {
          id: string;
          option_group_id: string;
          store_id: string;
          name: string;
          additional_price_cents: number;
          active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          option_group_id: string;
          store_id: string;
          name: string;
          additional_price_cents?: number;
          active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          option_group_id?: string;
          store_id?: string;
          name?: string;
          additional_price_cents?: number;
          active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_sizes: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          price_cents: number;
          active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          price_cents: number;
          active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          price_cents?: number;
          active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          category_id: string;
          name: string;
          slug: string;
          description: string;
          image_url: string | null;
          base_price_cents: number;
          active: boolean;
          available: boolean;
          featured: boolean;
          display_order: number;
          tag: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          category_id: string;
          name: string;
          slug: string;
          description?: string;
          image_url?: string | null;
          base_price_cents: number;
          active?: boolean;
          available?: boolean;
          featured?: boolean;
          display_order?: number;
          tag?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          category_id?: string;
          name?: string;
          slug?: string;
          description?: string;
          image_url?: string | null;
          base_price_cents?: number;
          active?: boolean;
          available?: boolean;
          featured?: boolean;
          display_order?: number;
          tag?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      staff_members: {
        Row: {
          user_id: string;
          store_id: string;
          role: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          store_id: string;
          role?: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          store_id?: string;
          role?: string;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      store_hours: {
        Row: {
          id: string;
          store_id: string;
          weekday: number;
          opens_at: string;
          closes_at: string;
          closes_next_day: boolean;
        };
        Insert: {
          id?: string;
          store_id: string;
          weekday: number;
          opens_at: string;
          closes_at: string;
          closes_next_day?: boolean;
        };
        Update: {
          id?: string;
          store_id?: string;
          weekday?: number;
          opens_at?: string;
          closes_at?: string;
          closes_next_day?: boolean;
        };
        Relationships: [];
      };
      store_settings: {
        Row: {
          store_id: string;
          timezone: string;
          phone: string;
          whatsapp: string;
          address: string;
          minimum_order_cents: number;
          estimated_minutes: number;
          ordering_enabled: boolean;
          pickup_enabled: boolean;
          delivery_enabled: boolean;
          pix_enabled: boolean;
          card_enabled: boolean;
          cash_enabled: boolean;
          opening_override: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          store_id: string;
          timezone?: string;
          phone?: string;
          whatsapp?: string;
          address?: string;
          minimum_order_cents?: number;
          estimated_minutes?: number;
          ordering_enabled?: boolean;
          pickup_enabled?: boolean;
          delivery_enabled?: boolean;
          pix_enabled?: boolean;
          card_enabled?: boolean;
          cash_enabled?: boolean;
          opening_override?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          store_id?: string;
          timezone?: string;
          phone?: string;
          whatsapp?: string;
          address?: string;
          minimum_order_cents?: number;
          estimated_minutes?: number;
          ordering_enabled?: boolean;
          pickup_enabled?: boolean;
          delivery_enabled?: boolean;
          pix_enabled?: boolean;
          card_enabled?: boolean;
          cash_enabled?: boolean;
          opening_override?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stores: {
        Row: {
          id: string;
          name: string;
          slug: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      webhook_events: {
        Row: {
          id: string;
          provider: string;
          external_event_id: string;
          resource_id: string;
          status: string;
          attempts: number;
          next_retry_at: string | null;
          received_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          provider: string;
          external_event_id: string;
          resource_id: string;
          status?: string;
          attempts?: number;
          next_retry_at?: string | null;
          received_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          provider?: string;
          external_event_id?: string;
          resource_id?: string;
          status?: string;
          attempts?: number;
          next_retry_at?: string | null;
          received_at?: string;
          processed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
