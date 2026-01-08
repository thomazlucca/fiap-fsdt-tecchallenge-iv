import React, { useState, useEffect, forwardRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

const SearchInput = forwardRef<TextInput, SearchInputProps>(
  ({ onSearch, placeholder = "Buscar...", isLoading = false }, ref) => {
    const [query, setQuery] = useState("");

    useEffect(() => {
      const timer = setTimeout(() => {
        onSearch(query);
      }, 500);

      return () => clearTimeout(timer);
    }, [query, onSearch]);

    const handleClear = () => {
      setQuery("");
    };

    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#7f8c8d"
            style={styles.icon}
          />
          <TextInput
            ref={ref}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#95a5a6"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            blurOnSubmit={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#95a5a6" />
            </TouchableOpacity>
          )}
        </View>
        {isLoading && (
          <View style={styles.loading}>
            <ActivityIndicator size="small" color="#3498db" />
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    height: 50,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
    paddingVertical: 0,
    height: "100%",
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  loading: {
    marginLeft: 10,
  },
});

SearchInput.displayName = "SearchInput";

export default SearchInput;
