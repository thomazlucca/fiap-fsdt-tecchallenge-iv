import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Post } from "../../api/types/post.types";

interface PostItemProps {
  post: Post;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean; // Controla se mostra botões de editar/excluir
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  onPress,
  onEdit,
  onDelete,
  showActions = false, // Padrão: não mostrar ações
}) => {
  // Função para extrair o nome do autor
  const getAuthorName = (): string => {
    if (!post.autor) return "Autor desconhecido";

    if (typeof post.autor === "string") {
      return post.autor;
    }

    if (post.autor && typeof post.autor === "object") {
      if ("nome" in post.autor) return (post.autor as any).nome;
      if ("name" in post.autor) return (post.autor as any).name;
      if ("_id" in post.autor)
        return `ID: ${(post.autor as any)._id.substring(0, 8)}...`;
    }

    return "Autor desconhecido";
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {post.titulo || "Sem título"}
        </Text>

        <View style={styles.footer}>
          <View style={styles.authorContainer}>
            <Ionicons name="person-outline" size={14} color="#7f8c8d" />
            <Text style={styles.author}> {getAuthorName()}</Text>
          </View>

          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={12} color="#95a5a6" />
            <Text style={styles.date}>
              {" "}
              {post.createdAt
                ? new Date(post.createdAt).toLocaleDateString("pt-BR")
                : "Data desconhecida"}
            </Text>
          </View>
        </View>

        <Text style={styles.preview} numberOfLines={3}>
          {post.conteudo || "Sem conteúdo"}
        </Text>
      </View>

      {/* MOSTRAR AÇÕES APENAS SE showActions = true */}
      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e?.stopPropagation?.();
              onEdit?.();
            }}
          >
            <Ionicons name="create-outline" size={20} color="#3498db" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e?.stopPropagation?.();
              onDelete?.();
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Mantenha os styles...
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  author: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  date: {
    fontSize: 12,
    color: "#95a5a6",
  },
  preview: {
    fontSize: 14,
    color: "#34495e",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});

const areEqual = (prevProps: PostItemProps, nextProps: PostItemProps) => {
  return (
    prevProps.post._id === nextProps.post._id &&
    prevProps.post.titulo === nextProps.post.titulo &&
    prevProps.post.conteudo === nextProps.post.conteudo &&
    prevProps.post.autor === nextProps.post.autor &&
    prevProps.post.createdAt === nextProps.post.createdAt &&
    prevProps.showActions === nextProps.showActions && // Importante!
    prevProps.onPress === nextProps.onPress &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete
  );
};

export default memo(PostItem, areEqual);
