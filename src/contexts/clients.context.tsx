"use client";

import React, { useState, useContext, ReactNode, useEffect } from "react";
import { User } from "@/types/user";
// import { useClerk, useOrganization } from "@clerk/nextjs"; // Removed - using dummy auth
import { ClientService } from "@/services/clients.service";

interface ClientContextProps {
  client?: User;
}

export const ClientContext = React.createContext<ClientContextProps>({
  client: undefined,
});

interface ClientProviderProps {
  children: ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
  const [client, setClient] = useState<User>();
  // Dummy user and organization
  const [userId, setUserId] = useState<string>("dummy-user-id");
  const [userEmail, setUserEmail] = useState<string>("demo@tinaai.com");
  const [orgId, setOrgId] = useState<string>("dummy-org-id");
  const [orgName, setOrgName] = useState<string>("TinaAI Organization");

  const [clientLoading, setClientLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem("tinaai_user_email") || "demo@tinaai.com";
    setUserEmail(email);
    setUserId(`user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`);
    setOrgId("org_tinaai_default");
    setOrgName("TinaAI Organization");
  }, []);

  const fetchClient = async () => {
    try {
      setClientLoading(true);
      const response = await ClientService.getClientById(
        userId as string,
        userEmail as string,
        orgId as string,
      );
      setClient(response);
    } catch (error) {
      console.error(error);
    }
    setClientLoading(false);
  };

  const fetchOrganization = async () => {
    try {
      setClientLoading(true);
      const response = await ClientService.getOrganizationById(
        orgId as string,
        orgName as string,
      );
    } catch (error) {
      console.error(error);
    }
    setClientLoading(false);
  };

  useEffect(() => {
    if (userId) {
      fetchClient();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (orgId) {
      fetchOrganization();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  return (
    <ClientContext.Provider
      value={{
        client,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export const useClient = () => {
  const value = useContext(ClientContext);

  return value;
};
