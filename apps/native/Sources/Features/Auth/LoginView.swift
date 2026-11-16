import SwiftUI

struct LoginView: View {
    @Environment(AuthStore.self) private var auth
    @State private var email = ""
    @State private var password = ""

    private var canSubmit: Bool {
        AuthValidation.email(email) && !password.isEmpty
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("Content de te\n\(Text("revoir").foregroundStyle(Theme.primary))")
                    .font(.system(size: 30, weight: .heavy, design: .rounded))
                    .foregroundStyle(Theme.text)
                    .padding(.bottom, 8)

                AuthField(title: "Email", text: $email, contentType: .emailAddress, keyboard: .emailAddress)
                AuthField(title: "Mot de passe", text: $password, isSecure: true, contentType: .password)

                if let error = auth.error { AuthErrorBanner(message: error) }

                AuthPrimaryButton(title: "Se connecter", isLoading: auth.isSubmitting, isEnabled: canSubmit) {
                    Task { await auth.signIn(email: email, password: password) }
                }

                NavigationLink {
                    RegisterView()
                } label: {
                    Text("Pas encore de compte ? \(Text("Créer un compte").bold().foregroundStyle(Theme.primary))")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(Theme.muted)
                        .frame(maxWidth: .infinity)
                        .frame(minHeight: 44)
                }
            }
            .padding(20)
        }
        .background(Theme.bg.ignoresSafeArea())
        .onAppear { auth.clearError() }
    }
}

#Preview {
    NavigationStack { LoginView() }
        .environment(AuthStore(api: URLSessionAuthAPI()))
}
