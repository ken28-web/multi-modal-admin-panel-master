import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "../components/admin-styles/index.styles";
import {
    getAdminSession,
    isAdminAuthenticatedClient,
    loginAdmin,
} from "../services/fareApi";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!isAdminAuthenticatedClient()) return;
      try {
        const session = await getAdminSession();
        if (session.authenticated) {
          router.replace("/selection");
        }
      } catch {
        // Keep user on sign-in page when session check fails.
      }
    };

    void run();
  }, [router]);

  const onSignIn = async () => {
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError("Enter both username and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await loginAdmin(username, password);
      router.replace("/selection");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Transport Fare Admin Panel</Text>
        <Text style={styles.subtitle}>
          Sign in to manage fare settings securely.
        </Text>

        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholder="Admin username"
          placeholderTextColor="#667085"
        />

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Admin password"
          placeholderTextColor="#667085"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={onSignIn}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
