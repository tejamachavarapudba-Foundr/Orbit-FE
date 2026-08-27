import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { LocationValue, reverseGeocode, searchPlaces } from "@/services/location/geocoding";

const DEFAULT_REGION: Region = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 8,
  longitudeDelta: 8
};

type EventLocationMapModalProps = {
  visible: boolean;
  value: LocationValue;
  onClose: () => void;
  onConfirm: (value: LocationValue) => void;
};

export const EventLocationMapModal = ({ visible, value, onClose, onConfirm }: EventLocationMapModalProps) => {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [pin, setPin] = useState<{ latitude: number; longitude: number } | null>(
    value.latitude != null && value.longitude != null ? { latitude: value.latitude, longitude: value.longitude } : null
  );
  const [address, setAddress] = useState(value.address);

  useEffect(() => {
    if (!visible) return;
    setSearch("");
    setSuggestions([]);
    setAddress(value.address);
    setPin(value.latitude != null && value.longitude != null ? { latitude: value.latitude, longitude: value.longitude } : null);
  }, [visible, value.address, value.latitude, value.longitude]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = search.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      void searchPlaces(trimmed)
        .then(setSuggestions)
        .finally(() => setIsSearching(false));
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const moveTo = (latitude: number, longitude: number) => {
    setPin({ latitude, longitude });
    mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 350);
  };

  const selectSuggestion = (item: { display_name: string; lat: string; lon: string }) => {
    const latitude = Number(item.lat);
    const longitude = Number(item.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    setAddress(item.display_name);
    setSearch(item.display_name);
    setSuggestions([]);
    moveTo(latitude, longitude);
  };

  const handleMapPress = (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setPin({ latitude, longitude });
    setIsResolvingAddress(true);
    void reverseGeocode(latitude, longitude)
      .then((resolved) => {
        setAddress(resolved);
        setSearch(resolved);
      })
      .finally(() => setIsResolvingAddress(false));
  };

  const confirm = () => {
    if (!pin) return;
    onConfirm({ address: address.trim() || `${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)}`, latitude: pin.latitude, longitude: pin.longitude });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center gap-2 border-b border-border px-4 pb-3">
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} className="h-9 w-9 items-center justify-center rounded-md">
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <AppText weight="bold" size="lg">
            Pin the location
          </AppText>
        </View>

        <View className="border-b border-border px-4 py-3">
          <View className="flex-row items-center gap-2 rounded-md border border-border bg-surface px-3">
            <Feather name="search" size={18} color={colors.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search address or place..."
              placeholderTextColor={colors.muted}
              selectionColor={colors.primary}
              className="h-11 flex-1 text-base text-text"
            />
            {isSearching ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          </View>
          {suggestions.length > 0 ? (
            <ScrollView keyboardShouldPersistTaps="handled" className="mt-2 max-h-44 rounded-md border border-border bg-surface">
              {suggestions.map((item) => (
                <Pressable
                  key={`${item.lat}-${item.lon}-${item.display_name}`}
                  accessibilityRole="button"
                  onPress={() => selectSuggestion(item)}
                  className="border-b border-border px-3 py-3"
                >
                  <AppText size="sm" numberOfLines={2}>
                    {item.display_name}
                  </AppText>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </View>

        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={
            pin ? { ...pin, latitudeDelta: 0.01, longitudeDelta: 0.01 } : DEFAULT_REGION
          }
          onPress={handleMapPress}
        >
          {pin ? <Marker coordinate={pin} /> : null}
        </MapView>

        <View className="gap-2 border-t border-border px-4 py-3" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          <AppText tone="muted" size="xs" numberOfLines={2}>
            {isResolvingAddress ? "Finding address…" : address || "Tap the map or search to drop a pin"}
          </AppText>
          <AppButton label="Confirm location" disabled={!pin} onPress={confirm} className="rounded-full" />
        </View>
      </View>
    </Modal>
  );
};
