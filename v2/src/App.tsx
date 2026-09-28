import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Hospital, LiveHold, WardCode, DetailedSymptom, AITriageResult } from './types';
import { DEFAULT_USER_LOCATION, INITIAL_HOSPITALS } from './data/hospitals';
import { CLINICAL_PROTOCOLS } from './data/protocols';
import { classifyEmergency, translateBengaliToEnglish, createDynamicSymptomFromTriage } from './utils/triageClassifier';
import { calculateDistanceKm, calculateEtaMinutes } from './utils/distance';
import { searchSymptoms, getSymptomById } from './data/symptoms';
import { analyzeSymptomFast, analyzeSymptomWithAI } from './utils/aiTriageService';
import { VoiceTriageInput } from './components/VoiceTriageInput';
import { TacticalMap } from './components/TacticalMap';
import { HospitalPeekDrawer } from './components/HospitalPeekDrawer';
import { SymptomTriageMenu } from './components/SymptomTriageMenu';
import { ClinicalProtocolSheet } from './components/ClinicalProtocolSheet';
import { SymptomDetailModal } from './components/SymptomDetailModal';
import { SymptomDirectoryModal } from './components/SymptomDirectoryModal';
import { Crosshair, MapPin, Search, X, Check, Undo2, Sun, Moon, Building2, Sparkles, ShieldAlert } from 'lucide-react';
import { applyAdminOverridesToHospitals, subscribeToCloudDb, createBedHold, getLocalHolds, getLocalAdmitted, cancelBedHold } from './utils/cloudDb';


export interface AddressSuggestion {
  place_id: string;
  display_name: string;
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
}

const SAVED_LOCATION_KEY = 'statmed_user_location';

function getInitialUserLocation(): { lat: number; lng: number; address: string } {
  try {
    const saved = localStorage.getItem(SAVED_LOCATION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        typeof parsed.lat === 'number' &&
        typeof parsed.lng === 'number' &&
        typeof parsed.address === 'string'
      ) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_USER_LOCATION;
}

// Snap to nearest drivable road via OSRM nearest API (with instant offline fallback)
async function snapToNearestRoad(
  lat: number,
  lng: number
): Promise<{ lat: number; lng: number; name?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://router.project-osrm.org/nearest/v1/driving/${lng},${lat}?number=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data.waypoints && data.waypoints.length > 0) {
        const [wLng, wLat] = data.waypoints[0].location;
        return { lat: wLat, lng: wLng, name: data.waypoints[0].name };
      }
    }
  } catch (err) {
    console.warn('Road snap request failed, using offset approximation:', err);
  }
  // Safe slight offset onto nearby street corridor if offline/timeout
  return {
    lat: Number((lat + 0.00025).toFixed(6)),
    lng: Number((lng + 0.00015).toFixed(6)),
  };
}


const ACTIVE_HOLD_STORAGE_KEY = 'pulsegrid_active_hold_v2';
const SAVED_HOSPITAL_KEY = 'pulsegrid_selected_hospital_id';

interface StoredHoldPayload {
  activeHold: LiveHold;
  expiresAtMs: number;
  hospitalId: string;
  currentQuery?: string;
}

function getInitialActiveHold(): LiveHold | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(ACTIVE_HOLD_STORAGE_KEY);
    if (!raw) return null;
    const parsed: StoredHoldPayload = JSON.parse(raw);
    if (parsed && parsed.expiresAtMs && parsed.activeHold) {
      const secondsLeft = Math.floor((parsed.expiresAtMs - Date.now()) / 1000);
      if (secondsLeft > 0) {
        return {
          ...parsed.activeHold,
          seconds_left: secondsLeft,
        };
      } else {
        localStorage.removeItem(ACTIVE_HOLD_STORAGE_KEY);
      }
    }
  } catch (e) {
    console.warn('Error reading active hold from localStorage:', e);
  }
  return null;
}

export function App() {
  // View mode: 'citizen' or 'admin'
  const [viewMode, setViewMode] = useState<'citizen' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('portal') === 'hospital' || params.get('mode') === 'admin') {
        return 'admin';
      }
    }
    return 'citizen';
  });

  // Global User Location State with localStorage persistence
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  }>(getInitialUserLocation);

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [manualAddressInput, setManualAddressInput] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState<boolean>(false);

  // Rapido-Style Draggable Road Pickup Pin State
  const [isAdjustingPickup, setIsAdjustingPickup] = useState<boolean>(false);
  const [pickupPoint, setPickupPoint] = useState<{ lat: number; lng: number } | null>(null);

  // Triage & Input state
  const [currentQuery, setCurrentQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Drawer & Modal views
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [showProtocolSheet, setShowProtocolSheet] = useState(false);
  const [showSymptomMenu, setShowSymptomMenu] = useState(false);
  const [selectedSymptomDetail, setSelectedSymptomDetail] = useState<DetailedSymptom | null>(null);
  const [showSymptomDirectory, setShowSymptomDirectory] = useState<boolean>(false);
  const [matchedSymptom, setMatchedSymptom] = useState<DetailedSymptom | null>(null);

  // Active Live Hold (15-Min Dynamic GPS Soft Lock)
  const [activeHold, setActiveHold] = useState<LiveHold | null>(getInitialActiveHold);
  const activeHoldRef = useRef(activeHold);
  useEffect(() => { activeHoldRef.current = activeHold; }, [activeHold]);
  const [, setInboundQueue] = useState<LiveHold[]>([]);

  const [gpaySuccessModal, setGpaySuccessModal] = useState<{
    show: boolean;
    hospitalName?: string;
    wardLabel?: string;
    otp?: string;
  } | null>(null);

  const [bookingAlert, setBookingAlert] = useState<{
    show: boolean;
    hospitalName: string;
    wardLabel: string;
    otp: string;
  } | null>(null);

  const [emergencyReRouteAlert, setEmergencyReRouteAlert] = useState<{
    show: boolean;
    oldHospitalName: string;
    newHospitalName: string;
    wardLabel: string;
    otp: string;
    reason: string;
  } | null>(null);

  const playEmergencyAlarmSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      [0, 0.25, 0.5].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(960, ctx.currentTime + delay);
        osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + delay + 0.2);
        gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.2);
      });
    } catch (e) {
      console.warn('Audio alert error:', e);
    }
  };

  // AI Multilingual Triage and Voice Language state
  const [aiTriageResult, setAiTriageResult] = useState<AITriageResult | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<'bn-IN' | 'en-IN'>('bn-IN');
  const [translationNotice, setTranslationNotice] = useState<{
    show: boolean;
    bengali: string;
    english: string;
    severity: string;
  } | null>(null);
  const recognitionInstanceRef = useRef<any>(null);
  const speechSilenceTimerRef = useRef<any>(null);
  const lastSpokenTextRef = useRef<string>('');

  // Light / Dark Theme State with persistence and html class toggle
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sanjivani_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('sanjivani_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Comprehensive reset function to return user to initial clean home screen
  const resetToHomeScreen = useCallback(() => {
    setActiveHold(null);
    setSelectedHospital(null);
    setCurrentQuery('');
    setIsSearchActive(false);
    setDrawerExpanded(false);
    setShowProtocolSheet(false);
    setShowSymptomMenu(false);
    setSelectedSymptomDetail(null);
    setShowSymptomDirectory(false);
    setMatchedSymptom(null);
    setBookingAlert(null);
    setAiTriageResult(null);
    setIsAiAnalyzing(false);
    setGpaySuccessModal(null);
    try {
      localStorage.removeItem(ACTIVE_HOLD_STORAGE_KEY);
    } catch {}
  }, []);

  // Search bar is visible only when no active hold, not adjusting pickup, and drawer is in peek mode
  const isSearchBarVisible = !activeHold && !drawerExpanded && !isAdjustingPickup;

  // Current clinical protocol based on query
  const classification = classifyEmergency(currentQuery);
  const currentProtocol = CLINICAL_PROTOCOLS[classification.protocol_key] || CLINICAL_PROTOCOLS.general || CLINICAL_PROTOCOLS.respiratory;

  // Speech Recognition setup (Web Speech API with graceful fallback)
  const recognitionRef = useRef<any>(null);

  // Real-time Address Autocomplete (Nominatim debounced search)
  useEffect(() => {
    const trimmed = manualAddressInput.trim();
    if (trimmed.length < 2) {
      setAddressSuggestions([]);
      setIsSearchingAddress(false);
      return;
    }

    setIsSearchingAddress(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            trimmed
          )}&addressdetails=1&limit=5`,
          {
            headers: { 'Accept-Language': 'en' },
            signal: controller.signal,
          }
        );
        if (res.ok) {
          const data = await res.json();
          const mapped: AddressSuggestion[] = data.map((item: any) => {
            const parts = (item.display_name || '').split(',').map((s: string) => s.trim());
            const title = parts.slice(0, 2).join(', ');
            const subtitle = parts.slice(2).join(', ');
            return {
              place_id: String(item.place_id || Math.random()),
              display_name: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              title: title || item.name || 'Location',
              subtitle: subtitle || '',
            };
          });
          setAddressSuggestions(mapped);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Address autocomplete error:', err);
        }
      } finally {
        setIsSearchingAddress(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [manualAddressInput]);

  // Re-sort hospitals based on emergency severity and live proximity
  const sortHospitals = useCallback(
    (hospitalList: Hospital[], query: string, targetWardCode: WardCode): Hospital[] => {
      const result = classifyEmergency(query);

      return [...hospitalList].sort((a, b) => {
        if (result.severity === 'RED') {
          const aWard = (a.wards || []).find((w) => w.ward_code === targetWardCode);
          const bWard = (b.wards || []).find((w) => w.ward_code === targetWardCode);

          const aHasBed = (aWard?.available_now ?? 0) > 0;
          const bHasBed = (bWard?.available_now ?? 0) > 0;

          if (aHasBed && !bHasBed) return -1;
          if (!aHasBed && bHasBed) return 1;

          return a.eta_minutes - b.eta_minutes;
        }

        const aWard = (a.wards || []).find((w) => w.ward_code === targetWardCode);
        const bWard = (b.wards || []).find((w) => w.ward_code === targetWardCode);

        const aBeds = aWard?.available_now ?? 0;
        const bBeds = bWard?.available_now ?? 0;

        if (aBeds > 0 && bBeds === 0) return -1;
        if (aBeds === 0 && bBeds > 0) return 1;

        return a.eta_minutes - b.eta_minutes;
      });
    },
    []
  );

  // Re-calculate all hospital ETAs and distances relative to any chosen origin
  const recomputeHospitalsForOrigin = useCallback(
    (lat: number, lng: number, prevList: Hospital[], query: string): Hospital[] => {
      const targetWardCode = classifyEmergency(query).recommended_ward;

      const updated = prevList.map((hosp) => {
        const distKm = calculateDistanceKm(lat, lng, hosp.lat, hosp.lng);
        const etaMin = calculateEtaMinutes(distKm);

        return {
          ...hosp,
          distance_km: distKm,
          eta_minutes: etaMin,
        };
      });

      return sortHospitals(updated, query, targetWardCode);
    },
    [sortHospitals]
  );

  // Hospital state with live admin overrides
  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    const merged = applyAdminOverridesToHospitals(INITIAL_HOSPITALS);
    return recomputeHospitalsForOrigin(
      userLocation.lat,
      userLocation.lng,
      merged,
      ''
    );
  });

  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Real-time Live Sync listener between Hospital Desk and Citizen App
  useEffect(() => {
    const unsubscribe = subscribeToCloudDb(() => {
      setHospitals((prev) => {
        const merged = applyAdminOverridesToHospitals(INITIAL_HOSPITALS);
        return recomputeHospitalsForOrigin(userLocation.lat, userLocation.lng, merged, currentQuery);
      });

      // Check if active hold was admitted or released remotely
      const cloudHolds = getLocalHolds();
      const cloudAdmitted = getLocalAdmitted();

      const currentHold = activeHoldRef.current;
      if (currentHold) {
        const curOtp = String(currentHold.otp_code || (currentHold as any).otp || '').trim();
        const matchingAdmission = (cloudAdmitted || []).find(
          (a) => (a.otp && String(a.otp).trim() === curOtp)
        );
        const matchingCloudHold = (cloudHolds || []).find(
          (h) => String(h.otp).trim() === curOtp || h.hold_id === currentHold.hold_id
        );

        const isCancelledInCloud = matchingCloudHold && matchingCloudHold.status === 'CANCELLED';
        const holdAgeMs = Date.now() - new Date(currentHold.created_at || Date.now()).getTime();
        const isMissingFromCloud = !matchingCloudHold && !matchingAdmission && holdAgeMs > 2500;

        const isRemoteCancelled = isCancelledInCloud || isMissingFromCloud;

        if (matchingAdmission || (matchingCloudHold && matchingCloudHold.status === 'ADMITTED')) {
          const rawCode = matchingAdmission?.ward_code || matchingCloudHold?.ward_code || currentHold.ward_code;
          const displayLabel =
            matchingAdmission?.ward_label ||
            (rawCode === 'general_ward' || rawCode === 'general_oxygen'
              ? 'General Ward'
              : rawCode === 'cardiac_icu'
              ? 'Cardiac ICU'
              : rawCode === 'pediatric_icu'
              ? 'Pediatric ICU'
              : rawCode === 'adult_icu'
              ? 'Adult ICU'
              : currentHold.ward_label);

          setGpaySuccessModal({
            show: true,
            hospitalName: currentHold.hospital_name,
            wardLabel: displayLabel,
            otp: curOtp,
          });
          setActiveHold(null);
          activeHoldRef.current = null;
          try {
            localStorage.removeItem(ACTIVE_HOLD_STORAGE_KEY);
          } catch {}
        } else if (isRemoteCancelled) {
          // 🚨 AUTOMATED EMERGENCY RE-ROUTING LOGIC
          playEmergencyAlarmSound();

          const oldHospId = currentHold.hospital_id;
          const oldHospName = currentHold.hospital_name;
          const targetWard = currentHold.ward_code || 'general_oxygen';

          const latestHospitals = recomputeHospitalsForOrigin(
            userLocation.lat,
            userLocation.lng,
            applyAdminOverridesToHospitals(INITIAL_HOSPITALS),
            currentQuery
          );

          const nextHospital =
            latestHospitals.find(
              (h) => h.id !== oldHospId && (h.wards || []).some((w) => isSameWardGroup(w.ward_code, targetWard) && w.available_now > 0)
            ) || latestHospitals.find((h) => h.id !== oldHospId) || latestHospitals[0];

          if (nextHospital) {
            const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
            const newWardLabel = isSameWardGroup(targetWard, 'general_oxygen') ? 'General Ward' : currentHold.ward_label;
            const nextHospName = nextHospital.short_name || nextHospital.name;

            const newHold: LiveHold = {
              hold_id: `hold_${Date.now()}`,
              hospital_id: nextHospital.id,
              hospital_name: nextHospName,
              ward_code: targetWard,
              ward_label: newWardLabel,
              otp_code: newOtp,
              seconds_left: 900,
              total_seconds: 900,
              hold_type: 'CITIZEN',
              severity: classification.severity,
              requester_phone: '+91 98300 12345',
              requester_name: 'Emergency Patient (Re-Routed)',
              created_at: new Date().toISOString(),
              status: 'ACTIVE',
              vector_status: 'TOWARD',
              current_lat: userLocation.lat,
              current_lng: userLocation.lng,
              eta_display: `${nextHospital.eta_minutes} mins`,
            };

            setActiveHold(newHold);
            activeHoldRef.current = newHold;
            setSelectedHospital(nextHospital);

            // Synchronize top floating reservation banner to new hospital and new 4-digit OTP
            setBookingAlert({
              show: true,
              hospitalName: nextHospName,
              wardLabel: newWardLabel,
              otp: newOtp,
            });

            try {
              localStorage.setItem(
                ACTIVE_HOLD_STORAGE_KEY,
                JSON.stringify({
                  activeHold: newHold,
                  expiresAtMs: Date.now() + 900 * 1000,
                  hospitalId: nextHospital.id,
                  currentQuery: currentQuery,
                })
              );
              createBedHold(
                nextHospital.id,
                targetWard,
                'Emergency Patient (Re-Routed)',
                matchedSymptom?.name || currentQuery || 'Emergency Preemption',
                newOtp
              );
            } catch (e) {
              console.warn('Re-route sync error:', e);
            }

            setEmergencyReRouteAlert({
              show: true,
              oldHospitalName: oldHospName,
              newHospitalName: nextHospName,
              wardLabel: newWardLabel,
              otp: newOtp,
              reason: 'Your bed reservation was re-allocated due to an emergency medical priority by the hospital.',
            });
          } else {
            resetToHomeScreen();
          }
        }
      }
    });
    return unsubscribe;
  }, [userLocation, currentQuery, activeHold, resetToHomeScreen]);

  // Sync selectedHospital live whenever hospitals array updates from cloud
  useEffect(() => {
    if (selectedHospital) {
      const updated = hospitals.find((h) => h.id === selectedHospital.id);
      if (updated) {
        setSelectedHospital(updated);
      }
    }
  }, [hospitals]);

  // Auto-dismiss GPay Success modal after 4 seconds and return user to main initial home screen
  useEffect(() => {
    if (!gpaySuccessModal || !gpaySuccessModal.show) return;

    const timer = setTimeout(() => {
      resetToHomeScreen();
    }, 4000);

    return () => clearTimeout(timer);
  }, [gpaySuccessModal, resetToHomeScreen]);



  // Auto-restore selected hospital and drawer state if activeHold is restored from localStorage
  const restoredOnMountRef = useRef(false);
  useEffect(() => {
    if (activeHold && hospitals.length > 0 && !restoredOnMountRef.current) {
      restoredOnMountRef.current = true;
      const matchedHosp = hospitals.find((h) => h.id === activeHold.hospital_id);
      if (matchedHosp) {
        setSelectedHospital(matchedHosp);
      }
      setDrawerExpanded(true);
      setIsSearchActive(true);
    }
  }, [activeHold, hospitals]);


  // 1. Find Nearest Government Hospital (by live proximity from active location)
  const nearestGovtHospital = useMemo(() => {
    const govtHospitals = hospitals.filter((h) => h.is_govt);
    if (govtHospitals.length === 0) return null;
    return [...govtHospitals].sort((a, b) => a.distance_km - b.distance_km)[0];
  }, [hospitals]);

  // 2. Find Nearest Private Hospital (distinct private healthcare option)
  const nearestGeneralHospital = useMemo(() => {
    if (hospitals.length === 0) return null;
    const privateHospitals = hospitals.filter((h) => !h.is_govt);
    if (privateHospitals.length > 0) {
      return [...privateHospitals].sort((a, b) => a.distance_km - b.distance_km)[0];
    }
    // Fallback if no non-govt hospital found
    const sortedByDist = [...hospitals].sort((a, b) => a.distance_km - b.distance_km);
    return sortedByDist.find((h) => !h.is_govt) || sortedByDist[0];
  }, [hospitals]);

  // Reverse geocoding helper via OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: { 'Accept-Language': 'en' },
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          const parts = data.display_name.split(',').map((p: string) => p.trim());
          const shortAddress = parts.slice(0, 3).join(', ');
          return shortAddress;
        }
      }
    } catch {
      // ignore
    }
    return null;
  };

  // Apply coordinates cleanly across all hospital ETAs, state, and localStorage
  const applyCoordinates = useCallback(
    (lat: number, lng: number, addressLabel?: string) => {
      const cleanLat = Number(lat.toFixed(6));
      const cleanLng = Number(lng.toFixed(6));
      const cleanAddr =
        addressLabel || `Near Lat ${cleanLat.toFixed(4)}, Lng ${cleanLng.toFixed(4)}`;

      const newLocation = {
        lat: cleanLat,
        lng: cleanLng,
        address: cleanAddr,
      };

      setUserLocation(newLocation);

      try {
        localStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify(newLocation));
      } catch {
        // ignore
      }

      setHospitals((prev) => {
        const recalculated = recomputeHospitalsForOrigin(cleanLat, cleanLng, prev, currentQuery);
        if (recalculated.length > 0) {
          setSelectedHospital((currentSelected) => {
            if (!currentSelected) return null;
            const match = recalculated.find((h) => h.id === currentSelected.id);
            return match || recalculated[0];
          });
        }
        return recalculated;
      });
    },
    [currentQuery, recomputeHospitalsForOrigin]
  );

  // Request browser GPS location cleanly
  const requestLiveGps = useCallback(() => {
    setIsLocating(true);

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      const handleSuccess = (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        const distToDefault = calculateDistanceKm(
          latitude,
          longitude,
          DEFAULT_USER_LOCATION.lat,
          DEFAULT_USER_LOCATION.lng
        );

        const initialLabel =
          distToDefault < 1.5
            ? DEFAULT_USER_LOCATION.address
            : `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

        applyCoordinates(latitude, longitude, initialLabel);
        setIsLocating(false);

        reverseGeocode(latitude, longitude).then((placeName) => {
          if (placeName) {
            setUserLocation((prev) => {
              const updated = { ...prev, address: placeName };
              try {
                localStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify(updated));
              } catch {
                // ignore
              }
              return updated;
            });
          }
        });
      };

      const handleError = (err: GeolocationPositionError) => {
        console.warn('High accuracy geolocation timed out/failed, trying standard accuracy:', err?.message);
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          (fallbackErr) => {
            console.warn('Geolocation fallback failed, keeping current location:', fallbackErr?.message);
            setIsLocating(false);
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 300000,
          }
        );
      };

      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000,
      });
    } else {
      setIsLocating(false);
    }
  }, [applyCoordinates]);

  // "Use Live GPS" with Rapido-style Pin Placement & Dragging on the nearest road
  const handleUseLiveGpsWithPin = useCallback(async () => {
    setIsLocating(true);
    setShowLocationModal(false);

    const onCoordsResolved = async (lat: number, lng: number) => {
      setIsLocating(false);
      // Automatically snap to the nearest road
      const road = await snapToNearestRoad(lat, lng);
      setPickupPoint({ lat: road.lat, lng: road.lng });
      setIsAdjustingPickup(true);

      reverseGeocode(lat, lng).then((addr) => {
        if (addr) {
          setUserLocation((prev) => ({ ...prev, address: addr }));
        }
      });
    };

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => onCoordsResolved(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          console.warn('GPS error, using current location:', err);
          onCoordsResolved(userLocation.lat, userLocation.lng);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      onCoordsResolved(userLocation.lat, userLocation.lng);
    }
  }, [userLocation.lat, userLocation.lng]);

  // Finalize Rapido Road Pickup Location
  const handleFinalizePickup = useCallback(async () => {
    if (!pickupPoint) {
      setIsAdjustingPickup(false);
      return;
    }
    const distMeters = Math.max(
      5,
      Math.round(
        calculateDistanceKm(userLocation.lat, userLocation.lng, pickupPoint.lat, pickupPoint.lng) * 1000
      )
    );
    setIsAdjustingPickup(false);
    const roadAddr = await reverseGeocode(pickupPoint.lat, pickupPoint.lng);
    const finalLabel = roadAddr || `Roadside Pickup Spot (~${distMeters}m walk)`;
    applyCoordinates(pickupPoint.lat, pickupPoint.lng, finalLabel);
  }, [applyCoordinates, pickupPoint, userLocation.lat, userLocation.lng]);

  // Snap Draggable Pin to nearest road
  const handleSnapPickupToRoad = useCallback(async () => {
    if (!pickupPoint) return;
    const road = await snapToNearestRoad(pickupPoint.lat, pickupPoint.lng);
    setPickupPoint({ lat: road.lat, lng: road.lng });
  }, [pickupPoint]);

  // Run live GPS detection on initial mount and initialize facilities if saved location exists
  const hasDetectedGpsOnMount = useRef(false);
  useEffect(() => {
    if (!hasDetectedGpsOnMount.current) {
      hasDetectedGpsOnMount.current = true;
      if (
        userLocation.lat !== DEFAULT_USER_LOCATION.lat ||
        userLocation.lng !== DEFAULT_USER_LOCATION.lng
      ) {
        applyCoordinates(userLocation.lat, userLocation.lng, userLocation.address);
      }
      requestLiveGps();
    }
  }, [applyCoordinates, requestLiveGps, userLocation.address, userLocation.lat, userLocation.lng]);

  // Multilingual Speech Recognition (Bengali bn-IN, Benglish / Indian English en-IN)
  const startSpeechRecognition = (lang: 'bn-IN' | 'en-IN') => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is supported in modern Chrome, Edge, and Safari.');
      return;
    }

    try {
      if (recognitionInstanceRef.current) {
        try {
          recognitionInstanceRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      const autoProceedWithSpeech = (spokenText: string) => {
        const textToSubmit = spokenText.trim();
        if (!textToSubmit) return;
        lastSpokenTextRef.current = '';
        if (speechSilenceTimerRef.current) {
          clearTimeout(speechSilenceTimerRef.current);
          speechSilenceTimerRef.current = null;
        }
        try {
          recognition.stop();
        } catch {
          // ignore
        }
        setIsListening(false);
        handleSymptomInput(textToSubmit, undefined, true);
      };

      recognition.onstart = () => {
        setIsListening(true);
        lastSpokenTextRef.current = '';
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        let hasFinalResult = false;
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
            hasFinalResult = true;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const text = (final || interim).trim();
        if (text) {
          setCurrentQuery(text);
          lastSpokenTextRef.current = text;
        }

        if (speechSilenceTimerRef.current) {
          clearTimeout(speechSilenceTimerRef.current);
        }

        // Auto-proceed with generous silence delay (at least 2.2 seconds) so user can comfortably speak full sentences:
        const silenceDelay = hasFinalResult ? 2200 : 2800;
        speechSilenceTimerRef.current = setTimeout(() => {
          if (lastSpokenTextRef.current) {
            autoProceedWithSpeech(lastSpokenTextRef.current);
          }
        }, silenceDelay);
      };

      recognition.onspeechend = () => {
        if (speechSilenceTimerRef.current) {
          clearTimeout(speechSilenceTimerRef.current);
        }
        speechSilenceTimerRef.current = setTimeout(() => {
          if (lastSpokenTextRef.current) {
            autoProceedWithSpeech(lastSpokenTextRef.current);
          }
        }, 2200);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition notice:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (!speechSilenceTimerRef.current && lastSpokenTextRef.current) {
          speechSilenceTimerRef.current = setTimeout(() => {
            if (lastSpokenTextRef.current) {
              autoProceedWithSpeech(lastSpokenTextRef.current);
            }
          }, 2000);
        }
      };

      recognitionInstanceRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Could not start speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      if (recognitionInstanceRef.current) {
        try {
          recognitionInstanceRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
    } else {
      startSpeechRecognition(voiceLanguage);
    }
  };

  // Handle clinical emergency symptom input / search submit with Multilingual AI Triage
  const handleSymptomInput = async (
    query: string, 
    explicitSymptom?: DetailedSymptom,
    autoProceed: boolean = false
  ) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setCurrentQuery(trimmed);
    setIsSearchActive(true);

    // Internal translation to canonical English for seamless cross-lingual triage
    const translation = translateBengaliToEnglish(trimmed);
    const queryForSearch = translation.isTranslated ? translation.translatedEnglish : trimmed;

    // 1. Instant Synchronous Clinical Analysis
    const fastAI = analyzeSymptomFast(trimmed);
    setAiTriageResult(fastAI);

    let symptomToUse = explicitSymptom;
    if (!symptomToUse && translation.matched_symptom_id) {
      symptomToUse = getSymptomById(translation.matched_symptom_id);
    }
    if (!symptomToUse && fastAI.matched_symptom_id) {
      symptomToUse = getSymptomById(fastAI.matched_symptom_id);
    }
    if (!symptomToUse && queryForSearch.length >= 2) {
      const matches = searchSymptoms(queryForSearch);
      if (matches.length > 0) {
        symptomToUse = matches[0];
      }
    }
    // Dynamic synthesis fallback: NEVER leave symptomToUse null for emergency input/voice!
    if (!symptomToUse) {
      symptomToUse = createDynamicSymptomFromTriage(trimmed, translation, fastAI, currentProtocol);
    }
    setMatchedSymptom(symptomToUse || null);

    const targetWard = fastAI.recommended_ward;
    const sorted = sortHospitals(hospitals, queryForSearch, targetWard);
    setHospitals(sorted);

    if (sorted.length > 0) {
      setSelectedHospital(sorted[0]);
    }

    // Show the Choose Hospital For... triage popup menu (Govt vs Private cards)
    // exactly as shown in user's UI screenshot. NEVER auto-open protocol sheet!
    setShowSymptomMenu(true);
    setShowProtocolSheet(false);
    setDrawerExpanded(false);

    // 2. Asynchronous Server-Side Deep AI Triage
    setIsAiAnalyzing(true);
    try {
      const refinedAI = await analyzeSymptomWithAI(trimmed);
      setAiTriageResult(refinedAI);

      if (refinedAI.matched_symptom_id && !explicitSymptom) {
        const found = getSymptomById(refinedAI.matched_symptom_id);
        if (found) setMatchedSymptom(found);
      }

      if (refinedAI.recommended_ward !== targetWard) {
        const reSorted = sortHospitals(hospitals, trimmed, refinedAI.recommended_ward);
        setHospitals(reSorted);
        if (reSorted.length > 0) {
          setSelectedHospital(reSorted[0]);
        }
      }
    } catch (err) {
      console.warn('AI triage background error:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleSelectHospitalFromMenu = (hosp: Hospital) => {
    setSelectedHospital(hosp);
  };

  const handleConfirmHospitalAndOpenDrawer = (hosp: Hospital) => {
    setSelectedHospital(hosp);
    setShowSymptomMenu(false);
    setDrawerExpanded(false);
  };

  const handleClearSearch = () => {
    resetToHomeScreen();
  };




  // Live Hold Countdown (Decrements every 1 sec; warns at 2 min; releases bed at 0)
  useEffect(() => {
    if (!activeHold) return;

    const timer = setInterval(() => {
      setActiveHold((prev) => {
        if (!prev) return null;
        if (prev.seconds_left <= 1) {
          try {
            localStorage.removeItem(ACTIVE_HOLD_STORAGE_KEY);
            cancelBedHold(prev.otp_code || (prev as any).otp || prev.hold_id, prev.hospital_id);
          } catch {}
          clearInterval(timer);
          // Release bed back to inventory on expiry
          setHospitals((hospList) =>
            hospList.map((h) => {
              if (h.id === prev.hospital_id) {
                return {
                  ...h,
                  wards: (h.wards || []).map((w) =>
                    w.ward_code === prev.ward_code
                      ? { ...w, available_now: w.available_now + 1 }
                      : w
                  ),
                };
              }
              return h;
            })
          );
          return null;
        }
        return {
          ...prev,
          seconds_left: prev.seconds_left - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeHold]);

function isSameWardGroup(codeA?: string, codeB?: string): boolean {
  if (!codeA || !codeB || typeof codeA !== 'string' || typeof codeB !== 'string') return false;
  if (codeA === codeB) return true;
  const generalCodes = new Set(['general_oxygen', 'general_ward', 'general']);
  return generalCodes.has(codeA) && generalCodes.has(codeB);
}

function isIcuWard(code?: string): boolean {
  if (!code || typeof code !== 'string') return false;
  return code === 'cardiac_icu' || code === 'adult_icu' || code === 'pediatric_icu';
}

  // Book a 15-minute emergency soft hold
  const handleBookSlot = (overrideWardCode?: WardCode | any) => {
    if (!selectedHospital) return;

    // Prevent duplicate bed holds if patient already has an active hold
    if (activeHold && activeHold.seconds_left > 0) {
      setDrawerExpanded(true);
      setShowProtocolSheet(false);
      setBookingAlert({
        show: true,
        hospitalName: activeHold.hospital_name,
        wardLabel: activeHold.ward_label,
        otp: activeHold.otp_code,
      });
      return;
    }

    // 1. Determine best ward to book based on clinical triage:
    const cleanOverride = typeof overrideWardCode === 'string' ? overrideWardCode : undefined;
    const isExplicitGeneral =
      !currentQuery ||
      /nearest|closest|hospital|emergency|doctor|general|govt|private/i.test(currentQuery) ||
      classification.protocol_key === 'general' ||
      classification.recommended_ward === 'general_oxygen';

    const targetWardCode = cleanOverride
      ? cleanOverride
      : isExplicitGeneral
      ? 'general_oxygen'
      : classification.recommended_ward || currentProtocol.target_ward || 'general_oxygen';

    const isGeneralBooking = isSameWardGroup(targetWardCode, 'general_oxygen') || isExplicitGeneral;

    let ward: any = undefined;

    if (isGeneralBooking) {
      // General Ward / Nearest Hospital booking MUST ALWAYS book a General Ward!
      // NEVER route a general emergency patient into Cardiac ICU or Adult ICU.
      ward = (selectedHospital.wards || []).find((w) => isSameWardGroup(w.ward_code, 'general_oxygen'));

      if (!ward) {
        ward = {
          ward_code: 'general_oxygen',
          label: 'General Ward',
          available_now: 1,
          total_physical: 10,
          total_staffed: 10,
          occupied: 9,
          held_now: 0,
          ghost_gap: 0,
        };
      }
    } else {
      // ICU or Specialized Ward booking:
      ward = (selectedHospital.wards || []).find(
        (w) => w.ward_code === targetWardCode && w.available_now > 0
      );

      if (!ward || ward.available_now <= 0) {
        ward = (selectedHospital.wards || []).find((w) => isIcuWard(w.ward_code) && w.available_now > 0);
      }

      if (!ward) {
        ward = (selectedHospital.wards || []).find((w) => w.ward_code === targetWardCode) || (selectedHospital.wards || [])[0];
      }
    }

    const wardCode = isGeneralBooking ? 'general_oxygen' : ward.ward_code;
    const wardLabel = isSameWardGroup(wardCode, 'general_oxygen') || isGeneralBooking ? 'General Ward' : ward.label;

    // Optimistically decrement bed count immediately in all hospitals
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === selectedHospital.id) {
          return {
            ...h,
            wards: (h.wards || []).map((w) =>
              w.ward_code === wardCode
                ? { ...w, available_now: Math.max(0, w.available_now - 1), held_now: (w.held_now || 0) + 1 }
                : w
            ),
          };
        }
        return h;
      })
    );

    // Keep selectedHospital synced immediately
    setSelectedHospital((prev) => {
      if (!prev || prev.id !== selectedHospital.id) return prev;
      return {
        ...prev,
        wards: (prev.wards || []).map((w) =>
          w.ward_code === wardCode
            ? { ...w, available_now: Math.max(0, w.available_now - 1), held_now: (w.held_now || 0) + 1 }
            : w
        ),
      };
    });

    // Generate 4-digit OTP code for nurse desk / er gate pass
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newHold: LiveHold = {
      hold_id: `hold_${Date.now()}`,
      hospital_id: selectedHospital.id,
      hospital_name: selectedHospital.short_name || selectedHospital.name,
      ward_code: wardCode,
      ward_label: wardLabel,
      otp_code: randomOtp,
      seconds_left: 900, // 15:00 minutes
      total_seconds: 900,
      hold_type: 'CITIZEN',
      severity: classification.severity,
      requester_phone: '+91 98300 12345',
      requester_name: 'Citizen Patient',
      created_at: new Date().toISOString(),
      status: 'ACTIVE',
      vector_status: 'TOWARD',
      current_lat: userLocation.lat,
      current_lng: userLocation.lng,
      eta_display: `${selectedHospital.eta_minutes} mins`,
    };

    setActiveHold(newHold);
    activeHoldRef.current = newHold;
    try {
      const expiresAtMs = Date.now() + 900 * 1000;
      localStorage.setItem(
        ACTIVE_HOLD_STORAGE_KEY,
        JSON.stringify({
          activeHold: newHold,
          expiresAtMs,
          hospitalId: selectedHospital.id,
          currentQuery: currentQuery,
        })
      );
    } catch (e) {
      console.warn('Failed to save hold to localStorage:', e);
    }
    try {
      createBedHold(
        selectedHospital.id,
        wardCode,
        'Emergency Patient',
        matchedSymptom?.name || currentQuery || 'Acute Triage',
        randomOtp
      );
    } catch (e) {
      console.warn('Hold sync exception:', e);
    }
    setInboundQueue((prev) => [newHold, ...prev]);
    setShowProtocolSheet(false);
    setDrawerExpanded(true); // Critical: expand drawer to show booking details & OTP

    // Show booking confirmation alert
    setBookingAlert({
      show: true,
      hospitalName: selectedHospital.short_name || selectedHospital.name,
      wardLabel: wardLabel,
      otp: randomOtp,
    });

    // Optional haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch {}
    }
  };

  const handleCancelHold = () => {
    try {
      localStorage.removeItem(ACTIVE_HOLD_STORAGE_KEY);
    } catch {}
    if (!activeHold) return;

    try {
      cancelBedHold(activeHold.otp_code || (activeHold as any).otp || activeHold.hold_id, activeHold.hospital_id);
    } catch (e) {
      console.warn('Failed to release hold in cloud:', e);
    }

    // Release bed back to inventory
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === activeHold.hospital_id) {
          return {
            ...h,
            wards: (h.wards || []).map((w) =>
              w.ward_code === activeHold.ward_code
                ? { ...w, available_now: w.available_now + 1, held_now: Math.max(0, (w.held_now || 1) - 1) }
                : w
            ),
          };
        }
        return h;
      })
    );

    setSelectedHospital((prev) => {
      if (!prev || prev.id !== activeHold.hospital_id) return prev;
      return {
        ...prev,
        wards: (prev.wards || []).map((w) =>
          w.ward_code === activeHold.ward_code
            ? { ...w, available_now: w.available_now + 1, held_now: Math.max(0, (w.held_now || 1) - 1) }
            : w
        ),
      };
    });

    resetToHomeScreen();
  };

  const handleRedeemHold = (otp: string) => {
    if (activeHold && activeHold.otp_code === otp) {
      try {
        localStorage.removeItem(ACTIVE_HOLD_STORAGE_KEY);
      } catch {}
      setActiveHold(null);
      setInboundQueue((prev) =>
        prev.map((h) => (h.otp_code === otp ? { ...h, status: 'REDEEMED' } : h))
      );
    }
  };

  const handleSelectSuggestion = (s: AddressSuggestion) => {
    applyCoordinates(s.lat, s.lng, s.title || s.display_name);
    setShowLocationModal(false);
    setManualAddressInput('');
    setAddressSuggestions([]);
  };

  // Manual Geocode Search
  const handleManualAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addressSuggestions.length > 0) {
      handleSelectSuggestion(addressSuggestions[0]);
      return;
    }
    if (!manualAddressInput.trim()) return;

    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          manualAddressInput.trim()
        )}&addressdetails=1&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const parts = (data[0].display_name || '').split(',').map((p: string) => p.trim());
          const shortName = parts.slice(0, 2).join(', ');
          applyCoordinates(lat, lon, shortName || data[0].name || manualAddressInput.trim());
          setShowLocationModal(false);
          setManualAddressInput('');
          setAddressSuggestions([]);
        } else {
          alert('Could not locate this address. Please type a specific locality or place name.');
        }
      }
    } catch {
      alert('Geocoding service unavailable. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSelectHospital = useCallback((hosp: Hospital) => {
    setSelectedHospital(hosp);
    setIsSearchActive(true);
  }, []);

  const handleRouteCalculated = useCallback((distKm: number, durationMin: number) => {
    setSelectedHospital((prev) => {
      if (!prev) return null;
      if (prev.distance_km === distKm && prev.eta_minutes === durationMin) {
        return prev;
      }
      return {
        ...prev,
        distance_km: distKm,
        eta_minutes: durationMin,
      };
    });
  }, []);

  

  return (
    <main className="relative w-full h-screen overflow-hidden bg-slate-50 dark:bg-[#070e1e] text-slate-900 dark:text-white font-sans transition-colors duration-300">
      {/* 1. Rapido-Style Draggable Road Pickup Pin Adjustment Card */}
      {isAdjustingPickup && pickupPoint && (
        <div className="fixed top-3.5 left-0 right-0 z-50 px-3 max-w-md mx-auto pointer-events-auto animate-in slide-in-from-top-4 duration-300">
          <div className="bg-white/98 dark:bg-[#0b162c]/98 backdrop-blur-2xl border-2 border-[#FF671F] rounded-2xl p-3.5 shadow-2xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200 dark:border-[#182b52]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF671F] animate-ping"></span>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#FF671F]">
                  ROAD PICKUP PIN
                </h4>
              </div>
              <span className="text-[10px] text-white font-black bg-[#FF671F] px-2 py-0.5 rounded-full uppercase">
                DRAG OR TAP MAP
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#d1d5db] mb-2.5 leading-relaxed">
              Pin auto-placed on nearest road. Drag the pin to any road spot or tap on the map.
            </p>

            {/* Walking Distance Indicator with Dotted Icon */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-[#070e1e] rounded-xl px-3 py-2 border border-slate-200 dark:border-[#182b52] mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🚶</span>
                <div>
                  <span className="block text-[11px] font-bold text-slate-900 dark:text-white">
                    Walk to road: ~{Math.max(5, Math.round(calculateDistanceKm(userLocation.lat, userLocation.lng, pickupPoint.lat, pickupPoint.lng) * 1000))} meters
                  </span>
                  <span className="block text-[9px] text-[#138808] dark:text-[#22C55E] font-medium">
                    •••• Dotted line shows walking path
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSnapPickupToRoad}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0b162c] hover:bg-slate-100 dark:hover:bg-[#10243e] text-[10px] font-bold text-[#FF671F] border border-[#FF671F]/40 cursor-pointer transition-colors shadow-sm"
              >
                Snap to Road
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdjustingPickup(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-[#070e1e] hover:bg-slate-200 dark:hover:bg-[#10243e] text-xs font-bold text-slate-700 dark:text-gray-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200 dark:border-[#182b52]"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalizePickup}
                className="flex-[2] py-2 rounded-xl bg-gradient-to-r from-[#FF671F] to-[#FF8533] hover:from-[#FF8533] hover:to-[#FF671F] text-white text-xs font-black tracking-wide shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Finalize Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Indian Flag Themed MY LOCATION Bar & Dedicated Theme Toggle Button */}
      {!isAdjustingPickup && (
        <div className="fixed top-3.5 left-0 right-0 z-30 px-3.5 max-w-md mx-auto pointer-events-auto transition-all duration-300 flex items-center gap-2">
          {/* My Location Pill - Apple Liquid Glass Capsule */}
          <div
            onClick={() => setShowLocationModal(true)}
            className="flex-1 min-w-0 flex items-center justify-between liquid-glass-bar rounded-full px-3.5 py-2 cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="p-1.5 rounded-full bg-[#FF671F]/15 text-[#FF671F] group-hover:scale-110 flex-shrink-0 transition-transform shadow-[0_0_14px_rgba(255,103,31,0.3)] border border-[#FF671F]/30">
                <MapPin className="w-3.5 h-3.5" />
              </span>
              <span className="text-[10px] font-black uppercase text-[#FF671F] tracking-wider flex-shrink-0">
                MY LOCATION:
              </span>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate group-hover:text-[#FF671F] transition-colors">
                {isLocating ? 'Detecting your GPS location...' : userLocation.address}
              </span>
            </div>

            <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
              <span className="text-[10px] text-[#FF7A00] dark:text-[#FFA05C] bg-[#FF671F]/15 dark:bg-[#FF671F]/25 px-2.5 py-1 rounded-full font-black group-hover:bg-[#FF671F] group-hover:text-white transition-all border border-[#FF671F]/50">
                Change
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUseLiveGpsWithPin();
                }}
                title="Place & Drag Road Pin with Live GPS"
                className="text-[#138808] dark:text-[#22C55E] hover:bg-[#138808] hover:text-white p-1 rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Theme Switcher Button (Sun/Moon) - Apple Liquid Glass Orb */}
          <button
            id="theme-toggle-button"
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full liquid-glass-orb text-slate-700 dark:text-amber-400 hover:border-[#FF671F] dark:hover:border-[#FF671F] transition-all cursor-pointer active:scale-95 group"
            aria-label="Toggle Light and Dark Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 group-hover:-rotate-12 transition-transform" />
            )}
          </button>
        </div>
      )}

      {/* 3. Voice Triage Search Bar directly beneath MY LOCATION */}
      <VoiceTriageInput
        currentQuery={currentQuery}
        onQueryChange={(query) => {
          setCurrentQuery(query);
        }}
        onSearchSubmit={(query, sym) => handleSymptomInput(query, sym, true)}
        isListening={isListening}
        onToggleListening={handleToggleListening}
        isSearchActive={isSearchActive}
        onClearSearch={handleClearSearch}
        isVisible={isSearchBarVisible}
        onOpenSymptomDirectory={() => setShowSymptomDirectory(true)}
        voiceLanguage={voiceLanguage}
        onChangeVoiceLanguage={setVoiceLanguage}
      />


      {/* Prominent Emergency Booking Confirmation Banner */}
      {bookingAlert?.show && (
        <div className="fixed top-16 left-0 right-0 z-40 px-3.5 max-w-md mx-auto pointer-events-auto animate-in slide-in-from-top-3 duration-300">
          <div className="liquid-glass border border-emerald-500/50 dark:border-emerald-400/40 rounded-2xl p-3 shadow-[0_12px_40px_rgba(19,136,8,0.25)] flex items-center justify-between gap-3 text-slate-900 dark:text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-xl liquid-btn-green text-white flex items-center justify-center font-black text-base flex-shrink-0 shadow-md">
                ✓
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#138808] animate-ping" />
                  <span className="text-[11px] font-black text-[#138808] dark:text-emerald-400 uppercase tracking-wider">
                    BED RESERVED • 15-MIN HOLD ACTIVE
                  </span>
                </div>
                <span className="block text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                  {bookingAlert.wardLabel} at {bookingAlert.hospitalName}
                </span>
                <span className="block text-[10px] text-slate-600 dark:text-gray-300">
                  Gate Check-In OTP: <strong className="text-[#FF671F] tracking-widest font-mono text-xs">{bookingAlert.otp}</strong>
                </span>
                <span className="block text-[9px] font-bold text-[#138808] dark:text-emerald-400 mt-0.5">
                  ⏱️ Timer pauses automatically when moving towards hospital
                </span>
              </div>
            </div>
            <button
              onClick={() => setBookingAlert(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
              title="Dismiss Alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Full-Screen Interactive Tactical Map with theme support */}
      <TacticalMap
        userLocation={userLocation}
        hospitals={hospitals}
        selectedHospital={selectedHospital}
        onSelectHospital={handleSelectHospital}
        isHolding={!!activeHold}
        onUserLocate={requestLiveGps}
        isLocating={isLocating}
        isSearchActive={isSearchActive}
        onRouteCalculated={handleRouteCalculated}
        drawerExpanded={drawerExpanded}
        isAdjustingPickup={isAdjustingPickup}
        pickupPoint={pickupPoint}
        onPickupPointChange={(point) => setPickupPoint(point)}
        theme={theme}
      />

      {/* 5. Symptom Triage 20% Screen Pop-up Menu with Nearest Government & Nearest Hospital */}
      <SymptomTriageMenu
        isOpen={showSymptomMenu && !activeHold}
        onClose={() => setShowSymptomMenu(false)}
        symptomQuery={currentQuery}
        translatedSummary={
          translationNotice?.english ||
          (translateBengaliToEnglish(currentQuery).isTranslated
            ? translateBengaliToEnglish(currentQuery).englishSummary
            : matchedSymptom?.name)
        }
        detectedLanguage={
          translateBengaliToEnglish(currentQuery).isTranslated
            ? translateBengaliToEnglish(currentQuery).detectedLanguage
            : undefined
        }
        nearestGovtHospital={nearestGovtHospital}
        nearestGeneralHospital={nearestGeneralHospital}
        selectedHospitalId={selectedHospital?.id}
        onSelectHospital={handleSelectHospitalFromMenu}
        onConfirmAndOpenDrawer={handleConfirmHospitalAndOpenDrawer}
        matchedSymptom={matchedSymptom}
        onOpenSymptomDetail={() => {
          const trans = translateBengaliToEnglish(currentQuery);
          const sym =
            (trans.matched_symptom_id ? getSymptomById(trans.matched_symptom_id) : null) ||
            matchedSymptom ||
            createDynamicSymptomFromTriage(currentQuery, trans, aiTriageResult, currentProtocol);

          setSelectedSymptomDetail(sym);
        }}
      />

      {/* 6. Full Scrollable Symptom Clinical Guide Modal (Detailed Disease Protocol) */}
      <SymptomDetailModal
        symptom={selectedSymptomDetail}
        isOpen={!!selectedSymptomDetail}
        onClose={() => setSelectedSymptomDetail(null)}
        nearestGovtHospital={nearestGovtHospital}
        nearestGeneralHospital={nearestGeneralHospital}
        onSelectHospital={(hosp) => {
          setSelectedHospital(hosp);
          setSelectedSymptomDetail(null);
          setShowSymptomMenu(true);
        }}
      />

      {/* 7. Clinical Symptoms Directory Explorer Modal */}
      <SymptomDirectoryModal
        isOpen={showSymptomDirectory}
        onClose={() => setShowSymptomDirectory(false)}
        onSelectSymptom={(sym) => {
          setSelectedSymptomDetail(sym);
          setMatchedSymptom(sym);
        }}
        nearestGovtHospital={nearestGovtHospital}
        nearestGeneralHospital={nearestGeneralHospital}
        onDirectRoute={(hosp) => {
          setSelectedHospital(hosp);
          setShowSymptomDirectory(false);
          setShowSymptomMenu(true);
        }}
      />

      {/* 6. Hospital Peek Drawer - visible when a hospital is selected and triage popup is not active */}
      {selectedHospital && (
        <HospitalPeekDrawer
          hospital={selectedHospital}
          onBookSlot={() => handleBookSlot()}
          isHolding={!!activeHold}
          activeHold={activeHold}
          onCancelHold={handleCancelHold}
          onSimulateRedeem={() => {
            if (activeHold) {
              handleRedeemHold(activeHold.otp_code);
            }
          }}
          onOpenProtocolView={() => setShowProtocolSheet(true)}
          matchedSymptom={matchedSymptom}
          onOpenSymptomDetail={() => {
            const trans = translateBengaliToEnglish(currentQuery);
            const sym =
              matchedSymptom ||
              (trans.matched_symptom_id ? getSymptomById(trans.matched_symptom_id) : null) ||
              createDynamicSymptomFromTriage(currentQuery, trans, aiTriageResult, currentProtocol);
            setSelectedSymptomDetail(sym);
          }}
          protocol={currentProtocol}
          aiTriageResult={aiTriageResult}
          isAiAnalyzing={isAiAnalyzing}
          userQuery={currentQuery}
          nearestGovtHospital={nearestGovtHospital}
          nearestGeneralHospital={nearestGeneralHospital}
          onSelectHospital={(h) => setSelectedHospital(h)}
          drawerExpanded={drawerExpanded}
          onDrawerExpandedChange={(expanded) => setDrawerExpanded(expanded)}
          isVisible={!isAdjustingPickup && (isSearchActive || !!activeHold) && (!showSymptomMenu || !!activeHold)}
          triageExplanation={classification.explanation}
          onClose={handleClearSearch}
          onReopenSymptomMenu={
            isSearchActive && !activeHold ? () => setShowSymptomMenu(true) : undefined
          }
        />
      )}

      {/* 6. Expanded Clinical Protocol Sheet */}
      {showProtocolSheet && selectedHospital && (
        <ClinicalProtocolSheet
          hospital={selectedHospital}
          protocol={currentProtocol}
          onClose={() => setShowProtocolSheet(false)}
          onBookSlot={() => handleBookSlot()}
          isHolding={!!activeHold}
          activeHold={activeHold}
        />
      )}

      {/* 7. Location Adjustment Modal with Real-time Address Autocomplete */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0b162c] border border-slate-200 dark:border-[#182b52] ring-1 ring-[#FF671F]/30 rounded-2xl shadow-2xl p-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#182b52]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF671F]" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Adjust My Location</h3>
              </div>
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  setAddressSuggestions([]);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualAddressSubmit} className="mt-3">
              <label className="block text-xs font-bold text-[#FF671F] uppercase tracking-wider mb-1.5">
                Search Your Address / Locality:
              </label>
              <div className="relative flex items-center gap-2 bg-slate-50 dark:bg-[#070e1e] border border-slate-200 dark:border-[#182b52] focus-within:border-[#FF671F] focus-within:ring-1 focus-within:ring-[#FF671F]/30 rounded-xl px-3 py-2.5 transition-all">
                <Search className="w-4 h-4 text-[#FF671F] flex-shrink-0" />
                <input
                  type="text"
                  value={manualAddressInput}
                  onChange={(e) => setManualAddressInput(e.target.value)}
                  placeholder="Type street, building, area (e.g. Park Street, Salt Lake...)"
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-gray-500"
                  autoFocus
                />
                {isSearchingAddress && (
                  <div className="w-3.5 h-3.5 border-2 border-[#FF671F] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                )}
                {manualAddressInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setManualAddressInput('');
                      setAddressSuggestions([]);
                    }}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 cursor-pointer flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Real-time Address Autocomplete Results Dropdown */}
              {addressSuggestions.length > 0 && (
                <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-[#182b52] bg-white dark:bg-[#070e1e] shadow-2xl divide-y divide-slate-100 dark:divide-[#182b52]">
                  {addressSuggestions.map((s) => (
                    <button
                      key={s.place_id}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-[#10243e] hover:border-l-2 hover:border-l-[#FF671F] transition-colors cursor-pointer group"
                    >
                      <MapPin className="w-4 h-4 text-[#FF671F] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#FF671F] truncate">
                          {s.title}
                        </span>
                        {s.subtitle && (
                          <span className="block text-[10px] text-slate-500 dark:text-gray-400 truncate mt-0.5">
                            {s.subtitle}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No match indicator */}
              {!isSearchingAddress && manualAddressInput.trim().length >= 2 && addressSuggestions.length === 0 && (
                <div className="mt-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e1e] border border-slate-200 dark:border-[#182b52] text-[11px] text-slate-500 dark:text-gray-400">
                  No address matches found. Press Enter to search or try a different locality name.
                </div>
              )}

              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleUseLiveGpsWithPin}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-[#16A34A]/15 border border-emerald-200 dark:border-[#16A34A]/40 text-xs font-bold text-[#138808] dark:text-[#22C55E] hover:bg-[#138808] hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  Use Live GPS & Place Pin
                </button>
                <button
                  type="submit"
                  disabled={!manualAddressInput.trim() || isGeocoding}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF671F] to-[#FF8533] text-white text-xs font-black hover:from-[#FF8533] hover:to-[#FF671F] disabled:opacity-40 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  {isGeocoding ? 'Locating...' : 'Set Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Honesty strip */}
      <div className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none text-center pb-0.5">
        <span className="text-[8px] font-mono text-white/30 tracking-widest uppercase bg-black/80 px-2 py-0.5 rounded-t">
          SIMULATED CAPACITY DATA • DEMONSTRATION ONLY • SMART INDIA HACKATHON 2026
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 🟢 GPAY-STYLE GREEN TICK BED HARD-LOCKED ADMISSION SUCCESS MODAL */}
      {/* ========================================================================= */}
      {gpaySuccessModal && gpaySuccessModal.show && (
        <div className="fixed inset-0 z-[9999] bg-[#060d1b]/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-300">
          <div className="absolute w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />

          <div className="relative mb-8 flex items-center justify-center">
            <div className="absolute w-36 h-36 bg-emerald-500/30 rounded-full animate-ping pointer-events-none" />
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-[0_0_70px_rgba(16,185,129,0.7)] animate-in zoom-in-50 duration-500 border-4 border-white/20">
              <Check className="w-16 h-16 text-white stroke-[4] animate-bounce" />
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase drop-shadow-lg">
            BED HARD LOCKED!
          </h2>
          <div className="inline-flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-mono font-extrabold uppercase tracking-widest mt-3 shadow-md">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>PATIENT ADMITTED VIA OTP {gpaySuccessModal.otp}</span>
          </div>

          <div className="w-full max-w-sm mt-6 p-6 rounded-[28px] bg-[#0b162c]/90 border border-emerald-500/30 shadow-2xl space-y-3.5 backdrop-blur-xl">
            <div className="flex justify-between items-center border-b border-[#182b52] pb-3 text-xs">
              <span className="text-slate-400 font-medium">Hospital Station Verification</span>
              <span className="text-emerald-400 font-mono font-bold">VERIFIED 100%</span>
            </div>
            <div className="text-left space-y-1">
              <h3 className="text-lg font-black text-white tracking-wide">{gpaySuccessModal.hospitalName}</h3>
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{gpaySuccessModal.wardLabel}</p>
            </div>
            <p className="text-[11px] text-slate-400 font-medium text-left pt-2 border-t border-[#182b52]">
              Emergency room team has logged check-in. The bed is now permanently assigned to your patient.
            </p>
          </div>

          <div className="w-full max-w-sm mt-8 space-y-3">
            <button
              type="button"
              onClick={() => {
                setGpaySuccessModal(null);
                setCurrentQuery('');
                setSelectedHospital(null);
                setDrawerExpanded(false);
              }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black rounded-2xl text-sm tracking-wider uppercase shadow-xl shadow-emerald-500/30 cursor-pointer active:scale-95 transition-all duration-200"
            >
              RETURN TO HOME SCREEN
            </button>
            <p className="text-xs text-slate-400 font-medium animate-pulse">Auto-returning to main screen in 4s...</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚨 EMERGENCY MEDICAL RE-ROUTING ALERT MODAL */}
      {/* ========================================================================= */}
      {emergencyReRouteAlert && emergencyReRouteAlert.show && (
        <div className="fixed inset-0 z-[9999] bg-rose-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
          <div className="absolute w-[500px] h-[500px] bg-red-600/30 rounded-full blur-[120px] pointer-events-none animate-ping" />

          <div className="relative mb-6 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-pink-500 flex items-center justify-center shadow-[0_0_80px_rgba(239,68,68,0.8)] animate-bounce border-4 border-white/30">
              <ShieldAlert className="w-12 h-12 text-white stroke-[2.5]" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase drop-shadow-xl">
            🚨 EMERGENCY MEDICAL RE-ROUTE!
          </h2>
          <div className="inline-flex items-center space-x-2 bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-1.5 rounded-full text-xs font-mono font-extrabold uppercase tracking-widest mt-2 shadow-lg">
            <Sparkles className="w-4 h-4 text-red-400" />
            <span>SLOT RE-ALLOCATED BY HOSPITAL ER DESK</span>
          </div>

          <div className="w-full max-w-sm mt-5 p-5 rounded-[28px] bg-[#0b162c]/95 border-2 border-red-500/50 shadow-2xl space-y-3 text-left backdrop-blur-xl">
            <div className="text-xs space-y-1">
              <span className="text-slate-400 font-bold">Previous Station:</span>
              <p className="text-rose-300 font-black line-through text-sm">{emergencyReRouteAlert.oldHospitalName}</p>
            </div>

            <div className="pt-2 border-t border-red-500/30 text-xs space-y-1">
              <span className="text-emerald-400 font-bold uppercase tracking-wider">➔ AUTO-BOOKED NEXT NEAREST HOSPITAL:</span>
              <h3 className="text-lg font-black text-white">{emergencyReRouteAlert.newHospitalName}</h3>
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{emergencyReRouteAlert.wardLabel}</p>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-red-500/30 text-xs">
              <span className="text-slate-300 font-bold">New 4-Digit Gate OTP:</span>
              <span className="text-amber-400 font-mono font-black text-base px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">{emergencyReRouteAlert.otp}</span>
            </div>

            <p className="text-[11px] text-slate-300 font-medium pt-2 border-t border-red-500/30">
              Your medical profile, triage level, and bed reservation have been automatically transferred to the next nearest hospital desk. Map route updated.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setEmergencyReRouteAlert(null)}
            className="w-full max-w-sm mt-6 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 hover:brightness-110 text-white font-black rounded-2xl text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-red-600/40 cursor-pointer active:scale-95 transition-all duration-200"
          >
            NAVIGATE TO NEW HOSPITAL ➔
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
