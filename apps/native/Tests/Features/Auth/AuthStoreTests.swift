import Foundation
import Testing
@testable import EventsHub

private let alice = AuthUser(id: "u1", name: "Alice", email: "alice@example.com")

private struct MockAuthAPI: AuthAPI {
    var session: AuthUser?
    var failure: AuthError?
    var signOutFails = false

    func signUp(name: String, email: String, password: String) async throws -> AuthUser {
        if let failure { throw failure }
        return AuthUser(id: "u1", name: name, email: email)
    }
    func signIn(email: String, password: String) async throws -> AuthUser {
        if let failure { throw failure }
        return alice
    }
    func signOut() async throws { if signOutFails { throw AuthError.network } }
    func currentSession() async throws -> AuthUser? {
        if let failure { throw failure }
        return session
    }
}

@MainActor
@Test func signUpOpensSession() async {
    let store = AuthStore(api: MockAuthAPI())
    await store.signUp(name: "Alice", email: "alice@example.com", password: "motdepasse")
    #expect(store.state == .signedIn(alice))
    #expect(store.error == nil)
}

@MainActor
@Test func signInThenSignOut() async {
    let store = AuthStore(api: MockAuthAPI())
    await store.signIn(email: "alice@example.com", password: "motdepasse")
    #expect(store.state == .signedIn(alice))
    await store.signOut()
    #expect(store.state == .signedOut)
}

@MainActor
@Test func wrongCredentialsKeepsSignedOutAndShowsError() async {
    let store = AuthStore(api: MockAuthAPI(session: nil))
    await store.restore()
    let failing = AuthStore(api: MockAuthAPI(failure: .invalidCredentials))
    await failing.restore()
    await failing.signIn(email: "alice@example.com", password: "mauvais")
    #expect(store.state == .signedOut)
    #expect(failing.state == .signedOut)
    #expect(failing.error == AuthError.invalidCredentials.errorDescription)
    #expect(failing.isSubmitting == false)
}

@MainActor
@Test func duplicateEmailShowsErrorAndStaysSignedOut() async {
    let store = AuthStore(api: MockAuthAPI(failure: .emailAlreadyUsed))
    await store.restore()
    await store.signUp(name: "Alice", email: "alice@example.com", password: "motdepasse")
    #expect(store.state == .signedOut)
    #expect(store.error == AuthError.emailAlreadyUsed.errorDescription)
}

@MainActor
@Test func invalidInputOnSignUpShowsError() async {
    let store = AuthStore(api: MockAuthAPI(failure: .invalidInput))
    await store.signUp(name: "A", email: "alice@example.com", password: "motdepasse")
    #expect(store.error == AuthError.invalidInput.errorDescription)
    #expect(store.state != .signedIn(alice))
}

@MainActor
@Test func successfulSignInClearsPreviousError() async {
    let store = AuthStore(api: MockAuthAPI())
    await store.signIn(email: "alice@example.com", password: "motdepasse")
    #expect(store.error == nil)
}

@MainActor
@Test func restoreWhenApiThrowsRedirectsToLogin() async {
    let store = AuthStore(api: MockAuthAPI(failure: .network))
    await store.restore()
    #expect(store.state == .signedOut)
}

@MainActor
@Test func signOutLeavesSessionEvenWhenApiThrows() async {
    let store = AuthStore(api: MockAuthAPI(session: alice, signOutFails: true))
    await store.restore()
    #expect(store.state == .signedIn(alice))
    await store.signOut()
    #expect(store.state == .signedOut)
}

@MainActor
@Test func restoreWithValidSessionSignsIn() async {
    let store = AuthStore(api: MockAuthAPI(session: alice))
    await store.restore()
    #expect(store.state == .signedIn(alice))
}

@MainActor
@Test func restoreWithInvalidSessionRedirectsToLogin() async {
    let store = AuthStore(api: MockAuthAPI(session: nil))
    await store.restore()
    #expect(store.state == .signedOut)
}

@Test func emailValidation() {
    #expect(AuthValidation.email("a@b.co"))
    #expect(!AuthValidation.email("a@b"))
    #expect(!AuthValidation.email("ab.co"))
    #expect(!AuthValidation.email("a @b.co"))
    #expect(!AuthValidation.email("@b.co"))
}

@Test func passwordValidation() {
    #expect(AuthValidation.password("12345678"))
    #expect(!AuthValidation.password("1234567"))
    #expect(AuthValidation.password(String(repeating: "a", count: 128)))
    #expect(!AuthValidation.password(String(repeating: "a", count: 129)))
}

@Test func nameValidation() {
    #expect(AuthValidation.name("Al"))
    #expect(!AuthValidation.name("A"))
    #expect(!AuthValidation.name("  "))
    #expect(!AuthValidation.name(" A "))
}

extension Networking {
@Suite struct AuthStoreSignOutTests {
    @MainActor
    @Test func signOutClearsLocalCookiesAfterForbiddenSoRestoreDoesNotResurrectSession() async throws {
        let client = makeStubClient(status: 403)
        let storage = try #require(client.session.configuration.httpCookieStorage)
        let base = try #require(client.baseURL)
        storage.setCookie(try #require(HTTPCookie(properties: [
            .name: "better-auth.session_token", .value: "abc", .domain: "test.local", .path: "/",
        ])))
        let store = AuthStore(api: URLSessionAuthAPI(client: client))
        await store.signOut()
        #expect(store.state == .signedOut)
        #expect(storage.cookies(for: base) ?? [] == [])
    }
}
}
