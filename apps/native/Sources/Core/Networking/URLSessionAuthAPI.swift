import Foundation

/// Implémentation réseau de l'authentification. Même URL de base que `URLSessionEventsAPI`.
/// `URLSession.shared` stocke et renvoie automatiquement le cookie de session.
struct URLSessionAuthAPI: AuthAPI {
    var baseURL: URL? = URLSessionEventsAPI.configuredBaseURL
    var session: URLSession = .shared

    func signUp(name: String, email: String, password: String) async throws -> AuthUser {
        try await authenticate(path: "sign-up/email", body: ["name": name, "email": email, "password": password])
    }

    func signIn(email: String, password: String) async throws -> AuthUser {
        try await authenticate(path: "sign-in/email", body: ["email": email, "password": password])
    }

    func signOut() async throws {
        _ = try await send(path: "sign-out", method: "POST", body: [:])
    }

    func currentSession() async throws -> AuthUser? {
        do {
            let data = try await send(path: "get-session", method: "GET", body: nil)
            return try JSONDecoder().decode(AuthResponse?.self, from: data)?.user
        } catch AuthError.invalidCredentials {
            return nil
        }
    }

    private func authenticate(path: String, body: [String: String]) async throws -> AuthUser {
        let data = try await send(path: path, method: "POST", body: body)
        guard let user = try? JSONDecoder().decode(AuthResponse.self, from: data).user else {
            throw AuthError.server
        }
        return user
    }

    private func send(path: String, method: String, body: [String: String]?) async throws -> Data {
        guard let baseURL else { throw AuthError.network }
        var request = URLRequest(url: baseURL.appending(path: "api/auth/\(path)"))
        request.httpMethod = method
        if let body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONEncoder().encode(body)
        }
        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw AuthError.network
        }
        guard let http = response as? HTTPURLResponse else { throw AuthError.server }
        switch http.statusCode {
        case 200..<300: return data
        case 400: throw AuthError.invalidInput
        case 401: throw AuthError.invalidCredentials
        case 422: throw AuthError.emailAlreadyUsed
        default: throw AuthError.server
        }
    }
}
