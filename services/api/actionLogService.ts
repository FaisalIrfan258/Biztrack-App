import { API_BASE_URL, ApiResponse, ENDPOINTS, getHeaders, handleApiError, handleApiResponse } from './config';

// User reference in action logs
export interface UserRef {
  _id: string;
  name: string;
  email: string;
}

// Action log item type
export interface ActionLogItem {
  _id: string;
  action: string;
  userId: UserRef;
  details: {
    name?: string;
    email?: string;
    role?: string;
    [key: string]: any;
  };
  previousState: any;
  newState: any;
  entityId: string | null;
  entityType: string | null;
  timestamp: string;
  __v: number;
}

// Action logs response type
export interface ActionLogsResponse extends ApiResponse {
  success: boolean;
  count: number;
  actionLogs: ActionLogItem[];
}

/**
 * Get action logs
 */
export const getActionLogs = async (token: string): Promise<ActionLogsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ACTION_LOGS.LIST}`, {
      method: 'GET',
      headers: getHeaders(token),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Get action logs error:', error);
    throw handleApiError(error);
  }
}; 