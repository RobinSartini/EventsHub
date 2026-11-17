import Foundation
import Testing
@testable import EventsHub

private func makeAPI(status: Int = 200, body: String = "", error: URLError? = nil) -> URLSessionAuthAPI {
    URLSessionAuthAPI(client: makeStubClient(status: status, body: body, error: error))
}

/// Forme de `AuthResponse` du contrat (User + Session) ; Better Auth ajoute des champs qu'on ignore.
private let authJSON = """
{"user":{"id":"cuid_abc123","name":"Alice","email":"alice@example.com","emailVerified":false,"image":null,
"createdAt":"2026-11-16T10:00:00.000Z","updatedAt":"2026-11-16T10:00:00.000Z"},
"session":{"id":"s1","userId":"cuid_abc123","expiresAt":"2026-11-23T10:00:00.000Z"}}
"""

private func expectError(_ expected: AuthError, _ call: () async throws -> Void) async {
    do {
        try await call()
        Issue.record("Aucune erreur levée, attendu \(expected)")
    } catch {
        #expect(error as? AuthError == expected)
    }
}

extension Networking {
@Suite struct URLSessionAuthAPITests {
    @Test func signInDecodesUserAndPostsCredentials() async throws {
        let api = makeAPI(body: authJSON)
        let user = try await api.signIn(email: "alice@example.com", password: "motdepasse")
        #expect(user == AuthUser(id: "cuid_abc123", name: "Alice", email: "alice@example.com"))
        let request = try #require(StubURLProtocol.lastRequest)
        #expect(request.httpMethod == "POST")
        #expect(request.url?.path == "/api/auth/sign-in/email")
    }

    @Test func signUpHitsSignUpEndpoint() async throws {
        let api = makeAPI(body: authJSON)
        _ = try await api.signUp(name: "Alice", email: "alice@example.com", password: "motdepasse")
        #expect(StubURLProtocol.lastRequest?.url?.path == "/api/auth/sign-up/email")
    }

    @Test func status401IsInvalidCredentials() async {
        let api = makeAPI(status: 401)
        await expectError(.invalidCredentials) { _ = try await api.signIn(email: "a@b.co", password: "x") }
    }

    @Test func status422IsEmailAlreadyUsed() async {
        let api = makeAPI(status: 422)
        await expectError(.emailAlreadyUsed) { _ = try await api.signUp(name: "Al", email: "a@b.co", password: "motdepasse") }
    }

    @Test func status400IsInvalidInput() async {
        let api = makeAPI(status: 400)
        await expectError(.invalidInput) { _ = try await api.signUp(name: "Al", email: "a@b.co", password: "motdepasse") }
    }

    @Test func status500IsServerError() async {
        let api = makeAPI(status: 500)
        await expectError(.server) { _ = try await api.signIn(email: "a@b.co", password: "x") }
    }

    @Test func invalidJSONIsServerError() async {
        let api = makeAPI(body: "{pas du json")
        await expectError(.server) { _ = try await api.signIn(email: "a@b.co", password: "x") }
    }

    @Test func networkFailureIsNetworkError() async {
        let api = makeAPI(error: URLError(.notConnectedToInternet))
        await expectError(.network) { _ = try await api.signIn(email: "a@b.co", password: "x") }
    }

    @Test func missingBaseURLIsNetworkError() async {
        let api = URLSessionAuthAPI(baseURL: nil)
        await expectError(.network) { _ = try await api.signIn(email: "a@b.co", password: "x") }
    }

    @Test func currentSessionDecodesUser() async throws {
        let api = makeAPI(body: authJSON)
        #expect(try await api.currentSession()?.email == "alice@example.com")
        #expect(StubURLProtocol.lastRequest?.httpMethod == "GET")
    }

    @Test func currentSessionNullBodyMeansNoSession() async throws {
        let api = makeAPI(body: "null")
        #expect(try await api.currentSession() == nil)
    }

    @Test func currentSession401MeansNoSession() async throws {
        let api = makeAPI(status: 401)
        #expect(try await api.currentSession() == nil)
    }

    @Test func signOutCallsEndpointAndPropagates401() async {
        let api = makeAPI(body: "{}")
        try? await api.signOut()
        #expect(StubURLProtocol.lastRequest?.url?.path == "/api/auth/sign-out")
        let failing = makeAPI(status: 401)
        await expectError(.invalidCredentials) { try await failing.signOut() }
    }

    @Test func signInForwardsClientOrigin() async throws {
        let api = URLSessionAuthAPI(client: makeStubClient(body: authJSON, origin: "http://localhost:3000"))
        _ = try await api.signIn(email: "alice@example.com", password: "motdepasse")
        #expect(StubURLProtocol.lastRequest?.value(forHTTPHeaderField: "Origin") == "http://localhost:3000")
    }

    @Test func signOutClearsSessionCookiesWhateverTheOutcome() async throws {
        let outcomes: [(status: Int, error: URLError?)] = [(200, nil), (403, nil), (500, nil), (200, URLError(.notConnectedToInternet))]
        for outcome in outcomes {
            let client = makeStubClient(status: outcome.status, error: outcome.error)
            let storage = try #require(client.session.configuration.httpCookieStorage)
            let base = try #require(client.baseURL)
            let cookie = try #require(HTTPCookie(properties: [
                .name: "better-auth.session_token", .value: "abc", .domain: "test.local", .path: "/",
            ]))
            storage.setCookie(cookie)
            let other = try #require(HTTPCookie(properties: [
                .name: "keep", .value: "1", .domain: "other.local", .path: "/",
            ]))
            storage.setCookie(other)
            try? await URLSessionAuthAPI(client: client).signOut()
            #expect(storage.cookies(for: base) ?? [] == [], "status \(outcome.status) error \(String(describing: outcome.error))")
            #expect(storage.cookies?.contains { $0.name == "keep" } == true)
            storage.deleteCookie(other)
        }
    }

    @Test func status403IsForbidden() async {
        let api = makeAPI(status: 403)
        await expectError(.forbidden) { _ = try await api.signIn(email: "a@b.co", password: "x") }
    }
}
}
