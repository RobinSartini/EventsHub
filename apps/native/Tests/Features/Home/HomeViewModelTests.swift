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
        Event(id: "1", name: "Nuit Fluo", startDate: Date(timeIntervalSince1970: 1_800_000_000),
              location: "Valence", capacity: 18, status: .published),
        Event(id: "2", name: "Afterwork jeux", startDate: Date(timeIntervalSince1970: 1_800_003_600),
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
