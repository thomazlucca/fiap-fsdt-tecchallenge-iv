import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../contexts/AuthContext";

import { userApi } from "../../api/userApi";
import { User } from "../../api/types/user.types";

type UsersScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Users"
>;

const UsersScreen = () => {
  const navigation = useNavigation<UsersScreenNavigationProp>();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterRole, setFilterRole] = useState<"all" | "aluno" | "professor">(
    "all"
  );

  const isProfessor = currentUser?.role === "professor";

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err: any) {
      Alert.alert("Erro", "Não foi possível carregar os usuários");
      console.error("Erro ao buscar usuários:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  const handleCreateUser = (): void => {
    navigation.navigate("CreateUser");
  };

  const handleUserPress = (user: User): void => {
    const canEditUser = () => {
      if (!currentUser) return false;

      if (currentUser._id === user._id) return true;

      if (isProfessor) return true;

      if (currentUser.role === "aluno" && user.role === "aluno") {
        return true;
      }

      return false;
    };

    if (canEditUser()) {
      navigation.navigate("UserDetail", { userId: user._id });
    } else {
      Alert.alert(
        user.nome,
        `Email: ${user.email}\nTipo: ${user.role === "professor" ? "Professor" : "Aluno"}\n\nApenas professores podem editar outros professores.`,
        [{ text: "OK" }]
      );
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const canDeleteUser = (userId: string, userRole: string): boolean => {
    if (!currentUser) return false;

    if (userId === currentUser._id) return false;

    if (isProfessor) return true;

    if (currentUser.role === "aluno" && userRole === "aluno") {
      return true;
    }

    return false;
  };

  const handleDeleteUser = useCallback(
    async (userId: string, userName: string, userRole: string) => {
      if (!canDeleteUser(userId, userRole)) {
        Alert.alert(
          "Ação não permitida",
          "Você não tem permissão para excluir este usuário"
        );
        return;
      }

      Alert.alert(
        "Excluir Usuário",
        `Tem certeza que deseja excluir ${userName}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: async () => {
              try {
                await userApi.delete(userId);
                Alert.alert("Sucesso", "Usuário excluído com sucesso!");
                fetchUsers(); // Recarregar lista
              } catch (err: any) {
                Alert.alert("Erro", "Não foi possível excluir o usuário");
                console.error("Erro ao excluir usuário:", err);
              }
            },
          },
        ]
      );
    },
    [currentUser, fetchUsers]
  );

  const filteredUsers = users.filter((user) => {
    if (filterRole !== "all" && user.role !== filterRole) {
      return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        user.nome.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const stats = {
    total: users.length,
    professores: users.filter((u) => u.role === "professor").length,
    alunos: users.filter((u) => u.role === "aluno").length,
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const showDeleteButton = canDeleteUser(item._id, item.role);

    const canEdit = () => {
      if (!currentUser) return false;
      if (currentUser._id === item._id) return true;
      if (isProfessor) return true;
      if (currentUser.role === "aluno" && item.role === "aluno") return true;
      return false;
    };

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleUserPress(item)}
      >
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>
            {item.nome.charAt(0).toUpperCase()}
          </Text>
          {item._id === currentUser?._id && (
            <View style={styles.currentUserIndicator}>
              <Ionicons name="person" size={12} color="#fff" />
            </View>
          )}
          {canEdit() && item._id !== currentUser?._id && (
            <View style={styles.editableIndicator}>
              <Ionicons name="create-outline" size={10} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.nome}
            {item._id === currentUser?._id && " (Você)"}
          </Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.userMeta}>
            <Text
              style={[
                styles.userRole,
                { color: item.role === "professor" ? "#e74c3c" : "#3498db" },
              ]}
            >
              {item.role === "professor" ? "Professor" : "Aluno"}
            </Text>
            <Text style={styles.userDate}>
              Criado: {new Date(item.createdAt).toLocaleDateString("pt-BR")}
            </Text>
          </View>
        </View>

        {showDeleteButton && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteUser(item._id, item.nome, item.role)}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Carregando usuários...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isProfessor ? "👥 Gerenciar Usuários" : "👥 Usuários do Sistema"}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#3498db" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, styles.statProfessor]}>
            {stats.professores}
          </Text>
          <Text style={styles.statLabel}>Professores</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, styles.statAluno]}>
            {stats.alunos}
          </Text>
          <Text style={styles.statLabel}>Alunos</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filtrar:</Text>
        <View style={styles.filterButtons}>
          {(["all", "professor", "aluno"] as const).map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.filterButton,
                filterRole === role && styles.filterButtonActive,
              ]}
              onPress={() => setFilterRole(role)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterRole === role && styles.filterButtonTextActive,
                ]}
              >
                {role === "all"
                  ? "Todos"
                  : role === "professor"
                    ? "Professores"
                    : "Alunos"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#7f8c8d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou email..."
            placeholderTextColor="#95a5a6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#95a5a6" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!isProfessor && (
        <View style={styles.permissionWarning}>
          <Ionicons name="information-circle-outline" size={18} color="#3498db" />
          <Text style={styles.permissionWarningText}>
            Você pode editar apenas usuários alunos (incluindo você mesmo).
          </Text>
        </View>
      )}

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3498db"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyStateText}>
              {searchQuery || filterRole !== "all"
                ? "Nenhum usuário encontrado"
                : "Nenhum usuário cadastrado"}
            </Text>
          </View>
        }
      />

      {currentUser && (
        <TouchableOpacity style={styles.fab} onPress={handleCreateUser}>
          <Ionicons name="person-add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  backButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  statProfessor: {
    color: "#e74c3c",
  },
  statAluno: {
    color: "#3498db",
  },
  statLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: "row",
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#2c3e50",
    marginLeft: 8,
  },
  permissionWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    padding: 12,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 8,
    gap: 8,
  },
  permissionWarningText: {
    flex: 1,
    fontSize: 12,
    color: "#1976d2",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  currentUserIndicator: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#2ecc71",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  editableIndicator: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#f39c12",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userRole: {
    fontSize: 12,
    fontWeight: "600",
  },
  userDate: {
    fontSize: 12,
    color: "#95a5a6",
  },
  deleteButton: {
    padding: 8,
  },
  listContent: {
    paddingVertical: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },
  emptyStateText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 16,
    textAlign: "center",
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
});

export default UsersScreen;