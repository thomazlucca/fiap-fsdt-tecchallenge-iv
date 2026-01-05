import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { usePosts } from "../../hooks/usePosts";
import PostItem from "../../components/posts/PostItem";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import SearchInput from "../../components/common/SearchInput"; // Se tiver

type PostsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Posts'>;

const PostsScreen = () => {
  const navigation = useNavigation<PostsScreenNavigationProp>();
  const { user, isAuthenticated, signOut } = useAuth();
  const { posts, loading, error, fetchPosts, deletePost } = usePosts();

  const [refreshing, setRefreshing] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handlePostPress = (postId: string): void => {
    navigation.navigate("PostDetail", { postId });
  };

  const handleEditPost = (postId: string): void => {
    navigation.navigate("EditPost", { postId });
  };

  const handleDeletePost = async (postId: string): Promise<void> => {
    Alert.alert("Excluir Post", "Tem certeza que deseja excluir este post?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const success = await deletePost(postId);
          if (success) {
            Alert.alert("Sucesso", "Post excluído com sucesso!");
            fetchPosts();
          } else {
            Alert.alert("Erro", "Não foi possível excluir o post");
          }
        },
      },
    ]);
  };

  const handleCreatePost = (): void => {
    navigation.navigate("CreatePost");
  };

  const handleAuthAction = (): void => {
    if (isAuthenticated) {
      Alert.alert("Sair", "Deseja sair da conta?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: signOut },
      ]);
    } else {
      navigation.navigate("Login");
    }
  };

  const handleManageUsers = (): void => {
    navigation.navigate("Users");
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>📝 Posts Acadêmicos</Text>
        <Text style={styles.subtitle}>
          {isAuthenticated ? `Olá, ${user?.nome}!` : "Visitante"}
          {user?.role === "professor" && " 👨‍🏫"}
          {user?.role === "aluno" && " 👨‍🎓"}
        </Text>
      </View>

      <View style={styles.headerActions}>
        {/* Botão de gerenciar usuários (apenas para professores logados) */}
        {isAuthenticated && user?.role === "professor" && (
          <TouchableOpacity
            onPress={handleManageUsers}
            style={styles.usersButton}
          >
            <Ionicons name="people-outline" size={24} color="#3498db" />
          </TouchableOpacity>
        )}

        {/* Botão de login/logout */}
        <TouchableOpacity onPress={handleAuthAction} style={styles.authButton}>
          <Ionicons
            name={isAuthenticated ? "log-out-outline" : "log-in-outline"}
            size={24}
            color="#3498db"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color="#bdc3c7" />
      <Text style={styles.emptyStateTitle}>Nenhum post</Text>
      <Text style={styles.emptyStateText}>
        {isAuthenticated && user?.role === "professor"
          ? "Crie o primeiro post!"
          : "Aguarde os professores criarem posts."}
      </Text>
    </View>
  );

  if (loading && !refreshing && posts.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Carregando posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            onPress={() => handlePostPress(item._id)}
            onEdit={
              isAuthenticated && user?.role === "professor"
                ? () => handleEditPost(item._id)
                : undefined
            }
            onDelete={
              isAuthenticated && user?.role === "professor"
                ? () => handleDeletePost(item._id)
                : undefined
            }
            showActions={isAuthenticated && user?.role === "professor"}
          />
        )}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={renderEmptyState()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3498db"]}
            tintColor="#3498db"
          />
        }
      />

      {/* Botão flutuante para criar post (apenas professores logados) */}
      {isAuthenticated && user?.role === "professor" && (
        <TouchableOpacity style={styles.fab} onPress={handleCreatePost}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchPosts}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

// Mantenha os styles existentes...
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  usersButton: {
    padding: 8,
    marginRight: 8,
  },
  authButton: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#7f8c8d",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 16,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#3498db",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  errorContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#ffeaea",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
  },
  errorText: {
    flex: 1,
    color: "#e74c3c",
    fontSize: 14,
    marginLeft: 8,
  },
  retryText: {
    color: "#3498db",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PostsScreen;
