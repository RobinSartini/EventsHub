import Foundation
import Testing
@testable import EventsHub

private let alice = AuthUser(id: "u1", name: "Alice", email: "alice@example.com")

private struct MockAuthAPI: AuthAPI {
    var session: AuthUser?
    var failure: AuthError?

    func signUp(name: String, email: String, password: String) async throws -> AuthUser {
        if let failure { throw failure }
        return AuthUser(id: "u1", name: name, email: email)
    }
    func signIn(email: String, password: String) async throws -> AuthUser {
        if let failure { throw failure }
        return alice
    }
    func signOut() async throws {}
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
    let store = AuthStore(api: MockAuthAPI(failure: .invalidCredentials))
    await store.signIn(email: "alice@example.com", password: "mauvais")
    #expect(store.state != .signedIn(alice))
    #expect(store.error == AuthError.invalidCredentials.errorDescription)
}

@MainActor
@Test func duplicateEmailShowsError() async {
    let store = AuthStore(api: MockAuthAPI(failure: .emailAlreadyUsed))
    await store.signUp(name: "Alice", email: "alice@example.com", password: "motdepasse")
    #expect(store.error == AuthError.emailAlreadyUsed.errorDescription)
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

@Test func validation() {
    #expect(AuthValidation.email("a@b.co"))
    #expect(!AuthValidation.email("a@b"))
    #expect(!AuthValidation.email("ab.co"))
    #expect(AuthValidation.password("12345678"))
    #expect(!AuthValidation.password("1234567"))
    #expect(!AuthValidation.name("  "))
}
