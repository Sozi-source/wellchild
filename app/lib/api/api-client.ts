import { auth } from '@/app/lib/firebase/firebase';

export class ApiClient {
  private static async getAuthHeader() {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const token = await user.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  
  static async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeader();
    
    const response = await fetch(endpoint, {
      headers
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    
    return response.json();
  }
  
  static async post<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeader();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    
    return response.json();
  }
  
  static async put<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeader();
    
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    
    return response.json();
  }
  
  static async delete(endpoint: string): Promise<void> {
    const headers = await this.getAuthHeader();
    
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
  }
}

// Usage examples:
// const child = await ApiClient.get<Child>('/api/children/123');
// const result = await ApiClient.post('/api/invitations/send', { childId, guardianEmail });