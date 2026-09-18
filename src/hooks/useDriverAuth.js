import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  isDriverAuthenticated,
  getDriverProfile,
  getDriverToken,
  loginDriver,
  logoutDriver,
  clearDriverSession,
  setDriverSession,
} from "../api/driverAuth";
import { fetchDriverProfile } from "../api/driverApi";

export default function useDriverAuth() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(() => getDriverProfile());
  const [isAuthenticated, setIsAuthenticated] = useState(() => isDriverAuthenticated());
  const [isLoading, setIsLoading] = useState(true);

  // Sync state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = isDriverAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const storedProfile = getDriverProfile();
        setDriver(storedProfile);

        // Refresh profile from /api/drivers/me
        try {
          const res = await fetchDriverProfile();
          const profileData =
            res?.data?.profile ||
            res?.data?.driver ||
            res?.data?.user ||
            res?.profile ||
            res?.driver ||
            res?.data ||
            res;

          if (profileData && typeof profileData === "object") {
            const updated = {
              ...(storedProfile || {}),
              ...profileData,
              id: profileData.id || profileData._id || profileData.driverId || storedProfile?.id,
              firstname: profileData.firstname || profileData.firstName || storedProfile?.firstname || "Driver",
              lastname: profileData.lastname || profileData.lastName || storedProfile?.lastname || "",
              email: profileData.email || storedProfile?.email,
              matricNumber: profileData.matricNumber || profileData.matric_number || storedProfile?.matricNumber,
              phone: profileData.phone || profileData.phoneNumber || storedProfile?.phone,
              role: "DRIVER",
              vehicleType: profileData.vehicleType || profileData.vehicle_type || storedProfile?.vehicleType,
              vehiclePlate: profileData.vehiclePlate || profileData.vehicle_plate || storedProfile?.vehiclePlate,
              terminalId: profileData.terminalId || profileData.terminal_id || storedProfile?.terminalId,
              terminalStatus: (profileData.terminalStatus || storedProfile?.terminalStatus || "ONLINE").toUpperCase(),
              bankName: profileData.bankName || profileData.bank_name || storedProfile?.bankName,
              accountNumber: profileData.accountNumber || profileData.account_number || storedProfile?.accountNumber,
            };
            setDriver(updated);
            setDriverSession(getDriverToken(), localStorage.getItem("driver_refresh_token"), updated);
          }
        } catch {
          // Keep existing stored profile if network fails
        }
      } else {
        setDriver(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(
    async (identifier, password) => {
      setIsLoading(true);
      try {
        const { profile } = await loginDriver(identifier, password);
        setDriver(profile);
        setIsAuthenticated(true);
        navigate("/driver", { replace: true });
        return { success: true, profile };
      } catch (err) {
        setIsAuthenticated(false);
        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Invalid driver credentials. Please try again.";
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    try {
      await logoutDriver();
    } catch {
      clearDriverSession();
    } finally {
      setDriver(null);
      setIsAuthenticated(false);
      navigate("/driver/login", { replace: true });
    }
  }, [navigate]);

  return {
    driver,
    token: getDriverToken(),
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
