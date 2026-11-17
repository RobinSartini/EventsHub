import Foundation

/// Implémentation réseau de l'authentification, couche fine sur `APIClient`.
/// `URLSession.shared` stocke et renvoie automatiquement le cookie de session.
struct URLSessionAuthAPI: AuthAPI {
    var client: APIClient

    init(client: APIClient = APIClient()) {
        self.client = client
    }

    init(baseURL: URL?, session: URLSession = .shared) {
        self.client = APIClient(baseURL: baseURL, session: session)
    }

    func signUp(name: String, email: String, password: String) async throws -> AuthUser {
        try await authenticate(path: "sign-up/email", body: ["name": name, "email": email, "password": password])
    }

    func signIn(email: String, password: String) async throws -> AuthUser {
        try await authenticate(path: "sign-in/email", body: ["email": email, "password": password])
    }

    /// Quel que soit le résultat de l'appel, les cookies de session locaux sont supprimés pour
    /// qu'une session ne ressuscite pas au prochain `currentSession()`.
    func signOut() async throws {
        defer { client.clearCookies() }
        do {
            try await client.sendRaw("POST", path: "api/auth/sign-out", body: [String: String]())
        } catch let error as APIError {
            throw AuthError(error)
        }
    }

    func currentSession() async throws -> AuthUser? {
        do {
            let response: AuthResponse? = try await client.send("GET", path: "api/auth/get-session")
            return response?.user
        } catch APIError.unauthorized {
            return nil
        } catch let error as APIError {
            throw AuthError(error)
        }
    }

    private func authenticate(path: String, body: [String: String]) async throws -> AuthUser {
        do {
            let response: AuthResponse = try await client.send("POST", path: "api/auth/\(path)", body: body)
            return response.user
        } catch let error as APIError {
            throw AuthError(error)
        }
    }
}

extension AuthError {
    init(_ error: APIError) {
        switch error {
        case .invalidURL, .network: self = .network
        case .badRequest: self = .invalidInput
        case .unauthorized: self = .invalidCredentials
        case .forbidden: self = .forbidden
        case .unprocessable: self = .emailAlreadyUsed
        case .server, .decoding: self = .server
        }
    }
}
