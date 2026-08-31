import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { searchPlaces } from "@/services/location/geocoding";

type PlaceSuggestion = { display_name: string; lat: string; lon: string };

type LocationSuggestInputProps = {
  label?: string | undefined;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string | undefined;
};

/** Same free OpenStreetMap-backed search already used for event locations —
 * just address suggestions here, no map/pin since profile location is a
 * plain text field with no coordinates to store. */
export const LocationSuggestInput = ({ label, value, onChange, placeholder }: LocationSuggestInputProps) => {
  const colors = useThemeTokens();
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = value.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(() => {
      void searchPlaces(trimmed)
        .then((results) => {
          // Several results (different neighborhoods/streets) often collapse
          // to the same city name — keep only the first of each.
          const seen = new Set<string>();
          const deduped = results.filter((item) => {
            const name = item.display_name.split(",")[0]?.trim().toLowerCase();
            if (!name || seen.has(name)) return false;
            seen.add(name);
            return true;
          });
          setSuggestions(deduped);
          setShowSuggestions(true);
        })
        .finally(() => setSearching(false));
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // Only re-search when the text itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Nominatim's display_name is a full address ("Hyderabad, Telangana,
  // India") — this field just wants a plain city name, so only the first
  // segment is shown and saved.
  const cityName = (displayName: string) => displayName.split(",")[0]?.trim() ?? displayName;

  const selectSuggestion = (item: PlaceSuggestion) => {
    onChange(cityName(item.display_name));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <View>
      <View className="flex-row items-center gap-2">
        <View style={{ flex: 1 }}>
          <AppTextInput
            label={label}
            value={value}
            placeholder={placeholder}
            onChangeText={onChange}
            onFocus={() => {
              if (suggestions.length) setShowSuggestions(true);
            }}
          />
        </View>
        {searching ? <ActivityIndicator size="small" color={colors.primary} /> : null}
      </View>

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
                    {cityName(item.display_name)}
                  </AppText>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
};
