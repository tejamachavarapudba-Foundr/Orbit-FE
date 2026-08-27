import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { EventLocationMapModal } from "@/modules/events/components/EventLocationMapModal";
import { LocationValue, searchPlaces } from "@/services/location/geocoding";

type EventLocationPickerProps = {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
};

export const EventLocationPicker = ({ value, onChange }: EventLocationPickerProps) => {
  const colors = useThemeTokens();
  const [search, setSearch] = useState(value.address);
  const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearch(value.address);
  }, [value.address]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = search.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(() => {
      void searchPlaces(trimmed)
        .then((results) => {
          setSuggestions(results);
          setShowSuggestions(true);
        })
        .finally(() => setSearching(false));
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search]);

  const selectSuggestion = (item: { display_name: string; lat: string; lon: string }) => {
    const latitude = Number(item.lat);
    const longitude = Number(item.lon);
    onChange({
      address: item.display_name,
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null
    });
    setSearch(item.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const hasCoordinates = value.latitude != null && value.longitude != null;

  return (
    <View>
      <AppText weight="medium" size="sm" className="mb-2">
        Location
      </AppText>
      <View className="flex-row items-center gap-2">
        <View className="flex-1 rounded-md border border-border bg-background px-3">
          <View className="flex-row items-center gap-2">
            <Feather name="search" size={18} color={colors.muted} />
            <TextInput
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                onChange({ address: text, latitude: value.latitude, longitude: value.longitude });
              }}
              onFocus={() => {
                if (suggestions.length) {
                  setShowSuggestions(true);
                }
              }}
              placeholder="Search address or place..."
              placeholderTextColor={colors.muted}
              selectionColor={colors.primary}
              className="h-11 flex-1 text-base text-text"
            />
            {searching ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pin location on map"
          onPress={() => setIsMapVisible(true)}
          className="h-11 w-11 items-center justify-center rounded-md border border-border bg-background"
        >
          <Feather name="map-pin" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <EventLocationMapModal
        visible={isMapVisible}
        value={value}
        onClose={() => setIsMapVisible(false)}
        onConfirm={(next) => {
          onChange(next);
          setIsMapVisible(false);
        }}
      />

      {showSuggestions && suggestions.length > 0 ? (
        <View className="mt-2 max-h-44 overflow-hidden rounded-md border border-border bg-surface">
          <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {suggestions.map((item) => (
              <Pressable
                key={`${item.lat}-${item.lon}-${item.display_name}`}
                accessibilityRole="button"
                onPress={() => selectSuggestion(item)}
                className="border-b border-border px-3 py-3"
              >
                <View className="flex-row items-start gap-2">
                  <Feather name="map-pin" size={16} color={colors.primary} style={{ marginTop: 2 }} />
                  <AppText size="sm" className="flex-1 leading-5">
                    {item.display_name}
                  </AppText>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {hasCoordinates ? (
        <AppText tone="muted" size="xs" className="mt-2">
          {value.latitude?.toFixed(5)}, {value.longitude?.toFixed(5)}
        </AppText>
      ) : (
        <AppText tone="muted" size="xs" className="mt-2">
          Pick a suggestion so we can pin the event on the map.
        </AppText>
      )}
    </View>
  );
};
