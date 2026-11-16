import Foundation
import Observation

/// État de session de l'app : source de vérité pour afficher Login ou l'accueil.
@MainActor
@Observable
final class AuthStore {
    enum State: Equatable {
        case unknown
        case signedOut
        case signedIn(AuthUser)
    }

    private(set) var state: State = .unknown
    private(set) var isSubmitting = false
    private(set) var error: String?

    private let api: AuthAPI

    init(api: AuthAPI) {
        self.api = api
    }

    /// Au lancement : vérifie le cookie existant. Une erreur réseau ne déconnecte pas à tort,
    /// mais sans session confirmée l'utilisateur est renvoyé vers Login.
    func restore() async {
        state = (try? await api.currentSession()).flatMap { $0 }.map(State.signedIn) ?? .signedOut
    }

    func signIn(email: String, password: String) async {
        await submit { try await self.api.signIn(email: email, password: password) }
    }

    func signUp(name: String, email: String, password: String) async {
        await submit { try await self.api.signUp(name: name, email: email, password: password) }
    }

    func signOut() async {
        try? await api.signOut()
        state = .signedOut
        error = nil
    }

    func clearError() { error = nil }

    private func submit(_ action: () async throws -> AuthUser) async {
        isSubmitting = true
        error = nil
        defer { isSubmitting = false }
        do {
            state = .signedIn(try await action())
        } catch {
            self.error = error.localizedDescription
        }
    }
}

/// Validation locale avant l'appel réseau (Better Auth impose 8 caractères minimum).
enum AuthValidation {
    static func email(_ value: String) -> Bool {
        let parts = value.split(separator: "@", omittingEmptySubsequences: false)
        return parts.count == 2 && !parts[0].isEmpty && parts[1].contains(".") && !value.contains(" ")
    }

    static func password(_ value: String) -> Bool { value.count >= 8 }

    static func name(_ value: String) -> Bool {
        !value.trimmingCharacters(in: .whitespaces).isEmpty
    }
}
