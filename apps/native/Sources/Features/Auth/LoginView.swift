import SwiftUI

struct LoginView: View {
    @Environment(AuthStore.self) private var auth
    @State private var email = ""
    @State private var password = ""

    private var canSubmit: Bool {
        AuthValidation.email(email) && !password.isEmpty
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            hero
            sheet
        }
        .background(Theme.primary.ignoresSafeArea())
        .onAppear { auth.clearError() }
    }

    private var hero: some View {
        ZStack(alignment: .top) {
            Circle()
                .fill(Theme.accent)
                .frame(width: 300, height: 300)
                .offset(x: 130, y: -110)
                .frame(maxWidth: .infinity, alignment: .trailing)
            Circle()
                .fill(Theme.sky)
                .frame(width: 200, height: 200)
                .offset(x: -100, y: 140)
                .frame(maxWidth: .infinity, alignment: .leading)

            VStack(spacing: 28) {
                HStack(spacing: 10) {
                    Circle()
                        .fill(.white)
                        .frame(width: 34, height: 34)
                        .overlay(Circle().fill(Theme.accent).frame(width: 11, height: 11))
                    Text("EventHub")
                        .font(.system(size: 21, weight: .heavy, design: .rounded))
                        .foregroundStyle(.white)
                    Spacer()
                }
                ticket
            }
            .padding(.horizontal, 24)
            .padding(.top, 24)
        }
        .frame(maxHeight: .infinity, alignment: .top)
        .accessibilityHidden(true)
    }

    private var ticket: some View {
        HStack(spacing: 0) {
            VStack(alignment: .leading) {
                Text("ENTRÉE · 01")
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundStyle(Color(light: 0x4D5878, dark: 0x4D5878))
                Spacer()
                Text("Nuit Fluo")
                    .font(.system(size: 19, weight: .heavy, design: .rounded))
                Spacer()
                Text("SAM 28.11")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)

            Rectangle()
                .fill(Color(light: 0xD3DBEC, dark: 0xD3DBEC))
                .frame(width: 2)
                .padding(.vertical, 12)

            Circle()
                .fill(Color(light: 0x1D3FD8, dark: 0x1D3FD8))
                .frame(width: 48, height: 48)
                .overlay(Text("J-11").font(.system(size: 12, weight: .heavy, design: .rounded)).foregroundStyle(.white))
                .frame(width: 70)
        }
        .foregroundStyle(Color(light: 0x0B1533, dark: 0x0B1533))
        .frame(width: 240, height: 120)
        .background(.white, in: RoundedRectangle(cornerRadius: 20))
        .rotationEffect(.degrees(-6))
        .shadow(color: .black.opacity(0.3), radius: 24, y: 12)
    }

    private var sheet: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                Text("Content de te revoir")
                    .font(.system(size: 26, weight: .heavy, design: .rounded))
                    .foregroundStyle(Theme.text)
                    .accessibilityAddTraits(.isHeader)
                Text("Retrouve tes billets et tes favoris.")
                    .font(.system(size: 14))
                    .foregroundStyle(Theme.muted)
                    .padding(.bottom, 4)

                AuthField(title: "Email", text: $email, contentType: .emailAddress, keyboard: .emailAddress)
                AuthField(title: "Mot de passe", text: $password, isSecure: true, contentType: .password)

                if let error = auth.error { AuthErrorBanner(message: error) }

                AuthPrimaryButton(title: "Se connecter", isLoading: auth.isSubmitting, isEnabled: canSubmit) {
                    Task { await auth.signIn(email: email, password: password) }
                }
                .padding(.top, 4)

                NavigationLink {
                    RegisterView()
                } label: {
                    Text("Créer un compte")
                        .font(.system(size: 14, weight: .heavy))
                        .foregroundStyle(Theme.primary)
                        .frame(maxWidth: .infinity, minHeight: 44)
                }
            }
            .padding(.horizontal, 22)
            .padding(.top, 28)
            .padding(.bottom, 20)
        }
        .scrollBounceBehavior(.basedOnSize)
        .frame(maxWidth: .infinity)
        .frame(maxHeight: 470)
        .background(
            UnevenRoundedRectangle(topLeadingRadius: 36, topTrailingRadius: 36)
                .fill(Theme.bg)
                .ignoresSafeArea(edges: .bottom)
        )
    }
}

#Preview {
    NavigationStack { LoginView() }
        .environment(AuthStore(api: URLSessionAuthAPI()))
}
