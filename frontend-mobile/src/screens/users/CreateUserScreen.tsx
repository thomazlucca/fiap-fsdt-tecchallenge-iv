// src/screens/users/CreateUserScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../contexts/AuthContext";
import { userApi } from "../../api/userApi";
import { CreateUserDto } from "../../api/types/user.types";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import AsyncStorage from "@react-native-async-storage/async-storage";

type CreateUserScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CreateUser"
>;

const CreateUserScreen = () => {
  const navigation = useNavigation<CreateUserScreenNavigationProp>();
  const { user: currentUser } = useAuth();

  // Estado do formulário
  const [formData, setFormData] = useState<CreateUserDto>({
    nome: "",
    email: "",
    senha: "",
    role: "aluno", // Default é aluno
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Verificar permissões para criar tipo de usuário
  const canCreateProfessor = (): boolean => {
    return currentUser?.role === "professor";
  };

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.senha) {
      newErrors.senha = "Senha é obrigatória";
    } else if (formData.senha.length < 6) {
      newErrors.senha = "Senha deve ter pelo menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle create user
  const handleCreateUser = async () => {
    if (!validateForm()) {
      Alert.alert("Erro", "Por favor, corrija os erros no formulário");
      return;
    }

    try {
      setLoading(true);

      // DEBUG: Verificar token
      const token = await AsyncStorage.getItem("@auth_token");
      console.log("🔑 Token atual:", token ? "Presente" : "Ausente");

      if (!token) {
        Alert.alert("Erro", "Você precisa estar logado para criar usuários");
        setLoading(false);
        return;
      }

      console.log("📤 Dados sendo enviados para a API:", formData);

      // Se for aluno tentando criar professor, força como aluno
      const userDataToSend = {
        ...formData,
        role: canCreateProfessor() ? formData.role : "aluno",
      };

      console.log("📤 Dados ajustados:", userDataToSend);

      const response = await userApi.create(userDataToSend);
      console.log("✅ Resposta da API:", response);

      Alert.alert("Sucesso!", `Usuário ${formData.nome} criado com sucesso!`, [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err: any) {
      console.error("Erro ao criar usuário:", err);

      let errorMessage = "Não foi possível criar o usuário";

      // Tratar erros específicos da API
      if (err.response?.data?.message?.includes("email")) {
        errorMessage = "Este email já está em uso";
      } else if (err.response?.status === 400) {
        errorMessage = "Dados inválidos. Verifique as informações.";
      }

      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle go back
  const handleGoBack = () => {
    if (formData.nome || formData.email || formData.senha) {
      Alert.alert(
        "Descartar alterações?",
        "Você tem alterações não salvas. Deseja descartá-las?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Descartar",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3498db" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👤 Criar Novo Usuário</Text>
        <View style={styles.headerActions}>
          {canCreateProfessor() && (
            <View style={styles.userTypeBadge}>
              <Ionicons name="school-outline" size={16} color="#fff" />
              <Text style={styles.userTypeText}>Professor</Text>
            </View>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card de Informações */}
          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#3498db"
            />
            <Text style={styles.infoText}>
              {canCreateProfessor()
                ? "Como professor, você pode criar usuários com perfil de aluno ou professor."
                : "Você pode criar novos usuários com perfil de aluno."}
            </Text>
          </View>

          {/* Formulário */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Informações do Usuário</Text>

            <Input
              label="Nome Completo *"
              value={formData.nome}
              onChangeText={(text) => {
                setFormData({ ...formData, nome: text });
                setErrors({ ...errors, nome: "" });
              }}
              placeholder="Digite o nome completo"
              error={errors.nome}
              autoCapitalize="words"
              required
            />

            <Input
              label="Email *"
              value={formData.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text.toLowerCase() });
                setErrors({ ...errors, email: "" });
              }}
              placeholder="exemplo@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              required
            />

            <Input
              label="Senha *"
              value={formData.senha}
              onChangeText={(text) => {
                setFormData({ ...formData, senha: text });
                setErrors({ ...errors, senha: "" });
              }}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              error={errors.senha}
              required
            />

            {/* Seletor de Tipo de Usuário (apenas para professores) */}
            {canCreateProfessor() && (
              <View style={styles.roleSelector}>
                <Text style={styles.selectorLabel}>Tipo de Usuário *</Text>
                <View style={styles.roleButtons}>
                  {(["aluno", "professor"] as const).map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleButton,
                        formData.role === role && styles.roleButtonActive,
                        role === "professor" &&
                          formData.role === "professor" &&
                          styles.roleButtonProfessorActive,
                        role === "aluno" &&
                          formData.role === "aluno" &&
                          styles.roleButtonAlunoActive,
                      ]}
                      onPress={() => setFormData({ ...formData, role })}
                    >
                      <Ionicons
                        name={
                          role === "professor"
                            ? "school-outline"
                            : "person-outline"
                        }
                        size={20}
                        color={formData.role === role ? "#fff" : "#7f8c8d"}
                      />
                      <Text
                        style={[
                          styles.roleButtonText,
                          formData.role === role && styles.roleButtonTextActive,
                        ]}
                      >
                        {role === "professor" ? "Professor" : "Aluno"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.roleHelpText}>
                  {formData.role === "professor"
                    ? "Professores podem criar posts e gerenciar usuários"
                    : "Alunos podem visualizar posts e comentar"}
                </Text>
              </View>
            )}

            {/* Aviso para alunos criando usuários */}
            {!canCreateProfessor() && (
              <View style={styles.warningCard}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#f39c12"
                />
                <Text style={styles.warningText}>
                  Você está criando um usuário com perfil de aluno.
                </Text>
              </View>
            )}

            {/* Botões */}
            <View style={styles.buttonContainer}>
              <Button
                title="Cancelar"
                onPress={handleGoBack}
                variant="outline"
                style={styles.cancelButton}
                disabled={loading}
              />
              <Button
                title={loading ? "Criando..." : "Criar Usuário"}
                onPress={handleCreateUser}
                disabled={loading}
                style={styles.createButton}
              />
            </View>

            {/* Dicas */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>📝 Dicas:</Text>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
                <Text style={styles.tipText}>
                  Use um email válido para o usuário
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
                <Text style={styles.tipText}>
                  A senha deve ter pelo menos 6 caracteres
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
                <Text style={styles.tipText}>
                  O usuário poderá alterar sua senha após o primeiro login
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    width: 40, // Para manter alinhamento
  },
  userTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e74c3c",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  userTypeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    padding: 16,
    margin: 20,
    marginBottom: 10,
    borderRadius: 8,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1976d2",
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 10,
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
  roleSelector: {
    marginTop: 10,
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  roleButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
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
  roleHelpText: {
    fontSize: 12,
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff8e1",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#f39c12",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 1,
  },
  tipsContainer: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#5d6d7e",
    flex: 1,
  },
});

export default CreateUserScreen;
