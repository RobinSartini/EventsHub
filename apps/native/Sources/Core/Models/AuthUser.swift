import Foundation

/// Utilisateur renvoyé par Better Auth (`User` dans contrat/openapi.yaml).
struct AuthUser: Codable, Equatable, Sendable {
    let id: String
    let name: String
    let email: String
}

/// Réponse de `sign-up`, `sign-in` et `get-session` (`AuthResponse`).
struct AuthResponse: Decodable, Sendable {
    let user: AuthUser
}
