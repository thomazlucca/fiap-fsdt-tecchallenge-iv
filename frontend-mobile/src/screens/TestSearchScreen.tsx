// src/screens/TestSearchScreen.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TestSearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<TextInput>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>🔍 Teste de Barra de Busca</Text>

        <View style={styles.searchContainer}>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Digite aqui..."
            placeholderTextColor="#95a5a6"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
            blurOnSubmit={false}
          />

          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <Ionicons name="close-circle" size={20} color="#95a5a6" />
          </TouchableOpacity>
        </View>

        <Text style={styles.debugText}>Texto digitado: "{searchQuery}"</Text>

        <Text style={styles.instructions}>
          Instruções:{"\n"}
          1. Digite várias letras rapidamente{"\n"}
          2. Veja se o teclado some{"\n"}
          3. O texto acima deve mostrar o que você digitou
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  debugText: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
  },
  instructions: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});

export default TestSearchScreen;
