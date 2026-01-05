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
import { postApi } from "../api/postApi";
import { Post } from "../api/types/post.types";
import { API_CONFIG } from "../utils/apiConfig";

const TestConnectionScreen: React.FC = () => {
  const [status, setStatus] = useState<string>("Testando conexão...");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<
    "testing" | "success" | "error"
  >("testing");

  const testConnection = async (): Promise<void> => {
    try {
      setLoading(true);
      setConnectionStatus("testing");
      setStatus("🔄 Conectando à API...");

      // Busca os posts diretamente
      const data = await postApi.getAll();

      setPosts(data);
      setConnectionStatus("success");
      setStatus(`✅ Sucesso! ${data.length} posts carregados.`);
    } catch (error: any) {
      setConnectionStatus("error");
      setStatus(`❌ Erro: ${error.message || "Falha na conexão"}`);
      console.error("Erro detalhado:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = (): void => {
    testConnection();
  };

  const handleViewDetails = (): void => {
    Alert.alert(
      "Detalhes da Conexão",
      `URL: ${API_CONFIG.BASE_URL}\n\nStatus: ${status}\n\nPosts encontrados: ${posts.length}`,
      [{ text: "OK" }]
    );
  };

  // Função para extrair o nome do autor de forma segura
  const getAuthorName = (post: Post): string => {
    // Se autor for uma string, retorna diretamente
    if (typeof post.autor === "string") {
      return post.autor;
    }

    // Se autor for um objeto com propriedade 'nome'
    if (post.autor && typeof post.autor === "object" && "nome" in post.autor) {
      return (post.autor as any).nome;
    }

    // Se for qualquer outro objeto, converte para string
    if (post.autor && typeof post.autor === "object") {
      return JSON.stringify(post.autor);
    }

    // Fallback
    return "Autor desconhecido";
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🔌 Teste de Conexão API</Text>
          <Text style={styles.subtitle}>FIAP Tech Challenge - Frontend</Text>
        </View>

        <View
          style={[
            styles.statusCard,
            connectionStatus === "success" && styles.statusCardSuccess,
            connectionStatus === "error" && styles.statusCardError,
          ]}
        >
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>Status da Conexão</Text>
            <View
              style={[
                styles.statusIndicator,
                connectionStatus === "success" && styles.statusIndicatorSuccess,
                connectionStatus === "error" && styles.statusIndicatorError,
              ]}
            />
          </View>

          <Text style={styles.statusText}>{status}</Text>

          <View style={styles.urlContainer}>
            <Text style={styles.urlLabel}>API URL:</Text>
            <Text style={styles.urlText}>{API_CONFIG.BASE_URL}</Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleRetry}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>🔁 Testar Novamente</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleViewDetails}
          >
            <Text style={styles.buttonText}>🔍 Ver Detalhes</Text>
          </TouchableOpacity>
        </View>

        {posts.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              📝 Posts Recebidos ({posts.length})
            </Text>

            {/* DEBUG: Mostrar estrutura do primeiro post */}
            {__DEV__ && posts.length > 0 && (
              <TouchableOpacity
                style={styles.debugCard}
                onPress={() => {
                  console.log("Estrutura do primeiro post:", posts[0]);
                  console.log("Tipo do autor:", typeof posts[0].autor);
                  console.log("Autor completo:", posts[0].autor);
                }}
              >
                <Text style={styles.debugText}>
                  🔍 Clique para ver estrutura do post no console
                </Text>
              </TouchableOpacity>
            )}

            {posts.slice(0, 5).map((post, index) => (
              <View key={post._id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <Text style={styles.postIndex}>#{index + 1}</Text>
                  <Text style={styles.postTitle} numberOfLines={1}>
                    {post.titulo || "Sem título"}
                  </Text>
                </View>
                <Text style={styles.postAuthor}>👤 {getAuthorName(post)}</Text>
                <Text style={styles.postContent} numberOfLines={2}>
                  {post.conteudo || "Sem conteúdo"}
                </Text>
                <Text style={styles.postDate}>
                  📅{" "}
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString("pt-BR")
                    : "Data desconhecida"}
                </Text>
              </View>
            ))}

            {posts.length > 5 && (
              <Text style={styles.moreText}>
                ... e mais {posts.length - 5} posts
              </Text>
            )}
          </View>
        )}

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Informações Importantes:</Text>
          <Text style={styles.tip}>
            ✅ Conexão com API estabelecida com sucesso!
          </Text>
          <Text style={styles.tip}>
            📱 Total de posts recebidos: {posts.length}
          </Text>
          <Text style={styles.tip}>
            🚀 Próximo passo: Criar telas de autenticação
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusCardSuccess: {
    borderLeftWidth: 6,
    borderLeftColor: "#2ecc71",
  },
  statusCardError: {
    borderLeftWidth: 6,
    borderLeftColor: "#e74c3c",
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#f1c40f",
  },
  statusIndicatorSuccess: {
    backgroundColor: "#2ecc71",
  },
  statusIndicatorError: {
    backgroundColor: "#e74c3c",
  },
  statusText: {
    fontSize: 16,
    color: "#34495e",
    marginBottom: 15,
    lineHeight: 22,
  },
  urlContainer: {
    backgroundColor: "#ecf0f1",
    padding: 10,
    borderRadius: 6,
  },
  urlLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  urlText: {
    fontSize: 14,
    fontFamily: "monospace",
    color: "#2c3e50",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: "#3498db",
  },
  secondaryButton: {
    backgroundColor: "#95a5a6",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  debugCard: {
    backgroundColor: "#e3f2fd",
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
    alignItems: "center",
  },
  debugText: {
    color: "#1976d2",
    fontSize: 12,
    fontStyle: "italic",
  },
  postCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  postIndex: {
    backgroundColor: "#3498db",
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 10,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    flex: 1,
  },
  postAuthor: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  postContent: {
    fontSize: 14,
    color: "#34495e",
    lineHeight: 20,
    marginBottom: 8,
  },
  postDate: {
    fontSize: 12,
    color: "#95a5a6",
  },
  moreText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 10,
  },
  tipsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  tip: {
    fontSize: 14,
    color: "#34495e",
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default TestConnectionScreen;
