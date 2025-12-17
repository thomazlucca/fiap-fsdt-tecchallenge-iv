import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

const UserDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId: string };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>👤 Detalhes do Usuário</Text>
      <Text style={styles.subtitle}>ID: {userId}</Text>

      <View style={styles.content}>
        <Text style={styles.text}>Tela em desenvolvimento</Text>
        <Text style={styles.info}>
          Aqui serão exibidos os detalhes completos do usuário
        </Text>
      </View>

      <Button title="Voltar" onPress={() => navigation.goBack()} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 30,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    color: "#34495e",
    marginBottom: 15,
  },
  info: {
    fontSize: 16,
    color: "#95a5a6",
    textAlign: "center",
  },
});

export default UserDetailScreen;
