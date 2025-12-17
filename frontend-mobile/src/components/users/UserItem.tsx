import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "../../api/userApi";

interface UserItemProps {
  user: User;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const UserItem: React.FC<UserItemProps> = ({
  user,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const getRoleIcon = () => {
    return user.role === "professor" ? "👨‍🏫" : "👨‍🎓";
  };

  const getRoleColor = () => {
    return user.role === "professor" ? "#e74c3c" : "#3498db";
  };

  const handleDelete = () => {
    Alert.alert(
      "Excluir Usuário",
      `Tem certeza que deseja excluir ${user.nome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => onDelete?.(),
        },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: getRoleColor() }]}>
          <Text style={styles.avatarText}>
            {user.nome.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {user.nome}
          </Text>
          <Text style={styles.role}>
            {getRoleIcon()} {user.role === "professor" ? "Professor" : "Aluno"}
          </Text>
        </View>

        <Text style={styles.email} numberOfLines={1}>
          <Ionicons name="mail-outline" size={14} color="#7f8c8d" />{" "}
          {user.email}
        </Text>

        <Text style={styles.date}>
          <Ionicons name="calendar-outline" size={12} color="#95a5a6" /> Criado
          em: {new Date(user.createdAt).toLocaleDateString("pt-BR")}
        </Text>
      </View>

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
              handleDelete();
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

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
  avatarContainer: {
    justifyContent: "center",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    flex: 1,
  },
  role: {
    fontSize: 12,
    color: "#7f8c8d",
    marginLeft: 8,
  },
  email: {
    fontSize: 14,
    color: "#34495e",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "#95a5a6",
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

const areEqual = (prevProps: UserItemProps, nextProps: UserItemProps) => {
  return (
    prevProps.user._id === nextProps.user._id &&
    prevProps.user.nome === nextProps.user.nome &&
    prevProps.user.email === nextProps.user.email &&
    prevProps.user.role === nextProps.user.role &&
    prevProps.user.createdAt === nextProps.user.createdAt &&
    prevProps.showActions === nextProps.showActions &&
    prevProps.onPress === nextProps.onPress &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete
  );
};

export default memo(UserItem, areEqual);
