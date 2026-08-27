import api from "./api";

export interface ClientOption {
  id: string;
  clientCode: string;
  name: string;
  mobile: string;
  email?: string | null;
  isActive?: boolean;
}

interface ClientListResponse {
  success: boolean;
  clients: ClientOption[];
  total?: number;
}

export const getClientOptions =
  async (): Promise<ClientOption[]> => {
    const response =
      await api.get<ClientListResponse>(
        "/clients",
        {
          params: {
            page: 1,
            limit: 100,
          },
        }
      );

    return response.data.clients || [];
  };