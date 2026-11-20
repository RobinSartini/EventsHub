import SwiftUI

/// Champ de formulaire de la maquette : label au-dessus, saisie arrondie à 18 pt.
struct AuthField: View {
    let title: String
    @Binding var text: String
    var isSecure = false
    var contentType: UITextContentType?
    var keyboard: UIKeyboardType = .default
    var capitalization: TextInputAutocapitalization = .never

    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title)
                .font(.system(size: 13, weight: .heavy))
                .foregroundStyle(Theme.text)
            Group {
                if isSecure {
                    SecureField("", text: $text)
                } else {
                    TextField("", text: $text)
                        .keyboardType(keyboard)
                }
            }
            .focused($isFocused)
            .textContentType(contentType)
            .textInputAutocapitalization(capitalization)
            .autocorrectionDisabled()
            .font(.system(size: 16, weight: .semibold))
            .foregroundStyle(Theme.text)
            .padding(.horizontal, 16)
            .frame(height: 50)
            .background(Theme.surface, in: RoundedRectangle(cornerRadius: 18))
            .overlay(
                RoundedRectangle(cornerRadius: 18)
                    .stroke(isFocused ? Theme.primary : Theme.border, lineWidth: isFocused ? 2 : 1.5)
            )
        }
    }
}

/// Bouton principal en pilule (54 pt).
struct AuthPrimaryButton: View {
    let title: String
    let isLoading: Bool
    let isEnabled: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Group {
                if isLoading { ProgressView().tint(Theme.onPrimary) } else { Text(title) }
            }
            .font(.system(size: 16, weight: .heavy))
            .foregroundStyle(Theme.onPrimary)
            .frame(maxWidth: .infinity, minHeight: 54)
            .background(Theme.primary.opacity(isEnabled ? 1 : 0.4), in: Capsule())
        }
        .disabled(!isEnabled || isLoading)
    }
}

struct AuthErrorBanner: View {
    let message: String

    var body: some View {
        Text(message)
            .font(.system(size: 14, weight: .semibold))
            .foregroundStyle(Theme.accentText)
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Theme.accentSoft, in: RoundedRectangle(cornerRadius: 12))
            .accessibilityAddTraits(.isStaticText)
    }
}

/// Jauge de solidité du mot de passe (4 segments) de la maquette d'inscription.
struct PasswordStrengthMeter: View {
    let password: String

    /// 0 à 4 : longueur minimale (8) puis variété (minuscules/majuscules, chiffres, symboles).
    static func score(for password: String) -> Int {
        guard AuthValidation.password(password) else { return password.isEmpty ? 0 : 1 }
        var score = 2
        if password.contains(where: \.isUppercase) && password.contains(where: \.isLowercase) { score += 1 }
        if password.contains(where: \.isNumber) { score += 1 }
        if password.contains(where: { !$0.isLetter && !$0.isNumber }) { score = min(4, score + 1) }
        return min(score, 4)
    }

    private var label: String {
        switch Self.score(for: password) {
        case 0: "8 caractères minimum"
        case 1: "Trop court"
        case 2: "Mot de passe moyen"
        case 3: "Mot de passe correct"
        default: "Mot de passe solide"
        }
    }

    var body: some View {
        let score = Self.score(for: password)
        VStack(alignment: .leading, spacing: 5) {
            HStack(spacing: 5) {
                ForEach(0..<4, id: \.self) { index in
                    Capsule()
                        .fill(index < score ? Theme.primary : Theme.border)
                        .frame(height: 5)
                }
            }
            .accessibilityHidden(true)
            Text(label)
                .font(.system(size: 12, weight: .bold))
                .foregroundStyle(Theme.muted)
        }
    }
}
