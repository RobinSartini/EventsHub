import SwiftUI

struct RegisterView: View {
    @Environment(AuthStore.self) private var auth
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""

    private var canSubmit: Bool {
        AuthValidation.name(name) && AuthValidation.email(email) && AuthValidation.password(password)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("Crée ton\n\(Text("compte").foregroundStyle(Theme.primary))")
                    .font(.system(size: 30, weight: .heavy, design: .rounded))
                    .foregroundStyle(Theme.text)
                    .padding(.bottom, 8)

                AuthField(title: "Nom", text: $name, contentType: .name)
                AuthField(title: "Email", text: $email, contentType: .emailAddress, keyboard: .emailAddress)
                AuthField(title: "Mot de passe (8 caractères min.)", text: $password, isSecure: true, contentType: .newPassword)

                if let error = auth.error { AuthErrorBanner(message: error) }

                AuthPrimaryButton(title: "Créer mon compte", isLoading: auth.isSubmitting, isEnabled: canSubmit) {
                    Task { await auth.signUp(name: name, email: email, password: password) }
                }
            }
            .padding(20)
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
