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

/// API qui réussit au premier appel puis échoue : simule une coupure réseau après un chargement.
private final class FlakyEventsAPI: EventsAPI, @unchecked Sendable {
    private let events: [Event]
    private var calls = 0

    init(events: [Event]) { self.events = events }

    func fetchEvents() async throws -> [Event] {
        calls += 1
        if calls == 1 { return events }
        throw URLError(.notConnectedToInternet)
    }
}

@MainActor
@Test func homeExposesErrorAndClearsEventsWhenAPIFails() async {
    // Arrange : un premier chargement réussi remplit la liste
    let loaded = [
        Event(id: "1", name: "Nuit Fluo", organizerId: "org_1", startDate: Date(timeIntervalSince1970: 1_800_000_000),
              location: "Valence", capacity: 18, status: .published),
    ]
    let viewModel = HomeViewModel(api: FlakyEventsAPI(events: loaded))
    await viewModel.load()
    #expect(viewModel.events == loaded)

    // Act : le second chargement échoue
    await viewModel.load()

    // Assert
    #expect(viewModel.error == URLError(.notConnectedToInternet).localizedDescription)
    #expect(viewModel.events.isEmpty)
    #expect(viewModel.isLoading == false)
}
