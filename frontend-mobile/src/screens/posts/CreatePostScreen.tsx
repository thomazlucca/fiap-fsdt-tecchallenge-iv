import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  CreatePost: undefined;
  EditPost: { postId: string };
  Posts: undefined;
};

type CreatePostScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CreatePost"
>;

interface CreatePostScreenProps {
  navigation: CreatePostScreenNavigationProp;
  route?: any;
}

const CreatePostScreen: React.FC<CreatePostScreenProps> = ({
  navigation,
  route,
}) => {
  const isEditing = route?.params?.postId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#3498db" />
          </TouchableOpacity>

          <Text style={styles.title}>
            {isEditing ? "Editar Post" : "Criar Novo Post"}
          </Text>
        </View>

        <View style={styles.content}>
          <Icon name="edit-note" size={80} color="#bdc3c7" />
          <Text style={styles.placeholderTitle}>
            {isEditing ? "Edição de Post" : "Criação de Post"}
          </Text>
          <Text style={styles.placeholderText}>
            Funcionalidade em desenvolvimento
          </Text>
          <Text style={styles.placeholderSubtext}>
            Em breve você poderá {isEditing ? "editar" : "criar"} posts aqui
          </Text>

          <TouchableOpacity
            style={styles.backToPostsButton}
            onPress={() => navigation.navigate("Posts")}
          >
            <Text style={styles.backToPostsText}>Voltar para Posts</Text>
          </TouchableOpacity>
        </View>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 20,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: "#95a5a6",
    textAlign: "center",
    marginBottom: 30,
  },
  backToPostsButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  backToPostsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CreatePostScreen;
