import Foundation
import Testing
@testable import EventsHub

/// Faux serveur : renvoie ce qu'on lui donne, sans réseau ni session.
private struct MockEventsAPI: EventsAPI {
    let events: [Event]
    func fetchEvents() async throws -> [Event] { events }
}

@MainActor
@Test func homeLoadsEventsWithoutBeingLoggedIn() async {
    // Arrange
    let expected = [
        Event(id: "1", name: "Nuit Fluo", organizerId: "org_1", startDate: Date(timeIntervalSince1970: 1_800_000_000),
              location: "Valence", capacity: 18, status: .published),
        Event(id: "2", name: "Afterwork jeux", organizerId: "org_1", startDate: Date(timeIntervalSince1970: 1_800_003_600),
              location: "Le Comptoir", capacity: nil, status: .published),
    ]
    let viewModel = HomeViewModel(api: MockEventsAPI(events: expected))

    // Act
    await viewModel.load()

    // Assert
    #expect(viewModel.events == expected)
    #expect(viewModel.error == nil)
    #expect(viewModel.isLoading == false)
}

/// API scriptée : renvoie ses résultats dans l'ordre, un par appel.
private final class ScriptedEventsAPI: EventsAPI, @unchecked Sendable {
    private var results: [Result<[Event], Error>]

    init(_ results: [Result<[Event], Error>]) { self.results = results }

    func fetchEvents() async throws -> [Event] {
        guard !results.isEmpty else {
            Issue.record("fetchEvents appelé plus de fois que prévu")
            throw URLError(.unknown)
        }
        return try results.removeFirst().get()
    }
}

private let nuitFluo = Event(
    id: "1", name: "Nuit Fluo", organizerId: "org_1", startDate: Date(timeIntervalSince1970: 1_800_000_000),
    location: "Valence", capacity: 18, status: .published
)

@MainActor
@Test func homeExposesErrorAndClearsEventsWhenAPIFails() async {
    // Arrange : un premier chargement réussi remplit la liste
    let offline = URLError(.notConnectedToInternet)
    let viewModel = HomeViewModel(api: ScriptedEventsAPI([.success([nuitFluo]), .failure(offline)]))
    await viewModel.load()
    #expect(viewModel.events == [nuitFluo])

    // Act : le second chargement échoue
    await viewModel.load()

    // Assert
    #expect(viewModel.error == offline.localizedDescription)
    #expect(viewModel.events.isEmpty)
    #expect(viewModel.isLoading == false)
}

@MainActor
@Test func homeClearsErrorWhenRetrySucceeds() async {
    // Arrange : un premier chargement échoue et laisse une erreur affichée
    let offline = URLError(.notConnectedToInternet)
    let viewModel = HomeViewModel(api: ScriptedEventsAPI([.failure(offline), .success([nuitFluo])]))
    await viewModel.load()
    #expect(viewModel.error == offline.localizedDescription)

    // Act : le second chargement réussit
    await viewModel.load()

    // Assert
    #expect(viewModel.error == nil)
    #expect(viewModel.events == [nuitFluo])
    #expect(viewModel.isLoading == false)
}
