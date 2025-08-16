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
      analytics_daily: {
        Row: {
          id: string;
          date: string;
          total_orders: number | null;
          completed_orders: number | null;
          cancelled_orders: number | null;
          gross_revenue: number | null;
          net_revenue: number | null;
          tax_collected: number | null;
          discounts_given: number | null;
          credits_used: number | null;
          refunds_issued: number | null;
          new_customers: number | null;
          returning_customers: number | null;
          total_customers: number | null;
          top_selling_products: Json | null;
          product_revenue_breakdown: Json | null;
          referral_codes_used: number | null;
          referral_revenue: number | null;
          new_referrals: number | null;
          avg_order_value: number | null;
          avg_fulfillment_time_hours: number | null;
          customer_satisfaction_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          total_orders?: number | null;
          completed_orders?: number | null;
          cancelled_orders?: number | null;
          gross_revenue?: number | null;
          net_revenue?: number | null;
          tax_collected?: number | null;
          discounts_given?: number | null;
          credits_used?: number | null;
          refunds_issued?: number | null;
          new_customers?: number | null;
          returning_customers?: number | null;
          total_customers?: number | null;
          top_selling_products?: Json | null;
          product_revenue_breakdown?: Json | null;
          referral_codes_used?: number | null;
          referral_revenue?: number | null;
          new_referrals?: number | null;
          avg_order_value?: number | null;
          avg_fulfillment_time_hours?: number | null;
          customer_satisfaction_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          total_orders?: number | null;
          completed_orders?: number | null;
          cancelled_orders?: number | null;
          gross_revenue?: number | null;
          net_revenue?: number | null;
          tax_collected?: number | null;
          discounts_given?: number | null;
          credits_used?: number | null;
          refunds_issued?: number | null;
          new_customers?: number | null;
          returning_customers?: number | null;
          total_customers?: number | null;
          top_selling_products?: Json | null;
          product_revenue_breakdown?: Json | null;
          referral_codes_used?: number | null;
          referral_revenue?: number | null;
          new_referrals?: number | null;
          avg_order_value?: number | null;
          avg_fulfillment_time_hours?: number | null;
          customer_satisfaction_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bundles: {
        Row: {
          active: boolean | null;
          badge: string | null;
          created_at: string | null;
          description: string;
          discount: number;
          discounted_price: number;
          duration: string;
          features: string[] | null;
          id: string;
          name: string;
          orders_count: number | null;
          original_price: number;
          popular: boolean | null;
          services: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean | null;
          badge?: string | null;
          created_at?: string | null;
          description: string;
          discount: number;
          discounted_price: number;
          duration: string;
          features?: string[] | null;
          id?: string;
          name: string;
          orders_count?: number | null;
          original_price: number;
          popular?: boolean | null;
          services?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean | null;
          badge?: string | null;
          created_at?: string | null;
          description?: string;
          discount?: number;
          discounted_price?: number;
          duration?: string;
          features?: string[] | null;
          id?: string;
          name?: string;
          orders_count?: number | null;
          original_price?: number;
          popular?: boolean | null;
          services?: string[] | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      communications: {
        Row: {
          id: string;
          type: string;
          channel: string;
          user_id: string | null;
          recipient_email: string | null;
          recipient_phone: string | null;
          subject: string | null;
          message: string;
          html_content: string | null;
          order_id: string | null;
          template_id: string | null;
          status: string;
          sent_at: string | null;
          delivered_at: string | null;
          read_at: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          channel: string;
          user_id?: string | null;
          recipient_email?: string | null;
          recipient_phone?: string | null;
          subject?: string | null;
          message: string;
          html_content?: string | null;
          order_id?: string | null;
          template_id?: string | null;
          status?: string;
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          channel?: string;
          user_id?: string | null;
          recipient_email?: string | null;
          recipient_phone?: string | null;
          subject?: string | null;
          message?: string;
          html_content?: string | null;
          order_id?: string | null;
          template_id?: string | null;
          status?: string;
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          transaction_type: string;
          description: string | null;
          order_id: string | null;
          custom_order_id: string | null;
          referral_transaction_id: string | null;
          balance_before: number;
          balance_after: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          transaction_type: string;
          description?: string | null;
          order_id?: string | null;
          custom_order_id?: string | null;
          referral_transaction_id?: string | null;
          balance_before: number;
          balance_after: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          transaction_type?: string;
          description?: string | null;
          order_id?: string | null;
          custom_order_id?: string | null;
          referral_transaction_id?: string | null;
          balance_before?: number;
          balance_after?: number;
          created_at?: string | null;
        };
        Relationships: [];
      };
      custom_order_items: {
        Row: {
          id: string;
          order_id: string | null;
          category: string;
          item_name: string;
          quantity: number;
          price_per_unit: number;
          total_price: number;
          description: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          category: string;
          item_name: string;
          quantity?: number;
          price_per_unit: number;
          total_price: number;
          description?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          category?: string;
          item_name?: string;
          quantity?: number;
          price_per_unit?: number;
          total_price?: number;
          description?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      custom_orders: {
        Row: {
          id: string;
          user_id: string | null;
          order_number: string;
          status: string;
          total_amount: number;
          currency: string;
          items: Json;
          special_instructions: string | null;
          customer_email: string | null;
          customer_discord: string | null;
          payment_intent_id: string | null;
          delivery_status: string | null;
          delivery_notes: string | null;
          admin_notes: string | null;
          created_at: string | null;
          updated_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          order_number?: string;
          status?: string;
          total_amount?: number;
          currency?: string;
          items?: Json;
          special_instructions?: string | null;
          customer_email?: string | null;
          customer_discord?: string | null;
          payment_intent_id?: string | null;
          delivery_status?: string | null;
          delivery_notes?: string | null;
          admin_notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          order_number?: string;
          status?: string;
          total_amount?: number;
          currency?: string;
          items?: Json;
          special_instructions?: string | null;
          customer_email?: string | null;
          customer_discord?: string | null;
          payment_intent_id?: string | null;
          delivery_status?: string | null;
          delivery_notes?: string | null;
          admin_notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      custom_pricing: {
        Row: {
          id: string;
          category: string;
          item_name: string;
          base_price: number;
          price_per_unit: number;
          minimum_quantity: number;
          maximum_quantity: number | null;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          item_name: string;
          base_price?: number;
          price_per_unit?: number;
          minimum_quantity?: number;
          maximum_quantity?: number | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          item_name?: string;
          base_price?: number;
          price_per_unit?: number;
          minimum_quantity?: number;
          maximum_quantity?: number | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          customer_email: string;
          customer_name: string;
          services: Json;
          status: string;
          total_amount: number;
          payment_status: string;
          progress: number | null;
          assigned_booster: string | null;
          estimated_completion: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
          ip_address: string | null;
          transaction_id: string | null;
          referral_code: string | null;
          referral_discount: number | null;
          credits_used: number | null;
          status_history: Json | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          customer_email: string;
          customer_name: string;
          services?: Json;
          status?: string;
          total_amount: number;
          payment_status?: string;
          progress?: number | null;
          assigned_booster?: string | null;
          estimated_completion?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          ip_address?: string | null;
          transaction_id?: string | null;
          referral_code?: string | null;
          referral_discount?: number | null;
          credits_used?: number | null;
          status_history?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          customer_email?: string;
          customer_name?: string;
          services?: Json;
          status?: string;
          total_amount?: number;
          payment_status?: string;
          progress?: number | null;
          assigned_booster?: string | null;
          estimated_completion?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          ip_address?: string | null;
          transaction_id?: string | null;
          referral_code?: string | null;
          referral_discount?: number | null;
          credits_used?: number | null;
          status_history?: Json | null;
        };
        Relationships: [];
      };
      order_messages: {
        Row: {
          id: string;
          order_id: string | null;
          from: string;
          message: string;
          is_read: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          from: string;
          message: string;
          is_read?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          from?: string;
          message?: string;
          is_read?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      order_tracking: {
        Row: {
          id: string;
          order_id: string | null;
          status: string;
          description: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          status: string;
          description: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          status?: string;
          description?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          short_description: string | null;
          product_type: string;
          category: string;
          subcategory: string | null;
          tags: string[] | null;
          base_price: number;
          sale_price: number | null;
          cost_price: number | null;
          price_per_unit: number | null;
          minimum_quantity: number | null;
          maximum_quantity: number | null;
          features: string[] | null;
          specifications: Json | null;
          requirements: string[] | null;
          estimated_duration_hours: number | null;
          difficulty_level: string | null;
          auto_fulfill: boolean | null;
          stock_quantity: number | null;
          track_inventory: boolean | null;
          allow_backorder: boolean | null;
          meta_title: string | null;
          meta_description: string | null;
          featured_image: string | null;
          gallery_images: string[] | null;
          status: string;
          visibility: string;
          featured: boolean | null;
          popular: boolean | null;
          view_count: number | null;
          order_count: number | null;
          conversion_rate: number | null;
          bundled_products: Json | null;
          bundle_type: string | null;
          created_at: string;
          updated_at: string;
          published_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          short_description?: string | null;
          product_type?: string;
          category: string;
          subcategory?: string | null;
          tags?: string[] | null;
          base_price?: number;
          sale_price?: number | null;
          cost_price?: number | null;
          price_per_unit?: number | null;
          minimum_quantity?: number | null;
          maximum_quantity?: number | null;
          features?: string[] | null;
          specifications?: Json | null;
          requirements?: string[] | null;
          estimated_duration_hours?: number | null;
          difficulty_level?: string | null;
          auto_fulfill?: boolean | null;
          stock_quantity?: number | null;
          track_inventory?: boolean | null;
          allow_backorder?: boolean | null;
          meta_title?: string | null;
          meta_description?: string | null;
          featured_image?: string | null;
          gallery_images?: string[] | null;
          status?: string;
          visibility?: string;
          featured?: boolean | null;
          popular?: boolean | null;
          view_count?: number | null;
          order_count?: number | null;
          conversion_rate?: number | null;
          bundled_products?: Json | null;
          bundle_type?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          short_description?: string | null;
          product_type?: string;
          category?: string;
          subcategory?: string | null;
          tags?: string[] | null;
          base_price?: number;
          sale_price?: number | null;
          cost_price?: number | null;
          price_per_unit?: number | null;
          minimum_quantity?: number | null;
          maximum_quantity?: number | null;
          features?: string[] | null;
          specifications?: Json | null;
          requirements?: string[] | null;
          estimated_duration_hours?: number | null;
          difficulty_level?: string | null;
          auto_fulfill?: boolean | null;
          stock_quantity?: number | null;
          track_inventory?: boolean | null;
          allow_backorder?: boolean | null;
          meta_title?: string | null;
          meta_description?: string | null;
          featured_image?: string | null;
          gallery_images?: string[] | null;
          status?: string;
          visibility?: string;
          featured?: boolean | null;
          popular?: boolean | null;
          view_count?: number | null;
          order_count?: number | null;
          conversion_rate?: number | null;
          bundled_products?: Json | null;
          bundle_type?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string | null;
          credit_balance: number | null;
          discord_username: string | null;
          email: string | null;
          id: string;
          role: string | null;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          created_at?: string | null;
          credit_balance?: number | null;
          discord_username?: string | null;
          email?: string | null;
          id: string;
          role?: string | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          created_at?: string | null;
          credit_balance?: number | null;
          discord_username?: string | null;
          email?: string | null;
          id?: string;
          role?: string | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
      referral_codes: {
        Row: {
          id: string;
          code: string;
          owner_user_id: string;
          is_active: boolean | null;
          uses_count: number | null;
          max_uses: number | null;
          created_at: string | null;
          updated_at: string | null;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          owner_user_id: string;
          is_active?: boolean | null;
          uses_count?: number | null;
          max_uses?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          owner_user_id?: string;
          is_active?: boolean | null;
          uses_count?: number | null;
          max_uses?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          expires_at?: string | null;
        };
        Relationships: [];
      };
      referral_transactions: {
        Row: {
          id: string;
          referral_code: string;
          referrer_user_id: string;
          referred_user_id: string | null;
          order_id: string | null;
          custom_order_id: string | null;
          commission_amount: number | null;
          discount_amount: number | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          referral_code: string;
          referrer_user_id: string;
          referred_user_id?: string | null;
          order_id?: string | null;
          custom_order_id?: string | null;
          commission_amount?: number | null;
          discount_amount?: number | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          referral_code?: string;
          referrer_user_id?: string;
          referred_user_id?: string | null;
          order_id?: string | null;
          custom_order_id?: string | null;
          commission_amount?: number | null;
          discount_amount?: number | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          original_price: number | null;
          duration: string;
          difficulty: string;
          features: string[] | null;
          active: boolean | null;
          popular: boolean | null;
          orders_count: number | null;
          created_at: string | null;
          updated_at: string | null;
          category: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          original_price?: number | null;
          duration: string;
          difficulty: string;
          features?: string[] | null;
          active?: boolean | null;
          popular?: boolean | null;
          orders_count?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          category?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          original_price?: number | null;
          duration?: string;
          difficulty?: string;
          features?: string[] | null;
          active?: boolean | null;
          popular?: boolean | null;
          orders_count?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          category?: string | null;
        };
        Relationships: [];
      };
      unified_orders: {
        Row: {
          id: string;
          order_number: string;
          order_type: string;
          user_id: string | null;
          customer_email: string;
          customer_name: string;
          customer_discord: string | null;
          items: Json;
          subtotal_amount: number;
          tax_amount: number;
          discount_amount: number;
          credits_used: number;
          total_amount: number;
          currency: string;
          status: string;
          payment_status: string;
          fulfillment_status: string;
          progress: number | null;
          estimated_completion_hours: number | null;
          actual_completion_time: string | null;
          transaction_id: string | null;
          payment_method: string | null;
          ip_address: string | null;
          referral_code: string | null;
          referral_discount: number | null;
          notes: string | null;
          special_instructions: string | null;
          admin_notes: string | null;
          metadata: Json | null;
          tags: string[] | null;
          status_history: Json | null;
          created_at: string;
          updated_at: string;
          confirmed_at: string | null;
          completed_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          order_number?: string;
          order_type?: string;
          user_id?: string | null;
          customer_email: string;
          customer_name: string;
          customer_discord?: string | null;
          items?: Json;
          subtotal_amount?: number;
          tax_amount?: number;
          discount_amount?: number;
          credits_used?: number;
          total_amount?: number;
          currency?: string;
          status?: string;
          payment_status?: string;
          fulfillment_status?: string;
          progress?: number | null;
          estimated_completion_hours?: number | null;
          actual_completion_time?: string | null;
          transaction_id?: string | null;
          payment_method?: string | null;
          ip_address?: string | null;
          referral_code?: string | null;
          referral_discount?: number | null;
          notes?: string | null;
          special_instructions?: string | null;
          admin_notes?: string | null;
          metadata?: Json | null;
          tags?: string[] | null;
          status_history?: Json | null;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string | null;
          completed_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          order_number?: string;
          order_type?: string;
          user_id?: string | null;
          customer_email?: string;
          customer_name?: string;
          customer_discord?: string | null;
          items?: Json;
          subtotal_amount?: number;
          tax_amount?: number;
          discount_amount?: number;
          credits_used?: number;
          total_amount?: number;
          currency?: string;
          status?: string;
          payment_status?: string;
          fulfillment_status?: string;
          progress?: number | null;
          estimated_completion_hours?: number | null;
          actual_completion_time?: string | null;
          transaction_id?: string | null;
          payment_method?: string | null;
          ip_address?: string | null;
          referral_code?: string | null;
          referral_discount?: number | null;
          notes?: string | null;
          special_instructions?: string | null;
          admin_notes?: string | null;
          metadata?: Json | null;
          tags?: string[] | null;
          status_history?: Json | null;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string | null;
          completed_at?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      user_activities: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          activity_type: string;
          activity_category: string;
          description: string | null;
          page_url: string | null;
          referrer_url: string | null;
          user_agent: string | null;
          ip_address: string | null;
          order_id: string | null;
          product_id: string | null;
          data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          activity_type: string;
          activity_category: string;
          description?: string | null;
          page_url?: string | null;
          referrer_url?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          order_id?: string | null;
          product_id?: string | null;
          data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          activity_type?: string;
          activity_category?: string;
          description?: string | null;
          page_url?: string | null;
          referrer_url?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          order_id?: string | null;
          product_id?: string | null;
          data?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_referral_usage: {
        Row: {
          id: string;
          user_id: string;
          referral_code: string;
          used_at: string | null;
          order_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          referral_code: string;
          used_at?: string | null;
          order_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          referral_code?: string;
          used_at?: string | null;
          order_id?: string | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          order_id: string | null;
          user_id: string | null;
          customer_name: string;
          customer_email: string;
          rating: number;
          title: string;
          content: string;
          purchased_item: string;
          purchase_value: number;
          order_type: string;
          completion_time_hours: number | null;
          verified_purchase: boolean | null;
          helpful_count: number | null;
          reported_count: number | null;
          is_featured: boolean | null;
          is_approved: boolean | null;
          admin_notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          user_id?: string | null;
          customer_name: string;
          customer_email: string;
          rating: number;
          title: string;
          content: string;
          purchased_item: string;
          purchase_value: number;
          order_type: string;
          completion_time_hours?: number | null;
          verified_purchase?: boolean | null;
          helpful_count?: number | null;
          reported_count?: number | null;
          is_featured?: boolean | null;
          is_approved?: boolean | null;
          admin_notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          user_id?: string | null;
          customer_name?: string;
          customer_email?: string;
          rating?: number;
          title?: string;
          content?: string;
          purchased_item?: string;
          purchase_value?: number;
          order_type?: string;
          completion_time_hours?: number | null;
          verified_purchase?: boolean | null;
          helpful_count?: number | null;
          reported_count?: number | null;
          is_featured?: boolean | null;
          is_approved?: boolean | null;
          admin_notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "unified_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      review_helpful: {
        Row: {
          id: string;
          review_id: string | null;
          user_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          review_id?: string | null;
          user_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          review_id?: string | null;
          user_id?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "review_helpful_review_id_fkey";
            columns: ["review_id"];
            referencedRelation: "reviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_helpful_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {
      get_custom_order_stats: {
        Args: {};
        Returns: {
          total_orders: number;
          total_revenue: number;
          avg_order_value: number;
          pending_orders: number;
          completed_orders: number;
          most_popular_category?: string;
        }[];
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;
