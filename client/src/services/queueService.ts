
import { Token } from '../types';

const API_URL = 'http://localhost:5000/api/queue';

export interface RegisterTokenResponse {
    success: boolean;
    token: Token;
    waitMinutes: number;
    queuePosition: number;
    remainingSlots: number;
    message: string;
}

export interface RegisterTokenError {
    message: string;
    requiresReason?: boolean;
    isEmergencyValid?: boolean;
    hint?: string;
    maxTokens?: number;
    currentTokens?: number;
}

export const registerToken = async (
    patientId: string,
    doctorId: string,
    patientName: string,
    type: 'REGULAR' | 'EMERGENCY' = 'REGULAR',
    emergencyReason?: string
): Promise<RegisterTokenResponse> => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patientId, doctorId, patientName, type, emergencyReason })
    });

    const data = await response.json();

    if (!response.ok) {
        const error = data as RegisterTokenError;
        throw error;
    }

    return data;
};

export const getQueueStatus = async (doctorId: string): Promise<{ activeToken: Token | null; queue: Token[]; totalWaiting: number }> => {
    const response = await fetch(`${API_URL}/doctor/${doctorId}`);
    if (!response.ok) throw new Error('Failed to fetch queue status');
    return response.json();
};

export const updateTokenStatus = async (tokenId: string, status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'): Promise<{ success: boolean; token: Token }> => {
    const response = await fetch(`${API_URL}/token/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tokenId, status })
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
};

export const getPatientToken = async (patientId: string): Promise<Token[]> => {
    const response = await fetch(`${API_URL}/patient/${patientId}`);
    if (!response.ok) throw new Error('Failed to fetch patient tokens');
    return response.json();
};

export const getQueueAnalytics = async (doctorId: string): Promise<{ dailyLoad: number; completedPatients: number; avgConsultationTime: number }> => {
    const response = await fetch(`${API_URL}/analytics/${doctorId}`);
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
};
