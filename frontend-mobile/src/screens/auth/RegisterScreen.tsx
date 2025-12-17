import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  Posts: undefined;
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Register"
>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { signUp, loading } = useAuth();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    role: "aluno" as "aluno" | "professor",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    } else if (formData.nome.length < 3) {
      newErrors.nome = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.senha.trim()) {
      newErrors.senha = "Senha é obrigatória";
    } else if (formData.senha.length < 6) {
      newErrors.senha = "Senha deve ter pelo menos 6 caracteres";
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpa erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleRoleChange = (role: "aluno" | "professor"): void => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleRegister = async (): Promise<void> => {
    if (!validateForm()) return;

    const result = await signUp({
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      role: formData.role,
    });

    if (result.success) {
      Alert.alert("Sucesso!", "Usuário criado com sucesso!", [
        { text: "OK", onPress: () => navigation.navigate("Posts") },
      ]);
    } else {
      Alert.alert("Erro no Registro", result.message);
    }
  };

  const handleGoToLogin = (): void => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#3498db" />
            </TouchableOpacity>
            <Text style={styles.title}>Criar Conta</Text>
            <View style={styles.backButtonPlaceholder} />
          </View>

          <View style={styles.form}>
            <Input
              label="Nome Completo"
              placeholder="Digite seu nome"
              value={formData.nome}
              onChangeText={(value) => handleChange("nome", value)}
              error={errors.nome}
              editable={!loading}
              autoCapitalize="words"
            />

            <Input
              label="Email"
              placeholder="seu@email.com"
              value={formData.email}
              onChangeText={(value) => handleChange("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              editable={!loading}
            />

            <Input
              label="Senha"
              placeholder="Digite sua senha"
              value={formData.senha}
              onChangeText={(value) => handleChange("senha", value)}
              secureTextEntry
              error={errors.senha}
              editable={!loading}
            />

            <Input
              label="Confirmar Senha"
              placeholder="Digite sua senha novamente"
              value={formData.confirmarSenha}
              onChangeText={(value) => handleChange("confirmarSenha", value)}
              secureTextEntry
              error={errors.confirmarSenha}
              editable={!loading}
            />

            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Tipo de Usuário</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === "aluno" && styles.roleButtonActive,
                  ]}
                  onPress={() => handleRoleChange("aluno")}
                  disabled={loading}
                >
                  <Ionicons
                    name="school-outline"
                    size={20}
                    color={formData.role === "aluno" ? "#fff" : "#3498db"}
                  />
                  <Text
                    style={[
                      styles.roleButtonText,
                      formData.role === "aluno" && styles.roleButtonTextActive,
                    ]}
                  >
                    Aluno
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === "professor" && styles.roleButtonActive,
                  ]}
                  onPress={() => handleRoleChange("professor")}
                  disabled={loading}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={formData.role === "professor" ? "#fff" : "#3498db"}
                  />
                  <Text
                    style={[
                      styles.roleButtonText,
                      formData.role === "professor" &&
                        styles.roleButtonTextActive,
                    ]}
                  >
                    Professor
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.roleHint}>
                Professores podem criar e gerenciar posts
              </Text>
            </View>

            <Button
              title={loading ? "Criando conta..." : "Criar Conta"}
              onPress={handleRegister}
              disabled={loading}
              style={styles.registerButton}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Já tem uma conta?</Text>
              <TouchableOpacity onPress={handleGoToLogin} disabled={loading}>
                <Text style={styles.loginLink}>Faça login</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                Ao criar uma conta, você concorda com nossos Termos de Serviço e
                Política de Privacidade.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  backButtonPlaceholder: {
    width: 40, // Para manter o título centralizado
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  form: {
    width: "100%",
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  roleButtons: {
    flexDirection: "row",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3498db",
    backgroundColor: "transparent",
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3498db",
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  roleHint: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 8,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  loginText: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  loginLink: {
    fontSize: 14,
    color: "#3498db",
    fontWeight: "600",
  },
  termsContainer: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  termsText: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 16,
  },
});

export default RegisterScreen;
