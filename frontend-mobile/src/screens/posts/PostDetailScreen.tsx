import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../../contexts/AuthContext";
import { postApi } from "../../api/postApi";
import { Post } from "../../api/types/post.types";

type RootStackParamList = {
  PostDetail: { postId: string };
  EditPost: { postId: string };
  Posts: undefined;
};

type PostDetailScreenRouteProp = RouteProp<RootStackParamList, "PostDetail">;
type PostDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PostDetail"
>;

interface PostDetailScreenProps {
  route: PostDetailScreenRouteProp;
  navigation: PostDetailScreenNavigationProp;
}

const PostDetailScreen: React.FC<PostDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { postId } = route.params;
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await postApi.getById(postId);
      setPost(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar post");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (): void => {
    navigation.navigate("EditPost", { postId });
  };

  const handleDelete = async (): Promise<void> => {
    Alert.alert(
      "Excluir Post",
      "Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await postApi.delete(postId);
              Alert.alert("Sucesso", "Post excluído com sucesso!", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (err) {
              Alert.alert("Erro", "Não foi possível excluir o post");
            }
          },
        },
      ]
    );
  };

  const getAuthorName = (): string => {
    if (!post) return "Carregando...";

    if (typeof post.autor === "string") {
      return post.autor;
    }
    if (post.autor && typeof post.autor === "object" && "nome" in post.autor) {
      return post.autor.nome;
    }
    return "Autor desconhecido";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isAuthor = user?.role === "professor";

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Carregando post...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={48} color="#e74c3c" />
          <Text style={styles.errorTitle}>Ops! Algo deu errado</Text>
          <Text style={styles.errorText}>{error || "Post não encontrado"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPost}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Voltar para posts</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonHeader}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#3498db" />
          </TouchableOpacity>

          {isAuthor && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEdit}
              >
                <Icon name="edit" size={24} color="#3498db" />
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Icon name="delete" size={24} color="#e74c3c" />
                <Text style={[styles.actionText, styles.deleteText]}>
                  Excluir
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.postContainer}>
          <Text style={styles.title}>{post.titulo}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Icon name="person" size={16} color="#7f8c8d" />
              <Text style={styles.metaText}>{getAuthorName()}</Text>
            </View>

            <View style={styles.metaItem}>
              <Icon name="calendar-today" size={16} color="#7f8c8d" />
              <Text style={styles.metaText}>{formatDate(post.createdAt)}</Text>
            </View>

            {post.updatedAt !== post.createdAt && (
              <View style={styles.metaItem}>
                <Icon name="edit" size={14} color="#95a5a6" />
                <Text style={styles.metaTextSmall}>
                  Editado em{" "}
                  {new Date(post.updatedAt).toLocaleDateString("pt-BR")}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.content}>{post.conteudo}</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Post ID: {post._id}</Text>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButtonHeader: {
    padding: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  deleteButton: {
    marginLeft: 12,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#3498db",
    fontWeight: "500",
  },
  deleteText: {
    color: "#e74c3c",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#7f8c8d",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    color: "#3498db",
    fontSize: 16,
  },
  postContainer: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    lineHeight: 36,
  },
  metaContainer: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#7f8c8d",
  },
  metaTextSmall: {
    marginLeft: 6,
    fontSize: 12,
    color: "#95a5a6",
    fontStyle: "italic",
  },
  contentContainer: {
    marginBottom: 30,
  },
  content: {
    fontSize: 16,
    lineHeight: 28,
    color: "#34495e",
    textAlign: "justify",
  },
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  footerText: {
    fontSize: 12,
    color: "#95a5a6",
    fontFamily: "monospace",
  },
});

export default PostDetailScreen;
