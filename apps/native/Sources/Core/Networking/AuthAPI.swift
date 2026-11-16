import Foundation

/// Endpoints Better Auth (contrat/openapi.yaml). La session vit dans un cookie httpOnly
/// géré par `URLSession` : l'app ne manipule jamais de jeton.
protocol AuthAPI: Sendable {
    func signUp(name: String, email: String, password: String) async throws -> AuthUser
    func signIn(email: String, password: String) async throws -> AuthUser
    func signOut() async throws
    /// `nil` si aucune session valide (401, ou 200 avec corps `null` côté Better Auth).
    func currentSession() async throws -> AuthUser?
}

enum AuthError: LocalizedError, Equatable {
    case invalidCredentials
    case emailAlreadyUsed
    case invalidInput
    case network
    case server

    var errorDescription: String? {
        switch self {
        case .invalidCredentials: "Email ou mot de passe incorrect."
        case .emailAlreadyUsed: "Cet email est déjà utilisé."
        case .invalidInput: "Les informations saisies sont invalides."
        case .network: "Connexion impossible. Vérifie ton réseau."
        case .server: "Le serveur a rencontré une erreur. Réessaie plus tard."
        }
    }
}
