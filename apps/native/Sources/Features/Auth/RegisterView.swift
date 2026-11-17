import SwiftUI

struct RegisterView: View {
    @Environment(AuthStore.self) private var auth
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var acceptsTerms = false

    private var canSubmit: Bool {
        AuthValidation.name(name)
            && AuthValidation.email(email)
            && AuthValidation.password(password)
            && acceptsTerms
    }

    var body: some View {
        ZStack(alignment: .topTrailing) {
            Circle()
                .fill(Theme.accentSoft)
                .frame(width: 260, height: 260)
                .offset(x: 100, y: -110)
                .accessibilityHidden(true)

            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Créer un compte")
                            .font(.system(size: 26, weight: .heavy, design: .rounded))
                            .foregroundStyle(Theme.text)
                            .accessibilityAddTraits(.isHeader)
                        Text("Gratuit, en une minute.")
                            .font(.system(size: 14))
                            .foregroundStyle(Theme.muted)
                    }

                    AuthField(title: "Prénom", text: $name, contentType: .givenName, capitalization: .words)
                    AuthField(title: "Email", text: $email, contentType: .emailAddress, keyboard: .emailAddress)
                    AuthField(title: "Mot de passe", text: $password, isSecure: true, contentType: .newPassword)
                    PasswordStrengthMeter(password: password)

                    Toggle(isOn: $acceptsTerms) {
                        Text("J'accepte les conditions et la confidentialité.")
                            .font(.system(size: 13))
                            .foregroundStyle(Theme.muted)
                    }
                    .toggleStyle(.switch)
                    .tint(Theme.primary)

                    if let error = auth.error { AuthErrorBanner(message: error) }

                    AuthPrimaryButton(title: "Créer mon compte", isLoading: auth.isSubmitting, isEnabled: canSubmit) {
                        Task { await auth.signUp(name: name, email: email, password: password) }
                    }
                }
                .padding(.horizontal, 22)
                .padding(.top, 8)
                .padding(.bottom, 24)
            }
            .scrollBounceBehavior(.basedOnSize)
        }
        .background(Theme.bg.ignoresSafeArea())
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { auth.clearError() }
    }
}

#Preview {
    NavigationStack { RegisterView() }
        .environment(AuthStore(api: URLSessionAuthAPI()))
}
