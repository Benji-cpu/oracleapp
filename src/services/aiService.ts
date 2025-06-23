import { supabase } from '../lib/supabase';

export interface GenerateMeaningRequest {
  card_id: string;
  title?: string;
  keywords?: string[];
  style_template?: string;
}

export interface GenerateImageRequest {
  card_id: string;
  title?: string;
  meaning?: string;
  keywords?: string[];
  style_template?: string;
}

export interface InterpretReadingRequest {
  reading_id: string;
}

export class AIService {
  private async callEdgeFunction(functionName: string, payload: any) {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async generateMeaning(request: GenerateMeaningRequest): Promise<{ meaning: string }> {
    try {
      const result = await this.callEdgeFunction('generate-meaning', request);
      return result;
    } catch (error) {
      console.error('Error generating meaning:', error);
      throw error;
    }
  }

  async generateImage(request: GenerateImageRequest): Promise<{ image_url: string }> {
    try {
      const result = await this.callEdgeFunction('generate-image', request);
      return result;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  async interpretReading(request: InterpretReadingRequest): Promise<{ interpretation: string }> {
    try {
      const result = await this.callEdgeFunction('interpret-reading', request);
      return result;
    } catch (error) {
      console.error('Error interpreting reading:', error);
      throw error;
    }
  }

  async sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<any> {
    try {
      const result = await this.callEdgeFunction('send-push', {
        user_id: userId,
        title,
        body,
        data,
      });
      return result;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  async validateReceipt(provider: 'apple' | 'google', receipt: string, productId: string): Promise<any> {
    try {
      const result = await this.callEdgeFunction('validate-receipt', {
        provider,
        receipt,
        product_id: productId,
      });
      return result;
    } catch (error) {
      console.error('Error validating receipt:', error);
      throw error;
    }
  }

  async syncDelta(pullSince?: string, pushOps: any[] = []): Promise<any> {
    try {
      const result = await this.callEdgeFunction('sync-delta', {
        pull_since: pullSince,
        push_ops: pushOps,
      });
      return result;
    } catch (error) {
      console.error('Error syncing delta:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();