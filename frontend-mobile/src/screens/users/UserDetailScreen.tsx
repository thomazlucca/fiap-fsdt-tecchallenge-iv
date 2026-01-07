// src/screens/users/UserDetailScreen.tsx - VERSÃO COMPLETA ATUALIZADA
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../contexts/AuthContext";
import { userApi } from "../../api/userApi";
import { User, UpdateUserDto } from "../../api/types/user.types";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

type UserDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "UserDetail"
>;

const UserDetailScreen = () => {
  const navigation = useNavigation<UserDetailScreenNavigationProp>();
  const route = useRoute();
  const { userId } = route.params as { userId: string };

  const { user: currentUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);

  // Form fields - ADICIONE CAMPOS DE SENHA
  const [editData, setEditData] = useState<UpdateUserDto>({
    nome: "",
    email: "",
    role: "aluno",
  });
  const [novaSenha, setNovaSenha] = useState<string>("");
  const [confirmarSenha, setConfirmarSenha] = useState<string>("");

  // Buscar dados do usuário
  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userApi.getById(userId);
      setUser(data);
      setEditData({
        nome: data.nome,
        email: data.email,
        role: data.role,
      });
      // Limpar campos de senha
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err: any) {
      Alert.alert("Erro", "Não foi possível carregar os dados do usuário");
      console.error("Erro ao buscar usuário:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Carregar quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      fetchUserDetails();
    }, [fetchUserDetails])
  );

  // Verificar permissões de edição
  const canEditUser = (): boolean => {
    if (!currentUser || !user) return false;

    // Se for o próprio usuário, pode editar
    if (currentUser._id === user._id) return true;

    // Professor pode editar qualquer um
    if (currentUser.role === "professor") return true;

    // Aluno só pode editar outros alunos
    if (currentUser.role === "aluno" && user.role === "aluno") {
      return true;
    }

    return false;
  };

  // Verificar se pode alterar senha
  const canChangePassword = (): boolean => {
    if (!currentUser || !user) return false;
    
    // Se for o próprio usuário, pode alterar senha
    if (currentUser._id === user._id) return true;
    
    // Professor pode alterar senha de qualquer um
    if (currentUser.role === "professor") return true;
    
    // Aluno só pode alterar senha de outros alunos
    if (currentUser.role === "aluno" && user.role === "aluno") {
      return true;
    }
    
    return false;
  };

  // Verificar se pode alterar role
  const canChangeRole = (): boolean => {
    if (!currentUser || !user) return false;
    
    // Professor pode alterar role de qualquer um (exceto o próprio)
    if (currentUser.role === "professor" && currentUser._id !== user._id) {
      return true;
    }
    
    return false;
  };

  // Verificar se pode excluir
  const canDeleteUser = (): boolean => {
    if (!currentUser || !user) return false;
    
    // Não pode excluir a si mesmo
    if (currentUser._id === user._id) return false;
    
    // Professor pode excluir qualquer um
    if (currentUser.role === "professor") return true;
    
    // Aluno só pode excluir outros alunos
    if (currentUser.role === "aluno" && user.role === "aluno") {
      return true;
    }
    
    return false;
  };

  // Handle update
  const handleUpdateUser = async () => {
    if (!user) return;

    // Validações básicas
    if (!editData.nome?.trim()) {
      Alert.alert("Erro", "O nome é obrigatório");
      return;
    }

    if (!editData.email?.trim()) {
      Alert.alert("Erro", "O email é obrigatório");
      return;
    }

    // Validação de senha se for preenchida
    if (novaSenha || confirmarSenha) {
      if (!canChangePassword()) {
        Alert.alert("Erro", "Você não tem permissão para alterar a senha deste usuário");
        return;
      }

      if (novaSenha.length < 6) {
        Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
        return;
      }

      if (novaSenha !== confirmarSenha) {
        Alert.alert("Erro", "As senhas não coincidem");
        return;
      }
    }

    // Preparar dados para envio
    const dadosParaEnviar: UpdateUserDto = {
      nome: editData.nome !== user.nome ? editData.nome : undefined,
      email: editData.email !== user.email ? editData.email : undefined,
      role: editData.role !== user.role ? editData.role : undefined,
    };

    // Adicionar senha se foi preenchida
    if (novaSenha && novaSenha.length >= 6) {
      dadosParaEnviar.senha = novaSenha;
    }

    // Verificar se há alterações
    const hasChanges = 
      dadosParaEnviar.nome !== undefined ||
      dadosParaEnviar.email !== undefined ||
      dadosParaEnviar.role !== undefined ||
      dadosParaEnviar.senha !== undefined;

    if (!hasChanges) {
      Alert.alert("Aviso", "Nenhuma alteração foi feita");
      return;
    }

    try {
      setUpdating(true);
      await userApi.update(userId, dadosParaEnviar);
      
      Alert.alert("Sucesso", "Usuário atualizado com sucesso!");
      fetchUserDetails(); // Recarregar dados
      setEditModalVisible(false);
      
      // Limpar campos de senha
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err: any) {
      console.error("Erro ao atualizar usuário:", err);
      
      let errorMessage = "Não foi possível atualizar o usuário";
      
      if (err.response?.status === 401) {
        errorMessage = "Sessão expirada. Faça login novamente.";
      } else if (err.response?.status === 403) {
        errorMessage = "Você não tem permissão para editar este usuário";
      } else if (err.response?.data?.message?.includes("email")) {
        errorMessage = "Este email já está em uso";
      }
      
      Alert.alert("Erro", errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  // Handle delete
  const handleDeleteUser = () => {
    if (!user) return;

    if (!canDeleteUser()) {
      Alert.alert(
        "Ação não permitida",
        "Você não tem permissão para excluir este usuário"
      );
      return;
    }

    Alert.alert(
      "Excluir Usuário",
      `Tem certeza que deseja excluir ${user.nome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await userApi.delete(userId);
              Alert.alert("Sucesso", "Usuário excluído com sucesso!");
              navigation.goBack();
            } catch (err: any) {
              Alert.alert("Erro", "Não foi possível excluir o usuário");
              console.error("Erro ao excluir usuário:", err);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Carregando usuário...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorText}>Usuário não encontrado</Text>
          <Button
            title="Voltar"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isCurrentUser = currentUser?._id === user._id;
  const canEdit = canEditUser();
  const canChangeRolePermission = canChangeRole();
  const canChangePasswordPermission = canChangePassword();
  const canDelete = canDeleteUser();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#3498db" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👤 Detalhes do Usuário</Text>
        <View style={styles.headerActions}>
          {canEdit && (
            <TouchableOpacity
              onPress={() => setEditModalVisible(true)}
              style={styles.editButton}
            >
              <Ionicons name="create-outline" size={24} color="#3498db" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Avatar e Info Principal */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user.nome.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: user.role === "professor" ? "#e74c3c" : "#3498db" },
              ]}
            >
              <Text style={styles.roleBadgeText}>
                {user.role === "professor" ? "Professor" : "Aluno"}
              </Text>
            </View>
          </View>

          <Text style={styles.userName}>{user.nome}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          {isCurrentUser && (
            <View style={styles.currentUserBadge}>
              <Ionicons name="person" size={16} color="#fff" />
              <Text style={styles.currentUserText}>Você</Text>
            </View>
          )}
          
          {/* Badge de permissões */}
          {!isCurrentUser && (
            <View style={styles.permissionBadge}>
              <Ionicons name="shield-outline" size={14} color="#fff" />
              <Text style={styles.permissionBadgeText}>
                {currentUser?.role === "professor" 
                  ? "Você tem todas as permissões" 
                  : "Permissões limitadas"}
              </Text>
            </View>
          )}
        </View>

        {/* Informações Detalhadas */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Informações do Usuário</Text>

          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={20} color="#7f8c8d" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Nome</Text>
              <Text style={styles.detailValue}>{user.nome}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={20} color="#7f8c8d" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="school-outline" size={20} color="#7f8c8d" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Tipo de Usuário</Text>
              <Text style={styles.detailValue}>
                {user.role === "professor" ? "Professor" : "Aluno"}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color="#7f8c8d" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Conta criada em</Text>
              <Text style={styles.detailValue}>{formatDate(user.createdAt)}</Text>
            </View>
          </View>

          {user.updatedAt && user.updatedAt !== user.createdAt && (
            <View style={styles.detailRow}>
              <Ionicons name="refresh-outline" size={20} color="#7f8c8d" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Última atualização</Text>
                <Text style={styles.detailValue}>{formatDate(user.updatedAt)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Permissões de Ação */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Ações</Text>
          
          {canEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setEditModalVisible(true)}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#3498db20" }]}>
                <Ionicons name="create-outline" size={24} color="#3498db" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Editar Usuário</Text>
                <Text style={styles.actionDescription}>
                  {isCurrentUser 
                    ? "Editar seus dados pessoais" 
                    : `Editar dados de ${user.nome}`}
                  {canChangePasswordPermission && " • Pode alterar senha"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#95a5a6" />
            </TouchableOpacity>
          )}

          {/* Botão de excluir */}
          {canDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteActionButton]}
              onPress={handleDeleteUser}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#e74c3c20" }]}>
                <Ionicons name="trash-outline" size={24} color="#e74c3c" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={[styles.actionTitle, styles.deleteText]}>
                  Excluir Usuário
                </Text>
                <Text style={styles.actionDescription}>
                  Remover permanentemente este usuário
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#95a5a6" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Modal de Edição */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(false);
          setNovaSenha("");
          setConfirmarSenha("");
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isCurrentUser ? "Editar Meu Perfil" : "Editar Usuário"}
              </Text>
              <TouchableOpacity onPress={() => {
                setEditModalVisible(false);
                setNovaSenha("");
                setConfirmarSenha("");
              }}>
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Input
                label="Nome"
                value={editData.nome || ""}
                onChangeText={(text) => setEditData({ ...editData, nome: text })}
                placeholder="Digite o nome"
                required
              />

              <Input
                label="Email"
                value={editData.email || ""}
                onChangeText={(text) => setEditData({ ...editData, email: text })}
                placeholder="Digite o email"
                keyboardType="email-address"
                autoCapitalize="none"
                required
              />

              {/* Campos de senha (apenas se tiver permissão) */}
              {canChangePasswordPermission && (
                <>
                  <View style={styles.sectionDivider}>
                    <Text style={styles.sectionDividerText}>Alterar Senha (Opcional)</Text>
                  </View>
                  
                  <Input
                    label="Nova Senha"
                    value={novaSenha}
                    onChangeText={setNovaSenha}
                    placeholder="Deixe em branco para não alterar"
                    secureTextEntry
                  />
                  
                  <Input
                    label="Confirmar Nova Senha"
                    value={confirmarSenha}
                    onChangeText={setConfirmarSenha}
                    placeholder="Repita a nova senha"
                    secureTextEntry
                  />
                  
                  <View style={styles.passwordInfo}>
                    <Ionicons name="information-circle-outline" size={16} color="#3498db" />
                    <Text style={styles.passwordInfoText}>
                      Preencha apenas se deseja alterar a senha. Mínimo 6 caracteres.
                    </Text>
                  </View>
                </>
              )}

              {/* Seletor de Role (apenas para professores editando outros) */}
              {canChangeRolePermission && (
                <View style={styles.roleSelector}>
                  <Text style={styles.inputLabel}>Tipo de Usuário</Text>
                  <View style={styles.roleButtons}>
                    {(["aluno", "professor"] as const).map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.roleButton,
                          editData.role === role && styles.roleButtonActive,
                          role === "professor" && editData.role === "professor" && styles.roleButtonProfessorActive,
                          role === "aluno" && editData.role === "aluno" && styles.roleButtonAlunoActive,
                        ]}
                        onPress={() => setEditData({ ...editData, role })}
                      >
                        <Ionicons
                          name={role === "professor" ? "school-outline" : "person-outline"}
                          size={20}
                          color={editData.role === role ? "#fff" : "#7f8c8d"}
                        />
                        <Text
                          style={[
                            styles.roleButtonText,
                            editData.role === role && styles.roleButtonTextActive,
                          ]}
                        >
                          {role === "professor" ? "Professor" : "Aluno"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.modalButtons}>
                <Button
                  title="Cancelar"
                  onPress={() => {
                    setEditModalVisible(false);
                    setNovaSenha("");
                    setConfirmarSenha("");
                  }}
                  variant="outline"
                  style={styles.cancelButton}
                />
                <Button
                  title={updating ? "Salvando..." : "Salvar Alterações"}
                  onPress={handleUpdateUser}
                  disabled={updating}
                  style={styles.saveButton}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: "row",
  },
  editButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  roleBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  currentUserBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2ecc71",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  currentUserText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  permissionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9b59b6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  permissionBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  detailsCard: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  actionsCard: {
    backgroundColor: "#fff",
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 100,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    marginBottom: 12,
  },
  deleteActionButton: {
    backgroundColor: "#ffeaea",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  deleteText: {
    color: "#e74c3c",
  },
  actionDescription: {
    fontSize: 12,
    color: "#7f8c8d",
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: "#e74c3c",
    marginTop: 16,
    marginBottom: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  modalForm: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  sectionDivider: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginTop: 20,
    paddingTop: 20,
    marginBottom: 15,
  },
  sectionDividerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 10,
  },
  passwordInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  passwordInfoText: {
    flex: 1,
    fontSize: 12,
    color: "#1976d2",
  },
  roleSelector: {
    marginTop: 20,
    marginBottom: 10,
  },
  roleButtons: {
    flexDirection: "row",
    gap: 10,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 8,
  },
  roleButtonActive: {
    borderWidth: 2,
  },
  roleButtonProfessorActive: {
    backgroundColor: "#e74c3c",
    borderColor: "#e74c3c",
  },
  roleButtonAlunoActive: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7f8c8d",
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 30,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default UserDetailScreen;