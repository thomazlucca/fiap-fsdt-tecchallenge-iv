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
import { useAuth } from "../../contexts/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Posts: undefined;
  Login: undefined;
  Register: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [errors, setErrors] = useState<{ email?: string; senha?: string }>({});
  const { signIn, loading } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: { email?: string; senha?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email inválido";
    }

    if (!senha.trim()) {
      newErrors.senha = "Senha é obrigatória";
    } else if (senha.length < 6) {
      newErrors.senha = "Senha deve ter pelo menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (): Promise<void> => {
    if (!validateForm()) return;

    const result = await signIn({ email, senha });

    if (result.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Posts" as never }],
      });
    }
  };

  const handleRegister = (): void => {
    navigation.navigate("Register");
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
        >
          <View style={styles.header}>
            <Text style={styles.title}>Blog de Postagens</Text>
            <Text style={styles.subtitle}>Faça login para continuar</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              editable={!loading}
            />

            <Input
              label="Senha"
              placeholder="Digite sua senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              error={errors.senha}
              editable={!loading}
            />

            <Button
              title={loading ? "Entrando..." : "Entrar"}
              onPress={handleLogin}
              disabled={loading}
              style={styles.loginButton}
            />

            <View style={styles.helpText}>
              <Text style={styles.helpTextContent}>
                Use as credenciais do usuário criado no seed para testar
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
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  form: {
    width: "100%",
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#7f8c8d",
    fontSize: 14,
  },
  helpText: {
    marginTop: 32,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    alignItems: "center",
  },
  helpTextContent: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 16,
  },
});

export default LoginScreen;
